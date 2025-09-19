"use client";
import { useRouter } from "next/navigation";
import React, { useState } from "react";

interface ChatInterfaceProps {
  className?: string;
}

interface Message {
  id: string;
  text: string;
  sender: "user" | "ai";
  timestamp: Date;
  type: "text" | "attachment" | "voice";
  attachment?: {
    name: string;
    type: string;
    size: number;
    url: string;
  };
}

const ChatInterface: React.FC<ChatInterfaceProps> = ({ className = "" }) => {
  const [selectedChat, setSelectedChat] = useState(0);
  const [selectedFilter, setSelectedFilter] = useState("All Attached Nodes");
  const [searchQuery, setSearchQuery] = useState("");
  const [message, setMessage] = useState("");
  const [messages, setMessages] = useState<Message[]>([]);
  const [isRecording, setIsRecording] = useState(false);
  const [attachedFiles, setAttachedFiles] = useState<File[]>([]);

  const router = useRouter();

  // Logo Component
  const LogoIcon: React.FC<{ size?: number }> = ({ size = 24 }) => (
    <div className="flex items-center justify-center rounded-full bg-white" style={{ width: size, height: size }}>
      <svg width={size * 0.6} height={size * 0.6} viewBox="0 0 46 46" fill="none" xmlns="http://www.w3.org/2000/svg">
        <path d="M12.8048 29.1955L12.6621 28.9615V33.5877V28.963L12.8048 29.1955Z" fill="#1E1E1E" />
        <path d="M16.9337 33.3713L16.9199 33.3636L16.9337 33.3713Z" fill="#1E1E1E" />
        <path
          d="M16.9316 33.3707L16.9202 33.3636L16.8974 33.3493C15.2312 32.2986 13.8306 30.877 12.8048 29.1954L12.6621 28.9629V33.5876H16.9316V33.3707Z"
          fill="#1E1E1E"
        />
        <path
          d="M16.9197 33.3608L16.8969 33.3451C16.1725 32.8914 15.4958 32.3657 14.877 31.776C15.4958 32.3682 16.1725 32.8967 16.8969 33.3537L16.9197 33.3608Z"
          fill="#1E1E1E"
        />
        <path
          d="M22.989 45.5901C26.8697 45.5896 30.6843 44.5855 34.0623 42.6752C37.4403 40.7648 40.2667 38.0133 42.2671 34.6878C44.2674 31.3624 45.3736 27.5761 45.4783 23.6968C45.5829 19.8174 44.6824 15.977 42.8642 12.5486C41.046 9.12011 38.372 6.2202 35.102 4.13055C31.8319 2.04091 28.0769 0.832577 24.2019 0.622944C20.3268 0.413312 16.4634 1.20951 12.987 2.93418C9.51055 4.65885 6.53931 7.25337 4.36189 10.4657C5.74454 10.276 7.14944 10.3243 8.51582 10.6083L9.2148 10.751C12.2387 7.36314 16.4098 5.21474 20.9238 4.71998C25.4378 4.22523 29.9752 5.41914 33.6612 8.07154C37.3471 10.7239 39.9206 14.647 40.8854 19.0844C41.8503 23.5218 41.1382 28.1593 38.8865 32.1028C36.6348 36.0462 33.0028 39.0165 28.6909 40.4408C24.379 41.8652 19.6924 41.6428 15.5348 39.8165C11.3771 37.9902 8.0428 34.6894 6.17463 30.5504C4.30647 26.4114 4.03675 21.7273 5.41749 17.4013C5.49309 17.163 5.5744 16.9262 5.65999 16.688C5.74558 16.4498 5.83545 16.2201 5.9296 15.9905H6.01376C6.23101 15.9899 6.44814 16.0008 6.66424 16.0233C6.90001 16.0457 7.13432 16.0814 7.36607 16.1303C8.55398 16.3794 9.65137 16.9479 10.54 17.7747C11.4286 18.6015 12.0747 19.6551 12.4087 20.822C12.4928 21.1185 12.5553 21.4208 12.5956 21.7264C12.6376 22.0274 12.6586 22.3311 12.6583 22.635V22.7292C12.6583 22.9931 12.674 23.2727 12.6983 23.5765C12.7225 23.8804 12.7668 24.1985 12.8195 24.5009C13.2059 26.7169 14.267 28.7596 15.8578 30.3499C17.4486 31.9403 19.4916 33.0008 21.7077 33.3866C23.9238 33.7724 26.2049 33.4646 28.2396 32.5054C30.2742 31.5462 31.9632 29.9822 33.0757 28.0272L33.1042 27.9758C33.2369 27.7362 33.3524 27.5165 33.4523 27.3011C33.5664 27.06 33.6762 26.8075 33.7804 26.5351C33.8289 26.4081 33.8759 26.2783 33.923 26.1471C34.0257 25.8389 34.1099 25.5522 34.1798 25.2669C34.3014 24.7685 34.3886 24.2624 34.4408 23.752C34.4784 23.3871 34.4975 23.0204 34.4979 22.6536V22.635C34.4979 22.3255 34.485 22.0145 34.4594 21.7121C34.4308 21.3954 34.3909 21.0844 34.3395 20.7892C34.0028 18.8294 33.1371 16.999 31.8359 15.4953C30.5347 13.9917 28.8476 12.872 26.9565 12.2573C25.0655 11.6425 23.0425 11.5559 21.1059 12.007C19.1692 12.458 17.3926 13.4294 15.9678 14.8165L15.9179 14.8635L15.9607 14.9177C16.8678 16.0785 17.5623 17.3907 18.0119 18.7935L18.059 18.9362L18.146 18.8106C18.8692 17.7829 19.869 16.9812 21.0294 16.4987C22.1898 16.0161 23.4632 15.8725 24.7019 16.0844C25.9406 16.2963 27.0939 16.8551 28.0279 17.6959C28.9619 18.5367 29.6383 19.6251 29.9788 20.8348C30.0626 21.1321 30.126 21.4347 30.1685 21.7406C30.2087 22.0414 30.2291 22.3445 30.2298 22.6479C30.2288 24.2497 29.6493 25.7972 28.598 27.0057C27.5466 28.2142 26.0942 29.0023 24.508 29.225C22.9217 29.4478 21.3084 29.0901 19.9649 28.2179C18.6214 27.3457 17.6381 26.0176 17.196 24.4781L17.176 24.4239C17.166 24.3853 17.1546 24.3468 17.1475 24.3055C17.0917 24.094 17.0474 23.8798 17.0148 23.6635C17.0148 23.6464 17.0148 23.6307 17.0148 23.615C17.0134 23.6013 17.0134 23.5874 17.0148 23.5737L16.9877 23.3454C16.9631 23.1199 16.9507 22.8933 16.9506 22.6664V22.6479C16.9506 22.3383 16.9392 22.0274 16.915 21.7235C16.8907 21.4197 16.8465 21.1001 16.7937 20.8006C16.4665 18.8861 15.6337 17.0938 14.3815 15.6091C13.1293 14.1244 11.5031 13.0013 9.67128 12.3558C9.44304 12.274 9.21195 12.2003 8.978 12.1347C8.73835 12.0676 8.49728 12.0077 8.25335 11.9578C6.65041 11.6212 4.99195 11.6534 3.40329 12.0519C1.47849 15.4743 0.482551 19.3407 0.514413 23.267C0.546276 27.1934 1.60483 31.0431 3.58492 34.4338C5.565 37.8245 8.39773 40.6381 11.8017 42.5952C15.2057 44.5523 19.0625 45.5848 22.989 45.5901Z"
          fill="#1E1E1E"
        />
      </svg>
    </div>
  );

  // Search Icon
  const SearchIcon: React.FC = () => (
    <svg width="16" height="16" viewBox="0 0 14 14" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path
        d="M12.4993 12.5L8.88824 8.88885M1.66602 5.87959C1.66602 6.43284 1.77499 6.98068 1.98671 7.49182C2.19843 8.00296 2.50875 8.46739 2.89996 8.8586C3.29117 9.24981 3.75561 9.56014 4.26675 9.77186C4.77789 9.98358 5.32572 10.0926 5.87898 10.0926C6.43223 10.0926 6.98007 9.98358 7.49121 9.77186C8.00235 9.56014 8.46678 9.24981 8.85799 8.8586C9.2492 8.46739 9.55953 8.00296 9.77125 7.49182C9.98297 6.98068 10.0919 6.43284 10.0919 5.87959C10.0919 5.32633 9.98297 4.7785 9.77125 4.26736C9.55953 3.75622 9.2492 3.29178 8.85799 2.90057C8.46678 2.50936 8.00235 2.19904 7.49121 1.98732C6.98007 1.7756 6.43223 1.66663 5.87898 1.66663C5.32572 1.66663 4.77789 1.7756 4.26675 1.98732C3.75561 2.19904 3.29117 2.50936 2.89996 2.90057C2.50875 3.29178 2.19843 3.75622 1.98671 4.26736C1.77499 4.7785 1.66602 5.32633 1.66602 5.87959Z"
        stroke="#4596FF"
        strokeWidth="1.66667"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );

  // Chat Icon
  const ChatIcon: React.FC<{ fill: string }> = ({ fill }) => (
    <svg width="16" height="16" viewBox="0 0 14 14" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path
        d="M12.9737 0.666504H1.69167C1.41966 0.666504 1.15878 0.776251 0.966437 0.971601C0.774092 1.16695 0.666034 1.4319 0.666034 1.70817V12.1248C0.664851 12.3235 0.720179 12.5182 0.825367 12.6857C0.930555 12.8532 1.08113 12.9862 1.25898 13.0688C1.39451 13.1329 1.54217 13.1663 1.69167 13.1665C1.93244 13.1659 2.1652 13.0787 2.34872 12.9204L2.35449 12.9159L4.44808 11.0832H12.9737C13.2457 11.0832 13.5066 10.9734 13.6989 10.7781C13.8913 10.5827 13.9993 10.3178 13.9993 10.0415V1.70817C13.9993 1.4319 13.8913 1.16695 13.6989 0.971601C13.5066 0.776251 13.2457 0.666504 12.9737 0.666504ZM12.9737 10.0415H4.25577C4.13264 10.0416 4.01364 10.0866 3.92052 10.1685L1.69167 12.1248V1.70817H12.9737V10.0415Z"
        fill={fill}
      />
    </svg>
  );

  // More Options Icon
  const MoreIcon: React.FC<{ fill: string }> = ({ fill }) => (
    <svg width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
      <circle cx="8" cy="2" r="1.5" fill={fill} />
      <circle cx="8" cy="8" r="1.5" fill={fill} />
      <circle cx="8" cy="14" r="1.5" fill={fill} />
    </svg>
  );

  // Attachment Icon
  const AttachmentIcon: React.FC = () => (
    <svg width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path
        d="M18.5 9.5L10.5 17.5C9.11929 18.8807 6.88071 18.8807 5.5 17.5C4.11929 16.1193 4.11929 13.8807 5.5 12.5L13.5 4.5C14.3284 3.67157 15.6716 3.67157 16.5 4.5C17.3284 5.32843 17.3284 6.67157 16.5 7.5L8.5 15.5"
        stroke="#fff"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );

  // Microphone Icon
  const MicrophoneIcon: React.FC = () => (
    <svg width="17" height="25" viewBox="0 0 17 25" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path
        d="M8.33333 15.6251C10.7045 15.6251 12.6263 13.5269 12.6263 10.9376V4.68762C12.6263 2.09834 10.7045 0.00012207 8.33333 0.00012207C5.96212 0.00012207 4.0404 2.09834 4.0404 4.68762V10.9376C4.0404 13.5269 5.96212 15.6251 8.33333 15.6251ZM16.6667 10.8818C16.6667 10.7591 16.5758 10.6586 16.4646 10.6586H14.9495C14.8384 10.6586 14.7475 10.7591 14.7475 10.8818C14.7475 14.7964 11.8763 17.9689 8.33333 17.9689C4.7904 17.9689 1.91919 14.7964 1.91919 10.8818C1.91919 10.7591 1.82828 10.6586 1.71717 10.6586H0.20202C0.0909091 10.6586 0 10.7591 0 10.8818C0 15.5888 3.19697 19.4728 7.32323 20.0224V22.8796H3.65404C3.30808 22.8796 3.0303 23.2786 3.0303 23.7724V24.7769C3.0303 24.8997 3.10101 25.0001 3.18687 25.0001H13.4798C13.5657 25.0001 13.6364 24.8997 13.6364 24.7769V23.7724C13.6364 23.2786 13.3586 22.8796 13.0126 22.8796H9.24242V20.0364C13.4167 19.5342 16.6667 15.6279 16.6667 10.8818Z"
        fill="#1E1E1E"
      />
    </svg>
  );

  // Send Icon
  const SendIcon: React.FC = () => (
    <svg width="24" height="20" viewBox="0 0 24 20" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path
        d="M12.7585 1.23588C12.6327 1.36303 12.5328 1.51412 12.4647 1.68048C12.3966 1.84684 12.3615 2.0252 12.3615 2.20533C12.3615 2.38547 12.3966 2.56382 12.4647 2.73018C12.5328 2.89655 12.6327 3.04764 12.7585 3.17479L18.55 9.04738L2.01575 9.04738C1.65778 9.04738 1.31447 9.19158 1.06134 9.44825C0.80822 9.70492 0.666016 10.053 0.666016 10.416C0.666016 10.779 0.80822 11.1271 1.06134 11.3838C1.31447 11.6405 1.65778 11.7847 2.01575 11.7847L18.55 11.7847L12.7585 17.6595C12.5049 17.9167 12.3625 18.2654 12.3625 18.629C12.3625 18.9926 12.5049 19.3413 12.7585 19.5984C13.0121 19.8556 13.356 20 13.7146 20C14.0732 20 14.4171 19.8556 14.6706 19.5984L22.769 11.3866C22.8949 11.2595 22.9947 11.1084 23.0628 10.942C23.1309 10.7757 23.166 10.5973 23.166 10.4172C23.166 10.237 23.1309 10.0587 23.0628 9.89231C22.9947 9.72595 22.8949 9.57486 22.769 9.44771L14.6706 1.23588C14.5452 1.10829 14.3962 1.00705 14.2322 0.937971C14.0681 0.868895 13.8922 0.833334 13.7146 0.833334C13.5369 0.833334 13.361 0.868895 13.197 0.937971C13.0329 1.00705 12.8839 1.10829 12.7585 1.23588Z"
        fill="white"
      />
    </svg>
  );

  // Maximize Icon
  const MaximizeIcon: React.FC = () => (
    <svg width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path
        d="M3 3H7M3 3V7M3 3L7 7M13 3H9M13 3V7M13 3L9 7M3 13H7M3 13V9M3 13L7 9M13 13H9M13 13V9M13 13L9 9"
        stroke="#6B7280"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );

  const recentChats = [
    "What's the best approach to...",
    "What's the best approach to...",
    "What's the best approach to...",
  ];

  const filterTags = [
    "All Attached Nodes",
    "Dhruv's Video Collection",
    "Wikipedia",
    "Recording",
    "Mind map",
    "Research",
  ];

  const handleSendMessage = () => {
    if (message.trim() || attachedFiles.length > 0) {
      const newMessage: Message = {
        id: Date.now().toString(),
        text: message,
        sender: "user",
        timestamp: new Date(),
        type: attachedFiles.length > 0 ? "attachment" : "text",
        attachment:
          attachedFiles.length > 0
            ? {
                name: attachedFiles[0].name,
                type: attachedFiles[0].type,
                size: attachedFiles[0].size,
                url: URL.createObjectURL(attachedFiles[0]),
              }
            : undefined,
      };

      setMessages((prev) => [...prev, newMessage]);
      setMessage("");
      setAttachedFiles([]);

      // Simulate AI response
      setTimeout(() => {
        const aiResponse: Message = {
          id: (Date.now() + 1).toString(),
          text: "I received your message. How can I help you further?",
          sender: "ai",
          timestamp: new Date(),
          type: "text",
        };
        setMessages((prev) => [...prev, aiResponse]);
      }, 1000);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const handleAttachmentClick = () => {
    const input = document.createElement("input");
    input.type = "file";
    input.multiple = true;
    input.accept = "image/*,video/*,audio/*,.pdf,.doc,.docx,.txt";
    input.onchange = (e) => {
      const files = Array.from((e.target as HTMLInputElement).files || []);
      setAttachedFiles((prev) => [...prev, ...files]);
    };
    input.click();
  };

  const removeAttachment = (index: number) => {
    setAttachedFiles((prev) => prev.filter((_, i) => i !== index));
  };

  const handleVoiceRecord = () => {
    if (!isRecording) {
      // Start recording
      setIsRecording(true);
      // In a real app, you would use the Web Audio API here
      console.log("Starting voice recording...");

      // Simulate recording for 3 seconds
      setTimeout(() => {
        setIsRecording(false);
        // Simulate adding a voice message
        const voiceMessage: Message = {
          id: Date.now().toString(),
          text: "Voice message recorded",
          sender: "user",
          timestamp: new Date(),
          type: "voice",
        };
        setMessages((prev) => [...prev, voiceMessage]);
      }, 3000);
    } else {
      // Stop recording
      setIsRecording(false);
      console.log("Stopping voice recording...");
    }
  };

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return "0 Bytes";
    const k = 1024;
    const sizes = ["Bytes", "KB", "MB", "GB"];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i];
  };

  // Message Component
  const MessageComponent: React.FC<{ message: Message }> = ({ message }) => {
    const isUser = message.sender === "user";

    return (
      <div className={`flex ${isUser ? "justify-end items-end" : "justify-start"} mb-4`}>
        <div className={`max-w-[70%] ${isUser ? "order-2" : "order-1"}`}>
          <div className={`rounded-md px-4 py-3 text-[#1E1E1E] ${isUser ? "bg-[#4596FF1A]" : "bg-white"}`}>
            {message.type === "attachment" && message.attachment && (
              <div className="mb-2">
                <div className="flex items-center gap-2 p-2 bg-white/20 rounded-lg">
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path
                      d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8l-6-6z"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                    <polyline
                      points="14,2 14,8 20,8"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                  </svg>
                  <div>
                    <p className="text-sm font-medium">{message.attachment.name}</p>
                    <p className="text-xs opacity-75">{formatFileSize(message.attachment.size)}</p>
                  </div>
                </div>
              </div>
            )}
            {message.type === "voice" && (
              <div className="mb-2">
                <div className="flex items-center gap-2 p-2 bg-white/20 rounded-lg">
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path
                      d="M12 1a3 3 0 0 0-3 3v8a3 3 0 0 0 6 0V4a3 3 0 0 0-3-3z"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                    <path
                      d="M19 10v2a7 7 0 0 1-14 0v-2"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                    <line
                      x1="12"
                      y1="19"
                      x2="12"
                      y2="23"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                    <line
                      x1="8"
                      y1="23"
                      x2="16"
                      y2="23"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                  </svg>
                  <div>
                    <p className="text-sm font-medium">Voice Message</p>
                    <p className="text-xs opacity-75">0:03</p>
                  </div>
                  <button className="ml-auto p-1 hover:bg-white/20 rounded">
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                      <polygon points="5,3 19,12 5,21" fill="currentColor" />
                    </svg>
                  </button>
                </div>
              </div>
            )}
            {message.text && <p className="text-sm whitespace-pre-wrap">{message.text}</p>}
          </div>
          <p className={`text-xs text-gray-500 mt-1 ${isUser ? "text-right" : "text-left"}`}>
            {message.timestamp.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
          </p>
        </div>
        {isUser && (
          <div
            className={`w-8 h-8 rounded-full flex items-center justify-center ${
              isUser ? "bg-blue-500 order-2 ml-2" : "bg-gray-300 order-2 mr-2"
            }`}
          >
            {isUser ? <span className="text-white text-xs font-medium">U</span> : <LogoIcon size={16} />}
          </div>
        )}
      </div>
    );
  };

  return (
    <div>
      <div className={`flex h-[calc(100vh-78px)] overflow-auto ${className}`}>
        {/* Left Sidebar */}
        <div className="w-80 sticky left-0 top-0 bg-white border-r border-gray-200 flex flex-col">
          {/* Top Section */}
          <div className="p-4 border-b border-gray-200">
            <div className="flex items-center justify-between">
              <LogoIcon size={32} />
              <button className="p-2 hover:bg-gray-100 rounded-lg transition-colors">
                <MoreIcon fill={`#1E1E1E`} />
              </button>
            </div>
          </div>

          {/* Search Bar */}
          <div className="p-4">
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <SearchIcon />
              </div>
              <input
                type="text"
                placeholder="Search"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-3 border placeholder:text-[#4596FF99] border-[#4596FF] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#1279FF] focus:border-transparent"
              />
            </div>
          </div>

          {/* Recent Chats Section */}
          <div className="flex-1 px-4">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-sm font-medium text-gray-700">Recent Chats</h3>
              <button className="text-sm text-[#1279FF] font-medium">New Chat +</button>
            </div>

            <div className="space-y-2">
              {recentChats.map((chat, index) => (
                <div
                  key={index}
                  className={`flex items-center justify-between p-3 rounded-lg cursor-pointer transition-colors ${
                    selectedChat === index ? "bg-[#4596FF99] border border-blue-200" : "hover:bg-gray-50"
                  }`}
                  onClick={() => setSelectedChat(index)}
                >
                  <div className="flex items-center gap-3">
                    <ChatIcon fill={`${selectedChat === index ? "#fff" : "#1E1E1E"}`} />
                    <span className={`text-sm truncate ${selectedChat === index ? "text-white" : "text-[#424242]"}`}>
                      {chat}
                    </span>
                  </div>
                  <button className="p-1 hover:bg-gray-200 rounded transition-colors">
                    <MoreIcon fill={`${selectedChat === index ? "#fff" : "#1E1E1E"}`} />
                  </button>
                </div>
              ))}
            </div>
          </div>

          {/* Bottom Section */}
          <div className="p-4 border-t border-gray-200" onClick={() => router.push("/")}>
            <button className="flex items-center gap-2 text-sm text-gray-600 hover:text-gray-800 transition-colors">
              <MaximizeIcon />
              <span>Minimize the Chat</span>
            </button>
          </div>
        </div>

        {/* Main Content Area */}
        <div className="flex-1 flex flex-col">
          {/* Filter Tags */}
          <div className="px-6 py-4 border-b border-gray-200">
            <div className="flex gap-2 flex-wrap bg-white px-3 py-2 rounded-4xl shadow-[0px_1.67px_16.67px_0px_#1E1E1E1A]">
              {filterTags.map((tag, index) => (
                <button
                  key={index}
                  className={`px-4 py-2 rounded-full text-sm font-medium transition-colors ${
                    selectedFilter === tag ? "bg-[#4596FF] text-white" : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                  }`}
                  onClick={() => setSelectedFilter(tag)}
                >
                  {tag}
                </button>
              ))}
            </div>
          </div>

          {/* Main Chat Area */}
          <div className="flex-1 flex flex-col px-6 py-4">
            {messages.length === 0 ? (
              <div className="flex-1 flex flex-col items-center justify-center">
                <div className="text-center flex flex-col items-center justify-center max-w-md">
                  <div className="mb-8">
                    <LogoIcon size={80} />
                  </div>

                  <h2 className="text-2xl text-center font-medium text-gray-800 mb-4">How can we assist you today?</h2>

                  <p className="text-gray-500 leading-relaxed">
                    Get expert guidance powered by AI agents specializing in Sales, Marketing, and Negotiation. Choose
                    the agent that suits your needs and start your conversation with ease.
                  </p>
                </div>
              </div>
            ) : (
              <div className="flex-1 overflow-y-auto">
                <div className="space-y-4 pb-4">
                  {messages.map((message) => (
                    <MessageComponent key={message.id} message={message} />
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Input Area */}
          <div className="p-6 sticky bottom-0 right-0 bg-[#F1F5F8] border-t border-gray-200">
            {/* Attachment Preview */}
            {attachedFiles.length > 0 && (
              <div className="mb-4 p-3 bg-gray-50 rounded-lg">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm font-medium text-gray-700">Attached Files:</span>
                  <button onClick={() => setAttachedFiles([])} className="text-sm text-red-600 hover:text-red-800">
                    Clear All
                  </button>
                </div>
                <div className="space-y-2">
                  {attachedFiles.map((file, index) => (
                    <div key={index} className="flex items-center justify-between p-2 bg-white rounded border">
                      <div className="flex items-center gap-2">
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                          <path
                            d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8l-6-6z"
                            stroke="currentColor"
                            strokeWidth="2"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                          />
                          <polyline
                            points="14,2 14,8 20,8"
                            stroke="currentColor"
                            strokeWidth="2"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                          />
                        </svg>
                        <span className="text-sm text-gray-700">{file.name}</span>
                        <span className="text-xs text-gray-500">({formatFileSize(file.size)})</span>
                      </div>
                      <button onClick={() => removeAttachment(index)} className="text-red-500 hover:text-red-700 p-1">
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
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
                  ))}
                </div>
              </div>
            )}

            <div className="flex items-center gap-3 p-2 bg-white border border-gray-200 rounded-xl">
              {/* <button
                onClick={handleAttachmentClick}
                className="p-3 bg-[#4596FF] rounded-lg transition-colors hover:bg-[#3B82F6]"
              >
                <AttachmentIcon />
              </button> */}

              <div className="flex-1 relative">
                <textarea
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  onKeyPress={handleKeyPress}
                  placeholder="Type your prompt here"
                  className="w-full px-4 py-3 pr-20 focus:outline-none focus:border-transparent resize-none"
                  rows={Math.min(Math.max(message.split("\n").length, 1), 4)}
                  style={{ minHeight: "48px", maxHeight: "120px" }}
                />

                <div className="absolute right-3 bottom-2 flex items-center gap-2">
                  {/* <button
                    onClick={handleVoiceRecord}
                    className={`p-2 rounded-lg transition-colors ${
                      isRecording ? "bg-gray-300 text-white animate-pulse" : "hover:bg-gray-100 text-gray-600"
                    }`}
                  >
                    <MicrophoneIcon />
                  </button> */}

                  <button
                    onClick={handleSendMessage}
                    disabled={!message.trim() && attachedFiles.length === 0}
                    className={`p-2 rounded-lg transition-colors ${
                      message.trim() || attachedFiles.length > 0 ? "opacity-100" : "opacity-50 cursor-not-allowed"
                    }`}
                    style={{
                      background: "linear-gradient(135deg, #8B5CF6 0%, #3B82F6 100%)",
                    }}
                  >
                    <SendIcon />
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ChatInterface;
