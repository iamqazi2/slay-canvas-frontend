import React from "react";

interface MobilePasteDropdownProps {
  isVisible: boolean;
  position: { x: number; y: number };
  onClose: () => void;
  onPasteAudio: () => void;
  onPasteImage: () => void;
  onPasteVideo: () => void;
  onPasteDocument: () => void;
  onPasteText: () => void;
}

const MobilePasteDropdown: React.FC<MobilePasteDropdownProps> = ({
  isVisible,
  position,
  onClose,
  onPasteAudio,
  onPasteImage,
  onPasteVideo,
  onPasteDocument,
  onPasteText,
}) => {
  if (!isVisible) return null;

  return (
    <>
      {/* Backdrop */}
      <div className="fixed inset-0 z-40 bg-opacity-20" onClick={onClose} />

      {/* Dropdown */}
      <div
        className="fixed z-50 bg-white rounded-xl shadow-2xl border border-gray-200 min-w-[200px]"
        style={{
          left: Math.min(position.x, window.innerWidth - 320),
          top: Math.min(position.y, window.innerHeight - 500),
        }}
      >
        <div className="p-2">
          <div className="text-xs font-medium text-gray-500 px-3 py-2 border-b border-gray-100">Paste Content</div>

          <div className="py-1">
            <button
              onClick={onPasteAudio}
              className="w-full flex items-center gap-3 px-3 py-3 text-left hover:bg-gray-50 rounded-lg transition-colors"
            >
              <div className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center">
                <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                  <path
                    d="M8 1C9.1 1 10 1.9 10 3V8C10 9.1 9.1 10 8 10C6.9 10 6 9.1 6 8V3C6 1.9 6.9 1 8 1Z"
                    fill="#3B82F6"
                  />
                  <path
                    d="M3 6V8C3 10.2 4.8 12 7 12H9C11.2 12 13 10.2 13 8V6"
                    stroke="#3B82F6"
                    strokeWidth="1.5"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>
              </div>
              <div>
                <div className="font-medium text-gray-900">Audio File</div>
                <div className="text-xs text-gray-500">MP3, WAV, etc.</div>
              </div>
            </button>

            <button
              onClick={onPasteImage}
              className="w-full flex items-center gap-3 px-3 py-3 text-left hover:bg-gray-50 rounded-lg transition-colors"
            >
              <div className="w-8 h-8 bg-green-100 rounded-lg flex items-center justify-center">
                <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                  <path
                    d="M2 4C2 2.9 2.9 2 4 2H12C13.1 2 14 2.9 14 4V12C14 13.1 13.1 14 12 14H4C2.9 14 2 13.1 2 12V4Z"
                    stroke="#10B981"
                    strokeWidth="1.5"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                  <path d="M6 6C6.6 6 7 5.6 7 5C7 4.4 6.6 4 6 4C5.4 4 5 4.4 5 5C5 5.6 5.4 6 6 6Z" fill="#10B981" />
                  <path
                    d="M14 10L10 6L4 12"
                    stroke="#10B981"
                    strokeWidth="1.5"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>
              </div>
              <div>
                <div className="font-medium text-gray-900">Image File</div>
                <div className="text-xs text-gray-500">PNG, JPG, SVG, etc.</div>
              </div>
            </button>

            <button
              onClick={onPasteVideo}
              className="w-full flex items-center gap-3 px-3 py-3 text-left hover:bg-gray-50 rounded-lg transition-colors"
            >
              <div className="w-8 h-8 bg-purple-100 rounded-lg flex items-center justify-center">
                <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                  <path
                    d="M2 3C2 2.4 2.4 2 3 2H13C13.6 2 14 2.4 14 3V13C14 13.6 13.6 14 13 14H3C2.4 14 2 13.6 2 13V3Z"
                    stroke="#8B5CF6"
                    strokeWidth="1.5"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                  <path d="M6 5L11 8L6 11V5Z" fill="#8B5CF6" />
                </svg>
              </div>
              <div>
                <div className="font-medium text-gray-900">Video File</div>
                <div className="text-xs text-gray-500">MP4, AVI, etc.</div>
              </div>
            </button>

            <button
              onClick={onPasteDocument}
              className="w-full flex items-center gap-3 px-3 py-3 text-left hover:bg-gray-50 rounded-lg transition-colors"
            >
              <div className="w-8 h-8 bg-orange-100 rounded-lg flex items-center justify-center">
                <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                  <path
                    d="M4 2C3.4 2 3 2.4 3 3V13C3 13.6 3.4 14 4 14H12C12.6 14 13 13.6 13 13V5L9 1H4Z"
                    stroke="#F59E0B"
                    strokeWidth="1.5"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                  <path d="M9 1V5H13" stroke="#F59E0B" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              </div>
              <div>
                <div className="font-medium text-gray-900">Document</div>
                <div className="text-xs text-gray-500">PDF, TXT, DOC, etc.</div>
              </div>
            </button>

            <button
              onClick={onPasteText}
              className="w-full flex items-center gap-3 px-3 py-3 text-left hover:bg-gray-50 rounded-lg transition-colors"
            >
              <div className="w-8 h-8 bg-indigo-100 rounded-lg flex items-center justify-center">
                <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                  <path
                    d="M2 3H14M2 6H14M2 9H10M2 12H8"
                    stroke="#6366F1"
                    strokeWidth="1.5"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>
              </div>
              <div>
                <div className="font-medium text-gray-900">Text</div>
                <div className="text-xs text-gray-500">Wikipedia link</div>
              </div>
            </button>
          </div>
        </div>
      </div>
    </>
  );
};

export default MobilePasteDropdown;
