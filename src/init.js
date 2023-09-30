import "dotenv/config";
import "./db";
import "./models/video";
import "./models/User";
import "./models/Comment";
import app from "./server";

const PORT = process.env.PORT || 4000; //클라우드타입에선 4000으로 포트 지정해주면 됌

const handleListening = () =>
  console.log(`✅ Server listening on port http://localhost:${PORT} 🚀`);

app.listen(PORT, handleListening); //listening
