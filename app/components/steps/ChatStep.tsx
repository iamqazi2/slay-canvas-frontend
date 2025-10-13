import { Asset, KnowledgeBase } from "@/app/types/workspace";
import { Loader2 } from "lucide-react";
import { useRouter } from "next/navigation";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import MessageComponent from "../MessageComponent";
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
  handleBackToContext: () => void;
  isFullscreen?: boolean;
  workspaceId?: number;
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
  handleBackToContext,
  isFullscreen = false,
  workspaceId,
}) => {
  const router = useRouter();

  const MinimizeIcon = () => (
    <svg
      width="16"
      height="16"
      viewBox="0 0 16 16"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      <path
        d="M3 8H13"
        stroke="#6B7280"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );

  return (
    <div
      className={`flex ${
        isFullscreen ? "h-[calc(100vh-77px)]" : "h-[calc(700px)]"
      }`}
    >
      {/* Sidebar */}
      <div className="bg-white flex flex-col justify-between">
        {" "}
        <div
          className={`bg-white border-[1px] border-black/10 flex flex-col py-6 gap-4 px-2 m-4 rounded-[16px] transition-all duration-300 ${
            isSidebarExpanded ? "w-80" : "w-20"
          }`}
        >
          {/* Expand/Collapse Button */}
          <button
            onClick={() => setIsSidebarExpanded(!isSidebarExpanded)}
            className="min-w-12 min-h-12  flex items-center justify-center  transition-all duration-300"
            title={isSidebarExpanded ? "Collapse sidebar" : "Expand sidebar"}
          >
            <svg
              width="40"
              height="40"
              viewBox="0 0 21 20"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                d="M7.70142 1.5V18.5M1.70142 7.4C1.70142 5.16 1.70142 4.04 2.13742 3.184C2.5209 2.43139 3.1328 1.81949 3.88542 1.436C4.74142 1 5.86142 1 8.10142 1H13.3014C15.5414 1 16.6614 1 17.5174 1.436C18.27 1.81949 18.8819 2.43139 19.2654 3.184C19.7014 4.04 19.7014 5.16 19.7014 7.4V12.6C19.7014 14.84 19.7014 15.96 19.2654 16.816C18.8819 17.5686 18.27 18.1805 17.5174 18.564C16.6614 19 15.5414 19 13.3014 19H8.10142C5.86142 19 4.74142 19 3.88542 18.564C3.1328 18.1805 2.5209 17.5686 2.13742 16.816C1.70142 15.96 1.70142 14.84 1.70142 12.6V7.4Z"
                stroke="#1E1E1E"
                stroke-opacity="0.8"
                stroke-width="1.5"
                stroke-linecap="round"
                stroke-linejoin="round"
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
              {/* <button className="min-w-12 min-h-12 bg-gray-100 rounded-lg flex items-center justify-center hover:bg-gray-200">
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
            </button> */}
              <button
                onClick={() => setIsAttachModalOpen(true)}
                className="min-w-12 min-h-12 border-t border-black/20   flex items-center justify-center  transition-all duration-300"
              >
                <span className="text-5xl font-light text-black">+</span>
              </button>
              {/* <button className="min-w-12 min-h-12 bg-gradient-to-r from-[#8e5eff] to-[#4596ff] rounded-lg flex items-center justify-center hover:from-[#7c4dff] hover:to-[#3b82f6] transition-all duration-300 shadow-md">
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
              </button> */}
              <div className="overflow-y-auto border-b border-black/20 flex flex-col space-y-2 h-[40vh] scrollbar-hide">
                {" "}
                {searchAssets.map((asset) => (
                  <button
                    key={asset.id}
                    className="min-w-12 min-h-12 backdrop-blur-lg rounded-lg flex items-center justify-center shadow-md hover:shadow-lg transition-all duration-300 hover:scale-105"
                    title={asset.title}
                  >
                    <svg
                      width="40"
                      height="40"
                      viewBox="0 0 21 16"
                      fill="none"
                      xmlns="http://www.w3.org/2000/svg"
                    >
                      <path
                        d="M2.70142 16C2.15142 16 1.68075 15.8043 1.28942 15.413C0.898083 15.0217 0.702083 14.5507 0.701416 14V2C0.701416 1.45 0.897416 0.979333 1.28942 0.588C1.68142 0.196666 2.15208 0.000666667 2.70142 0H18.7014C19.2514 0 19.7224 0.196 20.1144 0.588C20.5064 0.98 20.7021 1.45067 20.7014 2V14C20.7014 14.55 20.5057 15.021 20.1144 15.413C19.7231 15.805 19.2521 16.0007 18.7014 16H2.70142ZM2.70142 14H13.2014V10.5H2.70142V14ZM15.2014 14H18.7014V5H15.2014V14ZM2.70142 8.5H13.2014V5H2.70142V8.5Z"
                        fill="#1279FF"
                      />
                    </svg>
                  </button>
                ))}
              </div>
              <button
                onClick={handleBackToContext}
                className="mt-auto min-w-12 min-h-12   flex items-center justify-center transition-all duration-300"
                title="Back to search"
              >
                <svg
                  width="50"
                  height="50"
                  viewBox="0 0 33 32"
                  className=""
                  fill="none"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <rect
                    x="0.701416"
                    width="32"
                    height="32"
                    rx="16"
                    fill="#4596FF"
                    fill-opacity="0.1"
                  />
                  <path
                    fill-rule="evenodd"
                    clip-rule="evenodd"
                    d="M14.8298 7.52064C15.3725 7.52064 15.9058 7.57491 16.4195 7.6797C16.6627 7.72909 16.8763 7.87306 17.0133 8.07994C17.1504 8.28682 17.1996 8.53967 17.1503 8.78287C17.1009 9.02606 16.9569 9.23968 16.75 9.37672C16.5431 9.51377 16.2903 9.56301 16.0471 9.51363C14.8686 9.27322 13.6453 9.38764 12.5318 9.84242C11.4183 10.2972 10.4647 11.0719 9.79148 12.0686C9.11827 13.0653 8.7557 14.2393 8.74961 15.442C8.74352 16.6448 9.09419 17.8223 9.75729 18.8258C10.4204 19.8293 11.3661 20.6136 12.4749 21.0796C13.5838 21.5457 14.8059 21.6724 15.9867 21.444C17.1676 21.2155 18.2542 20.642 19.1092 19.7961C19.9641 18.9501 20.5491 17.8696 20.79 16.6912C20.8145 16.5708 20.8624 16.4564 20.9311 16.3545C20.9998 16.2526 21.0878 16.1652 21.1903 16.0974C21.2927 16.0295 21.4075 15.9825 21.5281 15.959C21.6487 15.9355 21.7728 15.936 21.8932 15.9604C22.0136 15.9849 22.128 16.0328 22.2299 16.1015C22.3318 16.1702 22.4192 16.2582 22.4871 16.3607C22.5549 16.4631 22.6019 16.5779 22.6254 16.6985C22.6489 16.8191 22.6484 16.9432 22.624 17.0636C22.3961 18.1795 21.9312 19.2335 21.2607 20.1542L21.0764 20.3974L24.4935 23.8145C24.663 23.9825 24.762 24.209 24.7701 24.4476C24.7782 24.6861 24.6948 24.9188 24.537 25.0979C24.3792 25.277 24.1589 25.389 23.9212 25.411C23.6835 25.433 23.4464 25.3633 23.2584 25.2162L23.1704 25.1376L19.7533 21.7205C18.7572 22.5055 17.5879 23.0409 16.3428 23.282C15.0977 23.5232 13.813 23.4631 12.5959 23.1068C11.3787 22.7505 10.2644 22.1082 9.346 21.2337C8.42754 20.3591 7.73155 19.2776 7.31608 18.0794C6.90061 16.8811 6.77772 15.6009 6.95765 14.3455C7.13758 13.0901 7.61513 11.896 8.35043 10.8626C9.08574 9.82934 10.0575 8.98687 11.1846 8.4055C12.3117 7.82414 13.5616 7.52075 14.8298 7.52064ZM22.783 6.58496C22.9581 6.58496 23.1296 6.63406 23.2782 6.72669C23.4267 6.81931 23.5463 6.95175 23.6233 7.10894L23.6682 7.21841L23.7898 7.5721C23.9182 7.94841 24.1251 8.29316 24.3967 8.58351C24.6683 8.87387 24.9986 9.1032 25.3655 9.25632L25.5386 9.32182L25.8923 9.44252C26.0674 9.50227 26.2209 9.61263 26.3334 9.75962C26.4458 9.90661 26.5121 10.0836 26.5239 10.2683C26.5358 10.453 26.4925 10.6371 26.3998 10.7972C26.307 10.9573 26.1688 11.0863 26.0027 11.1679L25.8923 11.2128L25.5386 11.3345C25.1623 11.4628 24.8175 11.6697 24.5272 11.9413C24.2368 12.213 24.0075 12.5432 23.8544 12.9101L23.7889 13.0832L23.6682 13.4369C23.6083 13.612 23.4979 13.7654 23.3508 13.8778C23.2038 13.9901 23.0267 14.0563 22.8421 14.0681C22.6574 14.0798 22.4734 14.0365 22.3133 13.9436C22.1532 13.8508 22.0243 13.7125 21.9428 13.5464L21.8979 13.4369L21.7762 13.0832C21.6479 12.7069 21.441 12.3622 21.1694 12.0718C20.8977 11.7815 20.5675 11.5521 20.2006 11.399L20.0275 11.3335L19.6738 11.2128C19.4986 11.1531 19.3451 11.0427 19.2327 10.8957C19.1203 10.7487 19.0539 10.5717 19.0421 10.387C19.0303 10.2023 19.0735 10.0183 19.1663 9.85816C19.2591 9.69804 19.3973 9.56902 19.5634 9.48743L19.6738 9.44252L20.0275 9.32088C20.4038 9.19251 20.7485 8.98565 21.0389 8.71401C21.3292 8.44237 21.5586 8.11214 21.7117 7.7452L21.7772 7.5721L21.8979 7.21841C21.9609 7.0337 22.0802 6.87332 22.2389 6.75974C22.3976 6.64615 22.5879 6.58504 22.783 6.58496ZM22.783 9.57539C22.5617 9.85394 22.3093 10.1063 22.0308 10.3277C22.3102 10.5491 22.561 10.7999 22.783 11.08C23.0045 10.8005 23.2552 10.5497 23.5353 10.3277C23.2568 10.1063 23.0044 9.85394 22.783 9.57539Z"
                    fill="#4596FF"
                  />
                </svg>
              </button>
            </>
          )}
        </div>
        {isFullscreen && (
          <div
            className="p-4 border-t border-gray-200 h-[99px]"
            onClick={() => router.push(`/workspace/${workspaceId}`)}
          >
            <button className="flex items-center h-full gap-2 text-sm text-gray-600 hover:text-gray-800 transition-colors">
              <MinimizeIcon />
              <span>Minimize the Chat</span>
            </button>
          </div>
        )}
      </div>

      {/* Main Chat Area */}
      <div className="flex-1 min-w-[300px] flex flex-col h-full min-h-0">
        {/* Chat Messages Area */}
        <div
          ref={messagesContainerRef}
          className="flex-1 overflow-y-auto bg-white min-h-0"
        >
          {messages.length === 0 ? (
            <div className="h-full flex flex-col px-6 py-8">
              <div className="flex flex-col max-w-lg">
                {/* Show KB Description as formatted markdown */}
                {searchKb?.description ? (
                  <div className="w-full max-w-2xl">
                    <div className="prose prose-gray max-w-none text-left">
                      <ReactMarkdown
                        remarkPlugins={[remarkGfm]}
                        components={{
                          h1: (props) => (
                            <h1
                              className="text-2xl font-bold text-gray-800 mb-4"
                              {...props}
                            />
                          ),
                          h2: (props) => (
                            <h2
                              className="text-xl font-semibold text-gray-800 mb-3"
                              {...props}
                            />
                          ),
                          h3: (props) => (
                            <h3
                              className="text-lg font-medium text-gray-800 mb-2"
                              {...props}
                            />
                          ),
                          p: (props) => (
                            <p
                              className="text-gray-700 mb-3 leading-relaxed"
                              {...props}
                            />
                          ),
                          ul: (props) => (
                            <ul
                              className="list-disc list-inside text-gray-700 mb-3 space-y-1"
                              {...props}
                            />
                          ),
                          ol: (props) => (
                            <ol
                              className="list-decimal list-inside text-gray-700 mb-3 space-y-1"
                              {...props}
                            />
                          ),
                          li: (props) => (
                            <li className="text-gray-700" {...props} />
                          ),
                          strong: (props) => (
                            <strong
                              className="font-semibold text-gray-800"
                              {...props}
                            />
                          ),
                          em: (props) => (
                            <em className="italic text-gray-700" {...props} />
                          ),
                          code: (props) => (
                            <code
                              className="bg-gray-100 px-1.5 py-0.5 rounded text-sm font-mono text-gray-800"
                              {...props}
                            />
                          ),
                          pre: (props) => (
                            <pre
                              className="bg-gray-100 p-3 rounded-lg overflow-x-auto text-sm font-mono text-gray-800 mb-3"
                              {...props}
                            />
                          ),
                          blockquote: (props) => (
                            <blockquote
                              className="border-l-4 border-blue-300 pl-4 py-2 bg-blue-50 rounded-r-lg text-gray-700 mb-3"
                              {...props}
                            />
                          ),
                          a: (props) => (
                            <a
                              className="text-blue-600 hover:text-blue-800 underline"
                              {...props}
                            />
                          ),
                        }}
                      >
                        {searchKb.description}
                      </ReactMarkdown>
                    </div>
                  </div>
                ) : (
                  <>
                    <h2 className="text-2xl text-center font-medium text-gray-800 mb-4">
                      {searchKb?.name || "How can we assist you today?"}
                    </h2>

                    <p className="text-base text-gray-500 leading-relaxed mb-4">
                      {searchKb
                        ? `Get expert guidance from your knowledge base "${searchKb.name}". Ask any question and get AI-powered responses based on your search results.`
                        : "Get expert guidance from your curated web search results. Ask any question and get AI-powered responses based on your selected content."}
                    </p>
                  </>
                )}
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
          <div className="flex items-center gap-2  bg-white border border-gray-200 rounded-xl shadow-sm">
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

              <div className="absolute right-2 bottom-2 flex items-center gap-1">
                <button
                  onClick={handleChatSubmit}
                  disabled={!chatInput.trim() || isStreaming}
                  className={`p-1.5 rounded-lg bg-black transition-colors ${
                    chatInput.trim()
                      ? "opacity-100"
                      : "opacity-50 cursor-not-allowed"
                  }`}
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
        className={`bg-white border-l border-gray-300 flex flex-col transition-all duration-500 ease-in-out h-full overflow-hidden ${
          isNotesExpanded ? "w-80" : "w-20"
        }`}
      >
        {/* Expand/Collapse Button */}
        <div className="p-4 border-b border-gray-200 flex items-center justify-between transition-all duration-300">
          <div
            className={`transition-all duration-300 ${
              isNotesExpanded
                ? "opacity-100 transform translate-x-0"
                : "opacity-0 transform -translate-x-4"
            }`}
          >
            {isNotesExpanded && (
              <div>
                <h3 className="text-lg font-semibold text-gray-800">Notes</h3>
                <p className="text-sm text-gray-500">Saved responses</p>
              </div>
            )}
          </div>
          <button
            onClick={() => setIsNotesExpanded(!isNotesExpanded)}
            className="min-w-8 min-h-8 bg-gradient-to-r from-[#8e5eff] to-[#4596ff] rounded-lg flex items-center justify-center hover:from-[#7c4dff] hover:to-[#3b82f6] transition-all duration-200 hover:scale-105 shadow-md"
            title={isNotesExpanded ? "Collapse notes" : "Expand notes"}
          >
            <svg
              width="20"
              height="20"
              viewBox="0 0 24 24"
              color="white"
              fill="none"
              className={`transform transition-transform duration-300 ease-in-out ${
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
            <div
              className={`transition-all duration-300 ${
                isNotesExpanded
                  ? "opacity-100 transform translate-x-0"
                  : "opacity-0 transform translate-x-4"
              }`}
            >
              {notes.length === 0 ? (
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
                        className="bg-white rounded-lg border border-gray-200 hover:border-gray-300 transition-all duration-200 hover:shadow-sm"
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
                                setDropdownOpen(
                                  isDropdownOpen ? null : note.id
                                );
                              }}
                              className="p-1 text-gray-400 hover:text-gray-600 transition-all duration-200 hover:scale-110"
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
                              <div className="absolute right-0 top-full mt-1 bg-white border border-gray-200 rounded-lg shadow-lg z-10 min-w-[120px] animate-in fade-in duration-200">
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
                        <div
                          className={`overflow-hidden transition-all duration-300 ease-in-out ${
                            isExpanded
                              ? "max-h-96 opacity-100"
                              : "max-h-0 opacity-0"
                          }`}
                        >
                          <div className="border-t border-gray-100 p-3">
                            <div className="text-sm overflow-auto h-[30vh] text-gray-700">
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
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          ) : (
            /* Collapsed Notes View */
            <div
              className={`flex flex-col items-center gap-2 transition-all duration-300 ${
                !isNotesExpanded
                  ? "opacity-100 transform translate-x-0"
                  : "opacity-0 transform -translate-x-4"
              }`}
            >
              {notes.slice(0, 5).map((note) => (
                <button
                  key={note.id}
                  className="min-w-12 min-h-12 bg-gradient-to-r from-[#8e5eff]/20 to-[#4596ff]/20 rounded-lg flex items-center justify-center hover:from-[#8e5eff]/30 hover:to-[#4596ff]/30 border border-[#8e5eff]/30 transition-all duration-200 hover:scale-105 shadow-sm"
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
                    className="text-[#8e5eff]"
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
