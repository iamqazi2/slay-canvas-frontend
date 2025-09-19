import React from "react";

interface SeparatorProps {
  orientation?: "vertical" | "horizontal";
  height?: number;
  width?: number;
  className?: string;
}

export default function Separator({
  orientation = "vertical",
  height = 42,
  width = 3,
  className = "",
}: SeparatorProps) {
  const baseClasses = "bg-[#1E1E1E4D] rounded-[10px]";

  const orientationClasses = {
    vertical: "w-[3px]",
    horizontal: "h-[3px]",
  };

  const style = orientation === "vertical" ? { height: `${height}px` } : { width: `${width}px` };

  const classes = `${baseClasses} ${orientationClasses[orientation]} ${className}`;

  return <div className={classes} style={style}></div>;
}
