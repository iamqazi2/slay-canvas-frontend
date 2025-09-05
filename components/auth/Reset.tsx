import React, { useState } from "react";
import FormHeading from "../Headings/FormHeading";
import FormBtn from "../ui/FormBtn";
import assets from "@/app/assets";
import { Router } from "next/router";

type ResetProps = {
  setReset: React.Dispatch<React.SetStateAction<boolean>>;
  formData: {
    newPassword: string,
    confirmPassword: string;
  }
  setFormData: React.Dispatch<React.SetStateAction<any>>
};

const Reset: React.FC<ResetProps> = ({ setReset, formData, setFormData}) => {

  const [showPassword, setShowPassword] = useState<boolean>(false)

  const submitHandler = (e: React.FormEvent) => {
    e.preventDefault();

    console.log("reset", formData)
    setFormData({
      newPassword: "",
      confirmPassword: ""
    })

    setReset(false);
  };

  return (
    <div className="flex m-auto items-center justify-center bg-white md:w-110 md:h-110 rounded-2xl mt-8 relative">

      <div
        onClick={() => setReset(false)}
        className="absolute top-4 left-8 flex gap-2 items-center cursor-pointer mt-2 px-1.5 py-0.5 border border-gray-200 rounded mb-4 text-gray-600 hover:text-black"
      >
        <img src={assets.arrowleft} alt="arrowleft" />
        <span className="text-xs">Cancel</span>
      </div>

      <div className="w-[400px] px-8 py-8">

        <div className="flex items-center justify-center text-center mt-6">
          <FormHeading
            text="Reset your password 🔑"
            text2="Your password should be at least 6 characters and should include a combination of the numbers, letters and special characters (!@#$)"
          />
        </div>

        <form
          onSubmit={(e) => {
            submitHandler(e);
          }}
          className="flex flex-col gap-3"
        >
          <div className="relative">
            <span className="text-xs mb-1.5">New Password</span>
            <input
              placeholder="Enter new password"
              value={formData.newPassword ?? ""}
              onChange={(e)=> setFormData({...formData, newPassword: e.target.value})}
              className="w-full rounded-lg bg-[#f5f5f5] px-3 py-2 outline-[#005EA0] border border-gray-200"
              type={showPassword ? 'text' : 'password'}
            />
            <img onClick={() => setShowPassword(!showPassword)} className="absolute right-3 top-8 text-sm text-black"
                src={assets.inputEye} />
          </div>

          <div className="relative">
            <span className="text-xs mb-1.5">Confirm Password</span>
            <input
              placeholder="Confirm password"
              value={formData.confirmPassword ?? ""}
              onChange={(e)=> setFormData({...formData, confirmPassword: e.target.value})}
              className="w-full rounded-lg bg-[#f5f5f5] px-3 py-2 outline-[#005EA0] border border-gray-200"
              type={showPassword ? 'text' : 'password'}
            />
            <img onClick={() => setShowPassword(!showPassword)} className="absolute right-3 top-8 text-sm text-black"
                src={assets.inputEye} />
          </div>

          <FormBtn text="Submit" />
        </form>
      </div>
    </div>
  );
};

export default Reset;
