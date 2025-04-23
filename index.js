const dotenv = require("dotenv").config();
const Blog = require("./models/blog");
const Comment = require("./models/comment");
const User = require("./models/user");
const express = require("express");
const app = express();
const path = require("path");
const userRoute = require("./routes/user");
const blogRoute = require("./routes/blog");
const mongoose = require("mongoose");
const cors = require("cors");
const cookieparser = require("cookie-parser");
const {
  chackForAuthenticationCookie,
} = require("./middlewares/authentication");

const PORT = 8000;
const MONGODB_URI = process.env.MONGODB_URI || "mongodb://localhost:27017/blogapp";


mongoose
  .connect(MONGODB_URI)
  .then(() => console.log("Mongoose connection successful"))
  .catch(() => ("Mongoose connection error"));
// ✅ CORS Middleware should come first!
app.use(cors());

app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieparser());
app.use(chackForAuthenticationCookie("token"));

app.set("view engine", "ejs");
app.set("views", path.resolve("./views"));
app.use(express.static(path.join(__dirname, 'public')));

app.use("/blog", blogRoute);
app.use("/user", userRoute);

app.get("/", async (req, res) => {
  try {
    const allblogs = await Blog.find({}).sort("createdAt");
    const content = await Comment.find({});
    let email = req.user ? req.user.email : null;
    const fullusername = await User.find({ email });
    const fullname = req.user ? fullusername[0].fullname : null;

    res.render("home", {
      fullname: fullname,
      user: req.user,
      blogs: allblogs,
      comments: content,
    });
  } catch (err) {
    console.error("Error in home route:", err);
    res.status(500).send("Internal Server Error");
  }
});

app.listen(PORT, () => {
  console.log("Server Started on PORT:", PORT);
});
