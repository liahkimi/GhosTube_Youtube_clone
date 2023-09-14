const globalRouter = express.Router()//<Router 생성>

const handleHome = (req, res) => res.send("Home");//<라우터에 함수 넣어주기-라우터 설정>
//-각 라우터들의 첫페이지 (global -> / , user -> /users/edit , video -> /videos/watch)

globalRouter.get('/', handleHome)//<라우터에 get하기>

export default globalRouter