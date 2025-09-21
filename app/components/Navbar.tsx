"use client";
import assets from "@/app/assets";
import Image from "next/image";
import Link from "next/link";
import { useUserStore } from "../store/userStore";
import Sec1Btn from "./ui/Sec1Btn";

const Navbar = () => {
  const { user, isAuthenticated, logout } = useUserStore();

  const handleLogout = () => {
    logout();
    window.location.href = "/"; // Redirect to home page
  };

  return (
    <div className="flex gap-4 md:gap-0 flex-col md:flex-row items-center justify-between px-10 py-4 main-container ">
      <Link href="/">
        <Image
          src={assets.logo}
          alt="Logo"
          width={160}
          height={45}
          className="cursor-pointer"
        />
      </Link>

      {isAuthenticated && user ? (
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center text-white text-sm">
              {user.name.charAt(0).toUpperCase()}
            </div>
            <span className="text-sm font-medium">{user.name}</span>
          </div>
          <button
            onClick={handleLogout}
            className="px-4 py-2 text-sm bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors"
          >
            Logout
          </button>
        </div>
      ) : (
        <Sec1Btn
          text="Get Slay Canvas"
          text2="Log in"
          width="139px"
          link2="/form"
          link="/payment"
          variant1="default"
          variant2="default"
        />
      )}
    </div>
  );
};

export default Navbar;
