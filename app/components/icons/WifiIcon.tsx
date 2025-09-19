import React from "react";

interface WifiIconProps {
  width?: number;
  height?: number;
  className?: string;
}

export default function WifiIcon({ width = 25, height = 24, className = "" }: WifiIconProps) {
  return (
    <svg
      width={width}
      height={height}
      viewBox="0 0 25 24"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
    >
      <g clipPath="url(#clip0_45_740)">
        <path
          d="M12.499 3.20095C5.872 3.20095 0.5 8.52795 0.5 15.1009V20.7999H2.712V20.2319C2.712 17.5659 4.89 15.4049 7.578 15.4049C10.266 15.4049 12.444 17.5649 12.444 20.2319V20.7999H14.656V20.2319C14.656 16.3549 11.486 13.2129 7.578 13.2129C6.11598 13.211 4.68901 13.6605 3.492 14.4999C4.10937 13.2895 5.04978 12.2736 6.20905 11.5647C7.36832 10.8559 8.70119 10.4818 10.06 10.4839C14.117 10.4839 17.407 13.7479 17.407 17.7709V20.7999H19.619V17.7699C19.619 12.5349 15.339 8.28895 10.059 8.28895C7.78122 8.28404 5.57654 9.09258 3.842 10.5689C4.68036 9.00237 5.92885 7.69318 7.45391 6.78146C8.97896 5.86973 10.7232 5.38978 12.5 5.39295C17.906 5.39295 22.288 9.73895 22.288 15.0999V20.7999H24.5V15.0999C24.499 8.52695 19.127 3.20095 12.499 3.20095Z"
          fill="white"
        />
      </g>
      <defs>
        <clipPath id="clip0_45_740">
          <rect width="24" height="24" fill="white" transform="translate(0.5)" />
        </clipPath>
      </defs>
    </svg>
  );
}
