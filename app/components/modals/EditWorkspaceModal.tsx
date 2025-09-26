"use client";
import React, { useState, useEffect } from "react";
import Modal from "../Modal";
import TextField from "../TextField";
import Button from "../Button";

interface EditWorkspaceModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (name: string) => void;
  workspaceName: string;
  isLoading?: boolean;
}

export default function EditWorkspaceModal({
  isOpen,
  onClose,
  onSubmit,
  workspaceName,
  isLoading = false,
}: EditWorkspaceModalProps) {
  const [name, setName] = useState(workspaceName);

  useEffect(() => {
    if (isOpen) {
      setName(workspaceName);
    }
  }, [isOpen, workspaceName]);

  const handleSubmit = () => {
    if (name && name.trim() && name.trim() !== workspaceName) {
      onSubmit(name.trim());
    }
  };

  const handleClose = () => {
    setName(workspaceName);
    onClose();
  };

  const isNameChanged = name.trim() !== workspaceName;
  const isNameValid = name.trim().length > 0;

  return (
    <Modal
      isOpen={isOpen}
      onClose={handleClose}
      closeOnEscape={!isLoading}
      showCloseButton={!isLoading}
      size="md"
      title="Edit Workspace"
    >
      <div className="flex flex-col w-full items-center gap-4">
        <TextField
          value={name}
          onChange={setName}
          label="Workspace Name"
          placeholder="Enter workspace name"
          onEnter={() => !isLoading && handleSubmit()}
          disabled={isLoading}
        />
        <Button
          onClick={() => {
            if (!isLoading && isNameValid && isNameChanged) {
              handleSubmit();
            }
          }}
          variant={isLoading || !isNameValid || !isNameChanged ? "secondary" : "gradient"}
          className="w-full"
        >
          {isLoading ? "Updating..." : "Update Workspace"}
        </Button>
      </div>
    </Modal>
  );
}