import bcrypt from "bcrypt";
import mongoose from "mongoose";

const userSchema = new mongoose.Schema({
  email: { type: String, required: true, unique: true },
  avatarUrl: String,
  socialOnly: { type: Boolean, default: false }, //깃헙로그인할때,
  username: { type: String, required: true, unique: true },
  password: { type: String },
  name: { type: String, required: true },
  location: String,
  comments: [{ type: mongoose.Schema.Types.ObjectId, ref: "Comment" }], //작성한 댓글들
  videos: [{ type: mongoose.Schema.Types.ObjectId, ref: "Video" }], //Video model에서 오는 ObjectId로 구성된 array
});
//pre save 미들웨어
userSchema.pre("save", async function () {
  //pw 수정할때만 save 눌렀을 때 pw hashing되게 하기
  if (this.isModified("password")) {
    this.password = await bcrypt.hash(this.password, 5); //5=saltrounds, async-await사용중이므로 콜백함수 안씀
    //this: 생성된 user object
  }
});

const User = mongoose.model("User", userSchema);
export default User;
