import fs from "fs";
import imagekit from "../configs/imagekit.js";
import Post from "../models/Post.js";
import User from "../models/User.js";
import Reply from "../models/Reply.js";
import { decryptText, encryptText } from "../utils/cryptoUtils.js";

export const addPost = async (req, res) => {
  try {
    const { userId } = await req.auth();
    const { content, post_type } = req.body;

    if (!content) {
      throw new Error("Post content is required");
    }

    let image_urls = [];

    if (req.files && req.files.length) {
      image_urls = await Promise.all(
        req.files.map(async (image) => {
          const fileBuffer = fs.readFileSync(image.path);
          const response = await imagekit.upload({
            file: fileBuffer,
            fileName: image.originalname,
            folder: "posts",
          });
          return imagekit.url({
            path: response.filePath,
            transformation: [
              { quality: "auto" },
              { format: "webp" },
              { width: "1280" },
            ],
          });
        })
      );
    }

    const encryptedContent = encryptText(content);

    await Post.create({
      user: userId,
      content: encryptedContent ? encryptedContent.encryptedData : "",
      iv: encryptedContent.iv,
      image_urls,
      post_type,
      likes_count: [],
    });

    res.json({
      success: true,
      message: "Post Created Successfully",
    });
  } catch (error) {
    console.log(error);
    res.json({
      success: false,
      message: error.message,
    });
  }
};

export const getPostById = async (req, res) => {
  try {
    const { postId } = req.params;

    const post = await Post.findById(postId).populate("user").lean();

    
    if (!post) {
      return res.status(404).json({
        success: false,
        message: "Post not found",
      });
    }
    const decryptedPost = {
      ...post,
      content: post.content
        ? decryptText({
            iv: post.iv,
            encryptedData: post.content,
          })
        : "",
    };
    const replies = await Reply.find({
      post_id: post._id,
    })
      .populate("replier_id")
      .sort({ createdAt: -1 })
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

    decryptedPost.replies = decryptedReplies;
    decryptedPost.total_replies = decryptedReplies.length;

    res.json({
      success: true,
      post: decryptedPost,
    });
  } catch (error) {
    console.log(error);
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

export const getFeedPosts = async (req, res) => {
  try {
    const { userId } = await req.auth();
    const user = await User.findById(userId);

    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;

    const userIds = [userId, ...user.connections, ...user.following];

    const posts = await Post.find({ user: { $in: userIds } })
      .populate("user")
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .lean();

    const decryptedPosts = posts.map((post) => ({
      ...post,
      content: post.content
        ? decryptText({
            iv: post.iv,
            encryptedData: post.content,
          })
        : "",
    }));

    const repliesLimit = parseInt(req.query.repliesLimit) || 3;

    for (let post of decryptedPosts) {
      const replies = await Reply.find({
        post_id: post._id,
      })
        .populate("replier_id")
        .sort({ createdAt: -1 })
        .limit(repliesLimit)
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

      post.replies = decryptedReplies;
      post.total_replies = await Reply.countDocuments({
        post_id: post._id,
      });
    }
    res.json({
      success: true,
      posts: decryptedPosts,
      currentPage: page,
      hasMore: posts.length === limit,
    });
  } catch (error) {
    console.error(error);
    res.json({
      success: false,
      message: error.message,
    });
  }
};

// Like Posts

export const likePost = async (req, res) => {
  try {
    const { userId } = await req.auth();
    const { postId } = req.body;
    const post = await Post.findById(postId);

    if (post.likes_count.includes(userId)) {
      post.likes_count = post.likes_count.filter((user) => user !== userId);
      await post.save();
      res.json({
        success: true,
        message: "Post unliked",
      });
    } else {
      post.likes_count.push(userId);
      await post.save();
      res.json({
        success: true,
        message: "Post liked",
      });
    }
  } catch (error) {
    console.log(error);
    res.json({
      success: false,
      message: error.message,
    });
  }
};
