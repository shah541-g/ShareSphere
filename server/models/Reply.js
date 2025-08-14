import mongoose from "mongoose";

const replySchema = new mongoose.Schema(
  {
    post_id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Post",
      required: true,
    },
    replier_id: { type: String, ref: "User", required: true },
    text: { type: String, required: true },
    iv: { type: String, default: '' },
  },
  { timestamps: true, minimize: false }
);

replySchema.index({ post_id: 1 });
replySchema.index({ replied_to_id: 1 });

const Reply = mongoose.model("Reply", replySchema);

export default Reply;
