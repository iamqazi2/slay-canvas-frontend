import React from "react";

interface FolderIconProps {
  width?: number;
  height?: number;
  className?: string;
}

export default function FolderIcon({
  width = 33,
  height = 32,
  className = "",
}: FolderIconProps) {
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
        d="M5.83366 6.33337H13.4196L15.7926 8.7074L16.0856 9.00037H27.1667C28.0809 9.00037 28.8335 9.75215 28.8337 10.6664V24.0004C28.8335 24.9146 28.0809 25.6664 27.1667 25.6664H5.83366C4.91971 25.6664 4.16738 24.9151 4.16666 24.0013L4.18034 8.00134V8.00037C4.18034 7.07945 4.92579 6.33337 5.83366 6.33337Z"
        stroke="black"
        strokeOpacity="0.8"
        strokeWidth="2"
      />
    </svg>
  );
}
