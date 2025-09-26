"use client";
import React, { useState } from "react";
import Modal from "../Modal";
import TextField from "../TextField";
import Button from "../Button";
import { useToast } from "../ui/Toast";

interface WebLinkModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (url: string) => void;
}

export default function WebLinkModal({ isOpen, onClose, onSubmit }: WebLinkModalProps) {
  const { showToast } = useToast();
  const [url, setUrl] = useState("");

  const handleSubmit = () => {
    const trimmed = url.trim();
    if (!trimmed) {
      showToast("Please enter a valid URL", "error");
      return;
    }
    onSubmit(trimmed);
    setUrl("");
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
      title="Enter Web Link URL"
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