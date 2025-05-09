import mongoose from "mongoose";
const postSchema = mongoose.Schema({
    title: {
      type: String,
      required: true,
    },
    createdAt: {
      type: Date,
      required: true
    },
    content: {
      type: String,
      maxLength: 500,
      required: true
    },
    author: {
      type: String,
      default: "Anonymous",
    },
    imageUrl: {
      type: String, // store the image file name or path
      default: null,
    }
  });
  

const Post = mongoose.model("Post",postSchema)
export default Post;