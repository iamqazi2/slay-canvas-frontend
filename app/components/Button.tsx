import React from "react";

interface ButtonProps {
  variant?: "primary" | "secondary" | "gradient";
  size?: "sm" | "md" | "lg" | "share" | "refer-earn";
  children: React.ReactNode;
  icon?: React.ReactNode;
  onClick?: () => void;
  className?: string;
}

export default function Button({
  variant = "primary",
  size = "md",
  children,
  icon,
  onClick,
  className = "",
}: ButtonProps) {
  const baseClasses =
    "inline-flex items-center cursor-pointer justify-center font-medium transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2";

  const variantClasses = {
    primary:
      "bg-white border border-[var(--primary-blue)] text-[var(--primary-blue)] hover:bg-blue-50 focus:ring-blue-500",
    secondary: "bg-white border border-gray-300 text-gray-700 hover:bg-gray-50 focus:ring-gray-500",
    gradient:
      "bg-gradient-to-r from-[#8E5EFF] to-[#4596FF] text-white border-2 border-[#FFFFFF99] hover:from-[#8E5EFF] hover:to-[#4596FF] focus:ring-purple-500",
  };

  const sizeClasses = {
    sm: "px-3 py-1.5 text-sm",
    md: "px-[20px] py-[10px] text-[14px] leading-[100%] tracking-[0%] rounded-[15px] w-[95px] h-[44px]",
    lg: "px-6 py-3 text-base",
    share:
      "px-[20px] py-[10px] text-[14px] leading-[100%] tracking-[0%] rounded-[15px] w-[112px] h-[44px] font-semibold",
    "refer-earn":
      "px-[20px] py-[10px] text-[14px] leading-[100%] tracking-[0%] rounded-[15px] w-[176px] h-[44px] font-semibold gap-[6px] text-left",
  };

  const classes = `${baseClasses} ${variantClasses[variant]} ${sizeClasses[size]} ${className}`;

  return (
    <button className={classes} onClick={onClick}>
      {icon && <span className="mr-2">{icon}</span>}
      {children}
    </button>
  );
}
