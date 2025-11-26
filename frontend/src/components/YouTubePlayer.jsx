import React, { useEffect, useRef } from 'react';
import YouTube from 'react-youtube'; 

const YouTubePlayer = ({ videoUrl, isPaused, volume, onReady, onStateChange }) => {

    const getVideoId = (url) => {
        if (!url) return null;
        let videoId = '';
        const regex = /(?:youtube\.com\/(?:[^\/\n\s]+\/\S+\/|(?:v|e(?:mbed)?)\/|\S*?[?&]v=)|youtu\.be\/)([a-zA-Z0-9_-]{11})/;
        const match = url.match(regex);
        if (match) {
            videoId = match[1];
        }
        return videoId;
    };
    
    const videoId = getVideoId(videoUrl);
    
    // Player options, enabling controls, autoplay, and setting video quality
    const opts = {
        height: '100%',
        width: '100%',
        playerVars: {
            autoplay: 1,      // Autoplay the video
            controls: 1,      // Show player controls (for pausing/volume)
            rel: 0,           // Do not show related videos
            modestbranding: 1, // Minimize YouTube logo
            disablekb: 1,      // Disable keyboard controls
            loop: 1,           // Loop the video (often requires playlist param, but helps)
            fs: 0,             // Disable fullscreen button
        },
    };

    if (!videoId) {
        return (
            <div className="absolute top-0 left-0 w-full h-full bg-black flex items-center justify-center text-white/50 z-0">
                <p>No video selected. Add a video to your playlist or paste an embed link.</p>
            </div>
        );
    }

    return (
        <div className="absolute top-0 left-0 w-full h-full z-0">
            <YouTube
                videoId={videoId}
                opts={opts}
                onReady={onReady}
                onPlay={() => console.log('Video started playing.')}
                onPause={() => console.log('Video paused.')}
                onEnd={() => console.log('Video ended. Looping or next video logic goes here.')}
                onStateChange={onStateChange}
                className="w-full h-full"
                containerClassName="video-player-container" 
            />
        </div>
    );
};

export default YouTubePlayer;