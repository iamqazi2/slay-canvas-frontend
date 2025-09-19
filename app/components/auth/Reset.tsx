import React, { Dispatch, SetStateAction, useState } from "react";
import FormHeading from "../Headings/FormHeading";
import FormBtn from "../ui/FormBtn";
import assets from "@/app/assets";
import Image from "next/image";
import { ChevronLeft } from "lucide-react";
import { authApi } from "../../utils/authApi";
import { useToast } from "../ui/Toast";

interface FormData {
  email: string;
  password: string;
  firstName: string;
  lastName: string;
  otp: [string, string, string, string, string, string];
  newPassword: string;
  confirmPassword: string;
}

type ResetProps = {
  setCurrentView: (view: "login" | "signup" | "forget" | "otp" | "reset") => void;
  formData: FormData;
  setFormData: Dispatch<SetStateAction<FormData>>;
};

const Reset: React.FC<ResetProps> = ({ setCurrentView, formData, setFormData }) => {

  const [showPassword, setShowPassword] = useState<boolean>(false)
  const { showToast } = useToast()
  const [isLoading, setIsLoading] = useState(false)

  const submitHandler = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.email) {
      showToast("Email is required", "error")
      return
    }

    if (formData.otp.some(digit => digit === "")) {
      showToast("Please enter the complete OTP", "error")
      return
    }

    if (!formData.newPassword || !formData.confirmPassword) {
      showToast("Please fill in all password fields", "error")
      return
    }

    if (formData.newPassword !== formData.confirmPassword) {
      showToast("Passwords do not match!", "error")
      return
    }

    setIsLoading(true)

    try {
      const response = await authApi.resetPassword({
        email: formData.email,
        otp: formData.otp.join(""),
        new_password: formData.newPassword,
        confirm_password: formData.confirmPassword,
      })

      if (response.success) {
        showToast("Password reset successful!", "success")

        // Reset form
        setFormData({
          email: "",
          password: "",
          firstName: "",
          lastName: "",
          otp: ["", "", "", "", "", ""],
          newPassword: "",
          confirmPassword: "",
        })

        setCurrentView("login")
      } else {
        showToast(response.message || "Password reset failed", "error")
      }
    } catch (error) {
      showToast("An error occurred during password reset", "error")
    } finally {
      setIsLoading(false)
    }
  };

  return (
    <div className="flex m-auto items-center justify-center bg-white md:w-110 md:h-110 rounded-2xl mt-8 relative">

      <div
        onClick={() => setCurrentView("otp")}
        className="absolute top-4 left-8 flex gap-1 items-center cursor-pointer mt-2 px-1.5 py-0.5 border border-gray-200 rounded mb-4 text-gray-600 hover:text-black"
      >
        <ChevronLeft size={16} />
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
              className="w-full rounded-lg bg-[#f5f5f5] px-3 py-2 outline-[#005EA0] border border-gray-200"
              type={showPassword ? 'text' : 'password'}
              value={formData.newPassword}
              onChange={(e) => setFormData({ ...formData, newPassword: e.target.value })}
            />

            <Image onClick={() => setShowPassword(!showPassword)} className="absolute right-3 top-8 text-sm text-black"
              src={assets.inputEye} width={25} height={25} alt="input eye" />
          </div>

          <div className="relative">
            <span className="text-xs mb-1.5">Confirm Password</span>
            <input
              placeholder="Confirm password"
              className="w-full rounded-lg bg-[#f5f5f5] px-3 py-2 outline-[#005EA0] border border-gray-200"
              type={showPassword ? 'text' : 'password'}
              value={formData.confirmPassword}
              onChange={(e) => setFormData({ ...formData, confirmPassword: e.target.value })}
            />

            <Image onClick={() => setShowPassword(!showPassword)} className="absolute right-3 top-8 text-sm text-black"
              src={assets.inputEye} width={25} height={25} alt="input eye" />
          </div>

          <FormBtn text="Submit" isLoading={isLoading} />
        </form>
      </div>
    </div>
  );
};

export default Reset;
