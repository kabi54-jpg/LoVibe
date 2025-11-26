const request = require("supertest");
const app = require("../server");
const mysql = require("mysql2/promise");
require("dotenv").config();

let db;

beforeAll(async () => {
  db = await mysql.createConnection({
    host: process.env.DB_HOST,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME
  });

  // Clear tables before testing
  await db.query("DELETE FROM users");
  await db.query("DELETE FROM playlists");
  await db.query("DELETE FROM playlist_videos");
});

afterAll(async () => {
  await db.end();
});


   //1. TEST USER REGISTRATION

test("Register user", async () => {
  const res = await request(app)
    .post("/api/register")
    .send({
      username: "testuser",
      email: "test@example.com",
      password: "123456"
    });

  expect(res.statusCode).toBe(200);
  expect(res.body.success).toBe(true);
});

// 2. TEST LOGIN
 
let token;
let userId;

test("Login user", async () => {
  const res = await request(app)
    .post("/api/login")
    .send({
      email: "test@example.com",
      password: "123456"
    });

  expect(res.statusCode).toBe(200);
  expect(res.body.success).toBe(true);
  expect(res.body.token).toBeDefined();

  token = res.body.token;
  userId = res.body.userId;
});


//3. CREATE PLAYLIST

let playlistId;

test("Create playlist", async () => {
  const res = await request(app)
    .post("/api/playlists")
    .set("Authorization", `Bearer ${token}`)
    .send({ name: "Study Playlist" });

  expect(res.statusCode).toBe(200);
  expect(res.body.id).toBeDefined();

  playlistId = res.body.id;
});


//4. GET PLAYLISTS

test("Get playlists", async () => {
  const res = await request(app)
    .get("/api/playlists")
    .set("Authorization", `Bearer ${token}`);

  expect(res.statusCode).toBe(200);
  expect(Array.isArray(res.body)).toBe(true);
});
//5. ADD VIDEO TO PLAYLIST

let videoId;

test("Add video", async () => {
  const res = await request(app)
    .post("/api/playlist_videos")
    .set("Authorization", `Bearer ${token}`)
    .send({
      playlistId,
      youtube_url: "https://youtu.be/dQw4w9WgXcQ",
      title: "Test Video"
    });

  expect(res.statusCode).toBe(200);
  expect(res.body.id).toBeDefined();

  videoId = res.body.id;
});


//6. GET VIDEOS FROM PLAYLIST

test("Get playlist videos", async () => {
  const res = await request(app)
    .get(`/api/playlist_videos/${playlistId}`)
    .set("Authorization", `Bearer ${token}`);

  expect(res.statusCode).toBe(200);
  expect(Array.isArray(res.body)).toBe(true);
});


//7. DELETE VIDEO

test("Delete video", async () => {
  const res = await request(app)
    .delete(`/api/playlist_videos/${videoId}`)
    .set("Authorization", `Bearer ${token}`);

  expect(res.statusCode).toBe(200);
  expect(res.body.success).toBe(true);
});


//8. DELETE PLAYLIST

test("Delete playlist", async () => {
  const res = await request(app)
    .delete(`/api/playlists/${playlistId}`)
    .set("Authorization", `Bearer ${token}`);

  expect(res.statusCode).toBe(200);
  expect(res.body.success).toBe(true);
});
