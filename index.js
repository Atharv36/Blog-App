import express from "express";
// import bodyParser from "body-parser";
import mongoose from "mongoose";
import Post from "./models/post.js";
import dotenv from "dotenv";
dotenv.config();


mongoose.connect(process.env.MONGO_URL)
.then(() => console.log("MongoDB connected"))
.catch(err => console.error("MongoDB connection error:", err));

const app = express();
const port = 3000;

app.use(express.static("public"));

app.use(express.urlencoded({ extended: true }));
app.use(express.json());
//Home route to get all posts
app.get("/",async (req,res)=>{
  try{
    const response = await Post.find({});
    console.log(response);
    res.render("index.ejs",{posts:response}) 
  }catch(err){
    res.status(500).json({ message: "Error fetching posts" });
  }
});

//route to create a new Post
app.get("/new", (req, res) => {
  res.render("modify.ejs", { heading: "New Post", submit: "Create Post" });
});

//route to post the info to db
app.post("/new",(req,res)=>{
  let {title,content,author}=req.body;
  let newPost = new Post({
    title:title,
    content:content,
    author:author,
    createdAt:new Date(),
  });
  console.log(newPost);
  newPost.save().then(()=>{console.log("Post was saved")}).catch(err=>{console.log(err)})
  res.redirect("/")
} )

//route to get infor the particular post
app.get("/edit/:id", async (req, res) => {
  try {
    let {id} = req.params;
    const response = await Post.findById(id)
    console.log(response);
    res.render("modify.ejs", {
      heading: "Edit Post",
      submit: "Update Post",
      post: response,
    });
  } catch (error) {
    res.status(500).json({ message: "Error fetching post" });
  }
});

//route to delete a post by taking id from params
app.get("/posts/delete/:id" , async (req,res)=>{
  try{
    let {id} = req.params;
    await Post.findByIdAndDelete(id);
    res.redirect("/");
  }catch (error) {
    console.error("Error deleting post:", error);
    res.status(500).json({ message: "Error deleting post" });
  }
});


//route to edit the info of post
app.post("/posts/:id", async (req, res) => {
  console.log("called");
  try {
    let {id} = req.params;
    let {title,content,author} =req.body;
    let updatedPost = await Post.findByIdAndUpdate(id,{title:title,content:content,author:author},{ runValidators: true, new: true })
    console.log(updatedPost);
    res.redirect("/");
  } catch (error) {
    res.status(500).json({ message: "Error updating post" });
  }
});
app.use((req, res) => {
  res.status(404).render("404.ejs", { url: req.originalUrl });
});

app.listen(port, () => {
  console.log(`Backend server is running on http://localhost:${port}`);
});
