import React from "react";

interface LockIconProps {
  width?: number;
  height?: number;
  className?: string;
}

export default function LockIcon({ width = 33, height = 32, className = "" }: LockIconProps) {
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
        d="M21.1667 7.33329C21.1667 4.75596 19.0773 2.66663 16.5 2.66663C13.9227 2.66663 11.8333 4.75596 11.8333 7.33329V16C11.8333 18.5773 13.9227 20.6666 16.5 20.6666C19.0773 20.6666 21.1667 18.5773 21.1667 16V7.33329Z"
        stroke="#1E1E1E"
        strokeOpacity="0.8"
        strokeWidth="2"
        strokeLinejoin="round"
      />
      <path
        d="M6.5 15.3333C6.5 20.8559 10.9773 25.3333 16.5 25.3333M16.5 25.3333C22.0227 25.3333 26.5 20.8559 26.5 15.3333M16.5 25.3333V29.3333"
        stroke="#1E1E1E"
        strokeOpacity="0.8"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}
