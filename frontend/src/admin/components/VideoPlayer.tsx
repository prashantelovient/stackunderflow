import React, { useEffect, useRef } from 'react';
import videojs from 'video.js';
import 'video.js/dist/video-js.css';

interface VideoPlayerProps {
  options: any;
  onReady?: (player: any) => void;
}

const VideoPlayer: React.FC<VideoPlayerProps> = ({ options, onReady }) => {
  const videoRef = useRef<HTMLDivElement>(null);
  const playerRef = useRef<any>(null);

  useEffect(() => {
    // Check if player is not yet instantiated
    if (!playerRef.current) {
      const videoElement = document.createElement("video-js");
      videoElement.classList.add('vjs-big-play-centered');
      videoRef.current?.appendChild(videoElement);

      // Initialize player
      const player = playerRef.current = videojs(videoElement, options, () => {
        if (onReady) {
          onReady(player);
        }
      });
      
      // Prevent right-click context menu (to disable simple downloading)
      player.on('contextmenu', (e: Event) => {
        e.preventDefault();
      });

    } else {
      // If player exists, update the sources dynamically
      const player = playerRef.current;
      player.autoplay(options.autoplay);
      player.src(options.sources);
    }
  }, [options, onReady]);

  useEffect(() => {
    const player = playerRef.current;
    return () => {
      if (player && !player.isDisposed()) {
        player.dispose();
        playerRef.current = null;
      }
    };
  }, []);

  return (
    <div 
      data-vjs-player 
      className="w-full relative shadow-lg rounded-xl overflow-hidden bg-black"
      onContextMenu={(e) => e.preventDefault()} // Block wrapper context menu too
    >
      <div ref={videoRef} className="w-full object-cover" />
    </div>
  );
};

export default VideoPlayer;
