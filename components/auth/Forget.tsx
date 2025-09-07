import React, { Dispatch, SetStateAction } from "react";
import FormHeading from "../Headings/FormHeading";
import FormBtn from "../ui/FormBtn";
import assets from "@/app/assets";
import { ChevronLeft } from "lucide-react";
import Image from "next/image";

interface FormData {
  email: string;
  password: string;
  firstName: string;
  lastName: string;
  otp: [string, string, string, string, string, string];
  newPassword: string;
  confirmPassword: string;
}

type ForgetProps = {
  setCurrentView: (view: "login" | "signup" | "forget" | "otp" | "reset") => void;
  formData: FormData;
  setFormData: Dispatch<SetStateAction<FormData>>;
};

const Forget: React.FC<ForgetProps> = ({ setCurrentView, setFormData, formData }) => {

  const submitHandler = (e: React.FormEvent) => {
    e.preventDefault();
    console.log("forget", formData)

    setFormData({
      email: "",
      password: "",
      firstName: "",
      lastName: "",
      otp: ["", "", "", "", "", ""],
      newPassword: "",
      confirmPassword: "",
    })

    setCurrentView("otp")
  };

  return (
    <div className="flex m-auto relative items-center justify-center bg-white md:w-110 md:h-100 rounded-2xl mt-8">
      <div
        onClick={() => setCurrentView("login")}
        className="absolute top-4 left-8 flex gap-2 items-center cursor-pointer"
      >
        <ChevronLeft size={16} />
        <span className="text-sm">Back</span>
      </div>

      <div className="w-[400px] px-8 py-8">
        <Image className="m-auto mb-3" width={100} height={100} src={assets.lock} alt="Lock" />

        <div className="flex items-center justify-center text-center">
          <FormHeading
            text="Forget Your password ?"
            text2="Enter your email to get reset link"
          />
        </div>

        <form onSubmit={(e) => {
          submitHandler(e)
        }} className="flex flex-col gap-3">
          <div>
            <span className="text-xs mb-1.5">Email</span>
            <input
              type="email"
              placeholder="Enter your email"
              value={formData.email}
              onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              className="w-full rounded-lg bg-[#f5f5f5] px-3 py-2 outline-[#005EA0] border border-gray-200"
            />
          </div>

          <FormBtn text="Submit" />
        </form>
      </div>
    </div>
  );
};

export default Forget;
