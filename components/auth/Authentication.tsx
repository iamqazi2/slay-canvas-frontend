"use client"
import React, { useState, useEffect } from "react";
import FormHeading from "../Headings/FormHeading";

type AuthProps = {
  setAuth: React.Dispatch<React.SetStateAction<boolean>>;
  setReset: React.Dispatch<React.SetStateAction<boolean>>;
};

const Authentication: React.FC<AuthProps> = ({setAuth, setReset}) => {
  const [otp, setOtp] = useState(["", "", "", "", "", ""]);
  const [timeLeft, setTimeLeft] = useState(60);

  useEffect(() => {
    if (timeLeft > 0) {
      const timer = setTimeout(() => setTimeLeft(timeLeft - 1), 1000);
      return () => clearTimeout(timer);
    }
  }, [timeLeft]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>, index: number) => {
    const value = e.target.value.replace(/\D/, ""); // sirf number
    if (value) {
      const newOtp = [...otp];
      newOtp[index] = value;
      setOtp(newOtp);

      if (index < otp.length - 1) {
        const nextInput = document.getElementById(`otp-${index + 1}`);
        nextInput?.focus();
      }
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const code = otp.join("");
    setOtp(["", "", "", "", "", ""])

    setReset(true);
    setAuth(false)
  };

  return (
    <div className="flex justify-center items-center mt-12">
      <div className="bg-white p-6 pb-25 rounded-2xl shadow-xl w-[450px] px-12">

        <button onClick={()=> setAuth(false)} className="text-sm flex items-center gap-2 px-1.5 py-0.5 border border-gray-200 rounded mb-4 text-gray-600 hover:text-black">
          ✖ <span className="text-xs">Cancel</span>
        </button>

        <div className="flex items-center justify-center text-center">
          <FormHeading
            text="Enter code"
            text2="Enter the code you received on your phone number"
          />
        </div>

        {/* OTP Inputs */}
        <form className="" onSubmit={handleSubmit}>
          <div className="flex gap-1 justify-center mb-3 mt-6">
            {otp.map((digit, i) => (
              <input
                key={i}
                id={`otp-${i}`}
                type="text"
                maxLength={1}
                value={digit}
                onChange={(e) => handleChange(e, i)}
                className="bg-[#faf8f8] w-12 h-12 border border-gray-200 rounded-lg text-center text-lg font-semibold focus:outline-none focus:ring-2 focus:ring-blue-400"
              />
            ))}
          </div>

          <button
            type="submit"
            className="w-full py-3 bg-gradient-to-r from-[#8e5eff] to-[#4596ff] text-white rounded-lg font-semibold hover:opacity-90"
          >
            Continue
          </button>

        </form>

        {/* Timer & Resend */}
        <div className="flex justify-between mt-3 text-sm text-gray-600">
          <span>
            {Math.floor(timeLeft / 60)}:
            {timeLeft % 60 < 10 ? `0${timeLeft % 60}` : timeLeft % 60}
          </span>
          <button
            onClick={() => setTimeLeft(60)}
            className="text-blue-500 font-medium hover:underline"
            disabled={timeLeft > 0}
          >
            Resend
          </button>
        </div>
      </div>
    </div>
  );
};

export default Authentication;
