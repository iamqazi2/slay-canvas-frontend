import React from "react";

interface UserIconProps {
  width?: number;
  height?: number;
  className?: string;
}

export default function UserIcon({ width = 33, height = 32, className = "" }: UserIconProps) {
  return (
    <svg
      width={width}
      height={height}
      viewBox="0 0 33 32"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
    >
      <path
        d="M3.16666 7.99996C3.16666 6.58547 3.72857 5.22892 4.72876 4.22872C5.72896 3.22853 7.08551 2.66663 8.5 2.66663H24.5C25.9145 2.66663 27.271 3.22853 28.2712 4.22872C29.2714 5.22892 29.8333 6.58547 29.8333 7.99996V24C29.8333 25.4144 29.2714 26.771 28.2712 27.7712C27.271 28.7714 25.9145 29.3333 24.5 29.3333H8.5C7.08551 29.3333 5.72896 28.7714 4.72876 27.7712C3.72857 26.771 3.16666 25.4144 3.16666 24V7.99996Z"
        stroke="#1E1E1E"
        strokeOpacity="0.8"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="M11.8333 14.6667C13.6743 14.6667 15.1667 13.1743 15.1667 11.3333C15.1667 9.49238 13.6743 8 11.8333 8C9.99238 8 8.5 9.49238 8.5 11.3333C8.5 13.1743 9.99238 14.6667 11.8333 14.6667Z"
        stroke="#1E1E1E"
        strokeOpacity="0.8"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="M19.868 16.828L8.5 29.3333H24.6773C26.0448 29.3333 27.3562 28.7901 28.3232 27.8232C29.2901 26.8562 29.8333 25.5448 29.8333 24.1773V24C29.8333 23.3787 29.6 23.14 29.18 22.68L23.8067 16.82C23.5562 16.5468 23.2516 16.3288 22.9122 16.18C22.5729 16.0311 22.2062 15.9546 21.8356 15.9553C21.465 15.9561 21.0986 16.0341 20.7598 16.1843C20.4211 16.3346 20.1173 16.5538 19.868 16.828Z"
        stroke="#1E1E1E"
        strokeOpacity="0.8"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}
