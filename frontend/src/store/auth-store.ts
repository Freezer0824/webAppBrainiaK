import { create } from "zustand";
import { persist } from "zustand/middleware";

export type AuthUser = {
  id: string;
  name: string;
  email?: string;
  mode: "guest" | "authenticated";
};

export type AuthView = "welcome" | "login" | "register";

type AuthState = {
  user: AuthUser | null;
  token: string | null;
  isAuthenticated: boolean;
  authView: AuthView;

  continueAsGuest: () => void;
  loginSuccess: (payload: {
    user: Omit<AuthUser, "mode">;
    token: string;
  }) => void;
  logout: () => void;
  openLogin: () => void;
  openRegister: () => void;
  setAuthView: (view: AuthView) => void;
};

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      user: null,
      token: null,
      isAuthenticated: false,
      authView: "welcome",

      continueAsGuest: () =>
        set({
          user: {
            id: crypto.randomUUID(),
            name: "Invité",
            mode: "guest",
          },
          token: null,
          isAuthenticated: true,
          authView: "welcome",
        }),

      loginSuccess: ({ user, token }) =>
        set({
          user: {
            ...user,
            mode: "authenticated",
          },
          token,
          isAuthenticated: true,
          authView: "welcome",
        }),

      logout: () =>
        set({
          user: null,
          token: null,
          isAuthenticated: false,
          authView: "welcome",
        }),

      openLogin: () =>
        set({
          user: null,
          token: null,
          isAuthenticated: false,
          authView: "login",
        }),

      openRegister: () =>
        set({
          user: null,
          token: null,
          isAuthenticated: false,
          authView: "register",
        }),

      setAuthView: (authView) => set({ authView }),
    }),
    {
      name: "brainiak-auth",
    },
  ),
);