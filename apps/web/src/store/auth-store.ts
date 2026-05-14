"use client";

import type { AuthUser } from "@mmorpg/shared-types";
import { create } from "zustand";
import { setAccessToken } from "@/lib/api";

type AuthState = {
  user: AuthUser | null;
  setSession: (user: AuthUser, accessToken: string) => void;
  clearSession: () => void;
};

export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  setSession: (user, accessToken) => {
    setAccessToken(accessToken);
    set({ user });
  },
  clearSession: () => {
    setAccessToken(null);
    set({ user: null });
  }
}));
