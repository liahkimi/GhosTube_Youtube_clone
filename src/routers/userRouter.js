import express from "express"; 
import {getEdit, postEdit,getChangePassword, postChangePassword, logout, see, startGithubLogin, finishGithubLogin} from "../controllers/userController";
import{ protectorMiddleware, publicOnlyMiddleware, avatarUpload} from "../middlewares";

const userRouter = express. Router(); 

//Log Out
userRouter.get('/logout',protectorMiddleware, logout );

//Edit Profile
userRouter
    .route('/edit')
    .all(protectorMiddleware)
    .get(getEdit)
    .post(avatarUpload.single("avatar"),postEdit);

//홈페이지에서 가입해서 password가 있는유저에게만 보이는 Edit Profile 내부의 change password
userRouter
    .route('/change-password')
    .all(protectorMiddleware)
    .get(getChangePassword)
    .post(postChangePassword);

//Log In -> 깃헙로그인
userRouter.get("/github/start",publicOnlyMiddleware, startGithubLogin);
userRouter.get("/github/finish",publicOnlyMiddleware, finishGithubLogin);

//My Profile
userRouter.get('/:id', see);

export default userRouter;