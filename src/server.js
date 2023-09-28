import express from "express";
import morgan from "morgan";
import session from "express-session";
import flash from "express-flash";
import MongoStore from "connect-mongo";
import rootRouter from "./routers/rootRouter";
import userRouter from "./routers/userRouter";
import videoRouter from "./routers/videoRouter";
import apiRouter from "./routers/apiRouter";
import { localsMiddleware } from "./middlewares";

const app = express(); //create server~
const logger = morgan("dev"); //morgan middleware

app.set("view engine", "pug"); //뷰엔진으로 pug를 셋팅
app.set("views", process.cwd() + "/src/views"); //process.cwd() (=현재디렉토리) + '/views'
app.use(logger);
app.use(express.urlencoded({ extended: true })); //express가 form의 value를 이해하도록 설치함

//세션미들웨어
app.use(
  session({
    secret: process.env.COOKIE_SECRET,
    resave: false,
    saveUninitialized: false,
    store: MongoStore.create({ mongoUrl: process.env.DB_URL }), //default로 설정된 store가 아닌, mongoDB store로 설정
  })
);
//SharedArrayBuffer is not defined 에러때문에 설정함
app.use((req, res, next) => {
  res.header("Cross-Origin-Embedder-Policy", "require-corp");
  res.header("Cross-Origin-Opener-Policy", "same-origin");
  next();
});
app.use(flash());
app.use(localsMiddleware); //로컬미들웨어
app.use("/uploads", express.static("uploads")); // 브라우저에 노출시키고 싶은 폴더
app.use("/static", express.static("assets")); //브라우저에 assets 폴더 안을 열람할 수 있게 해달라고 static으로 요청
app.use("/", rootRouter);
app.use("/videos", videoRouter);
app.use("/users", userRouter);
app.use("/api", apiRouter);
app.use((req, res, next) => {
  res.header("Cross-Origin-Embedder-Policy", "require-corp");
  res.header("Cross-Origin-Opener-Policy", "same-origin");
  next();
});

export default app;
