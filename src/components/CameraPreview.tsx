import React, { useRef, useEffect, useState } from 'react';
import { Play, Pause, Volume2, VolumeX } from 'lucide-react';

interface CameraPreviewProps {
  sourceUrl?: string;
  title?: string;
  showControls?: boolean;
}

const CameraPreview: React.FC<CameraPreviewProps> = ({
  sourceUrl = 'rtsp://camera:554/stream',
  title = 'Camera Feed',
  showControls = true,
}) => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const [volume, setVolume] = useState(100);
  const [resolution, setResolution] = useState<string>('Detecting...');
  const [bitrate, setBitrate] = useState<string>('-- Mbps');
  const [fps, setFps] = useState<string>('-- fps');

  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;

    // HLS.js for HLS streams (if needed)
    // For RTSP/RTMP, we'll use a media server approach
    video.addEventListener('loadedmetadata', () => {
      setResolution(`${video.videoWidth}x${video.videoHeight}`);
      setIsPlaying(true);
    });

    // Attempt to load stream
    // Note: Direct RTSP in browser requires a protocol converter (like GStreamer with HTTP output)
    // For now, we'll use HLS or DASH output from FFmpeg
    const hlsUrl = sourceUrl.replace(/rtsp:\/\//, 'http://').replace(/:\d+/, ':8080') + '.m3u8';
    video.src = hlsUrl;
    video.play().catch(() => {
      console.log('Stream not available yet');
    });

    return () => {
      video.pause();
    };
  }, [sourceUrl]);

  const togglePlay = () => {
    if (videoRef.current) {
      if (isPlaying) {
        videoRef.current.pause();
      } else {
        videoRef.current.play();
      }
      setIsPlaying(!isPlaying);
    }
  };

  const toggleMute = () => {
    if (videoRef.current) {
      videoRef.current.muted = !isMuted;
      setIsMuted(!isMuted);
    }
  };

  const handleVolumeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newVolume = parseInt(e.target.value);
    setVolume(newVolume);
    if (videoRef.current) {
      videoRef.current.volume = newVolume / 100;
    }
  };

  return (
    <div className="flex flex-col gap-3 bg-slate-900 rounded-lg p-4 border border-slate-700">
      {/* Title */}
      <h3 className="text-lg font-bold text-white">{title}</h3>

      {/* Video Container */}
      <div className="relative bg-black rounded-lg overflow-hidden aspect-video border border-slate-700 shadow-lg">
        <video
          ref={videoRef}
          className="w-full h-full object-cover"
          controls={false}
          muted={isMuted}
          crossOrigin="anonymous"
        />

        {/* Overlay Stats */}
        <div className="absolute top-2 right-2 text-xs font-mono text-cyan-400 bg-black/70 px-2 py-1 rounded pointer-events-none">
          <div>{resolution}</div>
          <div>{fps}</div>
          <div>{bitrate}</div>
        </div>

        {/* Loading Indicator */}
        {!isPlaying && (
          <div className="absolute inset-0 flex items-center justify-center bg-black/50">
            <div className="animate-spin">
              <div className="w-12 h-12 border-4 border-cyan-500 border-t-transparent rounded-full" />
            </div>
          </div>
        )}
      </div>

      {/* Controls */}
      {showControls && (
        <div className="flex items-center gap-3">
          {/* Play/Pause */}
          <button
            onClick={togglePlay}
            className="flex items-center gap-2 px-3 py-2 bg-cyan-600 hover:bg-cyan-500 text-white rounded font-semibold transition-colors"
          >
            {isPlaying ? (
              <>
                <Pause className="w-4 h-4" />
                Pause
              </>
            ) : (
              <>
                <Play className="w-4 h-4" />
                Play
              </>
            )}
          </button>

          {/* Volume Control */}
          <div className="flex items-center gap-2 flex-1">
            <button
              onClick={toggleMute}
              className="p-2 hover:bg-slate-700 rounded transition-colors text-slate-300"
            >
              {isMuted ? <VolumeX className="w-4 h-4" /> : <Volume2 className="w-4 h-4" />}
            </button>
            <input
              type="range"
              min="0"
              max="100"
              value={volume}
              onChange={handleVolumeChange}
              disabled={isMuted}
              className="flex-1 h-2 bg-slate-700 rounded-lg appearance-none cursor-pointer"
            />
            <span className="text-xs text-slate-400 w-8">{volume}%</span>
          </div>

          {/* Stream Status */}
          <div className="flex items-center gap-2">
            <div
              className={`w-2 h-2 rounded-full ${
                isPlaying ? 'bg-green-500 animate-pulse' : 'bg-red-500'
              }`}
            />
            <span className="text-xs text-slate-400">
              {isPlaying ? 'LIVE' : 'OFFLINE'}
            </span>
          </div>
        </div>
      )}

      {/* Stream Info */}
      <div className="grid grid-cols-3 gap-2 text-xs text-slate-400 bg-slate-800 p-2 rounded">
        <div>
          <p className="text-slate-500">Resolution</p>
          <p className="font-mono text-cyan-400">{resolution}</p>
        </div>
        <div>
          <p className="text-slate-500">Frame Rate</p>
          <p className="font-mono text-cyan-400">{fps}</p>
        </div>
        <div>
          <p className="text-slate-500">Bitrate</p>
          <p className="font-mono text-cyan-400">{bitrate}</p>
        </div>
      </div>
    </div>
  );
};

export default CameraPreview;
