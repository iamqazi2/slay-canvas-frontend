import { Pin } from "lucide-react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { Message } from "./types/multiStepChatTypes";

const MessageComponent: React.FC<{
  message: Message;
  onSaveNote?: (content: string) => void;
  isStreaming?: boolean;
}> = ({ message, onSaveNote, isStreaming = false }) => {
  const isUser = message.role === "user";

  // Don't render if no content and not a user message (prevents empty white box during streaming)
  if (!isUser && !message.content?.trim()) {
    return null;
  }

  return (
    <div className={`flex ${isUser ? "justify-end" : "justify-start"} mb-4`}>
      <div className={`max-w-[80%] ${isUser ? "order-2" : "order-1"}`}>
        <div
          className={`rounded-2xl shadow-md border-[1px] border-black/10 px-4 py-3 ${
            isUser ? "bg-[#4596FF]/20 text-black" : "bg-white text-black"
          }`}
        >
          <div className="text-[18px] leading-relaxed prose prose-sm max-w-none">
            <ReactMarkdown
              remarkPlugins={[remarkGfm]}
              components={{
                // Custom styling for markdown elements
                p: ({ children }) => (
                  <p className="mb-2 last:mb-0">{children}</p>
                ),
                ul: ({ children }) => (
                  <ul className="list-disc ml-4 mb-2">{children}</ul>
                ),
                ol: ({ children }) => (
                  <ol className="list-decimal ml-4 mb-2">{children}</ol>
                ),
                li: ({ children }) => <li className="mb-1">{children}</li>,
                code: ({ children, className }) => {
                  const isInline = !className;
                  return isInline ? (
                    <code className="bg-gray-100 px-1 py-0.5 rounded text-xs font-mono">
                      {children}
                    </code>
                  ) : (
                    <code className="block bg-gray-100 p-2 rounded text-xs font-mono whitespace-pre overflow-x-auto">
                      {children}
                    </code>
                  );
                },
                pre: ({ children }) => <pre className="mb-2">{children}</pre>,
                blockquote: ({ children }) => (
                  <blockquote className="border-l-4 border-gray-300 pl-4 italic mb-2">
                    {children}
                  </blockquote>
                ),
                h1: ({ children }) => (
                  <h1 className="text-[20px] font-semibold mb-2">{children}</h1>
                ),
                h2: ({ children }) => (
                  <h2 className="text-[20px] font-semibold mb-2">{children}</h2>
                ),
                h3: ({ children }) => (
                  <h3 className="text-[22px] font-semibold mb-1">{children}</h3>
                ),
              }}
            >
              {message.content}
            </ReactMarkdown>
          </div>

          {/* Save to Notes button for AI responses */}
          {!isUser && onSaveNote && !isStreaming && message.content?.trim() && (
            <div className="mt-3 pt-2 border-t  border-gray-100">
              <button
                onClick={() => onSaveNote(message.content)}
                className="flex items-center gap-2 border border-black/30  px-3 py-1.5 text-[16px] text-gray-500 hover:text-gray-800 hover:bg-gray-50 rounded-[20px] transition-colors"
              >
                <Pin
                  height={16}
                  width={16}
                  color="#1E1E1E"
                  className="opacity-50"
                />
                Save to Notes
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default MessageComponent;
