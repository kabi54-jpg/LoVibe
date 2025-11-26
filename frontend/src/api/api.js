import axios from "axios";

const BASE_URL = import.meta.env.VITE_API_URL || "http://localhost:5000/api";

export const api = axios.create({ baseURL: BASE_URL });

// Auth
export const loginUser = (data) => api.post("/login", data);
export const registerUser = (data) => api.post("/register", data);

// Playlists
export const getPlaylists = (token) =>
  api.get("/playlists", { headers: { Authorization: `Bearer ${token}` } });

export const createPlaylist = (name, token) =>
  api.post("/playlists", { name }, { headers: { Authorization: `Bearer ${token}` } });

export const deletePlaylist = (id, token) =>
  api.delete(`/playlists/${id}`, { headers: { Authorization: `Bearer ${token}` } });

// Playlist Videos
export const getPlaylistVideos = (playlistId, token) =>
  api.get(`/playlist_videos/${playlistId}`, { headers: { Authorization: `Bearer ${token}` } });

export const addPlaylistVideo = (playlistId, youtube_url, title, token) =>
  api.post("/playlist_videos", { playlistId, youtube_url, title }, { headers: { Authorization: `Bearer ${token}` } });

export const deletePlaylistVideo = (id, token) =>
  api.delete(`/playlist_videos/${id}`, { headers: { Authorization: `Bearer ${token}` } });
