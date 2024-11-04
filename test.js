import { describe, it, test, before, beforeEach, after } from "node:test";
import assert from "node:assert/strict";
import request from "supertest";
import app from "./src/app.js";
import { closeMongoDB, connectToMongoDB } from "./src/db/db.js";
import { initTest } from "./src/utils/testing.js";

before(async () => {
  await connectToMongoDB();
  await initTest();
});

after(async () => {
  await initTest();
  await closeMongoDB();
});

describe("Health Check Test", async () => {
  await request(app).get("/").expect(200, "OK");
  await request(app).get("/liveness").expect(200, "Service is up");
  await request(app).get("/readiness").expect(200, "Service is ready");
});

describe("Register and Login Test", async () => {
  await request(app)
    .post("/api/auth/register")
    .set("Content-Type", "application/json; charset=utf-8")
    .send({
      nickname: "testuser",
      password: "password1",
      confirmPassword: "password1",
    })
    .expect(201);

  await request(app)
    .post("/api/auth/login")
    .set("Content-Type", "application/json; charset=utf-8")
    .send({
      nickname: "testuser",
      password: "password1",
    })
    .expect(200);
});

describe("Post CRUD Test", async () => {
  let token;
  let post_id;

  before(async () => {
    const response = await request(app)
      .post("/api/auth/login")
      .set("Content-Type", "application/json; charset=utf-8")
      .send({
        nickname: "testuser",
        password: "password1",
      })
      .expect(200);

    token = response.body.data.accessToken;
  });

  test("Create Test", async () => {
    const response = await request(app)
      .post("/api/posts")
      .set("Content-Type", "application/json; charset=utf-8")
      .set("Authorization", `Bearer ${token}`)
      .send({
        title: "title",
        content: "content",
      })
      .expect(201);

    post_id = response.body.data._id;
  });

  test("Update Test", async () => {
    await request(app)
      .put(`/api/posts/${post_id}`)
      .set("Content-Type", "application/json; charset=utf-8")
      .set("Authorization", `Bearer ${token}`)
      .send({
        title: "title2",
        content: "content2",
      })
      .expect(200);
  });

  test("Delete Test", async () => {
    await request(app)
      .delete(`/api/posts/${post_id}`)
      .set("Content-Type", "application/json; charset=utf-8")
      .set("Authorization", `Bearer ${token}`)
      .expect(204);
  });
});

describe("Comment CRUD Test", async () => {
  let token;
  let post_id;
  let comment_id;

  before(async () => {
    let response = await request(app)
      .post("/api/auth/login")
      .set("Content-Type", "application/json; charset=utf-8")
      .send({
        nickname: "testuser",
        password: "password1",
      })
      .expect(200);

    token = response.body.data.accessToken;

    response = await request(app)
      .post("/api/posts")
      .set("Content-Type", "application/json; charset=utf-8")
      .set("Authorization", `Bearer ${token}`)
      .send({
        title: "title",
        content: "content",
      })
      .expect(201);

    post_id = response.body.data._id;
  });

  test("Create Test", async () => {
    const response = await request(app)
      .post(`/api/posts/${post_id}/comments`)
      .set("Content-Type", "application/json; charset=utf-8")
      .set("Authorization", `Bearer ${token}`)
      .send({
        content: "content",
      })
      .expect(201);

    comment_id = response.body.data._id;
  });

  test("Update Test", async () => {
    await request(app)
      .put(`/api/posts/${post_id}/comments/${comment_id}`)
      .set("Content-Type", "application/json; charset=utf-8")
      .set("Authorization", `Bearer ${token}`)
      .send({
        content: "content2",
      })
      .expect(200);
  });

  test("Delete Test", async () => {
    await request(app)
      .delete(`/api/posts/${post_id}/comments/${comment_id}`)
      .set("Content-Type", "application/json; charset=utf-8")
      .set("Authorization", `Bearer ${token}`)
      .expect(204);
  });
});
