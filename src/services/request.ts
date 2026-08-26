import axios, { type AxiosRequestConfig, type Method } from 'axios';

import { API_BASE_URL } from '@/config';
import { useAuthStore } from '@/store/auth';
import type { ApiResult } from '@/types';

let isRefreshing = false;
let refreshPromise: Promise<string | null> | null = null;

const extractErrorMessage = (error: any) => {
  if (typeof error?.response?.data === 'string' && error.response.data.length > 0) {
    return error.response.data;
  }

  return error?.message ?? 'Beklenmeyen bir hata oluştu.';
};

const refreshAccessTokenSilently = async (): Promise<string | null> => {
  if (isRefreshing && refreshPromise) {
    return refreshPromise;
  }

  isRefreshing = true;

  refreshPromise = (async () => {
    const { refreshToken, signIn, signOut } = useAuthStore.getState();

    if (!refreshToken) {
      signOut();
      return null;
    }

    try {
      const response = await axios.post(`${API_BASE_URL}/auth/refresh`, { refreshToken });

      signIn(response.data.accessToken, response.data.refreshToken, response.data.user);

      return response.data.accessToken as string;
    } catch {
      signOut();
      return null;
    } finally {
      isRefreshing = false;
      refreshPromise = null;
    }
  })();

  return refreshPromise;
};

export const request = async <T>(
  url: string,
  method: Method,
  data?: unknown
): Promise<ApiResult<T>> => {
  const { accessToken } = useAuthStore.getState();

  const config: AxiosRequestConfig = {
    method,
    url: `${API_BASE_URL}/${url}`,
    headers: accessToken ? { Authorization: `Bearer ${accessToken}` } : undefined,
    data,
  };

  try {
    const response = await axios.request<T>(config);
    return { res: true, data: response.data };
  } catch (error: any) {
    if (error?.response?.status === 401 && accessToken) {
      const newAccessToken = await refreshAccessTokenSilently();

      if (newAccessToken) {
        try {
          const retryResponse = await axios.request<T>({
            ...config,
            headers: { Authorization: `Bearer ${newAccessToken}` },
          });

          return { res: true, data: retryResponse.data };
        } catch (retryError) {
          return { res: false, message: extractErrorMessage(retryError) };
        }
      }

      return { res: false, message: 'Oturum süresi doldu. Lütfen tekrar giriş yapın.' };
    }

    return { res: false, message: extractErrorMessage(error) };
  }
};
