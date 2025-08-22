"use client";

import { useSession } from "next-auth/react";

export function useAdmin() {
  const { data: session, status } = useSession();

  const isLoading = status === "loading";
  const isAuthenticated = !!session?.user;
  const isAdmin = session?.user?.role === "ADMIN";

  return {
    isLoading,
    isAuthenticated,
    isAdmin,
    user: session?.user,
  };
}
