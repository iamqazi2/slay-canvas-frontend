import { useState, useCallback } from "react";

export interface UploadProgress {
  fileId: string;
  progress: number;
  status: "uploading" | "completed" | "error";
  error?: string;
}

export interface UseFileUploadOptions {
  onUploadComplete?: (file: File, url: string) => void;
  onUploadError?: (file: File, error: string) => void;
  onProgress?: (fileId: string, progress: number) => void;
  uploadUrl?: string;
  headers?: Record<string, string>;
}

export const useFileUpload = (options: UseFileUploadOptions = {}) => {
  const [uploads, setUploads] = useState<Map<string, UploadProgress>>(new Map());
  const [isUploading, setIsUploading] = useState(false);

  const uploadFile = useCallback(
    async (file: File, customUrl?: string): Promise<string> => {
      const fileId = Math.random().toString(36).substr(2, 9);
      const uploadUrl = customUrl || options.uploadUrl || "/api/upload";

      // Initialize upload progress
      setUploads((prev) =>
        new Map(prev).set(fileId, {
          fileId,
          progress: 0,
          status: "uploading",
        })
      );

      setIsUploading(true);

      try {
        const formData = new FormData();
        formData.append("file", file);

        const xhr = new XMLHttpRequest();

        // Track upload progress
        xhr.upload.addEventListener("progress", (event) => {
          if (event.lengthComputable) {
            const progress = Math.round((event.loaded / event.total) * 100);

            setUploads((prev) => {
              const newUploads = new Map(prev);
              const current = newUploads.get(fileId);
              if (current) {
                newUploads.set(fileId, { ...current, progress });
              }
              return newUploads;
            });

            options.onProgress?.(fileId, progress);
          }
        });

        // Handle upload completion
        xhr.addEventListener("load", () => {
          if (xhr.status >= 200 && xhr.status < 300) {
            const response = JSON.parse(xhr.responseText);
            const fileUrl = response.url || response.data?.url;

            setUploads((prev) => {
              const newUploads = new Map(prev);
              newUploads.set(fileId, {
                fileId,
                progress: 100,
                status: "completed",
              });
              return newUploads;
            });

            options.onUploadComplete?.(file, fileUrl);
            return fileUrl;
          } else {
            throw new Error(`Upload failed with status ${xhr.status}`);
          }
        });

        // Handle upload error
        xhr.addEventListener("error", () => {
          const errorMessage = "Upload failed due to network error";

          setUploads((prev) => {
            const newUploads = new Map(prev);
            newUploads.set(fileId, {
              fileId,
              progress: 0,
              status: "error",
              error: errorMessage,
            });
            return newUploads;
          });

          options.onUploadError?.(file, errorMessage);
          throw new Error(errorMessage);
        });

        // Start upload
        xhr.open("POST", uploadUrl);

        // Set headers
        if (options.headers) {
          Object.entries(options.headers).forEach(([key, value]) => {
            xhr.setRequestHeader(key, value);
          });
        }

        xhr.send(formData);

        // Return a promise that resolves when upload completes
        return new Promise((resolve, reject) => {
          xhr.addEventListener("load", () => {
            if (xhr.status >= 200 && xhr.status < 300) {
              const response = JSON.parse(xhr.responseText);
              resolve(response.url || response.data?.url);
            } else {
              reject(new Error(`Upload failed with status ${xhr.status}`));
            }
          });

          xhr.addEventListener("error", () => {
            reject(new Error("Upload failed due to network error"));
          });
        });
      } catch (error) {
        const errorMessage = error instanceof Error ? error.message : "Upload failed";

        setUploads((prev) => {
          const newUploads = new Map(prev);
          newUploads.set(fileId, {
            fileId,
            progress: 0,
            status: "error",
            error: errorMessage,
          });
          return newUploads;
        });

        options.onUploadError?.(file, errorMessage);
        throw error;
      } finally {
        setIsUploading(false);
      }
    },
    [options]
  );

  const uploadMultipleFiles = useCallback(
    async (files: File[]): Promise<string[]> => {
      const uploadPromises = files.map((file) => uploadFile(file));
      return Promise.all(uploadPromises);
    },
    [uploadFile]
  );

  const getUploadProgress = useCallback(
    (fileId: string): UploadProgress | undefined => {
      return uploads.get(fileId);
    },
    [uploads]
  );

  const clearUpload = useCallback((fileId: string) => {
    setUploads((prev) => {
      const newUploads = new Map(prev);
      newUploads.delete(fileId);
      return newUploads;
    });
  }, []);

  const clearAllUploads = useCallback(() => {
    setUploads(new Map());
  }, []);

  return {
    uploadFile,
    uploadMultipleFiles,
    getUploadProgress,
    clearUpload,
    clearAllUploads,
    isUploading,
    uploads: Array.from(uploads.values()),
  };
};
