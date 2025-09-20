"use client";
import React, { useState } from "react";
import Modal from "../Modal";
import TextField from "../TextField";
import Button from "../Button";

interface WikipediaModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (url: string) => void;
}

export default function WikipediaModal({ isOpen, onClose, onSubmit }: WikipediaModalProps) {
  const [wikiUrl, setWikiUrl] = useState("");

  const handleSubmit = () => {
    if (wikiUrl && wikiUrl.trim()) {
      onSubmit(wikiUrl.trim());
      setWikiUrl("");
    }
  };

  const handleClose = () => {
    setWikiUrl("");
    onClose();
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={handleClose}
      closeOnEscape
      showCloseButton
      size="md"
      title="Enter Wikipedia URL"
    >
      <div className="flex flex-col w-full items-center gap-4">
        <TextField
          value={wikiUrl}
          onChange={(e) => setWikiUrl(e)}
          label="Enter Wikipedia URL"
          onEnter={handleSubmit}
        />
        <Button onClick={handleSubmit} variant="gradient" className="w-full">
          Submit
        </Button>
      </div>
    </Modal>
  );
}