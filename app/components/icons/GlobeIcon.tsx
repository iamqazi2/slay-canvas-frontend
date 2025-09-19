import React from "react";

interface GlobeIconProps {
  width?: number;
  height?: number;
  className?: string;
}

export default function GlobeIcon({ width = 33, height = 32, className = "" }: GlobeIconProps) {
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
        d="M2.5 16C2.5 19.713 3.975 23.274 6.60051 25.8995C9.22601 28.525 12.787 30 16.5 30C20.213 30 23.774 28.525 26.3995 25.8995C29.025 23.274 30.5 19.713 30.5 16C30.5 12.287 29.025 8.72601 26.3995 6.10051C23.774 3.475 20.213 2 16.5 2C12.787 2 9.22601 3.475 6.60051 6.10051C3.975 8.72601 2.5 12.287 2.5 16Z"
        stroke="#1E1E1E"
        strokeOpacity="0.8"
        strokeWidth="1.5"
        strokeLinejoin="round"
      />
      <path
        d="M10.5 16C10.5 12.287 11.1321 8.72601 12.2574 6.10051C13.3826 3.475 14.9087 2 16.5 2C18.0913 2 19.6174 3.475 20.7426 6.10051C21.8679 8.72601 22.5 12.287 22.5 16C22.5 19.713 21.8679 23.274 20.7426 25.8995C19.6174 28.525 18.0913 30 16.5 30C14.9087 30 13.3826 28.525 12.2574 25.8995C11.1321 23.274 10.5 19.713 10.5 16Z"
        stroke="#1E1E1E"
        strokeOpacity="0.8"
        strokeWidth="1.5"
        strokeLinejoin="round"
      />
      <path
        d="M3.5 20.6667H29.5M3.5 11.3334H29.5"
        stroke="#1E1E1E"
        strokeOpacity="0.8"
        strokeWidth="1.5"
        strokeLinecap="round"
      />
    </svg>
  );
}
