import request from "supertest";
import app from "../index";
import mongoose from "mongoose";

describe("Auth API", () => {
  it("registers a user with valid data", async () => {
    const randomEmail = `testuser+${Date.now()}@example.com`;
    const res = await request(app)
      .post("/api/auth/register")
      .send({ email: randomEmail, password: "testpass123" });
    expect(res.statusCode).toBe(201);
    expect(res.body.message).toBe("User registered successfully");
  }, 20000);

  it("fails with short password", async () => {
    const res = await request(app)
      .post("/api/auth/register")
      .send({ email: `short+${Date.now()}@example.com`, password: "123" });
    expect(res.statusCode).toBe(400);
  });

  afterAll(async () => {
    await mongoose.disconnect();
    if ((global as any).__MONGOD__) {
    await (global as any).__MONGOD__.stop();}
  });
});