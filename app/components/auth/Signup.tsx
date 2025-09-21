import Image from "next/image";
import { useRouter } from "next/navigation";
import React, { Dispatch, SetStateAction, useState } from "react";
import assets from "../../assets";
import { useUserStore } from "../../store/userStore";
import { authApi } from "../../utils/authApi";
import FormHeading from "../Headings/FormHeading";
import FormBtn from "../ui/FormBtn";
import GoogleBtn from "../ui/GoogleBtn";
import Input from "../ui/Input";
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

type LogoutProps = {
  setCurrentView: (
    view: "login" | "signup" | "forget" | "otp" | "reset"
  ) => void;
  formData: FormData;
  setFormData: Dispatch<SetStateAction<FormData>>;
};

const Signup: React.FC<LogoutProps> = ({
  setCurrentView,
  formData,
  setFormData,
}) => {
  const router = useRouter();
  const { showToast } = useToast();
  const { login } = useUserStore();
  const [isLoading, setIsLoading] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [agreeToTerms, setAgreeToTerms] = useState(false);

  const submitHandler = async (e: React.FormEvent) => {
    e.preventDefault();

    if (formData.password !== formData.confirmPassword) {
      showToast("Passwords do not match", "error");
      return;
    }

    if (
      !formData.firstName ||
      !formData.lastName ||
      !formData.email ||
      !formData.password ||
      !formData.confirmPassword
    ) {
      showToast("Please fill in all required fields", "error");
      return;
    }

    if (!agreeToTerms) {
      showToast("Please agree to the terms and conditions", "error");
      return;
    }

    setIsLoading(true);

    try {
      const response = await authApi.register({
        email: formData.email,
        name: `${formData.firstName} ${formData.lastName}`,
        password: formData.password,
        confirm_password: formData.confirmPassword,
      });

      if (response.success && response.data) {
        showToast("Account created successfully!", "success");

        // Save user and token to store
        login(response.data.user, response.data.access_token);

        // Reset form
        setFormData({
          email: "",
          password: "",
          firstName: "",
          lastName: "",
          otp: ["", "", "", "", "", ""],
          newPassword: "",
          confirmPassword: "",
        });

        // Redirect to dashboard
        router.push("/dashboard");
      } else {
        showToast(response.message || "Registration failed", "error");
      }
    } catch (error) {
      console.error("Registration error:", error);
      showToast("An error occurred during registration", "error");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex m-auto items-center justify-center bg-white md:w-150 h-auto py-8 rounded-2xl flex-shrink-3   ">
      <div className="w-[400px] px-5 md:px-0">
        <FormHeading
          text="Create account"
          text2="Enter your credentials to create your account"
        />

        <form
          onSubmit={(e) => {
            submitHandler(e);
          }}
          className="flex flex-col gap-2"
        >
          <div className="flex gap-1.5 max-w-[400px]">
            <div className="flex flex-col gap-1">
              <span className="text-xs">First name</span>
              <input
                className="w-full rounded-lg bg-[#f5f5f5] px-3 py-2 border border-gray-200"
                type="text"
                placeholder="Your first name"
                value={formData.firstName}
                onChange={(e) =>
                  setFormData({ ...formData, firstName: e.target.value })
                }
              />
            </div>
            <div className="flex flex-col gap-1">
              <span className="text-xs">Last name</span>
              <input
                className="w-full rounded-lg bg-[#f5f5f5] px-3 py-2 border border-gray-200"
                type="text"
                placeholder="Your last name"
                value={formData.lastName}
                onChange={(e) =>
                  setFormData({ ...formData, lastName: e.target.value })
                }
              />
            </div>
          </div>

          <Input formData={formData} setFormData={setFormData} />

          <div className="flex flex-col relative">
            <span className="text-xs mb-1.5">Confirm Password</span>
            <input
              className="w-full outline-[#005EA0] py-2 px-3 rounded-lg bg-[#f5f5f5] border-1 border-gray-300"
              type={showConfirmPassword ? "text" : "password"}
              value={formData.confirmPassword}
              onChange={(e) =>
                setFormData({ ...formData, confirmPassword: e.target.value })
              }
              placeholder="Confirm your password"
            />
            <Image
              onClick={() => setShowConfirmPassword(!showConfirmPassword)}
              className="absolute right-3 top-8 text-sm text-black cursor-pointer"
              alt="toggle password visibility"
              src={assets.inputEye}
              width={20}
              height={20}
            />
          </div>

          <div className="flex items-center gap-2">
            <div
              className={`h-4.5 w-4.5 border-1 border-black rounded-full cursor-pointer flex items-center justify-center ${
                agreeToTerms ? "bg-black" : ""
              }`}
              onClick={() => setAgreeToTerms(!agreeToTerms)}
            >
              {agreeToTerms && (
                <div className="w-2 h-2 bg-white rounded-full"></div>
              )}
            </div>
            <span className="text-xs">
              Agree with <span className="font-bold">terms & conditions</span>
            </span>
          </div>

          <FormBtn text="Sign up" isLoading={isLoading} />

          <div className="flex items-center gap-2">
            <hr className="flex-grow border-gray-400" />
            <p className="text-gray-600">or</p>
            <hr className="flex-grow border-gray-400" />
          </div>

          <GoogleBtn />

          <span className="text-center text-sm ">
            already have an account?{" "}
            <span
              onClick={() => setCurrentView("login")}
              className="font-semibold text-[#1279ff] cursor-pointer"
            >
              Log In
            </span>
          </span>
        </form>
      </div>
    </div>
  );
};

export default Signup;
