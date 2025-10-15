console.log("App starting");

import express from "express";
import mongoose from "mongoose";
import dotenv from "dotenv";
import cors from "cors";
import authRoutes from "./routes/auth";
import protectedRoutes from "./routes/protected";
import taskRoutes from "./routes/tasks";
import { setupSwagger } from "./swagger";
import { graphqlHTTP } from "express-graphql";
import schema from "./graphql/schema";
import jwt from "jsonwebtoken";

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());

// Connect to MongoDB
async function connectDB() {
  let dbUri = process.env.MONGODB_URI!;

  // Use in-memory MongoDB only during testing
  if (process.env.NODE_ENV === "test") {
    const { MongoMemoryServer } = await import("mongodb-memory-server");
    const mongod = await MongoMemoryServer.create();
    dbUri = mongod.getUri();
    // Optionally store mongod to close after tests if you want
    (global as any).__MONGOD__ = mongod;
    console.log("Using in-memory MongoDB for testing");
  }

  await mongoose.connect(dbUri)
    .then(() => console.log("MongoDB connected"))
    .catch((err) => console.error("MongoDB connection error:", err));
}

connectDB();

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
      user = jwt.verify(authHeader.split(" ")[1], process.env.JWT_SECRET!);
    } catch (e) {
      console.log("JWT error:", e);
    }
  }
  (req as any).user = user;
  console.log("GRAPHQL MIDDLEWARE - user:", user);
  next();
}, graphqlHTTP((req, res) => ({
  schema,
  graphiql: true,
  context: { user: (req as any).user }
})));

setupSwagger(app);

if (process.env.NODE_ENV !== 'test') {
  app.listen(PORT, () => {
    console.log(`Server started on port ${PORT}`);
  });
}
export default app;