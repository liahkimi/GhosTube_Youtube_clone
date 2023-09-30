import mongoose from "mongoose";

const commentSchema = new mongoose.Schema({
  text: { type: String, required: true },
  owner: { type: mongoose.Schema.Types.ObjectId, required: true, ref: "User" }, //누가 작성했는지(댓글의 주인)
  video: { type: mongoose.Schema.Types.ObjectId, required: true, ref: "Video" }, //어느 동영상에 달린 댓글인지
  createdAt: { type: Date, required: true, default: Date.now }, //언제 작성했는지
});

const Comment = mongoose.model("Comment", commentSchema);

export default Comment;
