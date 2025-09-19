import React from "react";
import FileUpload, { FileUploadProps } from "./FileUpload";

interface AudioUploadProps extends Omit<FileUploadProps, "accept"> {
  maxDuration?: number; // in seconds
  allowedFormats?: string[];
  showWaveform?: boolean;
  autoPlay?: boolean;
}

const AudioUpload: React.FC<AudioUploadProps> = ({
  maxDuration = 300, // 5 minutes default
  allowedFormats = ["audio/mpeg", "audio/wav", "audio/mp3"],
  showWaveform = false,
  autoPlay = false,
  ...props
}) => {
  const validateAudio = (file: File): string | null => {
    // Check file type
    if (!file.type.startsWith("audio/")) {
      return "Please select a valid audio file";
    }

    // Check if format is allowed
    if (!allowedFormats.includes(file.type)) {
      return `Audio format not supported. Allowed formats: ${allowedFormats.join(", ")}`;
    }

    // Check file size (default 50MB for audio)
    const maxSize = props.maxSize || 50;
    if (file.size > maxSize * 1024 * 1024) {
      return `Audio file size must be less than ${maxSize}MB`;
    }

    return null;
  };

  const getDuration = (file: File): Promise<number> => {
    return new Promise((resolve, reject) => {
      const audio = new Audio();
      audio.onloadedmetadata = () => {
        resolve(audio.duration);
        URL.revokeObjectURL(audio.src);
      };
      audio.onerror = () => {
        reject(new Error("Failed to load audio"));
        URL.revokeObjectURL(audio.src);
      };
      audio.src = URL.createObjectURL(file);
    });
  };

  const validateDuration = async (file: File): Promise<string | null> => {
    try {
      const duration = await getDuration(file);
      if (duration > maxDuration) {
        return `Audio duration must be less than ${Math.floor(maxDuration / 60)} minutes`;
      }
      return null;
    } catch (error) {
      return "Failed to validate audio duration";
    }
  };

  return <FileUpload {...props} accept={allowedFormats} maxSize={props.maxSize || 50} showPreview={true} />;
};

export default AudioUpload;
