import { useAuthStore } from '@/store/auth';
import { API_BASE_URL } from '@/config';
import axios from 'axios';

let isRefreshing = false;
let refreshPromise: Promise<string | null> | null = null;

const refreshAccessTokenSilently = async (): Promise<string | null> => {
  if (isRefreshing && refreshPromise) {
    return refreshPromise;
  }

  isRefreshing = true;

  refreshPromise = (async () => {
    try {
      const { refreshToken } = useAuthStore.getState();

      if (!refreshToken) {
        useAuthStore.getState().signOut();
        return null;
      }

      const response = await axios.post(
        `${API_BASE_URL}/auth/refresh`,
        { refresh_token: refreshToken },
        {
          headers: { 'Content-Type': 'application/json' },
          timeout: 10000,
        }
      );

      if (response?.data) {
        const newAccessToken = response.data.access_token;
        const newRefreshToken = response.data.refresh_token;

        useAuthStore.getState().signIn(newAccessToken, newRefreshToken);

        return newAccessToken;
      } else {
        useAuthStore.getState().signOut();
        return null;
      }
    } catch {
      useAuthStore.getState().signOut();
      return null;
    } finally {
      isRefreshing = false;
      refreshPromise = null;
    }
  })();

  return refreshPromise;
};

export const request = async (
  url: string,
  method: string,
  token: { payload?: string } | null = null,
  data = null,
  contentType = 'application/json'
) => {
  const { accessToken } = useAuthStore.getState();

  try {
    const res = token?.payload ?? accessToken;
    const tkn = res;

    const apiUrl = `${API_BASE_URL}/${url}`;

    let config: {
      method: string;
      maxBodyLength: number;
      url: string;
      headers: { 'Content-Type': string; Authorization: string };
      data?: any;
    } = {
      method,
      maxBodyLength: Infinity,
      url: apiUrl,
      headers: {
        'Content-Type': contentType,
        Authorization: `Bearer ${tkn}`,
      },
    };

    if (method == 'POST' || method == 'PUT' || method == 'PATCH') {
      config.data = data ?? {};
    }

    const response = await axios.request(config);

    return {
      res: true,
      data: response.data,
    };
  } catch (error: any) {
    if (error?.response?.data?.code == 'TOKEN_EXPIRED') {
      const newAccessToken = await refreshAccessTokenSilently();

      if (newAccessToken) {
        try {
          const retryApiUrl = `${API_BASE_URL}/${url}`;

          let retryConfig: {
            method: string;
            maxBodyLength: number;
            url: string;
            headers: { 'Content-Type': string; Authorization: string };
            data?: any;
          } = {
            method,
            maxBodyLength: Infinity,
            url: retryApiUrl,
            headers: {
              'Content-Type': contentType,
              Authorization: `Bearer ${newAccessToken}`,
            },
          };

          if (method == 'POST' || method == 'PUT' || method == 'PATCH') {
            retryConfig.data = data ?? {};
          }

          const retryResponse = await axios.request(retryConfig);

          return {
            res: true,
            data: retryResponse.data,
          };
        } catch (retryError: any) {
          return {
            res: false,
            message: retryError?.response?.data?.message ?? retryError.message,
          };
        }
      }

      return {
        res: false,
        message: 'Oturum süresi doldu. Lütfen tekrar giriş yapın.',
      };
    }

    return {
      res: false,
      message: error?.response?.data?.message ?? error.message,
    };
  }
};
