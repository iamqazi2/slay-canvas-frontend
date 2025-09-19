"use client";
import React from "react";
import OverlayPanel from "./OverlayPanel";

interface SharePanelProps {
  isVisible: boolean;
  onClose: () => void;
}

const SharePanel: React.FC<SharePanelProps> = ({ isVisible, onClose }) => {
  return (
    <OverlayPanel
      isVisible={isVisible}
      onClose={onClose}
      position="top-right"
      width="w-96"
      maxHeight="max-h-[85vh]"
      className="relative inset-0"
      zIndex={150}
    >
      {/* Header */}
      <div className="flex items-center justify-between px-6 py-5 border-b border-gray-200">
        <h2 className="text-xl font-bold text-gray-900">Share this file</h2>
        <div className="flex items-center gap-6">
          <button className="flex items-center gap-2 text-blue-600 hover:text-blue-700 transition-colors">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path
                d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
            <span className="text-sm font-medium">Copy link</span>
          </button>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600 transition-colors p-1">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path
                d="M18 6L6 18M6 6l12 12"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          </button>
        </div>
      </div>

      {/* Invitation Input Section */}
      <div className="px-6 py-6">
        <div className="flex gap-3">
          <input
            type="text"
            placeholder="Emails, comma seperated"
            className="flex-1 px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-900 placeholder-gray-500 text-sm"
          />
          <button
            style={{
              background: "linear-gradient(90deg, #8E5EFF 0%, #4596FF 100%)",
            }}
            className="px-6 py-3 text-white rounded-xl font-medium hover:from-purple-700 hover:to-blue-700 transition-all duration-200 shadow-lg text-sm"
          >
            Invite
          </button>
        </div>
      </div>

      {/* People in this team Section */}
      <div className="px-6 pb-4">
        <h3 className="text-sm font-medium text-gray-500 mb-3">People in this team</h3>

        {/* Access Settings */}
        <div className="flex items-center justify-between my-4">
          <div className="flex items-center gap-3">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path
                fillRule="evenodd"
                clipRule="evenodd"
                d="M5.25 9.303V8C5.25 6.20979 5.96116 4.4929 7.22703 3.22703C8.4929 1.96116 10.2098 1.25 12 1.25C13.7902 1.25 15.5071 1.96116 16.773 3.22703C18.0388 4.4929 18.75 6.20979 18.75 8V9.303C18.9767 9.31833 19.1907 9.33967 19.392 9.367C20.292 9.487 21.05 9.747 21.652 10.348C22.254 10.95 22.512 11.708 22.634 12.608C22.75 13.475 22.75 14.578 22.75 15.945V16.055C22.75 17.422 22.75 18.525 22.634 19.392C22.512 20.292 22.254 21.05 21.652 21.652C21.05 22.254 20.292 22.512 19.392 22.634C18.525 22.75 17.422 22.75 16.055 22.75H7.945C6.578 22.75 5.475 22.75 4.608 22.634C3.708 22.512 2.95 22.254 2.348 21.652C1.746 21.05 1.488 20.292 1.367 19.392C1.25 18.525 1.25 17.422 1.25 16.055V15.945C1.25 14.578 1.25 13.475 1.367 12.608C1.487 11.708 1.747 10.95 2.348 10.348C2.95 9.746 3.708 9.488 4.608 9.367C4.80867 9.33967 5.02267 9.31833 5.25 9.303ZM6.75 8C6.75 6.60761 7.30312 5.27225 8.28769 4.28769C9.27225 3.30312 10.6076 2.75 12 2.75C13.3924 2.75 14.7277 3.30312 15.7123 4.28769C16.6969 5.27225 17.25 6.60761 17.25 8V9.253C16.8767 9.25033 16.4783 9.24933 16.055 9.25H7.945C7.52233 9.25 7.124 9.251 6.75 9.253V8ZM3.409 11.409C3.686 11.132 4.074 10.952 4.809 10.853C5.563 10.752 6.565 10.75 8 10.75H16C17.435 10.75 18.436 10.752 19.192 10.853C19.926 10.952 20.314 11.133 20.591 11.409C20.868 11.686 21.048 12.074 21.147 12.809C21.248 13.564 21.25 14.565 21.25 16C21.25 17.435 21.248 18.436 21.147 19.192C21.048 19.926 20.867 20.314 20.591 20.591C20.314 20.868 19.926 21.048 19.191 21.147C18.436 21.248 17.435 21.25 16 21.25H8C6.565 21.25 5.563 21.248 4.808 21.147C4.074 21.048 3.686 20.867 3.409 20.591C3.132 20.314 2.952 19.926 2.853 19.191C2.752 18.436 2.75 17.435 2.75 16C2.75 14.565 2.752 13.563 2.853 12.808C2.952 12.074 3.133 11.686 3.409 11.409Z"
                fill="#1E1E1E"
              />
            </svg>

            <span className="text-sm font-medium text-gray-700">Only those invited</span>
          </div>
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path
              d="M9 18l6-6-6-6"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        </div>

        {/* Collaborator List */}
        <div className="space-y-4">
          {/* Current User */}
          <div className="flex items-center justify-between py-2">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 bg-black rounded-full flex items-center justify-center">
                <span className="text-white text-xs font-medium">JW</span>
              </div>
              <div>
                <p className="text-sm font-medium text-gray-900">John Will (you)</p>
              </div>
            </div>
            <span className="text-sm font-medium text-gray-600">Owner</span>
          </div>

          {/* Another User */}
          <div className="flex items-center justify-between py-2">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 bg-black rounded-full flex items-center justify-center">
                <span className="text-white text-xs font-medium">WS</span>
              </div>
              <div>
                <p className="text-sm font-medium text-gray-900">wiliamsawyer@gmail.com</p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-sm font-medium text-gray-600">Edit</span>
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path
                  d="M6 9l6 6 6-6"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
            </div>
          </div>
        </div>
      </div>
    </OverlayPanel>
  );
};

export default SharePanel;
