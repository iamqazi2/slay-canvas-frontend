"use client"
import React, { Dispatch, SetStateAction } from "react";
import FormHeading from "../Headings/FormHeading";
import FormBtn from "../ui/FormBtn";

interface FormData {
  email: string;
  password: string;
  firstName: string;
  lastName: string;
  otp: [string, string, string, string, string, string];
  newPassword: string;
  confirmPassword: string;
}

type AuthProps = {
  setCurrentView: (view: "login" | "signup" | "forget" | "otp" | "reset") => void;
  formData: FormData;
  setFormData: Dispatch<SetStateAction<FormData>>
};

const Authentication: React.FC<AuthProps> = ({ setCurrentView, setFormData, formData }) => {

  const handleChange = (index: number, value: string) => {
    // Only allow a single digit (0-9)
    if (value.length <= 1 && "0123456789".includes(value)) {
      // Copy otp array and update the digit at index
      const newOtp = [...formData.otp];
      newOtp[index] = value;
      setFormData({ ...formData, otp: newOtp as [string, string, string, string, string, string] });

      // Move to next box if a digit was typed
      if (value && index < 5) {
        const nextBox = document.getElementById(`otp-box-${index + 1}`);
        if (nextBox) nextBox.focus();
      }
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    console.log("otp", formData.otp.join(""))

    setFormData({
      email: "",
      password: "",
      firstName: "",
      lastName: "",
      otp: ["", "", "", "", "", ""],
      newPassword: "",
      confirmPassword: "",
    })

    setCurrentView("reset")
  };

  return (
    <div className="flex justify-center items-center mt-12">
      <div className="bg-white p-6 pb-25 rounded-2xl shadow-xl w-[450px] px-12">

        <button onClick={() => setCurrentView("forget")} className="text-sm flex items-center gap-2 px-1.5 py-0.5 border border-gray-200 rounded mb-4 text-gray-600 hover:text-black">
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
            {formData.otp.map((digit, i) => (
              <input
                key={i}
                id={`otp-box-${i}`}
                type="text"
                maxLength={1}
                value={digit}
                onChange={(e) => handleChange(i, e.target.value)}
                className="bg-[#faf8f8] w-12 h-12 border border-gray-200 rounded-lg text-center text-lg font-semibold focus:outline-none focus:ring-2 focus:ring-blue-400"
              />
            ))}
          </div>

          <FormBtn text='Continue' />

        </form>

        {/* Timer & Resend */}
        <div className="flex justify-between mt-3 text-sm text-gray-600">
          <span>
            01:00
          </span>
          <button
            className="text-blue-500 font-medium hover:underline"
          >
            Resend
          </button>
        </div>
      </div>
    </div>
  );
};

export default Authentication;
