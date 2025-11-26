import { useState } from "react";
import API from "../api/api";

export default function LinkField({ setVideoId, style = "transparent" }) {
  const [link, setLink] = useState("");
  const [playlistId, setPlaylistId] = useState("");

  const extractVideoId = url => {
    const regex = /(?:youtube\.com\/watch\?v=|youtu\.be\/)([^&]+)/;
    const match = url.match(regex);
    return match ? match[1] : null;
  };

  const handleSetVideo = () => {
    const id = extractVideoId(link);
    if (id) setVideoId(id);
  };

  const handleSaveToPlaylist = async () => {
    if (!playlistId) return alert("Select playlist");
    const id = extractVideoId(link);
    if (!id) return alert("Invalid YouTube URL");
    await API.post("/playlist_videos", { playlistId, youtube_url: link, title: "Custom Video" });
    alert("Saved to playlist!");
  };

  const bgStyle =
    style === "transparent"
      ? "bg-white/20 text-white border"
      : style === "dark_translucent"
      ? "bg-black/40 text-white"
      : "bg-white/40 text-black";

  return (
    <div className={`flex items-center space-x-2 p-2 rounded-md ${bgStyle} w-full max-w-md self-end`}>
      <input
        type="text"
        placeholder="Enter YouTube link"
        value={link}
        onChange={e => setLink(e.target.value)}
        className="flex-1 p-2 rounded text-black"
      />
      <button onClick={handleSetVideo} className="bg-blue-500 px-4 rounded">Set Background</button>
      <button onClick={handleSaveToPlaylist} className="bg-green-500 px-4 rounded">Save</button>
    </div>
  );
}
