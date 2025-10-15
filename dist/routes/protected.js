import express from "express";
import jwt from "jsonwebtoken";
const router = express.Router();
router.get("/secret", (req, res) => {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
        return res.status(401).json({ message: "No token, authorization denied" });
    }
    const token = authHeader.split(" ")[1];
    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        res.json({ message: "Protected data access granted", user: decoded });
    }
    catch (err) {
        res.status(401).json({ message: "Invalid token" });
    }
});
export default router;
