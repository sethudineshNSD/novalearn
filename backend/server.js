import express from "express";
import mongoose from "mongoose";
import cors from "cors";
import dotenv from "dotenv";
import bcrypt from "bcrypt";
import Course from "./models/Course.js"; // ✅ Import Course model

dotenv.config();
const app = express();

// Middleware
app.use(cors());
app.use(express.json());

// MongoDB connection
mongoose.connect(process.env.MONGO_URI, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
})
.then(() => console.log("✅ MongoDB connected successfully"))
.catch(err => console.error("❌ MongoDB connection failed:", err));

// ==================== USER MODEL ====================
const userSchema = new mongoose.Schema({
    fullname: String,
    email: { type: String, unique: true },
    role: String,
    course: String,
    subject: String,
    password: String,
});

const User = mongoose.model("User", userSchema);

// ==================== AUTH ROUTES ====================

// 🧾 Register
app.post("/register", async (req, res) => {
    try {
        const { fullname, email, role, course, subject, password } = req.body;

        if (!fullname || !email || !role || !password) {
            return res.status(400).json({ message: "Please fill all required fields" });
        }

        const existingUser = await User.findOne({ email });
        if (existingUser) return res.status(400).json({ message: "User already exists" });

        const hashedPassword = await bcrypt.hash(password, 10);
        const newUser = new User({
            fullname,
            email,
            role,
            course: role === "student" ? course : null,
            subject: role === "teacher" ? subject : null,
            password: hashedPassword,
        });

        await newUser.save();
        res.status(200).json({ message: "Registration successful!" });
    } catch (error) {
        res.status(500).json({ message: "Server error" });
    }
});

// 🔐 Login
app.post("/login", async (req, res) => {
    try {
        const { email, password } = req.body;
        if (!email || !password)
            return res.status(400).json({ message: "Please enter both email and password" });

        const user = await User.findOne({ email });
        if (!user) return res.status(400).json({ message: "User not found" });

        const validPassword = await bcrypt.compare(password, user.password);
        if (!validPassword) return res.status(400).json({ message: "Invalid password" });

        res.status(200).json({
            message: "Login successful",
            role: user.role,
            fullname: user.fullname,
        });
    } catch (error) {
        res.status(500).json({ message: "Server error" });
    }
});

// ==================== COURSE ROUTES ====================

// 📘 Get all courses
app.get("/courses", async (req, res) => {
    try {
        const courses = await Course.find();
        res.status(200).json(courses);
    } catch (err) {
        res.status(500).json({ message: "Failed to fetch courses" });
    }
});

// ➕ Create new course (Teacher)
app.post("/courses", async (req, res) => {
    try {
        const { title, description, duration, category, icon, instructor } = req.body;
        if (!title || !description || !duration || !category || !instructor) {
            return res.status(400).json({ message: "All fields are required" });
        }

        const newCourse = new Course({
            title,
            description,
            duration,
            category,
            icon: icon || "📚",
            instructor,
        });

        await newCourse.save();
        res.status(201).json({ message: "Course created successfully", newCourse });
    } catch (err) {
        res.status(500).json({ message: "Error creating course" });
    }
});

// ❌ Delete a course
app.delete("/courses/:id", async (req, res) => {
    try {
        const { id } = req.params;
        const deleted = await Course.findByIdAndDelete(id);
        if (!deleted) return res.status(404).json({ message: "Course not found" });

        res.status(200).json({ message: "Course deleted successfully" });
    } catch (err) {
        res.status(500).json({ message: "Error deleting course" });
    }
});

// ======================================================
const PORT = process.env.PORT || 5001;
app.listen(PORT, () => console.log(`🚀 Server running on port ${PORT}`));