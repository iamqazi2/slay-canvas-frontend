"use client";
import React, { useState } from "react";
import Button from "./Button";
import Separator from "./Separator";
import {
  GridIcon,
  LogoIcon,
  DiamondIcon,
  ShareIcon,
  GiftIcon,
  DocumentIcon,
  HistoryIcon,
  BellIcon,
  LogoutIcon,
} from "./icons";
import { useRouter } from "next/navigation";
import { useUserStore } from "../store/userStore";
import SharePanel from "./SharePanel";
import NotificationPanel from "./NotificationPanel";
import Link from "next/link";

export default function ChatNav() {
  const router = useRouter();
  const { logout } = useUserStore();
  const [isSharePanelVisible, setIsSharePanelVisible] =
    useState<boolean>(false);
  const [isNotificationPanelVisible, setIsNotificationPanelVisible] =
    useState<boolean>(false);

  const handleShareButton = () => {
    setIsSharePanelVisible(!isSharePanelVisible);
  };

  const handleCloseSharePanel = () => {
    setIsSharePanelVisible(false);
  };

  const handleNotificationButton = () => {
    setIsNotificationPanelVisible(!isNotificationPanelVisible);
  };

  const handleCloseNotificationPanel = () => {
    setIsNotificationPanelVisible(false);
  };

  const handleLogout = () => {
    logout();
    router.push("/form");
  };

  return (
    <>
      <nav className="bg-white sticky z-10 top-0 border-b border-gray-200 px-6 py-4">
        <div className="flex items-center justify-between">
          {/* Left section */}
          <div className="flex items-center space-x-4">
            <div className="flex items-center space-x-3">
              <span className="max-sm:hidden flex items-center gap-3">
                <Link
                  href={"/boards"}
                  className="cursor-pointer hover:opacity-70"
                >
                  <GridIcon />
                </Link>
                <Separator />
              </span>
              <span className="cursor-pointer" onClick={() => router.push("/")}>
                <LogoIcon />
              </span>
              <span
                className="font-bold text-[18px] leading-[100%] tracking-[0%]"
                style={{ color: "var(--primary-blue)" }}
              >
                Better Video Research
              </span>
            </div>
          </div>

          {/* Center section - Buttons */}
          <div className="flex items-center space-x-3">
            {/* Credits - Hidden on mobile and tablet */}
            <div className="hidden lg:flex items-center space-x-2 ml-8">
              <DiamondIcon />
              <span
                className="font-medium text-[18px] leading-[100%] tracking-[0%] px-3 py-1 rounded-lg"
                style={{
                  color: "var(--dark-gray-bg)",
                }}
              >
                323/2.0k
              </span>
            </div>

            {/* Buttons - Hidden on mobile and tablet */}
            <div className="hidden lg:flex items-center space-x-3">
              <Button variant="primary" size="md">
                Upgrade
              </Button>

              <Button
                variant="gradient"
                size="share"
                icon={<ShareIcon />}
                onClick={handleShareButton}
              >
                Share
              </Button>

              <Button variant="gradient" size="refer-earn" icon={<GiftIcon />}>
                Refer and Earn
              </Button>
            </div>

            {/* Right section - Always visible */}
            <div className="flex items-center space-x-4">
              <span className="max-sm:hidden flex items-center gap-4">
                <Separator />
              </span>
              <DocumentIcon />
              <HistoryIcon />
              <span className="max-sm:hidden">
                <Separator />
              </span>
              <button
                onClick={handleNotificationButton}
                className={`cursor-pointer`}
              >
                <BellIcon />
              </button>
              <button
                onClick={handleLogout}
                className="cursor-pointer bg-gradient-to-r from-[#8E5EFF] to-[#4596FF] hover:from-[#8E5EFF] hover:to-[#4596FF] rounded-lg p-2 transition-all duration-200 "
              >
                <LogoutIcon size={18} />
              </button>
            </div>
          </div>
        </div>
      </nav>

      {/* Share Panel - Rendered outside nav to avoid z-index constraints */}
      <SharePanel
        isVisible={isSharePanelVisible}
        onClose={handleCloseSharePanel}
      />

      {/* Notification Panel - Rendered outside nav to avoid z-index constraints */}
      <NotificationPanel
        isVisible={isNotificationPanelVisible}
        onClose={handleCloseNotificationPanel}
      />
    </>
  );
}
