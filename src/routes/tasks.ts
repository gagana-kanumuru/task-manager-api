import express, { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";
import Task from "../models/Task";
import { taskCreateSchema, taskUpdateSchema } from "../validation/taskValidation";

declare module "express-serve-static-core" {
  interface Request {
    user?: any; // Or type as needed
  }
}

// Middleware to check if user is admin
function isAdmin(req: Request, res: Response, next: NextFunction) {
  if (req.user?.role !== "admin") {
    return res.status(403).json({ message: "Access denied: Admins only" });
  }
  next();
}

const router = express.Router();

// Admin-only: Get all tasks in the system
router.get("/all", authMiddleware, isAdmin, async (req, res) => {
  try {
    const tasks = await Task.find().populate("user", "email role");
    res.json(tasks);
  } catch (err) {
    res.status(500).json({ message: "Server error" });
  }
});

// Middleware to verify JWT and attach user
function authMiddleware(req: Request, res: Response, next: NextFunction) {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return res.status(401).json({ message: "No token, authorization denied" });
  }
  const token = authHeader.split(" ")[1];
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET!);
    req.user = decoded;
    next();
  } catch (err) {
    return res.status(401).json({ message: "Invalid token" });
  }
}

// Create a new task
router.post("/", authMiddleware, async (req, res) => {
  const { title, description } = req.body;
  const { error } = taskCreateSchema.validate(req.body);
  if (error) return res.status(400).json({ message: error.details[0].message });
  try {
    const task = new Task({
      title,
      description,
      user: req.user.userId
    });
    await task.save();
    res.status(201).json(task);
  } catch (err) {
    res.status(500).json({ message: "Server error" });
  }
});

// Get all tasks for logged-in user
router.get("/", authMiddleware, async (req, res) => {
  try {
    const tasks = await Task.find({ user: req.user.userId });
    res.json(tasks);
  } catch (err) {
    res.status(500).json({ message: "Server error" });
  }
});

// Update a task (admin: any task; user: own task)
router.put("/:id", authMiddleware, async (req, res) => {
  const { error } = taskUpdateSchema.validate(req.body);
  if (error) return res.status(400).json({ message: error.details[0].message });

  // Here’s the difference: the filter changes if you’re admin or not
  const filter = req.user?.role === "admin"
    ? { _id: req.params.id }
    : { _id: req.params.id, user: req.user.userId };

  try {
    const task = await Task.findOneAndUpdate(
      filter,
      req.body,
      { new: true }
    );
    if (!task) return res.status(404).json({ message: "Task not found" });
    res.json(task);
  } catch (err) {
    res.status(500).json({ message: "Server error" });
  }
});

// Delete a task (admin: any task; user: own task)
router.delete("/:id", authMiddleware, async (req, res) => {
  // Only admins can delete any task; users only their own
  const filter = req.user?.role === "admin"
    ? { _id: req.params.id }
    : { _id: req.params.id, user: req.user.userId };

  try {
    const task = await Task.findOneAndDelete(filter);
    if (!task) return res.status(404).json({ message: "Task not found" });
    res.json({ message: "Task deleted" });
  } catch (err) {
    res.status(500).json({ message: "Server error" });
  }
});

export default router;