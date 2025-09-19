import React from "react";
import FileUpload, { FileUploadProps } from "./FileUpload";

interface DocumentUploadProps extends Omit<FileUploadProps, "accept"> {
  allowedTypes?: string[];
  maxFileSize?: number;
  showFileInfo?: boolean;
  validateContent?: boolean;
}

const DocumentUpload: React.FC<DocumentUploadProps> = ({
  allowedTypes = ["application/pdf", "text/csv", "application/json", "text/plain"],
  maxFileSize = 10,
  showFileInfo = true,
  validateContent = false,
  ...props
}) => {
  const validateDocument = (file: File): string | null => {
    // Check file type
    if (!allowedTypes.includes(file.type)) {
      return `Document type not supported. Allowed types: ${allowedTypes.join(", ")}`;
    }

    // Check file size
    if (file.size > maxFileSize * 1024 * 1024) {
      return `Document size must be less than ${maxFileSize}MB`;
    }

    return null;
  };

  const validateFileContent = async (file: File): Promise<string | null> => {
    if (!validateContent) return null;

    try {
      const text = await file.text();

      if (file.type === "application/json") {
        JSON.parse(text);
      } else if (file.type === "text/csv") {
        // Basic CSV validation - check if it has at least one row with commas
        const lines = text.split("\n").filter((line) => line.trim());
        if (lines.length === 0) {
          return "CSV file appears to be empty";
        }
        if (!lines[0].includes(",")) {
          return "CSV file doesn't appear to have comma-separated values";
        }
      }

      return null;
    } catch (error) {
      return `Invalid ${file.type.split("/")[1]} file format`;
    }
  };

  const getFileTypeIcon = (file: File) => {
    switch (file.type) {
      case "application/pdf":
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
      case "text/csv":
        return (
          <svg className="w-8 h-8 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
            />
          </svg>
        );
      case "application/json":
        return (
          <svg className="w-8 h-8 text-yellow-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M10 20l4-16m4 4l4 4-4 4M6 16l-4-4 4-4"
            />
          </svg>
        );
      default:
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
    }
  };

  const getFileTypeName = (file: File): string => {
    switch (file.type) {
      case "application/pdf":
        return "PDF Document";
      case "text/csv":
        return "CSV Spreadsheet";
      case "application/json":
        return "JSON Data";
      case "text/plain":
        return "Text File";
      default:
        return "Document";
    }
  };

  return <FileUpload {...props} accept={allowedTypes} maxSize={maxFileSize} showPreview={true} />;
};

export default DocumentUpload;
