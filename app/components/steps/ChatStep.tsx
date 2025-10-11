import { Asset, KnowledgeBase } from "@/app/types/workspace";
import { Loader2, Sparkles } from "lucide-react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import MessageComponent from "../MessageComponent";
import WifiIcon from "../icons/WifiIcon";
import { Message, Note } from "../types/multiStepChatTypes";

interface ChatStepProps {
  searchKb?: KnowledgeBase;
  searchAssets: Asset[];
  messages: Message[];
  notes: Note[];
  expandedNotes: Set<number>;
  setExpandedNotes: React.Dispatch<React.SetStateAction<Set<number>>>;
  dropdownOpen: number | null;
  setDropdownOpen: React.Dispatch<React.SetStateAction<number | null>>;
  isStreaming: boolean;
  selectedAssets: Set<number>;
  toggleAssetSelection: (assetId: number) => void;
  toggleAllAssets: () => void;
  isSidebarExpanded: boolean;
  setIsSidebarExpanded: (expanded: boolean) => void;
  isNotesExpanded: boolean;
  setIsNotesExpanded: (expanded: boolean) => void;
  isAttachModalOpen: boolean;
  setIsAttachModalOpen: (open: boolean) => void;
  chatInput: string;
  setChatInput: (value: string) => void;
  handleChatSubmit: () => void;
  handleSaveNote: (content: string, role?: "user" | "agent") => void;
  handleDeleteNote: (noteId: number) => void;
  messagesContainerRef: React.RefObject<HTMLDivElement | null>;
  renderAssetIcon: (asset: Asset) => React.ReactElement;
  isFullscreen?: boolean;
}

const ChatStep: React.FC<ChatStepProps> = ({
  searchKb,
  searchAssets,
  messages,
  notes,
  expandedNotes,
  setExpandedNotes,
  dropdownOpen,
  setDropdownOpen,
  isStreaming,
  selectedAssets,
  toggleAssetSelection,
  toggleAllAssets,
  isSidebarExpanded,
  setIsSidebarExpanded,
  isNotesExpanded,
  setIsNotesExpanded,
  setIsAttachModalOpen,
  chatInput,
  setChatInput,
  handleChatSubmit,
  handleSaveNote,
  handleDeleteNote,
  messagesContainerRef,
  renderAssetIcon,
  isFullscreen = false,
}) => {
  return (
    <div
      className={`flex ${
        isFullscreen ? "h-[calc(100vh-77px)]" : "h-[calc(700px)]"
      }`}
    >
      {/* Sidebar */}
      <div
        className={`bg-white border-r border-gray-200 flex flex-col py-6 gap-4 px-2 transition-all duration-300 h-full overflow-auto ${
          isSidebarExpanded ? "w-80" : "w-20"
        }`}
      >
        {/* Expand/Collapse Button */}
        <button
          onClick={() => setIsSidebarExpanded(!isSidebarExpanded)}
          className="min-w-12 min-h-12 bg-gray-100 rounded-lg flex items-center justify-center hover:bg-gray-200 transition-colors"
          title={isSidebarExpanded ? "Collapse sidebar" : "Expand sidebar"}
        >
          <svg
            width="24"
            height="24"
            viewBox="0 0 24 24"
            fill="none"
            className={`transform transition-transform duration-200 ${
              isSidebarExpanded ? "rotate-180" : ""
            }`}
          >
            <path
              d="M9 18l6-6-6-6"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        </button>

        {isSidebarExpanded ? (
          /* Expanded Sidebar View */
          <div className="flex flex-col gap-4 w-full px-2 flex-1 overflow-hidden">
            {/* Select All Button */}
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium text-gray-700">
                Assets ({searchAssets.length})
              </span>
              <button
                onClick={toggleAllAssets}
                className="text-xs text-blue-600 hover:text-blue-800"
              >
                {selectedAssets.size === searchAssets.length
                  ? "Deselect All"
                  : "Select All"}
              </button>
            </div>

            {/* Selective Search Status */}
            {selectedAssets.size > 0 &&
              selectedAssets.size < searchAssets.length && (
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-2">
                  <p className="text-xs text-blue-700">
                    🎯 Selective search: {selectedAssets.size} of{" "}
                    {searchAssets.length} assets selected
                  </p>
                </div>
              )}

            {/* Asset List with Checkboxes */}
            <div className="flex flex-col gap-2 flex-1 overflow-y-auto">
              {searchAssets.map((asset) => (
                <div
                  key={asset.id}
                  className="flex items-start gap-3 p-3 hover:bg-gray-50 rounded-lg cursor-pointer border border-gray-100"
                  onClick={() => toggleAssetSelection(asset.id)}
                >
                  <input
                    type="checkbox"
                    checked={selectedAssets.has(asset.id)}
                    onChange={() => {}} // Handled by parent onClick
                    className="mt-1 w-4 h-4 text-blue-600 rounded focus:ring-blue-500"
                  />
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      {renderAssetIcon(asset)}
                      <span className="text-sm font-medium text-gray-900 truncate">
                        {asset.title.length > 25
                          ? `${asset.title.substring(0, 25)}...`
                          : asset.title}
                      </span>
                    </div>
                    <p className="text-xs text-gray-500 capitalize">
                      {asset.type.replace("_", " ")}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        ) : (
          /* Collapsed Sidebar View */
          <>
            <button className="min-w-12 min-h-12 bg-gray-100 rounded-lg flex items-center justify-center hover:bg-gray-200">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
                <rect
                  x="3"
                  y="3"
                  width="18"
                  height="18"
                  rx="2"
                  stroke="currentColor"
                  strokeWidth="2"
                />
              </svg>
            </button>
            <button
              onClick={() => setIsAttachModalOpen(true)}
              className="min-w-12 min-h-12 bg-gray-100 rounded-lg flex items-center justify-center hover:bg-gray-200"
            >
              <span className="text-2xl">+</span>
            </button>
            <button className="min-w-12 min-h-12 bg-blue-500 rounded-lg flex items-center justify-center hover:bg-blue-600">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
                <rect
                  x="4"
                  y="4"
                  width="16"
                  height="16"
                  rx="2"
                  stroke="white"
                  strokeWidth="2"
                />
                <line
                  x1="4"
                  y1="8"
                  x2="20"
                  y2="8"
                  stroke="white"
                  strokeWidth="2"
                />
                <line
                  x1="8"
                  y1="4"
                  x2="8"
                  y2="8"
                  stroke="white"
                  strokeWidth="2"
                />
              </svg>
            </button>
            {searchAssets.map((asset) => (
              <button
                key={asset.id}
                className="min-w-12 min-h-12 bg-gray-50 rounded-lg flex items-center justify-center hover:bg-gray-100 border border-gray-200"
                title={asset.title}
              >
                {renderAssetIcon(asset)}
              </button>
            ))}
            <button className="mt-auto min-w-12 min-h-12 bg-blue-100 rounded-full flex items-center justify-center hover:bg-blue-200">
              <Sparkles className="text-blue-600" size={20} />
            </button>
          </>
        )}
      </div>

      {/* Main Chat Area */}
      <div className="flex-1 min-w-[300px] flex flex-col h-full min-h-0">
        {/* Chat Messages Area */}
        <div
          ref={messagesContainerRef}
          className="flex-1 overflow-y-auto bg-gradient-to-b from-white to-[#F1F5F8] min-h-0"
        >
          {messages.length === 0 ? (
            <div className="h-full flex flex-col items-center justify-center px-6 py-8">
              <div className="text-center flex flex-col items-center justify-center max-w-lg">
                <div className="mb-8">
                  <WifiIcon width={80} height={80} />
                </div>

                <h2 className="text-2xl text-center font-medium text-gray-800 mb-4">
                  {searchKb?.name || "How can we assist you today?"}
                </h2>

                <p className="text-base text-gray-500 leading-relaxed mb-4">
                  {searchKb?.description ||
                    (searchKb
                      ? `Get expert guidance from your knowledge base "${searchKb.name}". Ask any question and get AI-powered responses based on your search results.`
                      : "Get expert guidance from your curated web search results. Ask any question and get AI-powered responses based on your selected content.")}
                </p>

                <div className="mt-4 px-3 py-2 bg-blue-50 rounded-lg border border-blue-200">
                  <p className="text-sm text-blue-700">
                    <span className="font-medium">Assets:</span>{" "}
                    {searchAssets.length} sources
                  </p>
                </div>
              </div>
            </div>
          ) : (
            <div className="px-6 py-2">
              <div className="space-y-4 bg-gray pb-4">
                {messages.map((message) => (
                  <MessageComponent
                    key={message.id}
                    message={message}
                    onSaveNote={handleSaveNote}
                  />
                ))}

                {isStreaming && (
                  <div className="flex items-center gap-1 justify-start">
                    <Loader2 size={10} className="animate-spin text-gray-500" />
                    <span className="text-[10px]">Generating...</span>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>

        {/* Input Area */}
        <div className="p-6 bg-white border-t border-gray-200">
          <div className="flex items-center gap-2 p-2 bg-white border border-gray-200 rounded-xl shadow-sm">
            <div className="flex-1 relative">
              <textarea
                value={chatInput}
                onChange={(e) => setChatInput(e.target.value)}
                onKeyPress={(e) => {
                  if (e.key === "Enter" && !e.shiftKey) {
                    e.preventDefault();
                    handleChatSubmit();
                  }
                }}
                placeholder="Type your prompt here"
                className="w-full px-3 py-2.5 pr-16 focus:outline-none focus:border-transparent resize-none text-sm"
                rows={1}
                style={{ minHeight: "40px", maxHeight: "100px" }}
                disabled={isStreaming}
              />

              <div className="absolute right-2 bottom-1 flex items-center gap-1">
                <button
                  onClick={handleChatSubmit}
                  disabled={!chatInput.trim() || isStreaming}
                  className={`p-1.5 rounded-lg transition-colors ${
                    chatInput.trim()
                      ? "opacity-100"
                      : "opacity-50 cursor-not-allowed"
                  }`}
                  style={{
                    background:
                      "linear-gradient(135deg, #8B5CF6 0%, #3B82F6 100%)",
                  }}
                >
                  <svg
                    width="16"
                    height="16"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="white"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  >
                    <path d="M22 2L11 13" />
                    <polygon points="22,2 15,22 11,13 2,9" />
                  </svg>
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Notes Sidebar */}
      <div
        className={`bg-white border-l border-gray-200 flex flex-col transition-all duration-300 h-full overflow-auto ${
          isNotesExpanded ? "w-80" : "w-20"
        }`}
      >
        {/* Expand/Collapse Button */}
        <div className="p-4 border-b border-gray-200 flex items-center justify-between">
          {isNotesExpanded && (
            <div>
              <h3 className="text-lg font-semibold text-gray-800">Notes</h3>
              <p className="text-sm text-gray-500">Saved responses</p>
            </div>
          )}
          <button
            onClick={() => setIsNotesExpanded(!isNotesExpanded)}
            className="min-w-8 min-h-8 bg-gray-100 rounded-lg flex items-center justify-center hover:bg-gray-200 transition-colors"
            title={isNotesExpanded ? "Collapse notes" : "Expand notes"}
          >
            <svg
              width="20"
              height="20"
              viewBox="0 0 24 24"
              fill="none"
              className={`transform transition-transform duration-200 ${
                isNotesExpanded ? "rotate-180" : ""
              }`}
            >
              <path
                d="M15 18l-6-6 6-6"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-4">
          {isNotesExpanded ? (
            /* Expanded Notes View */
            notes.length === 0 ? (
              <div className="text-center text-gray-500 py-8">
                <svg
                  width="48"
                  height="48"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="1"
                  className="mx-auto mb-3 text-gray-300"
                >
                  <path d="M19 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11l5 5v11a2 2 0 0 1-2 2z" />
                  <polyline points="17,21 17,13 7,13 7,21" />
                  <polyline points="7,3 7,8 15,8" />
                </svg>
                <p className="text-sm">No notes saved yet</p>
                <p className="text-xs mt-1">
                  Save AI responses to keep them for later
                </p>
              </div>
            ) : (
              <div className="space-y-2">
                {notes.map((note) => {
                  const isExpanded = expandedNotes.has(note.id);
                  const isDropdownOpen = dropdownOpen === note.id;

                  return (
                    <div
                      key={note.id}
                      className="bg-white rounded-lg border border-gray-200 hover:border-gray-300 transition-colors"
                    >
                      {/* Single Line Note Header */}
                      <div className="flex items-center justify-between p-3">
                        <div
                          onClick={() => {
                            setExpandedNotes((prev) => {
                              const newSet = new Set(prev);
                              if (newSet.has(note.id)) {
                                newSet.delete(note.id);
                              } else {
                                newSet.add(note.id);
                              }
                              return newSet;
                            });
                          }}
                          className="flex-1 cursor-pointer"
                        >
                          <p className="text-sm text-gray-800 line-clamp-1">
                            {note.content.length > 50
                              ? `${note.content.substring(0, 50)}...`
                              : note.content}
                          </p>
                          <p className="text-xs text-gray-500 mt-1">
                            {new Date(note.created_at).toLocaleDateString()}
                          </p>
                        </div>

                        {/* Three Dots Menu */}
                        <div className="relative">
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              setDropdownOpen(isDropdownOpen ? null : note.id);
                            }}
                            className="p-1 text-gray-400 hover:text-gray-600 transition-colors"
                          >
                            <svg
                              width="16"
                              height="16"
                              viewBox="0 0 24 24"
                              fill="currentColor"
                            >
                              <circle cx="12" cy="12" r="1" />
                              <circle cx="19" cy="12" r="1" />
                              <circle cx="5" cy="12" r="1" />
                            </svg>
                          </button>

                          {/* Dropdown Menu */}
                          {isDropdownOpen && (
                            <div className="absolute right-0 top-full mt-1 bg-white border border-gray-200 rounded-lg shadow-lg z-10 min-w-[120px]">
                              <button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  handleDeleteNote(note.id);
                                  setDropdownOpen(null);
                                }}
                                className="w-full px-3 py-2 text-left text-sm text-red-600 hover:bg-red-50 transition-colors rounded-lg"
                              >
                                Delete note
                              </button>
                            </div>
                          )}
                        </div>
                      </div>

                      {/* Expanded Content */}
                      {isExpanded && (
                        <div className="border-t border-gray-100 p-3">
                          <div className="text-sm text-gray-700">
                            <ReactMarkdown
                              remarkPlugins={[remarkGfm]}
                              components={{
                                p: ({ children }) => (
                                  <p className="mb-2 last:mb-0">{children}</p>
                                ),
                                ul: ({ children }) => (
                                  <ul className="list-disc ml-4 mb-2">
                                    {children}
                                  </ul>
                                ),
                                ol: ({ children }) => (
                                  <ol className="list-decimal ml-4 mb-2">
                                    {children}
                                  </ol>
                                ),
                                li: ({ children }) => (
                                  <li className="mb-1">{children}</li>
                                ),
                                code: ({ children }) => (
                                  <code className="bg-gray-100 px-1 py-0.5 rounded text-xs">
                                    {children}
                                  </code>
                                ),
                                h1: ({ children }) => (
                                  <h1 className="font-semibold text-base mb-2">
                                    {children}
                                  </h1>
                                ),
                                h2: ({ children }) => (
                                  <h2 className="font-semibold text-sm mb-2">
                                    {children}
                                  </h2>
                                ),
                                h3: ({ children }) => (
                                  <h3 className="font-semibold text-sm mb-1">
                                    {children}
                                  </h3>
                                ),
                              }}
                            >
                              {note.content}
                            </ReactMarkdown>
                          </div>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            )
          ) : (
            /* Collapsed Notes View */
            <div className="flex flex-col items-center gap-2">
              {notes.slice(0, 5).map((note) => (
                <button
                  key={note.id}
                  className="min-w-12 min-h-12 bg-blue-50 rounded-lg flex items-center justify-center hover:bg-blue-100 border border-blue-200 transition-colors"
                  title={
                    note.content.length > 50
                      ? `${note.content.substring(0, 50)}...`
                      : note.content
                  }
                  onClick={() => {
                    setIsNotesExpanded(true);
                    setExpandedNotes(new Set([note.id]));
                  }}
                >
                  <svg
                    width="20"
                    height="20"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    className="text-blue-600"
                  >
                    <path d="M19 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11l5 5v11a2 2 0 0 1-2 2z" />
                    <polyline points="17,21 17,13 7,13 7,21" />
                    <polyline points="7,3 7,8 15,8" />
                  </svg>
                </button>
              ))}
              {notes.length > 5 && (
                <div className="text-xs text-gray-500 text-center mt-2">
                  +{notes.length - 5} more
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ChatStep;
