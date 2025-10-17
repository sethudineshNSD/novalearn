import mongoose from "mongoose";

const courseSchema = new mongoose.Schema({
  title: { type: String, required: true },
  description: { type: String, required: true },
  duration: { type: Number, required: true },
  category: { type: String, required: true },
  icon: { type: String },
  instructor: { type: String },
});

export default mongoose.model("Course", courseSchema);