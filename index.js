const express = require("express");
const app = express();
const path = require("path");
const userRoute = require("./routes/user");
const blogRoute = require("./routes/blog");
const mongoose = require("mongoose");
const cors = require("cors");
const cookieparser = require("cookie-parser");
const { chackForAuthenticationCookie } = require("./middlewares/authentication");

const PORT = 8000;

// ✅ CORS Middleware should come first!
app.use(
  cors({
    origin: "http://localhost:5173",
    credentials: true,
  })
);

app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieparser());
app.use(chackForAuthenticationCookie("token"));

app.set("view engine", "ejs");
app.set("views", path.resolve("./views"));
app.use(express.static(path.resolve("./public")));

app.use("/blog", blogRoute);
app.use("/user", userRoute);

mongoose
  .connect("mongodb://127.0.0.1:27017/blogs")
  .then(() => console.log("Mongoose connection successful"))
  .catch(() => console.log("Mongoose connection error"));

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
