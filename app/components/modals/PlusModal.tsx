"use client";
import React from "react";
import Modal from "../Modal";
import Button from "../Button";

interface PlusModalProps {
  isOpen: boolean;
  onClose: () => void;
  onFacebookVideo: () => void;
  onDeviceImport: () => void;
}

export default function PlusModal({
  isOpen,
  onClose,
  onFacebookVideo,
  onDeviceImport,
}: PlusModalProps) {
  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      closeOnEscape
      showCloseButton
      size="md"
      title="Add Video"
    >
      <div className="flex flex-col w-full items-center gap-4">
        <Button
          onClick={() => {
            onFacebookVideo();
            onClose();
          }}
          variant="gradient"
          className="w-full"
        >
          Upload Facebook Video
        </Button>
        <Button
          onClick={() => {
            onDeviceImport();
            onClose();
          }}
          variant="secondary"
          className="w-full"
        >
          Import Video from Device
        </Button>
      </div>
    </Modal>
  );
}