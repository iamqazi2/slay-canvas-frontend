"use client";

import { usePathname } from "next/navigation";
import { useEffect } from "react";
import { useUserStore } from "../store/userStore";
import { getAccessToken } from "../utils/cookies";

// Routes that require user data to be fetched
const protectedRoutes = ["/workspace", "/chat", "/payment", "/boards"];

export default function AuthProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const { fetchUser, isAuthenticated, isLoading, user } = useUserStore();

  useEffect(() => {
    // Check if current route is protected
    const isProtectedRoute = protectedRoutes.some((route) =>
      pathname.startsWith(route)
    );

    // Only fetch user data on protected routes if:
    // 1. We're on a protected route
    // 2. We have an access token
    // 3. We're not already authenticated or don't have user data
    // 4. We're not currently loading
    if (
      isProtectedRoute &&
      getAccessToken() &&
      (!isAuthenticated || !user) &&
      !isLoading
    ) {
      fetchUser();
    }
  }, [pathname, fetchUser, isAuthenticated, user, isLoading]);

  return <>{children}</>;
}
