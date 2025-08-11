import fs from "fs";
import imagekit from "../configs/imagekit.js";
import Post from "../models/Post.js";
import User from "../models/User.js";

// Add Post
export const addPost = async (req, res) => {
  try {
    const { userId } = await req.auth();
    const { content, post_type } = req.body;

    let image_urls = [];

    if (req.files && req.files.length) {
      image_urls = await Promise.all(
        req.files.map(async (image) => {
          const fileBuffer = fs.readFileSync(image.path);
          const response = await imagekit.upload({
            file: fileBuffer,
            fileName: image.originalname,
            folder: 'posts'
          });
          return imagekit.url({
            path: response.filePath,
            transformation: [
              { quality: "auto" },
              { format: "webp" },
              { width: "1280" }
            ],
          });
        })
      );
    }

    await Post.create({
      user: userId,
      content,
      image_urls,
      post_type,
      likes_count: []
    });

    res.json({
      success: true,
      message: "Post Created Successfully"
    });

  } catch (error) {
    console.log(error);
    res.json({
      success: false,
      message: error.message
    });
  }
};


// Get Posts

export const getFeedPosts = async (req, res) => {
  try {
    const { userId } = await req.auth();
    const user = await User.findById(userId);

    // User Connections and followings
    const userIds = [userId, ...user.connections, ...user.following];
    const post = await Post.find({ user: { $in: userIds } })
      .populate("user")
      .sort({ createdAt: -1 });

    res.json({
      success: true,
      post,
    });
  } catch (error) {
    console.log(error);
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
