"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Sparkles, ChevronLeft } from "lucide-react";
import { WifiIcon } from "./icons";

type Step = "context" | "assets" | "chat";

interface Source {
  id: number;
  title: string;
  description: string;
  type: "article" | "pdf";
  selected: boolean;
}

const NotebookLMFlow = ({
  isFullscreen = false,
}: {
  isFullscreen?: boolean;
}) => {
  const router = useRouter();
  const [isMaximized] = useState(isFullscreen);
  const [currentStep, setCurrentStep] = useState<Step>(() => {
    if (typeof window !== "undefined") {
      const saved = localStorage.getItem("notebookCurrentStep");
      return (saved as Step) || "context";
    }
    return "context";
  });

  useEffect(() => {
    if (typeof window !== "undefined") {
      localStorage.setItem("notebookCurrentStep", currentStep);
    }
  }, [currentStep]);

  const [contextInput, setContextInput] = useState(() => {
    if (typeof window !== "undefined") {
      return localStorage.getItem("notebookContextInput") || "";
    }
    return "";
  });

  useEffect(() => {
    if (typeof window !== "undefined") {
      localStorage.setItem("notebookContextInput", contextInput);
    }
  }, [contextInput]);

  const [searchQuery, setSearchQuery] = useState(() => {
    if (typeof window !== "undefined") {
      return localStorage.getItem("notebookSearchQuery") || "";
    }
    return "";
  });

  useEffect(() => {
    if (typeof window !== "undefined") {
      localStorage.setItem("notebookSearchQuery", searchQuery);
    }
  }, [searchQuery]);

  const [sources, setSources] = useState<Source[]>(() => {
    if (typeof window !== "undefined") {
      const saved = localStorage.getItem("notebookSources");
      return saved
        ? JSON.parse(saved)
        : [
            {
              id: 1,
              title: "Mythological figures and the names of geographic",
              description:
                "Uncover how Venus's geography is predominantly named after women and goddesses.",
              type: "article",
              selected: true,
            },
            {
              id: 2,
              title: "Chinese mythological geography - Wikipedia",
              description:
                "You'll find an excellent overview of Chinese mythological geography.",
              type: "pdf",
              selected: true,
            },
            {
              id: 3,
              title: "6 Famous Greek Mythology Locations -",
              description:
                "Uncover how Venus's geography is predominantly named after women and goddesses.",
              type: "article",
              selected: true,
            },
          ];
    }
    return [
      {
        id: 1,
        title: "Mythological figures and the names of geographic",
        description:
          "Uncover how Venus's geography is predominantly named after women and goddesses.",
        type: "article",
        selected: true,
      },
      {
        id: 2,
        title: "Chinese mythological geography - Wikipedia",
        description:
          "You'll find an excellent overview of Chinese mythological geography.",
        type: "pdf",
        selected: true,
      },
      {
        id: 3,
        title: "6 Famous Greek Mythology Locations -",
        description:
          "Uncover how Venus's geography is predominantly named after women and goddesses.",
        type: "article",
        selected: true,
      },
    ];
  });

  useEffect(() => {
    if (typeof window !== "undefined") {
      localStorage.setItem("notebookSources", JSON.stringify(sources));
    }
  }, [sources]);

  const [chatInput, setChatInput] = useState(() => {
    if (typeof window !== "undefined") {
      return localStorage.getItem("notebookChatInput") || "";
    }
    return "";
  });

  useEffect(() => {
    if (typeof window !== "undefined") {
      localStorage.setItem("notebookChatInput", chatInput);
    }
  }, [chatInput]);

  const handleContextSubmit = () => {
    if (contextInput.trim()) {
      setSearchQuery(contextInput);
      setCurrentStep("assets");
    }
  };

  const toggleSource = (id: number) => {
    setSources(
      sources.map((s) => (s.id === id ? { ...s, selected: !s.selected } : s))
    );
  };

  const toggleAllSources = () => {
    const allSelected = sources.every((s) => s.selected);
    setSources(sources.map((s) => ({ ...s, selected: !allSelected })));
  };

  const handleImportBoard = () => {
    setCurrentStep("chat");
  };

  const selectedCount = sources.filter((s) => s.selected).length;

  return (
    <div
      className={
        isMaximized
          ? "fixed inset-0 z-50"
          : "flex items-center justify-center p-4"
      }
    >
      <div
        className={
          isMaximized
            ? "w-full h-full bg-[#F0F5F8] overflow-hidden"
            : "w-full max-w-4xl bg-[#F0F5F8] rounded-2xl shadow-lg overflow-hidden"
        }
        style={isMaximized ? {} : { height: "87vh" }}
      >
        {/* Header */}
        <div className="bg-black border-1 border-black text-white px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            {currentStep !== "context" && (
              <button
                onClick={() => {
                  if (currentStep === "assets") setCurrentStep("context");
                  if (currentStep === "chat") setCurrentStep("assets");
                }}
                className="text-white hover:bg-gray-800  rounded mr-2"
              >
                <ChevronLeft size={20} />
              </button>
            )}
            <div className="flex items-center gap-2">
              <WifiIcon width={40} height={40} className="" />
            </div>
          </div>
          <button
            onClick={
              isMaximized
                ? () => window.history.back()
                : () => router.push("/fullscreen")
            }
            className="text-white hover:bg-gray-800  rounded"
          >
            {isMaximized ? (
              <svg
                width="50"
                height="50"
                viewBox="0 0 28 28"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  d="M17.303 6.22217V8.44439C17.303 9.03376 17.5371 9.59899 17.9539 10.0157C18.3706 10.4325 18.9359 10.6666 19.5252 10.6666H21.7475M17.303 21.7777V19.5555C17.303 18.9661 17.5371 18.4009 17.9539 17.9842C18.3706 17.5674 18.9359 17.3333 19.5252 17.3333H21.7475M6.19189 10.6666H8.41412C9.00349 10.6666 9.56872 10.4325 9.98546 10.0157C10.4022 9.59899 10.6363 9.03376 10.6363 8.44439V6.22217M6.19189 17.3333H8.41412C9.00349 17.3333 9.56872 17.5674 9.98546 17.9842C10.4022 18.4009 10.6363 18.9661 10.6363 19.5555V21.7777"
                  stroke="white"
                  strokeWidth="1.66667"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
            ) : (
              <svg
                width="50"
                height="50"
                viewBox="0 0 28 28"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  d="M17.303 21.7777V19.5555C17.303 18.9661 17.5371 18.4009 17.9539 17.9842C18.3706 17.5674 18.9359 17.3333 19.5252 17.3333H21.7475M17.303 6.22217V8.44439C17.303 9.03376 17.5371 9.59899 17.9539 10.0157C18.3706 10.4325 18.9359 10.6666 19.5252 10.6666H21.7475M6.19189 17.3333H8.41412C9.00349 17.3333 9.56872 17.5674 9.98546 17.9842C10.4022 18.4009 10.6363 18.9661 10.6363 19.5555V21.7777M6.19189 10.6666H8.41412C9.00349 10.6666 9.56872 10.4325 9.98546 10.0157C10.4022 9.59899 10.6363 9.03376 10.6363 8.44439V6.22217"
                  stroke="white"
                  strokeWidth="1.66667"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
            )}
          </button>
        </div>

        {/* Content */}
        <div className="">
          {/* Step 1: Context Input */}
          {currentStep === "context" && (
            <div className="flex flex-col items-center bg-[#F0F5F8] justify-center  px-8 py-16">
              <svg
                width="100"
                height="100"
                viewBox="0 0 49 48"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
              >
                <rect
                  x="0.302734"
                  width="48"
                  height="48"
                  rx="22"
                  fill="#4596FF"
                  fill-opacity="0.1"
                />
                <path
                  fill-rule="evenodd"
                  clip-rule="evenodd"
                  d="M21.4368 11.0162C22.2678 11.0162 23.0844 11.0993 23.871 11.2598C24.2434 11.3354 24.5705 11.5558 24.7803 11.8726C24.9901 12.1894 25.0656 12.5766 24.9899 12.9489C24.9143 13.3213 24.6939 13.6484 24.3771 13.8583C24.0603 14.0681 23.6731 14.1435 23.3008 14.0679C21.4962 13.6998 19.6231 13.875 17.9181 14.5713C16.2132 15.2677 14.753 16.4539 13.7221 17.9801C12.6913 19.5063 12.1361 21.3038 12.1268 23.1455C12.1175 24.9871 12.6544 26.7902 13.6698 28.3267C14.6851 29.8633 16.1332 31.0642 17.8311 31.7778C19.5289 32.4914 21.4002 32.6855 23.2083 32.3357C25.0165 31.9859 26.6803 31.1078 27.9894 29.8124C29.2986 28.517 30.1942 26.8626 30.5632 25.0582C30.6006 24.8739 30.674 24.6987 30.7792 24.5426C30.8843 24.3866 31.0192 24.2528 31.176 24.1489C31.3329 24.045 31.5087 23.973 31.6934 23.9371C31.878 23.9011 32.068 23.9019 32.2524 23.9393C32.4368 23.9767 32.612 24.0501 32.768 24.1553C32.924 24.2604 33.0578 24.3953 33.1617 24.5521C33.2656 24.709 33.3376 24.8848 33.3736 25.0695C33.4095 25.2541 33.4088 25.4441 33.3713 25.6285C33.0224 27.3372 32.3105 28.951 31.2839 30.3607L31.0016 30.7332L36.2339 35.9655C36.4936 36.2227 36.6451 36.5695 36.6575 36.9348C36.6699 37.3001 36.5422 37.6563 36.3006 37.9306C36.0589 38.2048 35.7216 38.3763 35.3576 38.41C34.9936 38.4437 34.6306 38.337 34.3427 38.1117L34.208 37.9914L28.9758 32.7591C27.4506 33.9611 25.66 34.7809 23.7535 35.1502C21.8471 35.5194 19.8799 35.4274 18.0162 34.8818C16.1525 34.3362 14.4463 33.3528 13.04 32.0137C11.6337 30.6746 10.568 29.0186 9.93179 27.1838C9.29562 25.349 9.10744 23.3888 9.38296 21.4665C9.65847 19.5442 10.3897 17.7157 11.5156 16.1335C12.6415 14.5513 14.1295 13.2613 15.8553 12.3711C17.5812 11.4809 19.4949 11.0164 21.4368 11.0162ZM33.6149 9.5835C33.8829 9.5835 34.1456 9.65868 34.373 9.80051C34.6004 9.94234 34.7835 10.1451 34.9015 10.3858L34.9702 10.5534L35.1565 11.095C35.3531 11.6712 35.6698 12.1991 36.0857 12.6437C36.5017 13.0883 37.0073 13.4394 37.5692 13.6739L37.8342 13.7742L38.3758 13.959C38.644 14.0505 38.879 14.2195 39.0512 14.4445C39.2233 14.6696 39.3249 14.9407 39.343 15.2235C39.3611 15.5063 39.2949 15.7881 39.1528 16.0333C39.0108 16.2785 38.7992 16.476 38.5449 16.6009L38.3758 16.6697L37.8342 16.856C37.258 17.0525 36.7301 17.3693 36.2855 17.7852C35.841 18.2011 35.4898 18.7068 35.2553 19.2686L35.1551 19.5337L34.9702 20.0753C34.8786 20.3434 34.7095 20.5783 34.4843 20.7503C34.2592 20.9223 33.988 21.0237 33.7053 21.0417C33.4225 21.0596 33.1407 20.9933 32.8956 20.8511C32.6505 20.7089 32.4531 20.4973 32.3283 20.2429L32.2595 20.0753L32.0733 19.5337C31.8767 18.9575 31.56 18.4296 31.144 17.985C30.7281 17.5404 30.2225 17.1893 29.6606 16.9548L29.3955 16.8545L28.854 16.6697C28.5858 16.5782 28.3507 16.4092 28.1786 16.1842C28.0064 15.9591 27.9049 15.688 27.8868 15.4052C27.8687 15.1224 27.9349 14.8406 28.0769 14.5954C28.219 14.3503 28.4306 14.1527 28.6849 14.0278L28.854 13.959L29.3955 13.7728C29.9718 13.5762 30.4996 13.2594 30.9442 12.8435C31.3888 12.4276 31.74 11.9219 31.9744 11.3601L32.0747 11.095L32.2595 10.5534C32.3561 10.2706 32.5386 10.025 32.7817 9.85111C33.0247 9.67719 33.316 9.58362 33.6149 9.5835ZM33.6149 14.1625C33.276 14.589 32.8895 14.9754 32.463 15.3144C32.8909 15.6534 33.2749 16.0374 33.6149 16.4663C33.954 16.0384 34.3379 15.6544 34.7668 15.3144C34.3403 14.9754 33.9538 14.589 33.6149 14.1625Z"
                  fill="#4596FF"
                />
              </svg>

              <h1 className="text-3xl mt-6 font-normal text-gray-900 mb-12">
                What are you interested in?
              </h1>

              <div className="w-full max-w-2xl">
                <textarea
                  value={contextInput}
                  onChange={(e) => setContextInput(e.target.value)}
                  placeholder="Cultural Meanings and Symbolism of Color, Especially Yellow"
                  className="w-full px-6 py-4 border-2 border-gray-900 rounded-xl resize-none focus:outline-none focus:border-gray-800 text-gray-900 placeholder-gray-900"
                  rows={6}
                  style={{ fontFamily: "system-ui, -apple-system, sans-serif" }}
                />
              </div>

              <div className="flex items-center gap-4 mt-8">
                <button className="flex items-center gap-2 px-6 py-3 bg-white border-[1px] border-black/10 text-gray-600 rounded-full cursor-pointer transition-colors">
                  <Sparkles size={18} />
                  <span>I am feeling curious</span>
                </button>
                <button
                  onClick={handleContextSubmit}
                  disabled={!contextInput.trim()}
                  className="px-8 py-3 bg-blue-600 text-white rounded-full hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed font-medium"
                >
                  Submit
                </button>
              </div>
            </div>
          )}

          {/* Step 2: Assets Selection */}
          {currentStep === "assets" && (
            <div className="p-8">
              <div className="bg-[#4596FF]/10 rounded-xl p-4 mb-6">
                <div className="flex items-start gap-2">
                  <span className="text-gray-600 font-medium">Searched:</span>
                  <span className="text-gray-900 font-semibold flex-1">{searchQuery}</span>
                </div>
              </div>

              <p className="text-gray-700 mb-8 leading-relaxed">
                This selection of sources explores the fascinating connections
                between mythological figures and the names of geographic
                features across different cultures and celestial bodies.
              </p>

              <div className="flex items-center justify-between mb-6">
                <button
                  onClick={toggleAllSources}
                  className="text-gray-700 font-semibold hover:text-gray-900"
                >
                  Select all sources
                </button>
                <div
                  className={`w-6 h-6 rounded border-2 flex items-center justify-center cursor-pointer transition-colors ${
                    sources.every((s) => s.selected)
                      ? "bg-blue-600 border-blue-600"
                      : "border-gray-300 hover:border-gray-400"
                  }`}
                  onClick={toggleAllSources}
                >
                  {sources.every((s) => s.selected) && (
                    <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                      <path
                        d="M3 8L6.5 11.5L13 5"
                        stroke="white"
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      />
                    </svg>
                  )}
                </div>
              </div>

              <div className="space-y-4 mb-8">
                {sources.map((source) => (
                  <div
                    key={source.id}
                    className="flex items-start gap-4 p-4 border border-gray-200 rounded-xl hover:bg-gray-50 cursor-pointer transition-colors"
                    onClick={() => toggleSource(source.id)}
                  >
                    <div className="w-12 h-12 bg-blue-100 rounded flex items-center justify-center flex-shrink-0">
                      {source.type === "pdf" ? (
                        <div className="w-8 h-8 bg-red-500 rounded flex items-center justify-center text-white text-xs font-bold">
                          PDF
                        </div>
                      ) : (
                        <svg
                          width="24"
                          height="24"
                          viewBox="0 0 24 24"
                          fill="none"
                        >
                          <rect
                            x="4"
                            y="4"
                            width="16"
                            height="16"
                            rx="2"
                            stroke="#3B82F6"
                            strokeWidth="2"
                          />
                          <line
                            x1="4"
                            y1="8"
                            x2="20"
                            y2="8"
                            stroke="#3B82F6"
                            strokeWidth="2"
                          />
                          <line
                            x1="8"
                            y1="4"
                            x2="8"
                            y2="8"
                            stroke="#3B82F6"
                            strokeWidth="2"
                          />
                        </svg>
                      )}
                    </div>
                    <div className="flex-1">
                      <div className="flex items-start justify-between gap-4">
                        <h3 className="font-medium text-gray-900 mb-1">
                          {source.title}
                        </h3>
                        <svg
                          width="20"
                          height="20"
                          viewBox="0 0 24 24"
                          fill="none"
                          className="flex-shrink-0 text-gray-400"
                        >
                          <path
                            d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6M15 3h6v6M10 14L21 3"
                            stroke="currentColor"
                            strokeWidth="2"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                          />
                        </svg>
                      </div>
                      <p className="text-gray-600 text-sm">
                        {source.description}
                      </p>
                    </div>
                    <div
                      className={`w-6 h-6 rounded border-2 flex items-center justify-center flex-shrink-0 transition-colors ${
                        source.selected
                          ? "bg-blue-600 border-blue-600"
                          : "border-gray-300"
                      }`}
                    >
                      {source.selected && (
                        <svg
                          width="16"
                          height="16"
                          viewBox="0 0 16 16"
                          fill="none"
                        >
                          <path
                            d="M3 8L6.5 11.5L13 5"
                            stroke="white"
                            strokeWidth="2"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                          />
                        </svg>
                      )}
                    </div>
                  </div>
                ))}
              </div>

              <div className="flex items-center justify-between">
                <span className="text-gray-600">
                  {selectedCount === sources.length
                    ? sources.length
                    : selectedCount}{" "}
                  sources selected
                </span>
                <button
                  onClick={handleImportBoard}
                  disabled={selectedCount === 0}
                  className="px-8 py-3 bg-blue-600 text-white rounded-full hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed font-medium"
                >
                  Import as a Board
                </button>
              </div>
            </div>
          )}

          {/* Step 3: Chat Interface */}
          {currentStep === "chat" && (
            <div className="flex ">
              {/* Sidebar */}
              <div className="w-20 bg-white border-r border-gray-200 flex flex-col items-center py-6 gap-4 px-2">
                <button className="w-12 h-12 bg-gray-100 rounded-lg flex items-center justify-center hover:bg-gray-200">
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
                <button className="w-12 h-12 bg-gray-100 rounded-lg flex items-center justify-center hover:bg-gray-200">
                  <span className="text-2xl">+</span>
                </button>
                <button className="w-12 h-12 bg-blue-500 rounded-lg flex items-center justify-center hover:bg-blue-600">
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
                {sources.slice(0, 3).map((source) => (
                  <button
                    key={source.id}
                    className="w-12 h-12 bg-red-100 rounded-lg flex items-center justify-center hover:bg-red-200"
                  >
                    <div className="w-8 h-8 bg-red-500 rounded flex items-center justify-center text-white text-xs font-bold">
                      PDF
                    </div>
                  </button>
                ))}
                <button className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center hover:bg-blue-200">
                  <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
                    <rect
                      x="4"
                      y="4"
                      width="16"
                      height="16"
                      rx="2"
                      stroke="#3B82F6"
                      strokeWidth="2"
                    />
                    <line
                      x1="4"
                      y1="8"
                      x2="20"
                      y2="8"
                      stroke="#3B82F6"
                      strokeWidth="2"
                    />
                  </svg>
                </button>
                <button className="mt-auto w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center hover:bg-blue-200">
                  <Sparkles className="text-blue-600" size={20} />
                </button>
              </div>

              {/* Main Chat Area */}
              <div className="flex max-w-[700px] flex-col p-8">
                <div className="flex">
                  <div className="bg-white rounded-xl border border-gray-200 p-8 mb-6">
                    <h2 className="text-xl font-semibold text-gray-900 mb-4 break-words">
                      Cultural Meanings and Symbolism of Color, Especially
                      Yellow
                    </h2>
                    <p className="text-gray-700 leading-relaxed mb-4 break-words">
                      These sources collectively examine the multifaceted
                      symbolism of colours and the literary genre of
                      coming-of-age narratives. Several texts highlight how
                      colour meanings are profoundly influenced by cultural,
                      historical, and psychological factors, showing significant
                      variations across Western, Eastern, and other global
                      societies, even within colours like the same hue yellow,
                      which can represent everything from divinity and joy to
                      madness, illness, and betrayal. Concurrently, other
                      sources explore coming-of-age stories, tracing their
                      evolution from the traditional Bildungsroman to more
                      diverse modern narratives that address themes such as
                      identity formation, trauma, and the experiences of
                      marginalised groups, including queer Asian immigrants.
                      They underscore how traumatic events can profoundly affect
                      an individual&apos;s developmental journey and how
                      literary expression can serve as a means of processing
                      these complex experiences.
                    </p>
                    <div className="flex items-center gap-2 text-gray-500 text-sm">
                      <span>{sources.length} Sources</span>
                    </div>
                    <button className="mt-4 flex items-center gap-2 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 text-gray-700">
                      <svg
                        width="16"
                        height="16"
                        viewBox="0 0 24 24"
                        fill="none"
                      >
                        <path
                          d="M19 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11l5 5v11a2 2 0 0 1-2 2z"
                          stroke="currentColor"
                          strokeWidth="2"
                        />
                        <polyline
                          points="17 21 17 13 7 13 7 21"
                          stroke="currentColor"
                          strokeWidth="2"
                        />
                        <polyline
                          points="7 3 7 8 15 8"
                          stroke="currentColor"
                          strokeWidth="2"
                        />
                      </svg>
                      Save to Notes
                    </button>
                  </div>
                </div>

                {/* Chat Input */}
                <div className="border-t border-gray-200 bg-white">
                  <div className="flex items-center gap-3 my-3">
                    <div className="w-12 h-12 rounded-full bg-gray-300 flex-shrink-0"></div>
                    <input
                      type="text"
                      value={chatInput}
                      onChange={(e) => setChatInput(e.target.value)}
                      placeholder="Type your prompt here"
                      className="flex-1 px-4 py-3 border border-gray-300 rounded-full focus:outline-none focus:border-gray-400"
                    />
                    <button className="w-12 h-12 bg-gray-900 rounded-full flex items-center justify-center hover:bg-gray-800">
                      <svg
                        width="20"
                        height="20"
                        viewBox="0 0 24 24"
                        fill="none"
                      >
                        <path
                          d="M5 12h14M12 5l7 7-7 7"
                          stroke="white"
                          strokeWidth="2"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                        />
                      </svg>
                    </button>
                  </div>
                  <div className="flex gap-2 overflow-x-auto pb-2">
                    <button className="px-4 py-2 bg-white border border-gray-300 rounded-full text-sm text-gray-700 hover:bg-gray-50 whitespace-nowrap">
                      How do diverse cultures imbue yellow with meaning across
                      time and geography?
                    </button>
                    <button className="px-4 py-2 bg-white border border-gray-300 rounded-full text-sm text-gray-700 hover:bg-gray-50 whitespace-nowrap">
                      How do diverse cultures imbue yellow with meaning?
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default NotebookLMFlow;
