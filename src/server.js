//선언
//서버의 설정 및 서버를 이루고 있는 코드
//(express를 사용해서 router등을 만들어 서버를 만드는 것이나, server의 configuration에 관련된 코드만 처리)

import express from "express"; 
import morgan from "morgan";
import rootRouter from "./routers/rootRouter";
import userRouter from "./routers/userRouter";
import videoRouter from "./routers/videoRouter";

const app = express();//create server
const logger = morgan('dev');//morgan middleware


app.set("view engine", "pug");//뷰엔진으로 pug를 셋팅
app.set("views", process.cwd() + "/src/views") //process.cwd() (=현재디렉토리) + '/views'
app.use(logger);
app.use(express.urlencoded({extended: true}));//express가 form의 value를 이해하도록 설치함

app.use('/', rootRouter);
app.use('/users', userRouter);
app.use('/videos', videoRouter);

export default app;

