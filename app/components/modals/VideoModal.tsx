"use client";
import React, { useState } from "react";
import Modal from "../Modal";
import TextField from "../TextField";
import Button from "../Button";

interface VideoModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (url: string) => void;
}

export default function VideoModal({ isOpen, onClose, onSubmit }: VideoModalProps) {
  const [url, setUrl] = useState("");

  const handleSubmit = () => {
    if (url && url.trim()) {
      onSubmit(url.trim());
      setUrl("");
    }
  };

  const handleClose = () => {
    setUrl("");
    onClose();
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={handleClose}
      closeOnEscape
      showCloseButton
      size="md"
      title="Enter Video URL (YouTube, Vimeo, Instagram, Facebook, TikTok, Twitter, or direct video link)"
    >
      <div className="flex flex-col w-full items-center gap-4">
        <TextField
          value={url}
          onChange={(e) => setUrl(e)}
          label="Enter URL"
          onEnter={handleSubmit}
        />
        <Button onClick={handleSubmit} variant="gradient" className="w-full">
          Submit
        </Button>
      </div>
    </Modal>
  );
}