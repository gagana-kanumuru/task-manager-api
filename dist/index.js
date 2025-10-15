console.log("App starting");
import express from "express";
import mongoose from "mongoose";
import dotenv from "dotenv";
import cors from "cors";
import authRoutes from "./routes/auth.js";
import protectedRoutes from "./routes/protected.js";
import taskRoutes from "./routes/tasks.js";
import { setupSwagger } from "./swagger.js";
import { graphqlHTTP } from "express-graphql";
import schema from "./graphql/schema.js";
import jwt from "jsonwebtoken";
dotenv.config();
const app = express();
const PORT = process.env.PORT || 5000;
app.use(cors());
app.use(express.json());
// Connect to MongoDB
mongoose.connect(process.env.MONGODB_URI)
    .then(() => console.log("MongoDB connected"))
    .catch((err) => console.error("MongoDB connection error:", err));
app.get("/", (req, res) => {
    res.send("API is running!");
});
// Auth routes
app.use("/api/auth", authRoutes);
app.use("/api/protected", protectedRoutes);
app.use("/api/tasks", taskRoutes);
app.use("/api/graphql", (req, res, next) => {
    const authHeader = req.headers.authorization;
    let user = null;
    if (authHeader && authHeader.startsWith("Bearer ")) {
        try {
            user = jwt.verify(authHeader.split(" ")[1], process.env.JWT_SECRET);
        }
        catch (e) {
            console.log("JWT error:", e);
        }
    }
    req.user = user;
    console.log("GRAPHQL MIDDLEWARE - user:", user);
    next();
}, graphqlHTTP((req, res) => ({
    schema,
    graphiql: true,
    context: { user: req.user }
})));
setupSwagger(app);
app.listen(PORT, () => {
    console.log(`Server started on port ${PORT}`);
});
