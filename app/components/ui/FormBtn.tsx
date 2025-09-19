import React from "react";

type BtnProps = {
  text: string;
  isLoading?: boolean;
  onClick?: () => void;
  type?: "button" | "submit" | "reset";
};

const FormBtn: React.FC<BtnProps> = ({ text, isLoading = false, onClick, type = "submit" }) => {
  return (
    <button
      type={type}
      onClick={onClick}
      disabled={isLoading}
      className="bg-gradient-to-r from-[#8e5eff] flex justify-center items-center to-[#4596ff] text-white py-3 rounded-xl cursor-pointer mt-2 w-full disabled:opacity-50 disabled:cursor-not-allowed"
    >
      {isLoading ? (
        <div className="flex items-center">
          <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
          </svg>
          Loading...
        </div>
      ) : (
        text
      )}
    </button>
  );
};

export default FormBtn;
