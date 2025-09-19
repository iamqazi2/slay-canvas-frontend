import React from "react";

interface GridIconNewProps {
  width?: number;
  height?: number;
  className?: string;
}

export default function GridIconNew({ width = 33, height = 32, className = "" }: GridIconNewProps) {
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
        d="M7.16667 18.6667C8.63943 18.6667 9.83333 17.4728 9.83333 16C9.83333 14.5273 8.63943 13.3334 7.16667 13.3334C5.69391 13.3334 4.5 14.5273 4.5 16C4.5 17.4728 5.69391 18.6667 7.16667 18.6667Z"
        stroke="#1E1E1E"
        strokeOpacity="0.8"
        strokeWidth="1.5"
      />
      <path
        d="M25.8333 9.33333C27.3061 9.33333 28.5 8.13943 28.5 6.66667C28.5 5.19391 27.3061 4 25.8333 4C24.3606 4 23.1667 5.19391 23.1667 6.66667C23.1667 8.13943 24.3606 9.33333 25.8333 9.33333Z"
        stroke="#1E1E1E"
        strokeOpacity="0.8"
        strokeWidth="1.5"
      />
      <path
        d="M25.8333 18.6667C27.3061 18.6667 28.5 17.4728 28.5 16C28.5 14.5273 27.3061 13.3334 25.8333 13.3334C24.3606 13.3334 23.1667 14.5273 23.1667 16C23.1667 17.4728 24.3606 18.6667 25.8333 18.6667Z"
        stroke="#1E1E1E"
        strokeOpacity="0.8"
        strokeWidth="1.5"
      />
      <path
        d="M25.8333 28C27.3061 28 28.5 26.8061 28.5 25.3333C28.5 23.8605 27.3061 22.6666 25.8333 22.6666C24.3606 22.6666 23.1667 23.8605 23.1667 25.3333C23.1667 26.8061 24.3606 28 25.8333 28Z"
        stroke="#1E1E1E"
        strokeOpacity="0.8"
        strokeWidth="1.5"
      />
      <path
        d="M23.1667 25.3333H15.1667V6.66663H23.1667M9.83333 16H23.1667"
        stroke="#1E1E1E"
        strokeOpacity="0.8"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}
