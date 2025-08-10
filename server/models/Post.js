import mongoose from "mongoose";

const postSchema = new mongoose.Schema({
  user:{
    type: String,
    ref: 'User',
    required: true,
  },
  const: {
    type: String
  },
  image_url: [{
    type:String
  }],
  post_type: {
    type:String,
    enum: ['text', 'image', 'text-with-image'],
    require:true
  },
  likes_count:{
    type: String,
    ref: 'User',
    required: true,
  },
},{timestamps: true, minimize:false})

const Post = mongoose.model('Post', postSchema)

export default Post