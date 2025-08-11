import mongoose from "mongoose";

const postSchema = new mongoose.Schema({
  user:{
    type: String,
    ref: 'User',
    required: true,
  },
  content: {
    type: String
  },
  image_urls: [{
    type:String
  }],
  post_type: {
    type:String,
    enum: ['text', 'image', 'text_with_image'],
    require:true
  },
  likes_count:{
    type: [String],
    ref: 'User',
    default:[],
    required: true,
  },
},{timestamps: true, minimize:false})

const Post = mongoose.model('Post', postSchema)

export default Post