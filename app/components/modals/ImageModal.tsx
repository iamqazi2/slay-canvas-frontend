"use client";
import React from "react";
import Modal from "../Modal";
import ImageUpload from "../ImageUpload";

interface ImageModalProps {
  isOpen: boolean;
  onClose: () => void;
  onFilesChange: (files: File[]) => void;
}

export default function ImageModal({ isOpen, onClose, onFilesChange }: ImageModalProps) {
  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      closeOnEscape
      showCloseButton
      size="md"
      title="Upload Image (JPG, PNG, GIF, etc.)"
    >
      <div className="flex flex-col w-full items-center gap-4">
        <ImageUpload
          label="Click to upload"
          showPreview
          onFilesChange={onFilesChange}
          showProgress
          multiple
          showThumbnails
        />
      </div>
    </Modal>
  );
}