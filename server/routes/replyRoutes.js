import express from "express";
import { protect } from "../middlewares/auth.js";
import { createReply, deleteReply, getPostReplies } from "../controllers/replyController.js";


const replyRouter = express.Router();

replyRouter.post("/add", protect, createReply);
replyRouter.get("/post/:postId", protect, getPostReplies);
replyRouter.delete("/:replyId", protect, deleteReply);



export default replyRouter;
