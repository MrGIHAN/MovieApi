import React, { useState, useRef, useEffect, useCallback } from 'react';
import {
  PlayIcon,
  PauseIcon,
  SpeakerWaveIcon,
  SpeakerXMarkIcon,
  ArrowsPointingOutIcon,
  ArrowsPointingInIcon,
  Cog6ToothIcon,
  BackwardIcon,
  ForwardIcon,
  XMarkIcon
} from '@heroicons/react/24/outline';
import { useMovies } from '../../hooks/useMovies';
import { useAuth } from '../../hooks/useAuth';
import { formatVideoTime, throttle } from '../../utils/helpers';
import { VIDEO_PLAYER, API_ENDPOINTS } from '../../utils/constants';

const VideoPlayer = ({ 
  movie, 
  autoPlay = true, 
  onClose,
  startTime = 0,
  onTimeUpdate,
  className = '' 
}) => {
  const videoRef = useRef(null);
  const containerRef = useRef(null);
  const progressRef = useRef(null);
  const controlsTimeoutRef = useRef(null);
  const { updateWatchProgress } = useMovies();
  const { isAuthenticated } = useAuth();

  // Player state
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(startTime);
  const [duration, setDuration] = useState(0);
  const [volume, setVolume] = useState(1);
  const [isMuted, setIsMuted] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [showControls, setShowControls] = useState(true);
  const [isLoading, setIsLoading] = useState(true);
  const [showSettings, setShowSettings] = useState(false);
  const [playbackRate, setPlaybackRate] = useState(1);
  const [isBuffering, setIsBuffering] = useState(false);
  const [error, setError] = useState(null);

  // Settings options
  const playbackRates = VIDEO_PLAYER.PLAYBACK_RATES;

  // Get the correct video URL
  const getVideoUrl = useCallback(() => {
    if (!movie?.id) return '';
    // Use the full URL from API_ENDPOINTS to ensure correct server address
    return API_ENDPOINTS.STREAMING.STREAM(movie.id);
  }, [movie?.id]);

  // Video event handlers
  const handleLoadStart = () => {
    console.log('Video load started for movie:', movie?.title);
    setIsLoading(true);
    setError(null);
  };

  const handleLoadedData = () => {
    console.log('Video data loaded for movie:', movie?.title);
    setIsLoading(false);
  };

  const handleLoadedMetadata = () => {
    const video = videoRef.current;
    if (!video) return;
    
    console.log('Video metadata loaded:', {
      duration: video.duration,
      videoWidth: video.videoWidth,
      videoHeight: video.videoHeight
    });
    
    setDuration(video.duration);
    
    if (startTime > 0) {
      video.currentTime = startTime;
    }
    
    if (autoPlay) {
      video.play().catch(error => {
        console.error('Auto-play failed:', error);
        setError('Auto-play failed. Click to play video.');
      });
    }
  };

  const handleTimeUpdate = throttle(() => {
    const video = videoRef.current;
    if (!video) return;
    setCurrentTime(video.currentTime);
  }, 1000);

  const handlePlay = () => {
    setIsPlaying(true);
    setError(null);
  };

  const handlePause = () => {
    setIsPlaying(false);
  };

  const handleVolumeChange = () => {
    const video = videoRef.current;
    if (!video) return;
    setVolume(video.volume);
    setIsMuted(video.muted);
  };

  const handleWaiting = () => {
    setIsBuffering(true);
  };

  const handleCanPlay = () => {
    setIsBuffering(false);
  };

  const handleError = (e) => {
    console.error('Video error:', e);
    const video = videoRef.current;
    if (video && video.error) {
      const errorCode = video.error.code;
      const errorMessage = video.error.message;
      console.error('Video error details:', { errorCode, errorMessage });
      
      let userFriendlyMessage = 'Failed to load video';
      switch (errorCode) {
        case 1: // MEDIA_ERR_ABORTED
          userFriendlyMessage = 'Video loading was aborted';
          break;
        case 2: // MEDIA_ERR_NETWORK
          userFriendlyMessage = 'Network error occurred while loading video';
          break;
        case 3: // MEDIA_ERR_DECODE
          userFriendlyMessage = 'Video format not supported or corrupted';
          break;
        case 4: // MEDIA_ERR_SRC_NOT_SUPPORTED
          userFriendlyMessage = 'Video source not supported';
          break;
        default:
          userFriendlyMessage = `Video error: ${errorMessage || 'Unknown error'}`;
      }
      
      setError(userFriendlyMessage);
    }
    setIsLoading(false);
    setIsBuffering(false);
  };

  // Setup video element and event listeners
  useEffect(() => {
    const video = videoRef.current;
    if (!video || !movie) return;

    console.log('Setting up video for movie:', movie.title);
    console.log('Video URL:', getVideoUrl());

    video.addEventListener('loadstart', handleLoadStart);
    video.addEventListener('loadeddata', handleLoadedData);
    video.addEventListener('loadedmetadata', handleLoadedMetadata);
    video.addEventListener('timeupdate', handleTimeUpdate);
    video.addEventListener('play', handlePlay);
    video.addEventListener('pause', handlePause);
    video.addEventListener('volumechange', handleVolumeChange);
    video.addEventListener('waiting', handleWaiting);
    video.addEventListener('canplay', handleCanPlay);
    video.addEventListener('error', handleError);

    return () => {
      video.removeEventListener('loadstart', handleLoadStart);
      video.removeEventListener('loadeddata', handleLoadedData);
      video.removeEventListener('loadedmetadata', handleLoadedMetadata);
      video.removeEventListener('timeupdate', handleTimeUpdate);
      video.removeEventListener('play', handlePlay);
      video.removeEventListener('pause', handlePause);
      video.removeEventListener('volumechange', handleVolumeChange);
      video.removeEventListener('waiting', handleWaiting);
      video.removeEventListener('canplay', handleCanPlay);
      video.removeEventListener('error', handleError);
    };
  }, [movie, autoPlay, startTime, getVideoUrl, handleTimeUpdate]);

  // Update watch progress
  const updateProgress = useCallback((currentTime, duration) => {
    if (!isAuthenticated || !movie || !duration) return;
    
    const progressData = {
      movieId: movie.id,
      currentPosition: Math.floor(currentTime),
      totalDuration: Math.floor(duration),
      completed: currentTime / duration >= VIDEO_PLAYER.COMPLETION_THRESHOLD
    };

    updateWatchProgress(progressData);
    
    if (onTimeUpdate) {
      onTimeUpdate(currentTime, duration);
    }
  }, [isAuthenticated, movie, updateWatchProgress, onTimeUpdate]);

  // Handle time updates
  useEffect(() => {
    if (currentTime > 0 && duration > 0) {
      updateProgress(currentTime, duration);
    }
  }, [currentTime, duration, updateProgress]);

  // Auto-hide controls
  useEffect(() => {
    if (showControls) {
      if (controlsTimeoutRef.current) {
        clearTimeout(controlsTimeoutRef.current);
      }
      controlsTimeoutRef.current = setTimeout(() => {
        if (isPlaying) {
          setShowControls(false);
        }
      }, VIDEO_PLAYER.AUTO_HIDE_CONTROLS_DELAY);
    }

    return () => {
      if (controlsTimeoutRef.current) {
        clearTimeout(controlsTimeoutRef.current);
      }
    };
  }, [showControls, isPlaying]);

  // Fullscreen event listener
  useEffect(() => {
    const handleFullscreenChange = () => {
      setIsFullscreen(!!document.fullscreenElement);
    };

    document.addEventListener('fullscreenchange', handleFullscreenChange);
    return () => document.removeEventListener('fullscreenchange', handleFullscreenChange);
  }, []);

  // Player controls
  const togglePlayPause = () => {
    const video = videoRef.current;
    if (!video) return;

    if (isPlaying) {
      video.pause();
    } else {
      video.play().catch(error => {
        console.error('Play failed:', error);
        setError('Failed to play video');
      });
    }
  };

  const skipForward = () => {
    const video = videoRef.current;
    if (!video) return;
    video.currentTime = Math.min(video.duration, video.currentTime + VIDEO_PLAYER.SEEK_STEP);
  };

  const skipBackward = () => {
    const video = videoRef.current;
    if (!video) return;
    video.currentTime = Math.max(0, video.currentTime - VIDEO_PLAYER.SEEK_STEP);
  };

  const adjustVolume = (delta) => {
    const video = videoRef.current;
    if (!video) return;
    const newVolume = Math.max(0, Math.min(1, video.volume + delta));
    video.volume = newVolume;
    setVolume(newVolume);
    if (newVolume > 0 && isMuted) {
      video.muted = false;
      setIsMuted(false);
    }
  };

  const toggleMute = () => {
    const video = videoRef.current;
    if (!video) return;
    video.muted = !video.muted;
    setIsMuted(video.muted);
  };

  const toggleFullscreen = () => {
    const container = containerRef.current;
    if (!container) return;

    if (!document.fullscreenElement) {
      container.requestFullscreen().catch(console.error);
    } else {
      document.exitFullscreen().catch(console.error);
    }
  };

  const handleProgressClick = (e) => {
    const video = videoRef.current;
    const progressBar = progressRef.current;
    if (!video || !progressBar || !duration) return;

    const rect = progressBar.getBoundingClientRect();
    const clickX = e.clientX - rect.left;
    const percentage = clickX / rect.width;
    const newTime = percentage * duration;
    
    video.currentTime = newTime;
    setCurrentTime(newTime);
  };

  const handleVolumeSliderChange = (e) => {
    const video = videoRef.current;
    if (!video) return;
    
    const newVolume = parseFloat(e.target.value);
    video.volume = newVolume;
    setVolume(newVolume);
    
    if (newVolume > 0 && isMuted) {
      video.muted = false;
      setIsMuted(false);
    }
  };

  const handlePlaybackRateChange = (rate) => {
    const video = videoRef.current;
    if (!video) return;
    
    video.playbackRate = rate;
    setPlaybackRate(rate);
    setShowSettings(false);
  };

  const handleMouseMove = () => {
    setShowControls(true);
  };

  const getProgressPercentage = () => {
    return duration > 0 ? (currentTime / duration) * 100 : 0;
  };

  const getVolumeIcon = () => {
    if (isMuted || volume === 0) {
      return SpeakerXMarkIcon;
    }
    return SpeakerWaveIcon;
  };

  if (!movie) {
    return (
      <div className="flex items-center justify-center h-64 bg-netflix-black text-white">
        <p>No movie selected</p>
      </div>
    );
  }

  return (
    <div
      ref={containerRef}
      className={`relative bg-black ${isFullscreen ? 'h-screen' : 'aspect-video'} ${className}`}
      onMouseMove={handleMouseMove}
      onMouseLeave={() => isPlaying && setShowControls(false)}
    >
      {/* Video Element */}
      <video
        ref={videoRef}
        className="w-full h-full object-contain"
        playsInline
        preload="metadata"
        onClick={togglePlayPause}
        crossOrigin="anonymous"
      >
        <source src={getVideoUrl()} type="video/mp4" />
        Your browser does not support the video tag.
      </video>

      {/* Loading Overlay */}
      {(isLoading || isBuffering) && (
        <div className="absolute inset-0 flex items-center justify-center bg-black/50">
          <div className="flex flex-col items-center space-y-4">
            <div className="w-12 h-12 border-4 border-netflix-red border-t-transparent rounded-full animate-spin"></div>
            <p className="text-white">{isLoading ? 'Loading...' : 'Buffering...'}</p>
          </div>
        </div>
      )}

      {/* Error Overlay */}
      {error && (
        <div className="absolute inset-0 flex items-center justify-center bg-black/75">
          <div className="text-center text-white">
            <p className="text-xl mb-4">{error}</p>
            <div className="space-x-4">
              <button
                onClick={() => {
                  setError(null);
                  const video = videoRef.current;
                  if (video) {
                    video.load();
                  }
                }}
                className="btn btn-primary"
              >
                Retry
              </button>
              <button
                onClick={() => window.open(getVideoUrl(), '_blank')}
                className="btn btn-secondary"
              >
                Open Direct Link
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Controls Overlay */}
      <div
        className={`absolute inset-0 transition-opacity duration-300 ${
          showControls ? 'opacity-100' : 'opacity-0 pointer-events-none'
        }`}
      >
        {/* Top Bar */}
        <div className="absolute top-0 left-0 right-0 bg-gradient-to-b from-black/80 to-transparent p-4">
          <div className="flex items-center justify-between">
            <h3 className="text-white text-lg font-semibold">{movie.title}</h3>
            <div className="flex items-center space-x-2">
              {onClose && (
                <button
                  onClick={onClose}
                  className="text-white hover:text-netflix-lightGray transition-colors duration-200"
                >
                  <XMarkIcon className="h-6 w-6" />
                </button>
              )}
              <button
                onClick={toggleFullscreen}
                className="text-white hover:text-netflix-lightGray transition-colors duration-200"
              >
                {isFullscreen ? (
                  <ArrowsPointingInIcon className="h-6 w-6" />
                ) : (
                  <ArrowsPointingOutIcon className="h-6 w-6" />
                )}
              </button>
            </div>
          </div>
        </div>

        {/* Center Play Button (when paused) */}
        {!isPlaying && !isLoading && !error && (
          <div className="absolute inset-0 flex items-center justify-center">
            <button
              onClick={togglePlayPause}
              className="w-20 h-20 bg-white/90 hover:bg-white rounded-full flex items-center justify-center transition-all duration-200 hover:scale-110"
            >
              <PlayIcon className="h-10 w-10 text-black ml-1" />
            </button>
          </div>
        )}

        {/* Bottom Controls */}
        <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/80 to-transparent p-4">
          {/* Progress Bar */}
          <div className="mb-4">
            <div
              ref={progressRef}
              className="relative h-1 bg-white/30 rounded-full cursor-pointer hover:h-2 transition-all duration-200"
              onClick={handleProgressClick}
            >
              <div
                className="absolute top-0 left-0 h-full bg-netflix-red rounded-full"
                style={{ width: `${getProgressPercentage()}%` }}
              />
            </div>
            <div className="flex justify-between text-white text-sm mt-2">
              <span>{formatVideoTime(currentTime)}</span>
              <span>{formatVideoTime(duration)}</span>
            </div>
          </div>

          {/* Control Buttons */}
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <button
                onClick={skipBackward}
                className="text-white hover:text-netflix-lightGray transition-colors duration-200"
              >
                <BackwardIcon className="h-6 w-6" />
              </button>

              <button
                onClick={togglePlayPause}
                className="text-white hover:text-netflix-lightGray transition-colors duration-200"
              >
                {isPlaying ? (
                  <PauseIcon className="h-8 w-8" />
                ) : (
                  <PlayIcon className="h-8 w-8" />
                )}
              </button>

              <button
                onClick={skipForward}
                className="text-white hover:text-netflix-lightGray transition-colors duration-200"
              >
                <ForwardIcon className="h-6 w-6" />
              </button>

              <div className="flex items-center space-x-2">
                <button
                  onClick={toggleMute}
                  className="text-white hover:text-netflix-lightGray transition-colors duration-200"
                >
                  {React.createElement(getVolumeIcon(), { className: "h-6 w-6" })}
                </button>
                <input
                  type="range"
                  min="0"
                  max="1"
                  step={VIDEO_PLAYER.VOLUME_STEP}
                  value={isMuted ? 0 : volume}
                  onChange={handleVolumeSliderChange}
                  className="w-20 h-1 bg-white/30 rounded-full appearance-none cursor-pointer"
                />
              </div>
            </div>

            <div className="flex items-center space-x-4">
              <div className="relative">
                <button
                  onClick={() => setShowSettings(!showSettings)}
                  className="text-white hover:text-netflix-lightGray transition-colors duration-200"
                >
                  <Cog6ToothIcon className="h-6 w-6" />
                </button>

                {showSettings && (
                  <div className="absolute bottom-full right-0 mb-2 bg-black/90 rounded-md p-2 min-w-[120px]">
                    <div className="text-white text-sm mb-2">Playback Speed</div>
                    {playbackRates.map(rate => (
                      <button
                        key={rate}
                        onClick={() => handlePlaybackRateChange(rate)}
                        className={`block w-full text-left px-2 py-1 text-sm hover:bg-white/20 rounded ${
                          playbackRate === rate ? 'text-netflix-red' : 'text-white'
                        }`}
                      >
                        {rate}x
                      </button>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default VideoPlayer;