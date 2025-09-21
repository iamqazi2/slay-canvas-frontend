"use client";
import React from "react";
import Modal from "../Modal";
import DocumentUpload from "../DocumentUpload";

interface DocumentModalProps {
  isOpen: boolean;
  onClose: () => void;
  onFilesChange: (files: File[]) => void;
}

export default function DocumentModal({ isOpen, onClose, onFilesChange }: DocumentModalProps) {
  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      closeOnEscape
      showCloseButton
      size="md"
      title="Upload Document (PDF, DOCX, TXT, XLSX, CSV)"
    >
      <div className="flex flex-col w-full items-center gap-4">
        <DocumentUpload
          label="Click to upload"
          showPreview
          onFilesChange={onFilesChange}
          showProgress
          multiple
          showFileInfo
        />
      </div>
    </Modal>
  );
}