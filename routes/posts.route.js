const express = require("express");
const { Posts } = require("../models")
const { Op } = require("sequelize")
const router = express.Router();
//게시글을 생성하는 사용자는 로그인 된 사용자이여야 하기 때문에 authMiddle 를 사용
const authMiddleware = require("../middlewares/auth-middleware");

//게시글 생성 API
router.post("/posts", authMiddleware, async (req, res) => {
    //게시글을 생성하는 사용자의 정보를 가지고 올 것.
    const { userId } = res.locals.user;  //미들웨어를 거쳐서 사용자 인증이 완료 된 user정보
    const { title, content } = req.body;

    const post = await Posts.create({
        UserId: userId,
        title, content
    });

    return res.status(200).json({ data: post });
});

//게시글 목록조회 API
router.get("/posts", async (req, res) => {
    const posts = await Posts.findAll({
        attributes: ['postId', 'title', 'createdAt', 'updatedAt'], //조회할 컬럼을 먼저 설정
        order: [['createdAt', 'DESC']], //DESC 를 이용하여  createdAt를 기준으로 내림차순으로 정렬을 설정.
    });

    return res.status(200).json({ data: posts });
});

//게시글 상세 조회 API
router.get("/posts/:postId", async (req, res) => {
    const { postId } = req.params;
    const post = await Posts.findOne({
        attributes: ['postId', 'title', 'content', 'createdAt', 'updatedAt'],//조회 할 컬럼을 먼저 설정
        where: { postId }
    });

    return res.status(200).json({ data: post });
});

//게시글 수정 API
router.put("/posts/:postId", authMiddleware, async (req, res) => {
    const { postId } = req.params;
    const { userId } = res.locals.user;
    const { title, content } = req.body;

    const post = await Posts.findOne({ where: { postId } });

    if (!post) {
        return res.status(404).json({ message: "게시글이 존재하지 않습니다." })
    } else if (post.UserId !== userId) {
        return res.status(400).json({ message: "게시글을 수정할 권한이 없습니다." })
    }
    await Posts.update(
        { title, content },
        {
            where: {
                [Op.and]: [{ postId }, { UserId: userId }],
            }
        }

    );
    return res.status(200).json({ data: "게시글을 수정 완료하였습니다." })
});

//게시글 삭제 API
router.delete("/posts/:postId", authMiddleware, async (req, res) => {
    const { userId } = res.locals.user;
    const { postId } = req.params;
    
    const post = await Posts.findOne({ where: { postId } })
    if (!post) {
        return res.status(404).json({ message: "게시글이 존재하지 않습니다." })
    } else if (post.UserId !== userId) {
        return res.status(400).json({ message: "게시글을 삭제할 권한이 없습니다." })
    }
    await Posts.destroy({
        where: {
            [Op.and]: [{ postId }, { UserId: userId }]
        }
    });
    return res.status(200).json({ data: "게시글이 삭제되었습니다." });
});

module.exports = router;