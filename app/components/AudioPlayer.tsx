"use client";
import { Mic } from "lucide-react";
import React, { useCallback, useEffect, useRef, useState } from "react";
import { DeleteIcon, EditIcon } from "./icons";
import { useToast } from "./ui/Toast";
import ConfirmationModal from "./modals/ConfirmationModal";

interface AudioPlayerProps {
  className?: string;
  id?: string;
  initialData?: { file: File } | { url: string; name?: string };
  onClose?: () => void;
  inline?: boolean;
}

const AudioPlayer: React.FC<AudioPlayerProps> = ({
  className = "",
  id,
  initialData,
  onClose,
  inline = false,
}) => {
  const { showToast } = useToast();

  // id is used for React key in parent component
  const [isPlaying, setIsPlaying] = useState<boolean>(false);
  const [progress, setProgress] = useState<number>(0);
  const [duration, setDuration] = useState<number>(0);
  const [currentTime, setCurrentTime] = useState<number>(0);
  const [isDragging, setIsDragging] = useState<boolean>(false);
  const [audioFile, setAudioFile] = useState<string | null>(null);
  const [fileName, setFileName] = useState<string>("Recording.mp3");
  const [isVisible, setIsVisible] = useState<boolean>(true);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);

  // Draggable state
  const [isDraggingComponent, setIsDraggingComponent] = useState(false);
  const [position, setPosition] = useState({ x: 70, y: 10 }); // Percentage values (80% from left, 10% from top)
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });

  const audioRef = useRef<HTMLAudioElement | null>(null);
  const progressRef = useRef<HTMLDivElement | null>(null);
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  // Generate waveform data based on audio file
  const [waveformData, setWaveformData] = useState<number[]>(() => {
    // Default waveform when no audio is loaded
    return Array.from({ length: 50 }, (_, i) => {
      const base = Math.sin(i * 0.3) * 0.4 + 0.6;
      const noise = Math.random() * 0.2;
      const variation = Math.sin(i * 0.1) * 0.3;
      return Math.max(0.2, Math.min(1, base + noise + variation));
    });
  });

  const generateWaveformFromAudio = async (
    audioFile: string
  ): Promise<void> => {
    try {
      const audioContext = new window.AudioContext();
      const response = await fetch(audioFile);
      const arrayBuffer = await response.arrayBuffer();
      const audioBuffer = await audioContext.decodeAudioData(arrayBuffer);

      const channelData = audioBuffer.getChannelData(0);
      const samples = 50; // Number of waveform bars
      const blockSize = Math.floor(channelData.length / samples);
      const waveform = [];

      for (let i = 0; i < samples; i++) {
        let sum = 0;
        for (let j = 0; j < blockSize; j++) {
          sum += Math.abs(channelData[i * blockSize + j]);
        }
        const average = sum / blockSize;
        // Normalize and ensure minimum height
        const normalizedHeight = Math.max(0.2, Math.min(1, average * 10));
        waveform.push(normalizedHeight);
      }

      setWaveformData(waveform);
      audioContext.close();
    } catch (error) {
      console.error("Error generating waveform:", error);
      // Fallback to simulated waveform
      const fallbackWaveform = Array.from({ length: 50 }, (_, i) => {
        const base = Math.sin(i * 0.3) * 0.4 + 0.6;
        const noise = Math.random() * 0.2;
        const variation = Math.sin(i * 0.1) * 0.3;
        return Math.max(0.2, Math.min(1, base + noise + variation));
      });
      setWaveformData(fallbackWaveform);
    }
  };

  // Draggable handlers
  const handleMouseDown = (e: React.MouseEvent) => {
    if (inline) return; // No dragging in inline mode
    // Only allow dragging from the header area or ellipses
    const target = e.target as HTMLElement;
    if (
      target.closest('[data-draggable="true"]') ||
      target.closest(".drag-handle")
    ) {
      e.preventDefault();
      setIsDraggingComponent(true);

      // Convert percentage position to pixels for drag calculation
      const viewportWidth = window.innerWidth;
      const viewportHeight = window.innerHeight;
      const currentXPixels = (position.x / 100) * viewportWidth;
      const currentYPixels = (position.y / 100) * viewportHeight;

      setDragStart({
        x: e.clientX - currentXPixels,
        y: e.clientY - currentYPixels,
      });
    }
  };

  const handleTouchStart = (e: React.TouchEvent) => {
    // Only allow dragging from the header area or ellipses
    const target = e.target as HTMLElement;
    if (
      target.closest('[data-draggable="true"]') ||
      target.closest(".drag-handle")
    ) {
      e.preventDefault();
      const touch = e.touches[0];
      setIsDraggingComponent(true);

      // Convert percentage position to pixels for drag calculation
      const viewportWidth = window.innerWidth;
      const viewportHeight = window.innerHeight;
      const currentXPixels = (position.x / 100) * viewportWidth;
      const currentYPixels = (position.y / 100) * viewportHeight;

      setDragStart({
        x: touch.clientX - currentXPixels,
        y: touch.clientY - currentYPixels,
      });
    }
  };

  const handleMouseMove = useCallback(
    (e: MouseEvent) => {
      if (isDraggingComponent) {
        const newX = e.clientX - dragStart.x;
        const newY = e.clientY - dragStart.y;

        // Convert to percentages
        const viewportWidth = window.innerWidth;
        const viewportHeight = window.innerHeight;
        const percentageX = (newX / viewportWidth) * 100;
        const percentageY = (newY / viewportHeight) * 100;

        setPosition({
          x: Math.max(0, Math.min(percentageX, 100)), // Clamp between 0-100%
          y: Math.max(0, Math.min(percentageY, 100)), // Clamp between 0-100%
        });
      }
    },
    [isDraggingComponent, dragStart]
  );

  const handleTouchMove = useCallback(
    (e: TouchEvent) => {
      if (isDraggingComponent) {
        e.preventDefault();
        const touch = e.touches[0];
        const newX = touch.clientX - dragStart.x;
        const newY = touch.clientY - dragStart.y;

        // Convert to percentages
        const viewportWidth = window.innerWidth;
        const viewportHeight = window.innerHeight;
        const percentageX = (newX / viewportWidth) * 100;
        const percentageY = (newY / viewportHeight) * 100;

        setPosition({
          x: Math.max(0, Math.min(percentageX, 100)), // Clamp between 0-100%
          y: Math.max(0, Math.min(percentageY, 100)), // Clamp between 0-100%
        });
      }
    },
    [isDraggingComponent, dragStart]
  );

  const handleMouseUp = useCallback(() => {
    setIsDraggingComponent(false);
  }, []);

  const handleTouchEnd = useCallback(() => {
    setIsDraggingComponent(false);
  }, []);

  useEffect(() => {
    if (isDraggingComponent) {
      document.addEventListener("mousemove", handleMouseMove);
      document.addEventListener("mouseup", handleMouseUp);
      document.addEventListener("touchmove", handleTouchMove, {
        passive: false,
      });
      document.addEventListener("touchend", handleTouchEnd);
    }

    return () => {
      document.removeEventListener("mousemove", handleMouseMove);
      document.removeEventListener("mouseup", handleMouseUp);
      document.removeEventListener("touchmove", handleTouchMove);
      document.removeEventListener("touchend", handleTouchEnd);
    };
  }, [
    isDraggingComponent,
    dragStart,
    handleMouseMove,
    handleMouseUp,
    handleTouchMove,
    handleTouchEnd,
  ]);

  // Handle keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key === "v") {
        // Let the paste event handle it
        return;
      }
      if (e.key === "Escape" && audioFile) {
        clearAudio();
      }
    };

    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [audioFile]);

  // Handle initial data when component is created
  useEffect(() => {
    if (initialData) {
      // Handle File object from local uploads
      if ("file" in initialData && initialData.file) {
        const file = initialData.file;
        if (file.type.startsWith("audio/")) {
          const newAudioUrl = URL.createObjectURL(file);
          setAudioFile(newAudioUrl);
          setFileName(file.name);
          setIsPlaying(false);
          setProgress(0);
          setCurrentTime(0);
          setDuration(0);

          // Generate waveform from the new audio file
          generateWaveformFromAudio(newAudioUrl);
        }
      }
      // Handle URL from backend assets
      else if ("url" in initialData && initialData.url) {
        const audioUrl = initialData.url;
        setAudioFile(audioUrl);
        setFileName(initialData.name || "Audio File");
        setIsPlaying(false);
        setProgress(0);
        setCurrentTime(0);
        setDuration(0);

        // Generate waveform from the audio URL
        generateWaveformFromAudio(audioUrl);
      }
    }
  }, [initialData]);

  // Handle routed audio files from VideoCollection (for backward compatibility)
  useEffect(() => {
    const handleAudioFilePasted = (event: CustomEvent) => {
      const file = event.detail.file;
      if (file && file.type.startsWith("audio/")) {
        // Clean up previous audio URL to prevent memory leaks
        if (audioFile) {
          URL.revokeObjectURL(audioFile);
        }

        const newAudioUrl = URL.createObjectURL(file);
        setAudioFile(newAudioUrl);
        setFileName(file.name);
        setIsPlaying(false);
        setProgress(0);
        setCurrentTime(0);
        setDuration(0);

        // Generate waveform from the new audio file
        generateWaveformFromAudio(newAudioUrl);
      }
    };

    window.addEventListener(
      "audioFilePasted",
      handleAudioFilePasted as EventListener
    );
    return () =>
      window.removeEventListener(
        "audioFilePasted",
        handleAudioFilePasted as EventListener
      );
  }, [audioFile]);

  useEffect(() => {
    const audio = audioRef.current;
    if (!audio || !audioFile) return;

    const updateProgress = () => {
      if (!isDragging && audio.duration) {
        const currentProgress = (audio.currentTime / audio.duration) * 100;
        setCurrentTime(audio.currentTime);
        setProgress(currentProgress);
      }
    };

    const updateDuration = () => {
      if (audio.duration) {
        setDuration(audio.duration);
      }
    };

    const handleEnded = () => {
      setIsPlaying(false);
      setProgress(0);
      setCurrentTime(0);
    };

    const handleLoadStart = () => {
      setProgress(0);
      setCurrentTime(0);
    };

    audio.addEventListener("timeupdate", updateProgress);
    audio.addEventListener("loadedmetadata", updateDuration);
    audio.addEventListener("ended", handleEnded);
    audio.addEventListener("loadstart", handleLoadStart);

    return () => {
      audio.removeEventListener("timeupdate", updateProgress);
      audio.removeEventListener("loadedmetadata", updateDuration);
      audio.removeEventListener("ended", handleEnded);
      audio.removeEventListener("loadstart", handleLoadStart);
    };
  }, [isDragging, audioFile]);

  const togglePlayPause = (): void => {
    const audio = audioRef.current;
    if (!audio || !audioFile) return;

    if (isPlaying) {
      audio.pause();
    } else {
      audio.play();
    }
    setIsPlaying(!isPlaying);
  };

  const handleProgressClick = (e: React.MouseEvent<HTMLDivElement>): void => {
    const audio = audioRef.current;
    if (!audio || !progressRef.current || !duration) return;

    const rect = progressRef.current.getBoundingClientRect();
    const clickX = e.clientX - rect.left;
    const newProgress = Math.max(0, Math.min(100, (clickX / rect.width) * 100));
    const newTime = (newProgress / 100) * duration;

    setProgress(newProgress);
    setCurrentTime(newTime);
    audio.currentTime = newTime;
  };

  const handleProgressMouseDown = (
    e: React.MouseEvent<HTMLDivElement>
  ): void => {
    setIsDragging(true);
    handleProgressClick(e);
  };

  const handleProgressMouseMove = useCallback(
    (e: MouseEvent): void => {
      if (!isDragging || !progressRef.current || !duration) return;

      const rect = progressRef.current.getBoundingClientRect();
      const moveX = e.clientX - rect.left;
      const newProgress = Math.max(
        0,
        Math.min(100, (moveX / rect.width) * 100)
      );
      const newTime = (newProgress / 100) * duration;

      setProgress(newProgress);
      setCurrentTime(newTime);

      if (audioRef.current) {
        audioRef.current.currentTime = newTime;
      }
    },
    [isDragging, duration]
  );

  const handleProgressMouseUp = useCallback((): void => {
    setIsDragging(false);
  }, []);

  useEffect(() => {
    if (isDragging) {
      document.addEventListener("mousemove", handleProgressMouseMove);
      document.addEventListener("mouseup", handleProgressMouseUp);
    }

    return () => {
      document.removeEventListener("mousemove", handleProgressMouseMove);
      document.removeEventListener("mouseup", handleProgressMouseUp);
    };
  }, [isDragging, handleProgressMouseMove, handleProgressMouseUp]);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>): void => {
    const file = e.target.files?.[0];
    if (file && file.type.startsWith("audio/")) {
      // Clean up previous audio URL to prevent memory leaks
      if (audioFile) {
        URL.revokeObjectURL(audioFile);
      }

      const newAudioUrl = URL.createObjectURL(file);
      setAudioFile(newAudioUrl);
      setFileName(file.name);
      setIsPlaying(false);
      setProgress(0);
      setCurrentTime(0);
      setDuration(0);

      // Generate waveform from the new audio file
      generateWaveformFromAudio(newAudioUrl);
    }
  };

  const handlePaste = async (): Promise<void> => {
    try {
      const clipboardItems = await navigator.clipboard.read();
      for (const item of clipboardItems) {
        for (const type of item.types) {
          if (type.startsWith("audio/")) {
            const blob = await item.getType(type);
            const audioUrl = URL.createObjectURL(blob);
            setAudioFile(audioUrl);
            setFileName("Pasted Audio.mp3");
            setIsPlaying(false);
            setProgress(0);
            setCurrentTime(0);
            setDuration(0);

            // Generate waveform from the pasted audio
            generateWaveformFromAudio(audioUrl);
            return;
          }
        }
      }
      showToast("No audio found in clipboard", "error");
    } catch (err: unknown) {
      console.error("Failed to read clipboard:", err);
      fileInputRef.current?.click();
    }
  };

  const formatTime = (time: number): string => {
    const minutes = Math.floor(time / 60);
    const seconds = Math.floor(time % 60);
    return `${minutes}:${seconds.toString().padStart(2, "0")}`;
  };

  const clearAudio = (): void => {
    setAudioFile(null);
    setFileName("Recording.mp3");
    setIsPlaying(false);
    setProgress(0);
    setCurrentTime(0);
  };

  const handleEdit = (): void => {
    // Trigger file input to change audio file
    fileInputRef.current?.click();
  };

  const handleClose = (): void => {
    setIsDeleteModalOpen(true);
  };

  const handleConfirmDelete = (): void => {
    console.log("AudioPlayer handleConfirmDelete called");
    // Clean up audio resources
    if (audioFile) {
      URL.revokeObjectURL(audioFile);
    }

    // Check if this is a sidebar component (hardcoded ID) or has onClose prop
    if (id === "sidebar-audio-player" || onClose) {
      console.log(
        "AudioPlayer is sidebar component or has onClose prop, calling onClose"
      );
      if (onClose) {
        onClose();
      } else {
        setIsVisible(false);
      }
      return;
    }

    // Remove this component instance
    if (id) {
      console.log("AudioPlayer dispatching removeComponent event with id:", id);
      const removeEvent = new CustomEvent("removeComponent", {
        detail: { componentId: id },
      });
      window.dispatchEvent(removeEvent);
    } else {
      console.log("AudioPlayer no id, using fallback hide");
      // Fallback: hide the component
      setIsVisible(false);
    }
  };

  // Don't render if component is closed
  if (!isVisible) {
    return null;
  }

  return (
    <>
      <div
        ref={containerRef}
        className={`${
          inline ? "relative w-full h-full" : "fixed z-20 select-none"
        } ${className}`}
        style={
          inline
            ? {}
            : {
                left: `${position.x}%`,
                top: `${position.y}%`,
                width: "min(400px, 90vw)",
                height: "min(200px, 40vh)",
                maxWidth: "400px",
                maxHeight: "200px",
                opacity: 1,
                transform: "rotate(0deg)",
              }
        }
        onPaste={handlePaste}
        tabIndex={0}
      >
        {audioFile && <audio ref={audioRef} src={audioFile} />}
        <input
          type="file"
          ref={fileInputRef}
          accept="audio/*"
          onChange={handleFileChange}
          className="hidden"
        />

        {/* Main Container */}
        <div
          className="relative w-full p-1"
          style={{
            backgroundColor: "#5e63ff",
            boxShadow: "0px 0px 28.82px 0px rgba(0, 0, 0, 0.15)",
            borderRadius: "12px",
          }}
        >
          {/* Header - Draggable */}
          <div
            className="flex items-center justify-between px-4 py-2 drag-handle cursor-move"
            data-draggable="true"
            onMouseDown={handleMouseDown}
            onTouchStart={handleTouchStart}
            style={{
              backgroundColor: "#5e63ff",
              borderRadius: "12px",
            }}
          >
            <div className="flex overflow-hidden items-center space-x-3 text-white">
              <div className="w-[29px] h-[29px]">
                <svg
                  width="29"
                  height="29"
                  viewBox="0 0 29 29"
                  fill="none"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path
                    d="M18.1042 7.14364C18.1042 4.88847 16.276 3.0603 14.0208 3.0603C11.7657 3.0603 9.9375 4.88847 9.9375 7.14364V14.727C9.9375 16.9821 11.7657 18.8103 14.0208 18.8103C16.276 18.8103 18.1042 16.9821 18.1042 14.727V7.14364Z"
                    fill="white"
                    stroke="white"
                    strokeWidth="2"
                    strokeLinejoin="round"
                  />
                  <path
                    d="M5.27148 14.1437C5.27148 18.976 9.18915 22.8937 14.0215 22.8937M14.0215 22.8937C18.8538 22.8937 22.7715 18.976 22.7715 14.1437M14.0215 22.8937V26.3937"
                    stroke="white"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>
              </div>

              <span className="text-lg font-medium truncate">{fileName}</span>
            </div>
            {/* Right side - Action buttons */}
            <div className="flex items-center gap-2">
              <button
                onClick={handleEdit}
                className="p-1 hover:bg-white/10 rounded transition-colors"
                style={{ pointerEvents: "auto" }}
                title="Edit audio file"
              >
                <EditIcon />
              </button>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  console.log("AudioPlayer close button clicked");
                  handleClose();
                }}
                className="p-1 hover:bg-white/10 rounded transition-colors"
                style={{ pointerEvents: "auto" }}
                title="Close audio player"
              >
                <DeleteIcon />
              </button>
            </div>
          </div>

          {/* Player container */}
          <div
            className="bg-white p-3"
            style={{
              height: "calc(100% - 94px)",
              borderRadius: "12px",
            }}
          >
            <div className="flex items-center space-x-4">
              <button
                onClick={togglePlayPause}
                disabled={!audioFile}
                className="flex-shrink-0 w-12 h-12 rounded-full flex items-center justify-center text-white shadow-lg hover:shadow-xl transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
                style={{
                  background: isPlaying
                    ? "linear-gradient(135deg, #8E5EFF 0%, #1279FF 100%)"
                    : "linear-gradient(135deg, #8E5EFF 0%, #1279FF 100%)",
                }}
              >
                {isPlaying ? (
                  <svg
                    width="24"
                    height="24"
                    viewBox="0 0 24 24"
                    fill="none"
                    xmlns="http://www.w3.org/2000/svg"
                  >
                    <rect
                      x="6"
                      y="4"
                      width="4"
                      height="16"
                      rx="2"
                      fill="white"
                    />
                    <rect
                      x="14"
                      y="4"
                      width="4"
                      height="16"
                      rx="2"
                      fill="white"
                    />
                  </svg>
                ) : (
                  <svg
                    width="24"
                    height="24"
                    viewBox="0 0 24 24"
                    fill="none"
                    xmlns="http://www.w3.org/2000/svg"
                  >
                    <path d="M8 5V19L19 12L8 5Z" fill="white" />
                  </svg>
                )}
              </button>

              {/* Waveform + Progress */}
              <div className="flex-1">
                <div
                  ref={progressRef}
                  className="relative h-12 cursor-pointer select-none"
                  onMouseDown={handleProgressMouseDown}
                  onClick={handleProgressClick}
                >
                  {/* Custom Waveform Visualization */}
                  <div className="flex items-end justify-between h-full space-x-0.5">
                    {waveformData.length > 0
                      ? waveformData.map((height, index) => {
                          const isActive =
                            index < (progress / 100) * waveformData.length;
                          const barHeight = Math.max(4, height * 50); // Minimum 4px height
                          return (
                            <div
                              key={index}
                              className="rounded-sm transition-all duration-200"
                              style={{
                                width: "3px",
                                height: `${barHeight}px`,
                                backgroundColor: isActive
                                  ? "#1E1E1E"
                                  : "rgba(30, 30, 30, 0.5)",
                                opacity: isActive ? 1 : 0.6,
                              }}
                            />
                          );
                        })
                      : // Fallback when no waveform data
                        Array.from({ length: 50 }, (_, index) => (
                          <div
                            key={index}
                            className="rounded-sm transition-all duration-200"
                            style={{
                              width: "3px",
                              height: "20px",
                              backgroundColor: "rgba(30, 30, 30, 0.3)",
                              opacity: 0.6,
                            }}
                          />
                        ))}
                  </div>

                  {/* Progress indicator */}
                  <div
                    className="absolute top-0 w-0.5 h-full bg-blue-500 shadow-lg transition-transform duration-75"
                    style={{
                      left: `${progress}%`,
                      transform: "translateX(-50%)",
                    }}
                  >
                    <div className="absolute top-1/2 left-1/2 w-4 h-4 bg-blue-500 rounded-full shadow-lg transform -translate-x-1/2 -translate-y-1/2 border-2 border-white" />
                  </div>
                </div>

                <div className="flex justify-between text-sm text-gray-500 mt-2">
                  <span>{formatTime(currentTime)}</span>
                  <span>{duration ? formatTime(duration) : "0:00"}</span>
                </div>
              </div>
            </div>

            {!audioFile && (
              <div className="mt-4">
                <div
                  onClick={() => fileInputRef.current?.click()}
                  className="bg-gray-100 border-2 border-dashed border-gray-300 rounded-xl p-4 text-center cursor-pointer hover:bg-gray-200 transition-colors"
                >
                  <Mic className="w-6 h-6 text-gray-500 mx-auto mb-2" />
                  <p className="text-gray-600 text-sm">
                    Click to upload an audio file or use Ctrl+V to paste
                  </p>
                </div>
              </div>
            )}
          </div>

          {/* Bottom Right Ellipse - Draggable */}
          <div
            className="absolute cursor-move drag-handle"
            data-draggable="true"
            onMouseDown={handleMouseDown}
            onTouchStart={handleTouchStart}
            style={{
              bottom: "-10px",
              right: "-10px",
            }}
          >
            <svg
              width="9"
              height="11"
              viewBox="0 0 9 11"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                d="M7.79841 0.6123C8.09939 0.52497 8.41641 0.697898 8.48094 1.00458C8.68701 1.98387 8.69713 2.99625 8.50856 3.98288C8.28442 5.15567 7.78589 6.25876 7.05374 7.20196C6.32159 8.14516 5.3766 8.9017 4.29604 9.40971C3.38701 9.83708 2.40375 10.0784 1.40395 10.1216C1.09084 10.1352 0.844695 9.87092 0.854648 9.55768C0.864602 9.24444 1.12701 9.00119 1.43991 8.9835C2.26042 8.93712 3.06628 8.73377 3.81318 8.38263C4.73165 7.95082 5.53489 7.30777 6.15722 6.50604C6.77954 5.70432 7.20329 4.7667 7.39382 3.76982C7.54875 2.95917 7.54588 2.12806 7.38732 1.32168C7.32685 1.01417 7.49742 0.699631 7.79841 0.6123Z"
                fill="#1279FF"
              />
            </svg>
          </div>
        </div>
      </div>

      {/* Delete Confirmation Modal */}
      <ConfirmationModal
        isOpen={isDeleteModalOpen}
        onClose={() => setIsDeleteModalOpen(false)}
        onConfirm={handleConfirmDelete}
        title="Delete Audio Player"
        message="Are you sure you want to close this audio player? This will stop playback and remove the audio."
        confirmText="Delete"
        confirmButtonClass="bg-red-600 hover:bg-red-700 text-white"
      />
    </>
  );
};

export default AudioPlayer;
