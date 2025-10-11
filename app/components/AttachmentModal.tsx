import { useState } from "react";
import { Link, Upload } from "lucide-react";

interface AttachmentModalProps {
  isAttachModalOpen: boolean;
  setIsAttachModalOpen: (open: boolean) => void;
  handleLinkAttach: (url: string, title: string) => Promise<void>;
  handleFileAttach: (file: File) => Promise<void>;
  isAttaching: boolean;
}

const AttachmentModal: React.FC<AttachmentModalProps> = ({
  isAttachModalOpen,
  setIsAttachModalOpen,
  handleLinkAttach,
  handleFileAttach,
  isAttaching,
}) => {
  const [activeTab, setActiveTab] = useState<"link" | "file">("link");
  const [linkUrl, setLinkUrl] = useState("");
  const [linkTitle, setLinkTitle] = useState("");
  const [selectedFile, setSelectedFile] = useState<File | null>(null);

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      // Validate file type (only images and documents)
      const isImage = file.type.startsWith("image/");
      const isDocument =
        file.type === "application/pdf" ||
        file.type.includes("document") ||
        file.type.includes("text") ||
        file.type.includes("msword") ||
        file.type.includes("officedocument");

      if (isImage || isDocument) {
        setSelectedFile(file);
      } else {
        alert("Please select an image or document file.");
      }
    }
  };

  const handleSubmit = async () => {
    if (activeTab === "link" && linkUrl.trim()) {
      await handleLinkAttach(linkUrl.trim(), linkTitle.trim());
    } else if (activeTab === "file" && selectedFile) {
      await handleFileAttach(selectedFile);
    }
  };

  if (!isAttachModalOpen) return null;

  return (
    <div
      className={`fixed inset-0 z-50 flex items-center justify-center p-4`}
      onClick={(e) => {
        if (e.target === e.currentTarget) {
          setIsAttachModalOpen(false);
        }
      }}
    >
      {/* Overlay */}
      <div className="absolute inset-0 bg-black/50 transition-opacity duration-300 animate-in fade-in" />

      {/* Modal */}
      <div
        className={`relative w-full max-w-md bg-white rounded-lg shadow-xl transform transition-all duration-300 animate-in zoom-in-95 slide-in-from-bottom-4`}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200 bg-gray-50 rounded-t-lg">
          <h2 className="text-xl font-semibold text-gray-900">
            Attach Content
          </h2>
          <button
            onClick={() => setIsAttachModalOpen(false)}
            className="text-gray-400 hover:text-gray-600 transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-[var(--primary-blue)] focus:ring-offset-2 rounded-full p-1 hover:bg-gray-100"
            aria-label="Close modal"
          >
            <svg
              className="w-6 h-6"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M6 18L18 6M6 6l12 12"
              />
            </svg>
          </button>
        </div>

        {/* Content */}
        <div className="p-6 max-h-[70vh] overflow-y-auto">
          {/* Tab Navigation */}
          <div className="flex border-b border-gray-200 mb-4">
            <button
              onClick={() => setActiveTab("link")}
              className={`flex-1 py-2 px-4 text-sm font-medium border-b-2 transition-colors duration-200 ${
                activeTab === "link"
                  ? "border-blue-500 text-blue-600"
                  : "border-transparent text-gray-500 hover:text-gray-700"
              }`}
            >
              <Link className="w-4 h-4 inline mr-2" />
              Add Link
            </button>
            <button
              onClick={() => setActiveTab("file")}
              className={`flex-1 py-2 px-4 text-sm font-medium border-b-2 transition-colors duration-200 ${
                activeTab === "file"
                  ? "border-blue-500 text-blue-600"
                  : "border-transparent text-gray-500 hover:text-gray-700"
              }`}
            >
              <Upload className="w-4 h-4 inline mr-2" />
              Upload File
            </button>
          </div>

          {/* Tab Content */}
          {activeTab === "link" && (
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  URL *
                </label>
                <input
                  type="url"
                  value={linkUrl}
                  onChange={(e) => setLinkUrl(e.target.value)}
                  placeholder="https://example.com"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Title (optional)
                </label>
                <input
                  type="text"
                  value={linkTitle}
                  onChange={(e) => setLinkTitle(e.target.value)}
                  placeholder="Enter a custom title"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <p className="text-xs text-gray-500">
                Supports social media links (Facebook, Instagram, TikTok,
                etc.), Wikipedia, and general web links.
              </p>
            </div>
          )}

          {activeTab === "file" && (
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Select File *
                </label>
                <input
                  type="file"
                  onChange={handleFileSelect}
                  accept="image/*,.pdf,.doc,.docx,.txt"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              {selectedFile && (
                <div className="p-3 bg-gray-50 rounded-md">
                  <p className="text-sm font-medium">{selectedFile.name}</p>
                  <p className="text-xs text-gray-500">
                    {(selectedFile.size / 1024 / 1024).toFixed(2)} MB
                  </p>
                </div>
              )}
              <p className="text-xs text-gray-500">
                Supported formats: Images (JPG, PNG, GIF, etc.) and Documents
                (PDF, DOC, DOCX, TXT)
              </p>
            </div>
          )}

          {/* Action Buttons */}
          <div className="flex gap-3 mt-6">
            <button
              onClick={() => setIsAttachModalOpen(false)}
              className="flex-1 px-4 py-2 text-gray-700 border border-gray-300 rounded-md hover:bg-gray-50 transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-[var(--primary-blue)] focus:ring-offset-2"
              disabled={isAttaching}
            >
              Cancel
            </button>
            <button
              onClick={handleSubmit}
              disabled={
                isAttaching ||
                (activeTab === "link" && !linkUrl.trim()) ||
                (activeTab === "file" && !selectedFile)
              }
              className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
            >
              {isAttaching ? (
                <>
                  <svg
                    className="animate-spin h-4 w-4 mr-2"
                    viewBox="0 0 24 24"
                  >
                    <circle
                      className="opacity-25"
                      cx="12"
                      cy="12"
                      r="10"
                      stroke="currentColor"
                      strokeWidth="4"
                      fill="none"
                    />
                    <path
                      className="opacity-75"
                      fill="currentColor"
                      d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                    />
                  </svg>
                  Attaching...
                </>
              ) : (
                "Attach"
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AttachmentModal;