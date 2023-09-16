import mongoose from "mongoose"; 

mongoose.connect(process.env.DB_URL);//mongodb에 wetube라는 새 database 생성

const db = mongoose.connection;//mongoose가 준 db connection에 대한 access

const handleOpen = () => console.log("✅ Connected to DB");
const handleError = (error) => console.log("💥 DB Error", error)

//event
db.on("error", handleError);//(on:여러번 일어나는 error감지용)
db.once("open", handleOpen)//db가 잘 연결되었음을 알려줌(once:오로지 한번만 일어나는 open감지용)
