import Post from "../models/Post.js";
import Reply from "../models/Reply.js";
import { decryptText, encryptText } from "../utils/cryptoUtils.js";

export const getPostReplies = async (req, res) => {
  try {
    const { postId } = req.params;
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;

    const replies = await Reply.find({
      post_id: postId,
      replied_to_id: null,
    })
      .populate("replier_id")
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .lean();

    const decryptedReplies = replies.map((reply) => ({
      ...reply,
      text: reply.text
        ? decryptText({
            iv: reply.iv,
            encryptedData: reply.text,
          })
        : "",
    }));

    res.json({
      success: true,
      replies: decryptedReplies,
      currentPage: page,
      hasMore: replies.length === limit,
    });
  } catch (error) {
    console.log(error);
    res.json({
      success: false,
      message: error.message,
    });
  }
};

export const deleteReply = async (req, res) => {
  try {
    const { userId } = await req.auth();
    const { replyId } = req.params;

    const reply = await Reply.findById(replyId);
    if (!reply) {
      return res.status(404).json({
        success: false,
        message: "Reply not found",
      });
    }

    if (reply.replier_id.toString() !== userId) {
      return res.status(403).json({
        success: false,
        message: "Not authorized to delete this reply",
      });
    }

    await Reply.findByIdAndDelete(replyId);

    return res.json({
      success: true,
      message: "Reply deleted successfully",
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

export const createReply = async (req, res) => {
  try {
    const { userId } = await req.auth();
    const { postId, text } = req.body;

    if (!text || !text.trim()) {
      return res.status(400).json({
        success: false,
        message: "Reply text is required",
      });
    }

    const post = await Post.findById(postId);
    if (!post) {
      return res.status(404).json({
        success: false,
        message: "Post not found",
      });
    }

    const encryptedText = encryptText(text.trim());

    const reply = await Reply.create({
      post_id: postId,
      replier_id: userId,
      text: encryptedText ? encryptedText.encryptedData : "",
      iv: encryptedText ? encryptedText.iv : "",
    });

    
    const populatedReply = await Reply.findById(reply._id).populate(
      "replier_id"
    );

    const decryptedReply = {
      ...populatedReply._doc,
      text: populatedReply.text
        ? decryptText({
            iv: populatedReply.iv,
            encryptedData: populatedReply.text,
          })
        : "",
    };


    return res.json({
      success: true,
      message: "Reply created successfully",
      reply: decryptedReply,
    });
  } catch (error) {
    console.log(error);
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};
