import React from "react";

interface TrashIconProps {
  width?: number;
  height?: number;
  className?: string;
}

export default function TrashIcon({ width = 33, height = 32, className = "" }: TrashIconProps) {
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
        d="M26.1667 11.1854L25.34 9.53871C25.0073 8.87603 24.497 8.31888 23.866 7.92945C23.235 7.54002 22.5082 7.33365 21.7667 7.33337H11.2333C10.4918 7.33365 9.76502 7.54002 9.13402 7.92945C8.50302 8.31888 7.99269 8.87603 7.66 9.53871L6.83334 11.1867M16.5 7.33337V24.6667M16.5 24.6667H14.5667M16.5 24.6667H18.4333"
        stroke="#1E1E1E"
        strokeOpacity="0.8"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}
