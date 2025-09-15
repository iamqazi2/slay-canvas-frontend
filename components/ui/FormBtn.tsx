import React from "react";

type BtnProps = {
  text: string;
};

const FormBtn: React.FC<BtnProps> = ({ text }) => {
  return (
    <a
      href="https://slay-canvas.vercel.app/"
      className="bg-gradient-to-r from-[#8e5eff] flex justify-center to-[#4596ff] text-white py-3 rounded-xl cursor-pointer mt-2 w-full"
    >
      {text}
    </a>
  );
};

export default FormBtn;
