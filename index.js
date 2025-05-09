import express from "express";
// import bodyParser from "body-parser";
import mongoose from "mongoose";
import Post from "./models/post.js";
import dotenv from "dotenv";
import multer from "multer";
import path from "path";

dotenv.config();

mongoose.connect(process.env.MONGO_URL)
.then(() => console.log("MongoDB connected"))
.catch(err => console.error("MongoDB connection error:", err));

const app = express();
const port = 3000;

app.use(express.static("public"));

app.use(express.urlencoded({ extended: true }));
app.use(express.json());
// Configure multer for file upload
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, 'public/uploads'); // store files in public/uploads
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, uniqueSuffix + path.extname(file.originalname));
  }
});
const upload = multer({ storage: storage });

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
app.post("/new", upload.single('image'), async (req, res) => {
  let { title, content, author } = req.body;
  let imageUrl = req.file ? "/uploads/" + req.file.filename : null;

  let newPost = new Post({
    title,
    content,
    author,
    createdAt: new Date(),
    imageUrl,
  });

  try {
    await newPost.save();
    console.log("Post was saved");
    res.redirect("/");
  } catch (err) {
    console.log(err);
    res.status(500).send("Error saving post");
  }
});


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
app.post("/posts/:id", upload.single("image"), async (req, res) => {
  try {
    const { id } = req.params;
    const { title, content, author } = req.body;

    // Build updated fields
    const updatedFields = {
      title,
      content,
      author,
    };

    // If a new image was uploaded, update imageUrl
    if (req.file) {
      updatedFields.imageUrl = "/uploads/" + req.file.filename;
    }

    const updatedPost = await Post.findByIdAndUpdate(id, updatedFields, {
      runValidators: true,
      new: true,
    });

    res.redirect("/");
  } catch (error) {
    console.error("Error updating post:", error);
    res.status(500).json({ message: "Error updating post" });
  }
});

app.use((req, res) => {
  res.status(404).render("404.ejs", { url: req.originalUrl });
});

app.listen(port, () => {
  console.log(`Backend server is running on http://localhost:${port}`);
});
