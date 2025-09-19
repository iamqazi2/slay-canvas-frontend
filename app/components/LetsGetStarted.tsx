"use client";
import React from "react";

interface LetsGetStartedProps {
  className?: string;
}

const LetsGetStarted: React.FC<LetsGetStartedProps> = ({ className = "" }) => {
  return (
    <div className={`min-h-screen bg-gray-100 flex items-center justify-center p-8 ${className}`}>
      {/* Dotted Background Pattern */}
      <div
        className="absolute inset-0 opacity-30"
        style={{
          backgroundImage: `radial-gradient(circle, #D1D5DB 1px, transparent 1px)`,
          backgroundSize: "20px 20px",
        }}
      />

      <div className="relative z-10 flex flex-col items-center">
        {/* Main Red Card */}
        <div className="relative mb-8">
          {/* Red Card with Halftone Pattern */}
          <div
            className="relative rounded-2xl w-96 h-64 flex flex-col justify-between"
            style={{
              backgroundImage: `url(/thumbnail.svg)`,
              backgroundSize: "contain",
              backgroundPosition: "center",
              backgroundRepeat: "no-repeat",
              // backgroundSize: "30px 30px, 25px 25px, 35px 35px",
            }}
          >
            <div className="absolute flex justify-center items-center w-full h-full">
              <svg width="96" height="96" viewBox="0 0 96 96" fill="none" xmlns="http://www.w3.org/2000/svg">
                <g filter="url(#filter0_d_62_1208)">
                  <g clip-path="url(#clip0_62_1208)">
                    <rect
                      x="10.9645"
                      y="26.7382"
                      width="60"
                      height="60"
                      rx="15"
                      transform="rotate(-15 10.9645 26.7382)"
                      fill="#1E1E1E"
                    />
                    <path
                      d="M44.9477 56.9729L55.5395 46.3702L41.0655 42.484L44.9477 56.9729ZM67.7966 30.585C68.4147 31.6358 69.0396 33.0989 69.7022 34.992C70.3888 36.8785 70.9078 38.5253 71.296 39.9742L71.9844 41.9638C73.4014 47.2523 74.0568 51.2437 74.0471 53.9121C74.0257 56.2472 73.0004 58.0231 70.9889 59.2091C69.938 59.8272 67.9195 60.601 64.7708 61.5999C61.6768 62.6101 58.8226 63.4526 56.1663 64.1643L52.3656 65.338C42.2475 68.0492 35.8413 69.3516 33.1729 69.3419C30.8378 69.3205 29.0619 68.2952 27.8758 66.2837C27.2578 65.2328 26.6328 63.7697 25.9703 61.8767C25.2836 59.9901 24.7647 58.3433 24.3765 56.8944L23.6881 54.9048C22.2711 49.6164 21.6157 45.625 21.6254 42.9565C21.6467 40.6215 22.672 38.8456 24.6836 37.6595C25.7344 37.0415 27.753 36.2677 30.9017 35.2687C33.9957 34.2585 36.8499 33.4161 39.5062 32.7043L43.3069 31.5306C53.425 28.8195 59.8312 27.5171 62.4996 27.5268C64.8347 27.5481 66.6106 28.5734 67.7966 30.585Z"
                      fill="#FF4500"
                    />
                  </g>
                </g>
                <defs>
                  <filter
                    id="filter0_d_62_1208"
                    x="-3.03552"
                    y="-2.79102"
                    width="101.485"
                    height="101.485"
                    filterUnits="userSpaceOnUse"
                    colorInterpolationFilters="sRGB"
                  >
                    <feFlood flood-opacity="0" result="BackgroundImageFix" />
                    <feColorMatrix
                      in="SourceAlpha"
                      type="matrix"
                      values="0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 127 0"
                      result="hardAlpha"
                    />
                    <feOffset />
                    <feGaussianBlur stdDeviation="7" />
                    <feComposite in2="hardAlpha" operator="out" />
                    <feColorMatrix type="matrix" values="0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0.25 0" />
                    <feBlend mode="normal" in2="BackgroundImageFix" result="effect1_dropShadow_62_1208" />
                    <feBlend mode="normal" in="SourceGraphic" in2="effect1_dropShadow_62_1208" result="shape" />
                  </filter>
                  <clipPath id="clip0_62_1208">
                    <rect
                      x="10.9645"
                      y="26.7382"
                      width="60"
                      height="60"
                      rx="15"
                      transform="rotate(-15 10.9645 26.7382)"
                      fill="white"
                    />
                  </clipPath>
                </defs>
              </svg>
            </div>
          </div>
        </div>

        {/* Title */}
        <h1 className="text-4xl font-bold text-gray-800 mb-4 text-center">{"Let's Get Starte"}d</h1>

        {/* Descriptive Text */}
        <div className="text-center max-w-md">
          <p className="text-gray-600 text-lg leading-relaxed">
            Drag & drop files, links, or notes board from sidebar here and start chatting with AI to explore ideas.
          </p>
        </div>
      </div>
    </div>
  );
};

export default LetsGetStarted;
