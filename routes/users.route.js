const express = require("express");
const jwt = require("jsonwebtoken");
const { Users, UserInfos } = require("../models");
const router = express.Router();

//회원가입 API

router.post("/users", async (req, res) => {
    const { email, password, name, age, gender, profileImage } = req.body;
    const isExistUser = await Users.findOne({
        where: {
            email: email,
        }
    });
    if (isExistUser) {
        return res.status(409).json({ messsage: "이미 존재하는 이메일입니다." })
    }

    //사용자 테이블에 데이터 삽입
    const user = await Users.create({ email, password });
    //사용자 정보 테이블에 데이터 삽입
    //어떤 사용자의 사용자 정보인지 내용이 필요.
    await UserInfos.create({
        UserId: user.userId, //현재 사용자 정보가 19번째 줄에서 생성된 사용자의 userId를 할당
        name, age, gender, profileImage
    });

    return res.status(201).json({ message: "회원가입이 완료되었습니다." })

});

router.post("/login", async (req, res) => {
    const { email, password } = req.body;
    const user = await Users.findOne({
        where: { email }
    });
    if (!user) {
        return res.status(401).json({ message: "해당하는 사용자가 존재하지 않습니다" });
    } else if (user.password !== password) {
        return res.status(401).json({ message: "비밀번호가 일치하지 않습니다." });
    }

    //jwt(토큰)를 생성하고
    const token = jwt.sign({
        userId: user.userId
    }, "comstomized_secret_key");
    //쿠키를 발급
    res.cookie("authorization", `Bearer ${token}`);
    //response 를 할당
    return res.status(200).json({message : "로그인에 성공하였습니다."})
});

//사용자 조회 API
router.get("/users/:userId", async(req, res) =>{
    const {userId} = req.params;

    //사용자 테이블과 사용자 정보 테이블에 있는 데이터를 가지고 와야한다.
    const user = await Users.findOne({
        attributes: ['userId', 'email', 'createdAt', 'updatedAt'],
        include: [
            {
                model: UserInfos,
                attributes: ['name','age','gender','profileImage'],
            }
        ]
    });

    return res.status(200).json({data : user});
});

module.exports = router;
