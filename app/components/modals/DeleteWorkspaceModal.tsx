"use client";
import React from "react";
import Modal from "../Modal";
import Button from "../Button";

interface DeleteWorkspaceModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  workspaceName: string;
  isLoading?: boolean;
}

export default function DeleteWorkspaceModal({
  isOpen,
  onClose,
  onConfirm,
  workspaceName,
  isLoading = false,
}: DeleteWorkspaceModalProps) {
  const handleConfirm = () => {
    if (!isLoading) {
      onConfirm();
    }
  };

  const handleCancel = () => {
    if (!isLoading) {
      onClose();
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={handleCancel}
      closeOnEscape={!isLoading}
      showCloseButton={!isLoading}
      size="sm"
      title="Delete Workspace"
    >
      <div className="flex flex-col w-full items-center gap-6">
        <div className="text-center">
          <p className="text-gray-700 mb-2">
            Are you sure you want to delete the workspace{" "}
            <span className="font-semibold text-gray-900">&ldquo;{workspaceName}&rdquo;</span>?
          </p>
          <p className="text-sm text-gray-500">
            This action cannot be undone. All data associated with this workspace will be permanently deleted.
          </p>
        </div>

        <div className="flex gap-3 w-full">
          <Button
            onClick={handleCancel}
            variant="secondary"
            className="flex-1"
          >
            Cancel
          </Button>
          <Button
            onClick={handleConfirm}
            variant="primary"
            className="flex-1 bg-red-500 hover:bg-red-600 text-white border-red-500"
          >
            {isLoading ? "Deleting..." : "Delete"}
          </Button>
        </div>
      </div>
    </Modal>
  );
}