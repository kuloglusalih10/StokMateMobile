export type AuthUser = {
  id: number;
  email: string;
  fullName: string;
};

export type AuthResponse = {
  accessToken: string;
  refreshToken: string;
  expiresAt: string;
  user: AuthUser;
};

export type AuthState = {
  accessToken: string | null;
  refreshToken: string | null;
  user: AuthUser | null;
  isAuthenticated: boolean;
  _hasHydrated: boolean;
  isSessionLoading: boolean;
  signIn: (accessToken: string, refreshToken: string, user: AuthUser) => void;
  signOut: () => void;
  checkSession: () => Promise<void>;
  setHasHydrated: (value: boolean) => void;
};
