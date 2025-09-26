import Image from "next/image";
import React from "react";

const LoadingSpinner: React.FC = () => {
  return (
    <div className="fixed inset-0  flex items-center justify-center z-50">
      <div className="relative">
        {/* Main spinning circle */}
        <div className="animate-spin rounded-full h-20 w-20 border-4 border-transparent bg-gradient-to-r from-[#4596FF] via-[#6B73FF] to-[#8E5EFF] p-1">
          <div className="bg-black/90 backdrop-blur-2xl rounded-full h-full w-full"></div>
        </div>

        {/* Logo icon in the center - rotating independently */}
        <div className="absolute inset-0 flex items-center justify-center">
          <div
            className="animate-spin"
            style={{ animationDirection: "reverse", animationDuration: "3s" }}
          >
            <Image src={"logos.svg"} alt="Loading" width={40} height={40} />
          </div>
        </div>
      </div>
    </div>
  );
};

export default LoadingSpinner;
