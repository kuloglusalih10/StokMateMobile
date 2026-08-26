import { request } from '../request';
import type { AuthResponse, AuthUser } from '@/types';

export const login = (email: string, password: string) =>
  request<AuthResponse>('auth/login', 'POST', { email, password });

export const logout = (refreshToken: string) => request<void>('auth/logout', 'POST', { refreshToken });

export const getCurrentUser = () => request<AuthUser>('auth/me', 'GET');
