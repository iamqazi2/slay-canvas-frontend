import React from "react";
import FileUpload, { FileUploadProps } from "./FileUpload";

interface ImageUploadProps extends Omit<FileUploadProps, "accept"> {
  maxWidth?: number;
  maxHeight?: number;
  aspectRatio?: string;
  showThumbnails?: boolean;
  thumbnailSize?: number;
}

const ImageUpload: React.FC<ImageUploadProps> = ({
  maxWidth = 1920,
  maxHeight = 1080,
  aspectRatio,
  showThumbnails = true,
  thumbnailSize = 100,
  ...props
}) => {
  const validateImage = (file: File): string | null => {
    // Basic file validation
    if (!file.type.startsWith("image/")) {
      return "Please select a valid image file";
    }

    // Check file size (default 10MB for images)
    const maxSize = props.maxSize || 10;
    if (file.size > maxSize * 1024 * 1024) {
      return `Image size must be less than ${maxSize}MB`;
    }

    return null;
  };

  const processImage = (file: File): Promise<File> => {
    return new Promise((resolve, reject) => {
      const img = new Image();
      const canvas = document.createElement("canvas");
      const ctx = canvas.getContext("2d");

      img.onload = () => {
        let { width, height } = img;

        // Calculate new dimensions maintaining aspect ratio
        if (width > maxWidth || height > maxHeight) {
          const ratio = Math.min(maxWidth / width, maxHeight / height);
          width = width * ratio;
          height = height * ratio;
        }

        // Apply aspect ratio if specified
        if (aspectRatio) {
          const [ratioW, ratioH] = aspectRatio.split(":").map(Number);
          const targetRatio = ratioW / ratioH;
          const currentRatio = width / height;

          if (currentRatio > targetRatio) {
            width = height * targetRatio;
          } else {
            height = width / targetRatio;
          }
        }

        canvas.width = width;
        canvas.height = height;

        if (ctx) {
          ctx.drawImage(img, 0, 0, width, height);
          canvas.toBlob(
            (blob) => {
              if (blob) {
                const processedFile = new File([blob], file.name, {
                  type: file.type,
                  lastModified: Date.now(),
                });
                resolve(processedFile);
              } else {
                reject(new Error("Failed to process image"));
              }
            },
            file.type,
            0.9
          );
        } else {
          reject(new Error("Canvas context not available"));
        }
      };

      img.onerror = () => reject(new Error("Failed to load image"));
      img.src = URL.createObjectURL(file);
    });
  };

  return <FileUpload {...props} accept={["image/*"]} maxSize={props.maxSize || 10} showPreview={showThumbnails} />;
};

export default ImageUpload;
