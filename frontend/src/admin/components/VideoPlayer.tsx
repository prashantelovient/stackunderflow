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
    if (!playerRef.current && videoRef.current) {
      const videoElement = document.createElement("video-js");
      videoElement.classList.add('vjs-big-play-centered', 'vjs-fill'); // Added vjs-fill
      videoRef.current.appendChild(videoElement);

      // Initialize player
      const player = playerRef.current = videojs(videoElement, {
        ...options,
        fluid: false, // Changed to false
        fill: true,   // Set to true
        responsive: true,
      }, () => {
        if (onReady) {
          onReady(player);
        }
      });

      // Prevent right-click context menu (to disable simple downloading)
      player.on('contextmenu', (e: Event) => {
        e.preventDefault();
      });

    } else if (playerRef.current) {
      // If player exists, update the sources dynamically
      const player = playerRef.current;
      player.autoplay(options.autoplay);
      player.src(options.sources);
    }
  }, [options, onReady]);

  // Dispose the player on unmount
  useEffect(() => {
    return () => {
      const player = playerRef.current;
      if (player && !player.isDisposed()) {
        player.dispose();
        playerRef.current = null;
      }
    };
  }, []);

  return (
    <div
      data-vjs-player
      className="w-full h-full relative overflow-hidden rounded-xl bg-black"
      onContextMenu={(e) => e.preventDefault()}
    >
      <style>{`
        .video-js.vjs-fill {
          display: block;
        }
        .video-js video {
          object-fit: contain !important;
        }
      `}</style>
      <div ref={videoRef} className="w-full h-full aspect-video" />
    </div>
  );
};

export default VideoPlayer;
