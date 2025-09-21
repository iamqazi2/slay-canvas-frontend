"use client";
import Authentication from "@/app/components/auth/Authentication";
import Forget from "@/app/components/auth/Forget";
import Login from "@/app/components/auth/Login";
import Reset from "@/app/components/auth/Reset";
import Signup from "@/app/components/auth/Signup";
import Image from "next/image";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useEffect, useState } from "react";
import assets from "../assets";
import { ToastProvider, useToast } from "../components/ui/Toast";
import { useUserStore } from "../store/userStore";
import { setAccessToken } from "../utils/cookies";
import { userService } from "../utils/userService";

type View = "login" | "signup" | "forget" | "otp" | "reset";

interface FormState {
  email: string;
  password: string;
  firstName: string;
  lastName: string;
  otp: [string, string, string, string, string, string];
  newPassword: string;
  confirmPassword: string;
}

const FormContent = () => {
  const [formData, setFormData] = useState<FormState>({
    email: "",
    password: "",
    firstName: "",
    lastName: "",
    otp: ["", "", "", "", "", ""],
    newPassword: "",
    confirmPassword: "",
  });

  const [currentView, setCurrentView] = useState<View>("login");
  const router = useRouter();
  const searchParams = useSearchParams();
  const { login } = useUserStore();
  const { showToast } = useToast();

  // Handle Google OAuth callback
  useEffect(() => {
    const handleGoogleCallback = async () => {
      const accessToken = searchParams.get("access_token");
      const error = searchParams.get("error");

      if (error) {
        showToast(`Authentication failed: ${error}`, "error");
        return;
      }

      if (accessToken) {
        try {
          // Save the access token
          setAccessToken(accessToken);

          // Fetch user data
          const userData = await userService.getCurrentUser();

          // Update user store
          login(userData, accessToken);

          showToast("Successfully logged in with Google!", "success");

          // Redirect to dashboard
          router.push("/dashboard");
        } catch (error) {
          console.error("Error fetching user data:", error);
          showToast("Failed to fetch user data", "error");
        }
      }
    };

    handleGoogleCallback();
  }, [searchParams, router, login, showToast]);

  return (
    <div className="bg-gradient-to-r px-[24px] from-[#8e5eff] to-[#4596ff] w-full min-h-screen flex flex-col">
      {/* Logo */}
      <div className="pt-8 pb-4 md:px-1 flex items-center justify-center md:justify-start">
        <Link href="/">
          <Image
            src={assets.whiteLogo}
            alt="whiteLogo"
            height={40}
            width={140}
          />
        </Link>
      </div>

      {/* Centered Forms */}
      <div className="flex-1 flex items-center justify-center">
        {currentView === "login" && (
          <Login
            setCurrentView={setCurrentView}
            formData={formData}
            setFormData={setFormData}
          />
        )}
        {currentView === "signup" && (
          <Signup
            setCurrentView={setCurrentView}
            formData={formData}
            setFormData={setFormData}
          />
        )}
        {currentView === "forget" && (
          <Forget
            setCurrentView={setCurrentView}
            formData={formData}
            setFormData={setFormData}
          />
        )}
        {currentView === "otp" && (
          <Authentication
            setCurrentView={setCurrentView}
            formData={formData}
            setFormData={setFormData}
          />
        )}
        {currentView === "reset" && (
          <Reset
            setCurrentView={setCurrentView}
            formData={formData}
            setFormData={setFormData}
          />
        )}
      </div>
    </div>
  );
};

const Form = () => {
  return (
    <ToastProvider>
      <FormContent />
    </ToastProvider>
  );
};

export default Form;
