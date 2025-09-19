import React from "react";

interface FileIconProps {
  width?: number;
  height?: number;
  className?: string;
}

export default function FileIcon({ width = 33, height = 32, className = "" }: FileIconProps) {
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
        d="M12.5 17.3333H20.5M12.5 22.6666H16.5M5.83334 5.33329V26.6666C5.83334 27.3739 6.11429 28.0521 6.61438 28.5522C7.11448 29.0523 7.79276 29.3333 8.5 29.3333H24.5C25.2072 29.3333 25.8855 29.0523 26.3856 28.5522C26.8857 28.0521 27.1667 27.3739 27.1667 26.6666V11.1226C27.1666 10.7674 27.0956 10.4157 26.9578 10.0883C26.8199 9.76086 26.6181 9.46428 26.364 9.21596L20.444 3.42663C19.9458 2.9395 19.2768 2.66671 18.58 2.66663H8.5C7.79276 2.66663 7.11448 2.94758 6.61438 3.44767C6.11429 3.94777 5.83334 4.62605 5.83334 5.33329Z"
        stroke="#1E1E1E"
        strokeOpacity="0.8"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="M19.1667 2.66663V7.99996C19.1667 8.7072 19.4476 9.38548 19.9477 9.88558C20.4478 10.3857 21.1261 10.6666 21.8333 10.6666H27.1667"
        stroke="#1E1E1E"
        strokeOpacity="0.8"
        strokeWidth="2"
        strokeLinejoin="round"
      />
    </svg>
  );
}
