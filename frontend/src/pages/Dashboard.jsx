import { useState, useRef } from "react"; 
import Sidebar from "../components/Sidebar";
import PomodoroWidget from "../components/PomodoroWidget";
import TodoWidget from "../components/TodoWidget";
import PlaylistWidget from "../components/PlaylistWidget";
import YouTubePlayer from "../components/YouTubePlayer"; 
import { Bars3Icon, PauseIcon, PlayIcon } from "@heroicons/react/24/solid"; 

// Define the available styles 
const WIDGET_STYLES = {
  BLACK_LOW_OPACITY: 'black_low_opacity',
  WHITE_LOW_OPACITY: 'white_low_opacity',
  TRANSPARENT_BLACK: 'transparent_black',
  TRANSPARENT_WHITE: 'transparent_white',
};

export default function Dashboard() {
  const [backgroundVideoUrl, setBackgroundVideoUrl] = useState("https://www.youtube.com/embed/5qap5aO4i9A");
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [widgets, setWidgets] = useState({
    pomodoro: true,
    todo: true,
    playlist: true,
  });
  const [widgetStyle, setWidgetStyle] = useState(WIDGET_STYLES.BLACK_LOW_OPACITY);
  
  // Player state and Ref 
  const [isPlaying, setIsPlaying] = useState(true);
  const playerRef = useRef(null);

  const toggleWidget = (w) =>
    setWidgets((old) => ({ ...old, [w]: !old[w] }));

  const toggleSidebar = () => setSidebarOpen((o) => !o);

  const handleVideoSelect = (url) => {
    // If the URL is null (e.g., playlist emptied), set to blank to stop/clear player.
    if (url) {
       
        const embedUrl = url.includes('embed') ? url : url.replace('youtu.be/', 'youtube.com/embed/');
        setBackgroundVideoUrl(embedUrl);
    } else {
        setBackgroundVideoUrl("");
    }
  };

  // --- YouTube API Handlers ---
  
  // Called when the YouTube player loads and is ready for commands
  const onPlayerReady = (event) => {
    playerRef.current = event.target; // Save the API instance
    playerRef.current.setVolume(40); // Initial volume (e.g., 40%)
    playerRef.current.playVideo();
  };

  // Called when playback state changes (e.g., playing, paused, ended)
  const onPlayerStateChange = (event) => {
    // Access the YouTube API object from the window 
    const YT = window.YT;
    if (YT) {
        if (event.data === YT.PlayerState.PLAYING) {
            setIsPlaying(true);
        } else if (event.data === YT.PlayerState.PAUSED || event.data === YT.PlayerState.BUFFERING) {
            setIsPlaying(false);
        }
    }
  };

  // External control handler
  const togglePlayPause = () => {
    const player = playerRef.current;
    if (!player) return;

    const state = player.getPlayerState();
    const YT = window.YT;

    if (state === YT.PlayerState.PLAYING) {
      player.pauseVideo();
    } else {
      player.playVideo();
    }
  };
  // --- END YouTube API Handlers ---

  return (
    <div className="relative h-screen w-screen bg-black overflow-hidden">
      
      {/*FIX 1: Use the YouTubePlayer component instead of raw iframe*/}
      <YouTubePlayer 
        videoUrl={backgroundVideoUrl}
        onReady={onPlayerReady}
        onStateChange={onPlayerStateChange}
      />

      {/* Overlay to darken background */}
      <div className="absolute top-0 left-0 w-full h-full bg-black/40 z-0"></div>

      {/* --- Header/Controls --- */}
      <div className="relative z-20 flex justify-between items-center p-4">
        
        {/* Hamburger icon */}
        <button 
          onClick={toggleSidebar} 
          className="text-white hover:text-gray-300 bg-transparent p-0 border-none"
        >
          <Bars3Icon className="w-8 h-8" />
        </button>

        {/* YouTube Link Input (Controls backgroundVideoUrl) */}
        <input
          type="text"
          value={backgroundVideoUrl}
          onChange={(e) => setBackgroundVideoUrl(e.target.value)}
          className="p-2 rounded bg-white/20 backdrop-blur-md text-white placeholder-white/60 w-full max-w-sm ml-4"
          placeholder="Enter YouTube embed link..."
        />
        
        {/*FIX 2: External Play/Pause Button*/}
        <button
            onClick={togglePlayPause}
            // Only show button if the player instance is ready
            className={`bg-white/20 hover:bg-white/30 text-white p-2 rounded ml-2 transition ${playerRef.current ? '' : 'opacity-50 cursor-not-allowed'}`}
            disabled={!playerRef.current}
        >
            {isPlaying ? <PauseIcon className="w-5 h-5" /> : <PlayIcon className="w-5 h-5" />}
        </button>
        {/* NOTE: For Volume control, you would add a slider component here, using playerRef.current.setVolume() on change. */}
      </div>

      {/* --- Sidebar --- */}
      <Sidebar 
        isOpen={sidebarOpen}
        toggle={toggleSidebar}
        widgets={widgets}
        toggleWidget={toggleWidget}
        currentStyle={widgetStyle}
        setWidgetStyle={setWidgetStyle}
        styleOptions={WIDGET_STYLES}
      />

      {/* --- Widgets (Conditionally rendered) --- */}
      {widgets.pomodoro && (
        <PomodoroWidget 
          close={() => toggleWidget("pomodoro")}
          style={widgetStyle}
        />
      )}
      
      {widgets.todo && (
        <TodoWidget 
          close={() => toggleWidget("todo")}
          style={widgetStyle}
        />
      )}
      
      {widgets.playlist && (
        <PlaylistWidget 
          close={() => toggleWidget("playlist")}
          style={widgetStyle}
          onVideoSelect={handleVideoSelect} 
        />
      )}
    </div>
  );
}