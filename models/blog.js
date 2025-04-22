const { Schema, model } = require("mongoose");
const blogSchema = new Schema(
  {
    title: {
      type: String,
      required: true,
    },
    body: {
      type: String,
      required: true,
    },
    coverImageURL: {
      type: String,
      required: true,
    },
    likes: {
      type: Number,
      default: 0,
      required: false,
    },
    comments: [
      {
        type: Schema.Types.ObjectId,
        ref: "comment",        
        required: false,
      },
    ],
    createdBy: {
      type: Schema.Types.ObjectId,
      isliked: false,
      ref: "user",
      required: true,
    },
  },
  { timestamps: true }
);

const Blog = model("blog", blogSchema);

module.exports = Blog;
