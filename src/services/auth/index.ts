import { request } from '../request';

type AuthUser = {
  id: number;
  email: string;
  fullName: string;
};

type AuthResponse = {
  accessToken: string;
  refreshToken: string;
  expiresAt: string;
  user: AuthUser;
};

export const login = (email: string, password: string) =>
  request<AuthResponse>('auth/login', 'POST', { email, password });

export const logout = (refreshToken: string) => request<void>('auth/logout', 'POST', { refreshToken });

export const getCurrentUser = () => request<AuthUser>('auth/me', 'GET');
