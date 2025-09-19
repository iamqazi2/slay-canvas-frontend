import React, { useRef, useState, useCallback } from "react";

export interface FileUploadProps {
  accept?: string[];
  maxSize?: number; // in MB
  maxFiles?: number;
  onFilesChange?: (files: File[]) => void;
  onFileRemove?: (file: File) => void;
  disabled?: boolean;
  className?: string;
  dropZoneClassName?: string;
  previewClassName?: string;
  showPreview?: boolean;
  showProgress?: boolean;
  multiple?: boolean;
  label?: string;
  helperText?: string;
  error?: string;
}

interface FileWithPreview extends File {
  id: string;
  preview?: string;
  progress?: number;
  error?: string;
}

const FileUpload: React.FC<FileUploadProps> = ({
  accept = ["image/*", "audio/mpeg", "application/pdf", "text/csv", "application/json"],
  maxSize = 10, // 10MB default
  maxFiles = 5,
  onFilesChange,
  onFileRemove,
  disabled = false,
  className = "",
  dropZoneClassName = "",
  previewClassName = "",
  showPreview = true,
  showProgress = true,
  multiple = true,
  label,
  helperText,
  error,
}) => {
  const [files, setFiles] = useState<FileWithPreview[]>([]);
  const [isDragOver, setIsDragOver] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const generateFileId = () => Math.random().toString(36).substr(2, 9);

  const validateFile = (file: File): string | null => {
    // Check file size
    if (file.size > maxSize * 1024 * 1024) {
      return `File size must be less than ${maxSize}MB`;
    }

    // Check file type
    const isValidType = accept.some((type) => {
      if (type.endsWith("/*")) {
        return file.type.startsWith(type.slice(0, -1));
      }
      return file.type === type;
    });

    if (!isValidType) {
      return `File type not supported. Accepted types: ${accept.join(", ")}`;
    }

    return null;
  };

  const createFilePreview = (file: File): string | undefined => {
    if (file.type.startsWith("image/")) {
      return URL.createObjectURL(file);
    }
    return undefined;
  };

  const addFiles = useCallback(
    (newFiles: File[]) => {
      const validFiles: FileWithPreview[] = [];
      const errors: string[] = [];

      newFiles.forEach((file) => {
        const error = validateFile(file);
        if (error) {
          errors.push(`${file.name}: ${error}`);
        } else {
          const fileWithPreview: FileWithPreview = Object.assign(file, {
            id: generateFileId(),
            preview: createFilePreview(file),
            progress: 0,
          });
          validFiles.push(fileWithPreview);
        }
      });

      if (errors.length > 0) {
        console.warn("File validation errors:", errors);
      }

      setFiles((prevFiles) => {
        const updatedFiles = [...prevFiles, ...validFiles].slice(0, maxFiles);
        onFilesChange?.(updatedFiles);
        return updatedFiles;
      });
    },
    [maxSize, accept, maxFiles, onFilesChange]
  );

  const removeFile = useCallback(
    (fileId: string) => {
      setFiles((prevFiles) => {
        const fileToRemove = prevFiles.find((f) => f.id === fileId);
        const updatedFiles = prevFiles.filter((f) => f.id !== fileId);

        if (fileToRemove) {
          onFileRemove?.(fileToRemove);
          if (fileToRemove.preview) {
            URL.revokeObjectURL(fileToRemove.preview);
          }
        }

        onFilesChange?.(updatedFiles);
        return updatedFiles;
      });
    },
    [onFileRemove, onFilesChange]
  );

  const handleDragOver = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      if (!disabled) {
        setIsDragOver(true);
      }
    },
    [disabled]
  );

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
  }, []);

  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      setIsDragOver(false);

      if (disabled) return;

      const droppedFiles = Array.from(e.dataTransfer.files);
      addFiles(droppedFiles);
    },
    [disabled, addFiles]
  );

  const handleFileInput = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const selectedFiles = Array.from(e.target.files || []);
      addFiles(selectedFiles);

      // Reset input value to allow selecting the same file again
      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }
    },
    [addFiles]
  );

  const openFileDialog = () => {
    if (!disabled && fileInputRef.current) {
      fileInputRef.current.click();
    }
  };

  const getFileIcon = (file: File) => {
    if (file.type.startsWith("image/")) {
      return (
        <svg className="w-8 h-8 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
          />
        </svg>
      );
    }

    if (file.type.startsWith("audio/")) {
      return (
        <svg className="w-8 h-8 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M9 19V6l12-3v13M9 19c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2zm12-3c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2zM9 10l12-3"
          />
        </svg>
      );
    }

    if (file.type === "application/pdf") {
      return (
        <svg className="w-8 h-8 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z"
          />
        </svg>
      );
    }

    if (file.type === "text/csv" || file.type === "application/json") {
      return (
        <svg className="w-8 h-8 text-purple-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
          />
        </svg>
      );
    }

    return (
      <svg className="w-8 h-8 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={2}
          d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
        />
      </svg>
    );
  };

  const formatFileSize = (bytes: number): string => {
    if (bytes === 0) return "0 Bytes";
    const k = 1024;
    const sizes = ["Bytes", "KB", "MB", "GB"];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i];
  };

  return (
    <div className={`w-full ${className}`}>
      {/* Label */}
      {label && <label className="block text-sm font-medium text-gray-700 mb-2">{label}</label>}

      {/* Drop Zone */}
      <div
        className={`
          relative border-2 border-dashed rounded-lg p-6 text-center transition-colors duration-200 cursor-pointer
          ${isDragOver ? "border-[var(--primary-blue)] bg-blue-50" : "border-gray-300"}
          ${disabled ? "opacity-50 cursor-not-allowed" : "hover:border-gray-400"}
          ${error ? "border-red-500" : ""}
          ${dropZoneClassName}
        `}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        onClick={openFileDialog}
      >
        <input
          ref={fileInputRef}
          type="file"
          accept={accept.join(",")}
          multiple={multiple}
          onChange={handleFileInput}
          className="hidden"
          disabled={disabled}
        />

        <div className="space-y-2">
          <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12"
            />
          </svg>

          <div className="text-sm text-gray-600">
            <span className="font-medium text-[var(--primary-blue)]">Click to upload</span> or drag and drop
          </div>

          <div className="text-xs text-gray-500">
            {accept.includes("image/*") && "Images, "}
            {accept.includes("audio/mpeg") && "MP3, "}
            {accept.includes("application/pdf") && "PDF, "}
            {accept.includes("text/csv") && "CSV, "}
            {accept.includes("application/json") && "JSON"}
            {maxSize && ` (max ${maxSize}MB)`}
          </div>
        </div>
      </div>

      {/* File Previews */}
      {showPreview && files.length > 0 && (
        <div className={`mt-4 space-y-2 ${previewClassName}`}>
          {files.map((file) => (
            <div key={file.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
              <div className="flex items-center space-x-3">
                {file.preview ? (
                  <img src={file.preview} alt={file.name} className="w-10 h-10 object-cover rounded" />
                ) : (
                  getFileIcon(file)
                )}

                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-gray-900 truncate">{file.name}</p>
                  <p className="text-xs text-gray-500">{formatFileSize(file.size)}</p>
                  {file.error && <p className="text-xs text-red-500">{file.error}</p>}
                </div>
              </div>

              <div className="flex items-center space-x-2">
                {showProgress && file.progress !== undefined && file.progress < 100 && (
                  <div className="w-16 h-2 bg-gray-200 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-[var(--primary-blue)] transition-all duration-300"
                      style={{ width: `${file.progress}%` }}
                    />
                  </div>
                )}

                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    removeFile(file.id);
                  }}
                  className="text-gray-400 hover:text-red-500 transition-colors duration-200"
                  disabled={disabled}
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Helper Text / Error Message */}
      {(error || helperText) && (
        <div className="mt-2">
          {error && <p className="text-sm text-red-600">{error}</p>}
          {!error && helperText && <p className="text-sm text-gray-500">{helperText}</p>}
        </div>
      )}
    </div>
  );
};

export default FileUpload;
