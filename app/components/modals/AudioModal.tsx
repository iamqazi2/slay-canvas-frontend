"use client";
import React from "react";
import Modal from "../Modal";
import AudioUpload from "../AudioUpload";

interface AudioModalProps {
  isOpen: boolean;
  onClose: () => void;
  onFilesChange: (files: File[]) => void;
}

export default function AudioModal({ isOpen, onClose, onFilesChange }: AudioModalProps) {
  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      closeOnEscape
      showCloseButton
      size="md"
      title="Upload Audio (MP3, WAV, etc.)"
    >
      <div className="flex flex-col w-full items-center gap-4">
        <AudioUpload
          label="Click to upload"
          showPreview
          onFilesChange={onFilesChange}
          showProgress
          multiple
          showWaveform
        />
      </div>
    </Modal>
  );
}