import express from "express";
// import { registerView, createComment } from "../controllers/videoController";
import {
  registerView,
  createComment,
  deleteComment,
} from "../controllers/videoController";

const apiRouter = express.Router();

apiRouter.post("/videos/:id([0-9a-f]{24})/view", registerView);
apiRouter.post("/videos/:id([0-9a-f]{24})/comment", createComment);
apiRouter.delete(
  "/videos/:videoId([0-9a-f]{24})/comments/:id([0-9a-f]{24})/delete",
  deleteComment
);

export default apiRouter;
