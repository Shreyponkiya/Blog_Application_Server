const express = require("express");
const Blog = require("../models/blog");
const Comment = require("../models/comment");
const { ObjectId } = require("mongodb");
const User = require("../models/user");

const router = express.Router();

// In server-side, modify your GET /allBlog route
router.get("/allBlog", async (req, res) => {
  try {
    const blogs = await Blog.find().populate(
      "createdBy",
      "fullname profileImage"
    );
    
    // Get the user ID from the request if available
    const userId = req.query.userId;
    
    if (userId) {
      // Find the user to check which blogs they've liked
      const user = await User.findById(userId);
      
      if (user && user.likeBlogId) {
        // Mark blogs as liked based on user's likeBlogId array
        const blogsWithLikeStatus = blogs.map(blog => {
          const blogObj = blog.toObject();
          blogObj.isLikedByCurrentUser = user.likeBlogId.includes(blog._id.toString());
          return blogObj;
        });
        
        return res.status(200).json(blogsWithLikeStatus);
      }
    }
    
    // If no user ID provided or user not found, return blogs without like status
    res.status(200).json(blogs);
  } catch (error) {
    res.status(500).json({ error: "Failed to fetch blogs" });
  }
});
router.post("/addblog", async (req, res) => {
  try {
    const { title, body, coverImageURL, createdBy } = req.body;
    console.log("req.body : ", req.body);

    const blog = new Blog({
      body,
      title,
      createdBy: createdBy || req.user._id, // Use createdBy from request body or fallback to req.user._id
      coverImageURL,
    });

    await blog.save(); // ✅ Fix: Save to MongoDB
    return res.status(201).json({ message: "Blog added successfully", blog });
  } catch (error) {
    console.error("Error adding blog:", error);
    return res.status(500).json({ error: "Failed to add blog" });
  }
});


// delete blog
router.delete("/deleteBlog/:blogId", async (req, res) => {
  try {
    const { blogId } = req.params;
    const blog = await Blog.findOneAndDelete({ _id: blogId });
    console.log("blog", blog);
    if (!blog) {
      return res.status(404).json({ error: "Blog not found" });
    }
    res.status(200).json({ message: "Blog deleted successfully" });
  } catch (error) {
    res.status(500).json({ error: "Error deleting blog" });
  }
});

// update blog
router.put("/updateBlog/:blogId", async (req, res) => {
  try {
    const { blogId } = req.params;
    const { title, body, coverImageURL } = req.body;
    const blog = await Blog.findOneAndUpdate(
      { _id: blogId },
      { title, body, coverImageURL },
      { new: true }
    );
    if (!blog) {
      return res.status(404).json({ error: "Blog not found" });
    }
    res.status(200).json({ message: "Blog updated successfully", blog });
  } catch (error) {
    res.status(500).json({ error: "Error updating blog" });
  }
});

// router.post("/like", async (req, res) => {
//   try {
//     const { userId, blogId } = req.body;

//     if (!userId || !blogId) {
//       return res.status(400).json({ error: "Missing userId or blogId" });
//     }

//     const user = await User.findById(userId);
//     if (!user) {
//       return res.status(404).json({ error: "User not found" });
//     }

//     const blog = await Blog.findById(blogId);
//     if (!blog) {
//       return res.status(404).json({ error: "Blog not found" });
//     }

//     const alreadyLiked = user.likeBlogId.includes(blogId);

//     if (alreadyLiked) {
//       // Unlike the blog
      
//       await User.findByIdAndUpdate(userId, { $pull: { likeBlogId: blogId, isliked: false } });

//       // Prevent negative likes
//       if (blog.likes > 0) {
//         await Blog.findByIdAndUpdate(blogId, { $inc: { likes: -1 } });
//       }

//       return res.status(200).json({ message: "Blog unliked successfully" });
//     } else {
//       // Like the blog
//       await User.findByIdAndUpdate(userId, { $addToSet: { likeBlogId: blogId, isliked: true } });
//       await Blog.findByIdAndUpdate(blogId, { $inc: { likes: 1 } });

//       return res.status(200).json({ message: "Blog liked successfully" });
//     }
//   } catch (error) {
//     console.error("Error liking/unliking blog:", error);
//     res.status(500).json({ error: "Error processing like/unlike request" });
//   }
// });
router.post("/like", async (req, res) => {
  try {
    const { userId, blogId } = req.body;

    if (!userId || !blogId) {
      return res.status(400).json({ error: "Missing userId or blogId" });
    }

    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }

    const blog = await Blog.findById(blogId);
    if (!blog) {
      return res.status(404).json({ error: "Blog not found" });
    }

    const alreadyLiked = user.likeBlogId.includes(blogId);

    if (alreadyLiked) {
      // Unlike the blog
      await User.findByIdAndUpdate(userId, { $pull: { likeBlogId: blogId } });

      // Prevent negative likes
      if (blog.likes > 0) {
        await Blog.findByIdAndUpdate(blogId, { $inc: { likes: -1 } });
      }

      return res.status(200).json({ 
        message: "Blog unliked successfully",
        isLiked: false 
      });
    } else {
      // Like the blog
      await User.findByIdAndUpdate(userId, { $addToSet: { likeBlogId: blogId } });
      await Blog.findByIdAndUpdate(blogId, { $inc: { likes: 1 } });

      return res.status(200).json({ 
        message: "Blog liked successfully",
        isLiked: true
      });
    }
  } catch (error) {
    console.error("Error liking/unliking blog:", error);
    res.status(500).json({ error: "Error processing like/unlike request" });
  }
});
router.get("/comments", async (req, res) => {
  try {
    const comments = await Comment.find({});
    res.status(200).json(comments);
  } catch (error) {
    res.status(500).json({ error: "Error fetching comments" });
  }
});
router.post("/comment/:blogId", async (req, res) => {
  try {
    const { userId, content } = req.body;
    await Comment.create({
      content,
      blogId: req.params.blogId,
      createdBy: userId,
    });

    const comments = await Comment.find({ blogId: req.params.blogId });
    res.status(200).json({ comments });
  } catch (error) {
    res.status(500).json({ error: "Error adding comment" });
  }
});

router.post("/like");

router.get("/comments/:blogId", async (req, res) => {
  try {
    const comments = await Comment.find({ blogId: req.params.blogId });
    res.status(200).json(comments);
  } catch (error) {
    res.status(500).json({ error: "Error fetching comments" });
  }
});



module.exports = router;
