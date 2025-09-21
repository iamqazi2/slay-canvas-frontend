"use client";
import React, { useState } from "react";
import Modal from "../Modal";
import TextField from "../TextField";
import Button from "../Button";

interface TextModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (text: string) => void;
}

export default function TextModal({ isOpen, onClose, onSubmit }: TextModalProps) {
  const [text, setText] = useState("");

  const handleSubmit = () => {
    if (text && text.trim()) {
      onSubmit(text.trim());
      setText("");
    }
  };

  const handleClose = () => {
    setText("");
    onClose();
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={handleClose}
      closeOnEscape
      showCloseButton
      size="md"
      title="Enter Text Content"
    >
      <div className="flex flex-col w-full items-center gap-4">
        <TextField
          value={text}
          onChange={(e) => setText(e)}
          label="Enter Text"
          onEnter={handleSubmit}
        />
        <Button onClick={handleSubmit} variant="gradient" className="w-full">
          Submit
        </Button>
      </div>
    </Modal>
  );
}