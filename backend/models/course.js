import mongoose from "mongoose";

const courseSchema = new mongoose.Schema({
    title: { type: String, required: true },
    description: { type: String, required: true },
    duration: { type: Number, required: true },
    category: { type: String, required: true },
    icon: { type: String, default: "📚" },
    instructor: { type: String, required: true },
    students: { type: Number, default: 0 },
    createdAt: { type: Date, default: Date.now }
});

export default mongoose.model("Course", courseSchema);