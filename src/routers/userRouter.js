import express from "express"; 
import {getEdit, postEdit,getChangePassword, postChangePassword, logout, see, startGithubLogin, finishGithubLogin} from "../controllers/userController";
import{ protectorMiddleware, publicOnlyMiddleware} from "../middlewares";

const userRouter = express. Router(); 

userRouter.get('/logout',protectorMiddleware, logout );
userRouter.route('/edit').all(protectorMiddleware).get(getEdit).post(postEdit);
userRouter.route('/change-password').all(protectorMiddleware).get(getChangePassword).post(postChangePassword);
userRouter.get("/github/start",publicOnlyMiddleware, startGithubLogin);
userRouter.get("/github/finish",publicOnlyMiddleware, finishGithubLogin);
userRouter.get('/:id', see);//유저 보여주기 => 로그인여부 상관없음

export default userRouter;