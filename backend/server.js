require('dotenv').config();
const express = require('express');
const mysql = require('mysql2/promise');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const cors = require('cors');

const app = express();
app.use(cors());
app.use(express.json());

const db = mysql.createPool({
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME
});
db.getConnection()
  .then(conn => {
    console.log("Connected to MySQL");
    conn.release();
  })
  .catch(err => {
    console.error(" MySQL connection failed:", err.message);
  });
const SECRET = process.env.JWT_SECRET;

// --- Auth ---
app.post('/api/register', async (req,res)=>{
  const { username,email,password } = req.body;
  const hash = await bcrypt.hash(password,10);
  try {
    await db.query('INSERT INTO users (username,email,password_hash) VALUES (?,?,?)',[username,email,hash]);
    res.json({ success:true });
  } catch(e){
    res.status(400).json({ success:false, message:e.message });
  }
});

app.post('/api/login', async (req,res)=>{
  const { email,password } = req.body;
  const [rows] = await db.query('SELECT * FROM users WHERE email=?',[email]);
  if(rows.length===0) return res.status(400).json({ success:false, message:'User not found' });
  const user = rows[0];
  const match = await bcrypt.compare(password,user.password_hash);
  if(!match) return res.status(400).json({ success:false, message:'Wrong password' });
  const token = jwt.sign({ id:user.id },SECRET,{ expiresIn:'1d' });
  res.json({ success:true, token, username:user.username, userId:user.id });
});

// --- Middleware to verify JWT ---
const authMiddleware = (req,res,next)=>{
  const authHeader = req.headers['authorization'];
  if(!authHeader) return res.status(401).json({ message:'No token' });
  const token = authHeader.split(' ')[1];
  jwt.verify(token,SECRET,(err,user)=>{
    if(err) return res.status(403).json({ message:'Invalid token' });
    req.user = user;
    next();
  });
};

// --- Playlists ---
app.get('/api/playlists', authMiddleware, async (req,res)=>{
  const userId = req.user.id;
  const [playlists] = await db.query('SELECT * FROM playlists WHERE user_id=?',[userId]);
  res.json(playlists);
});

app.post('/api/playlists', authMiddleware, async (req,res)=>{
  const { name } = req.body;
  const userId = req.user.id;
  const [result] = await db.query('INSERT INTO playlists (user_id,name) VALUES (?,?)',[userId,name]);
  res.json({ id: result.insertId });
});

app.delete('/api/playlists/:id', authMiddleware, async (req,res)=>{
  const id = req.params.id;
  await db.query('DELETE FROM playlists WHERE id=?',[id]);
  await db.query('DELETE FROM playlist_videos WHERE playlist_id=?',[id]);
  res.json({ success:true });
});

// --- Playlist videos ---
app.get('/api/playlist_videos/:playlistId', authMiddleware, async (req,res)=>{
  const playlistId = req.params.playlistId;
  const [videos] = await db.query('SELECT * FROM playlist_videos WHERE playlist_id=?',[playlistId]);
  res.json(videos);
});

app.post('/api/playlist_videos', authMiddleware, async (req,res)=>{
  const { playlistId, youtube_url, title } = req.body;
  const [result] = await db.query('INSERT INTO playlist_videos (playlist_id,youtube_url,title) VALUES (?,?,?)',[playlistId,youtube_url,title]);
  res.json({ id: result.insertId });
});

app.delete('/api/playlist_videos/:id', authMiddleware, async (req,res)=>{
  const id = req.params.id;
  await db.query('DELETE FROM playlist_videos WHERE id=?',[id]);
  res.json({ success:true });
});

if (process.env.NODE_ENV !== "test") {
  app.listen(process.env.PORT, () =>
    console.log(`Server running on http://localhost:${process.env.PORT}`)
  );
}

module.exports = app;

