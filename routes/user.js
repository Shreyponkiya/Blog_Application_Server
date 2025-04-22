const express = require("express");
const router = express.Router();
const User = require("../models/user");
const multer = require("multer");
const path = require("path");

router.get("/signin", (req, res) => {
  return res.render("signin");
});
router.get("/signup", (req, res) => {
  return res.render("signup");
});

const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, path.resolve(`./public/image/`));
  },
  filename: function (req, file, cb) {
    const fileName = `${Date.now()}-${file.originalname}`;
    cb(null, fileName);
  },
});
const upload = multer({ storage: storage });

router.post("/signin", async (req, res) => {
    const { email, password } = req.body;
    try {
      const token = await User.matchPasswordAndGenerateToken(email, password);
      if (!token) {
        return res.status(401).json({ error: "Invalid credentials" });
      }
      res.cookie("token", token, { httpOnly: true }); // Secure cookie
      return res.status(200).json({ message: "Login successful", token });
    } catch (err) {
      return res.status(401).json({ error: "Incorrect Email or password" });
    }
  });
  
router.get("/profile", async (req, res) => {
  try {
    const token = req.cookies.token;
    if (!token) {
      return res.status(401).json({ error: "Unauthorized" });
    }
    const user = await User.findByToken(token);
    if (!user) {
      return res.status(401).json({ error: "Unauthorized" });
    }
    return res.status(200).json({ user });
  } catch (err) {
    return res.status(500).json({ error: "Internal server error" });
  }
});
router.get("/getAllUser", async (req, res) => {
  try {
    const users = await User.find();
    return res.status(200).json({ users });
  } catch (err) {
    return res.status(500).json({ error: "Internal server error" });
  }
});
router.get("/profile/:id", async (req, res) => {
  try {
    const userId = req.params.id;
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }
    return res.status(200).json({ user });
  } catch (err) {
    return res.status(500).json({ error: "Internal server error" });
  }
});
router.post("/signup", async (req, res) => {
  try {
    const { fullname, email, password, profileImage } = req.body;

    if (!fullname || !email || !password || !profileImage) {
      return res.status(400).json({ error: "All fields are required" });
    }
    console.log("profileImage", profileImage);

    const user = await User.create({
      fullname,
      email,
      password,
      profileImage,
    });

    return res
      .status(201)
      .json({ message: "User registered successfully", user });
  } catch (error) {
    console.error("Signup error:", error);
    return res.status(500).json({ error: "Internal server error" });
  }
});
router.get("/logout", (req, res) => {
  res.clearCookie("token").redirect("/");
});

module.exports = router;
