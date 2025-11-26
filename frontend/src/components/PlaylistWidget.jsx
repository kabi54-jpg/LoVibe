import { useState, useEffect, useCallback } from "react";
import { Rnd } from "react-rnd"; 
import { TrashIcon, PlusIcon, XMarkIcon, PlayIcon } from "@heroicons/react/24/solid";

// LOCAL STUBS: 
const useAuth = () => ({ user: { token: 'mock' } }); 
const loadWidgetState = (key, defaultState) => defaultState;
const saveWidgetState = () => {};
const getPlaylists = () => Promise.resolve({ data: [{ id: 1, name: 'Lofi Focus ' }] }); 
const getPlaylistVideos = (playlistId) => {
    if (playlistId === 1) {
        return Promise.resolve({ 
            data: [
                { id: 101, youtube_url: 'https://youtu.be/5qap5aO4i9A', title: 'Rainy Day Lofi' },
                { id: 102, youtube_url: 'https://youtu.be/1Q8r3iYn-0o', title: 'Study Beats' }
            ] 
        });
    }
    return Promise.resolve({ data: [] });
}; 
const createPlaylist = (name) => Promise.resolve({ data: { id: Date.now(), name: name } });
const deletePlaylist = () => Promise.resolve();
const addPlaylistVideo = (playlistId, url, title) => Promise.resolve({ data: { id: Date.now(), youtube_url: url, title: title || `Untitled Video (${url})` } });
const deletePlaylistVideo = () => Promise.resolve();
// --- END STUBS ---


const getWidgetClasses = (style) => {
    switch (style) {
        case 'black_low_opacity':
            return 'bg-gray-900/60 text-white'; 
        case 'white_low_opacity':
            return 'bg-white/30 text-black'; 
        case 'transparent_black':
            return 'bg-transparent border border-black text-black backdrop-blur-md'; 
        case 'transparent_white':
            return 'bg-transparent border border-white text-white backdrop-blur-md'; 
        default:
            return 'bg-gray-900/60 text-white';
    }
};


export default function PlaylistWidget({ close, style, onVideoSelect }) {
    const { user } = useAuth();
    const token = user?.token;
    const widgetClasses = getWidgetClasses(style);

    // State setup
    const [playlists, setPlaylists] = useState([]);
    const [selected, setSelected] = useState(null);
    const [newPlaylistName, setNewPlaylistName] = useState("");
    const [newVideoUrl, setNewVideoUrl] = useState("");
    const [videos, setVideos] = useState([]);
    const [currentVideoUrl, setCurrentVideoUrl] = useState(null); 

    const defaultState = { x: 50, y: 50, width: 320, height: 420, zIndex: 20 };
    const [widgetState, setWidgetState] = useState(() => loadWidgetState("playlistWidget", defaultState));
    
    // --- Theme Logic for Inputs and Buttons ---
    
    // Determines if the primary text color is WHITE
    const isPrimaryTextColorWhite = style === 'black_low_opacity' || style === 'transparent_white'; 
    
    // Input styling
    const inputBgClass = isPrimaryTextColorWhite ? 'bg-gray-700' : 'bg-white';
    const inputTextColorClass = isPrimaryTextColorWhite ? 'text-white' : 'text-black';
    const inputPlaceholderClass = isPrimaryTextColorWhite ? 'placeholder:text-gray-400' : 'placeholder:text-gray-600';
    const inputStyling = `${inputBgClass} ${inputTextColorClass} ${inputPlaceholderClass} focus:ring-indigo-500 focus:ring-2 focus:outline-none`;

   
    const MINIMAL_BUTTON_CLASS = `bg-current/[.15] hover:bg-current/[.25] text-current p-2 rounded text-sm font-medium transition`;
    
    // API handlers 
    const fetchPlaylists = async () => {
        try {
            const res = await getPlaylists(token);
            setPlaylists(res.data);
            if (res.data.length > 0 && selected === null) {
                setSelected(res.data[0].id);
            }
        } catch (err) { console.error("Stub Error:", err); }
    };

    const handleVideoSelect = useCallback((url) => {
        setCurrentVideoUrl(url);
        if (onVideoSelect) {
            onVideoSelect(url);
        } else {
            console.warn("[PlaylistWidget]: onVideoSelect prop not provided. Video URL ready:", url);
        }
    }, [onVideoSelect]);

    const fetchVideos = async (id) => {
        if (!id) return setVideos([]);
        try {
            const res = await getPlaylistVideos(id, token);
            setVideos(res.data);
            if (res.data.length > 0) {
                // Automatically trigger play on the first video when playlist loads
                handleVideoSelect(res.data[0].youtube_url);
            } else {
                setCurrentVideoUrl(null);
                // Stop any current playback if the list is empty
                if (onVideoSelect) onVideoSelect(null);
            }
        } catch (err) { console.error("Stub Error:", err); }
    };

    useEffect(() => {
        fetchPlaylists();
    }, [token]);

    useEffect(() => {
        if (selected !== null) {
            fetchVideos(selected);
        }
    }, [selected, token]);


    const handleAddPlaylist = async () => {
        if (!newPlaylistName) return;
        try {
            const res = await createPlaylist(newPlaylistName, token); 
            const newP = { id: res.data.id, name: newPlaylistName };
            setPlaylists([...playlists, newP]);
            setNewPlaylistName("");
            setSelected(newP.id);
        } catch (err) { console.error("Stub Error:", err); }
    };
    
    const handleDeletePlaylist = async (id) => {
        try {
            await deletePlaylist(id, token);
            setPlaylists(playlists.filter(p => p.id !== id));
            if (selected === id) {
                setSelected(null);
                setVideos([]);
            }
        } catch (err) { console.error("Stub Error:", err); }
    };

    const handleAddVideo = async () => {
        if (!selected || !newVideoUrl) return;
        try {
            const res = await addPlaylistVideo(selected, newVideoUrl, null, token); 
            setVideos([...videos, res.data]);
            setNewVideoUrl("");
            // Immediately play the new video
            handleVideoSelect(res.data.youtube_url);
        } catch (err) { console.error("Stub Error:", err); }
    };

    const handleDeleteVideo = async (videoId) => {
        try {
            await deletePlaylistVideo(videoId, token);
            setVideos(videos.filter(v => v.id !== videoId));
        } catch (err) { console.error("Stub Error:", err); }
    };

    // --- Render ---

    return (
        <Rnd
            size={{ width: widgetState.width, height: widgetState.height }}
            position={{ x: widgetState.x, y: widgetState.y }}
            onDragStart={() => setWidgetState((prev) => ({ ...prev, zIndex: 100 }))}
            onDragStop={(e, d) => {
                const newState = { ...widgetState, x: d.x, y: d.y, zIndex: 20 };
                setWidgetState(newState);
                saveWidgetState("playlistWidget", newState);
            }}
            onResizeStop={(e, direction, ref, delta, position) => {
                const newState = {
                    x: position.x, y: position.y, zIndex: 20,
                    width: parseInt(ref.style.width),
                    height: parseInt(ref.style.height),
                };
                setWidgetState(newState);
                saveWidgetState("playlistWidget", newState);
            }}
            minWidth={250}
            minHeight={250}
            bounds="parent"
            dragHandleClassName="drag-handle"
            className="z-30" 
        >
            <div className={`p-4 h-full rounded-xl shadow-lg border border-white/10 ${widgetClasses}`}>
                
                <div className="flex justify-between items-center mb-2 drag-handle cursor-move">
                    <h2 className="text-lg font-bold">Playlists</h2>
                    <div className="flex gap-2 items-center">
                        {/* Display current playing video URL (simplified) */}
                        {currentVideoUrl && <span className="text-xs opacity-70">Playing: {currentVideoUrl.substring(0, 15)}...</span>}
                        <XMarkIcon className="w-5 h-5 cursor-pointer" onClick={close} /> 
                    </div>
                </div>

                {/* --- 1. New Playlist Input --- */}
                <div className="flex mb-3 space-x-2">
                    <input
                        type="text"
                        placeholder="New playlist name..."
                        value={newPlaylistName}
                        onChange={(e) => setNewPlaylistName(e.target.value)}
                        className={`flex-1 p-2 rounded ${inputStyling}`}
                    />
                    <button
                        onClick={handleAddPlaylist}
                        className={MINIMAL_BUTTON_CLASS}
                    >
                        <PlusIcon className="w-4 h-4" />
                    </button>
                </div>

                {/* --- 2. Playlists List --- */}
                <h3 className="font-semibold text-sm mb-1 opacity-90">Your Lists:</h3>
                <ul className="space-y-1 max-h-40 overflow-y-auto pr-2 mb-4 custom-scrollbar">
                    {playlists.map((p) => (
                        <li
                            key={p.id}
                            className={`flex justify-between items-center p-2 rounded cursor-pointer transition text-sm ${
                                selected === p.id ? "bg-indigo-600 font-bold" : "bg-current/[.15] hover:bg-current/[.25]"
                            }`}
                            onClick={() => setSelected(p.id)}
                        >
                            <span className="truncate">{p.name}</span>
                            <TrashIcon 
                                className="w-4 h-4 text-red-500 hover:text-red-700 transition flex-shrink-0 ml-2" 
                                onClick={(e) => {
                                    e.stopPropagation();
                                    handleDeletePlaylist(p.id);
                                }} 
                            />
                        </li>
                    ))}
                    {playlists.length === 0 && <li className="text-sm opacity-60 p-2">No playlists found.</li>}
                </ul>

                <hr className="opacity-10 mb-4" />

                {/* --- 3. Video Management (Shown only if a playlist is selected) --- */}
                {selected && (
                    <div className="mt-4">
                        <h3 className="font-semibold text-sm mb-2 opacity-90">Videos in: {playlists.find(p => p.id === selected)?.name}</h3>
                        
                        {/* Add Video Input */}
                        <div className="flex mb-3 space-x-2">
                            <input
                                type="url"
                                placeholder="Paste YouTube video URL..."
                                value={newVideoUrl}
                                onChange={(e) => setNewVideoUrl(e.target.value)}
                                className={`flex-1 p-2 rounded text-sm ${inputStyling}`}
                            />
                            <button
                                onClick={handleAddVideo}
                                className={MINIMAL_BUTTON_CLASS}
                            >
                                <PlusIcon className="w-4 h-4" />
                            </button>
                        </div>

                        {/* Videos List */}
                        <ul className="space-y-1 max-h-40 overflow-y-auto pr-2 custom-scrollbar">
                            {videos.map((v) => (
                                <li
                                    key={v.id}
                                    className={`flex justify-between items-center p-2 rounded cursor-pointer transition text-sm ${
                                        currentVideoUrl === v.youtube_url ? "bg-indigo-500/70 font-medium" : "bg-current/[.1] hover:bg-current/[.2]"
                                    }`}
                                    onClick={() => handleVideoSelect(v.youtube_url)}
                                >
                                    <span className="truncate flex items-center gap-2">
                                        <PlayIcon className="w-4 h-4 flex-shrink-0" />
                                        {v.title || v.youtube_url}
                                    </span>
                                    <TrashIcon 
                                        className="w-4 h-4 text-red-500 hover:text-red-700 transition flex-shrink-0 ml-2" 
                                        onClick={(e) => {
                                            e.stopPropagation();
                                            handleDeleteVideo(v.id);
                                        }} 
                                    />
                                </li>
                            ))}
                            {videos.length === 0 && <li className="text-sm opacity-60 p-2">No videos in this playlist.</li>}
                        </ul>
                    </div>
                )}
            </div>
        </Rnd>
    );
}