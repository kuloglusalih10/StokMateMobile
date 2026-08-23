import { useSystemStore } from '@/store/system';
import { request } from '../request';
import { API_BASE_URL } from '@/config';
import axios from 'axios';

const { setSpinner } = useSystemStore.getState();

export const login = async (email: string, password: string) => {
  try {
    setSpinner(true);

    const response = await request('auth/login', 'POST', null, { email, password } as any);

    return response;
  } catch (error) {
    return {
      res: false,
      message: error instanceof Error ? error.message : String(error),
    };
  } finally {
    setSpinner(false);
  }
};

export const refreshAccessToken = async (refresh_token: string) => {
  try {
    setSpinner(true);

    const response = await axios.post(
      `${API_BASE_URL}/auth/refresh`,
      { refresh_token },
      { headers: { 'Content-Type': 'application/json' } }
    );

    return {
      res: true,
      data: response.data,
    };
  } catch (error: any) {
    return {
      res: false,
      message: error?.response?.data?.message ?? (error instanceof Error ? error.message : String(error)),
    };
  } finally {
    setSpinner(false);
  }
};

export const sendResetCodeToEmail = async (email: string) => {
  try {
    setSpinner(true);

    const response = await request('auth/forgot-password/send-code', 'POST', null, { email } as any);

    return response;
  } catch (error) {
    return {
      res: false,
      message: error instanceof Error ? error.message : String(error),
    };
  } finally {
    setSpinner(false);
  }
};

export const verifyResetCode = async (email: string, code: string) => {
  try {
    setSpinner(true);

    const response = await request('auth/forgot-password/verify-code', 'POST', null, { email, code } as any);

    return response;
  } catch (error) {
    return {
      res: false,
      message: error instanceof Error ? error.message : String(error),
    };
  } finally {
    setSpinner(false);
  }
};

export const resetPassword = async (email: string, code: string, newPassword: string) => {
  try {
    setSpinner(true);

    const response = await request('auth/forgot-password/reset-password', 'POST', null, {
      email,
      code,
      newPassword,
    } as any);

    return response;
  } catch (error) {
    return {
      res: false,
      message: error instanceof Error ? error.message : String(error),
    };
  } finally {
    setSpinner(false);
  }
};

export const sendHelpRequest = async (title: string, message: string) => {
  try {
    setSpinner(true);

    const response = await request('help', 'POST', null, { title, message } as any);

    return response;
  } catch (error) {
    return {
      res: false,
      message: error instanceof Error ? error.message : String(error),
    };
  } finally {
    setSpinner(false);
  }
};

export const getCurrentProfile = async () => {
  try {
    setSpinner(true);

    const response = await request('profile', 'GET');

    return response;
  } catch (error) {
    return {
      res: false,
      message: error instanceof Error ? error.message : String(error),
    };
  } finally {
    setSpinner(false);
  }
};

export const updateProfile = async (firstName: string, lastName: string, phoneNumber: string) => {
  try {
    setSpinner(true);

    const response = await request('profile', 'PUT', null, { firstName, lastName, phoneNumber } as any);

    return response;
  } catch (error) {
    return {
      res: false,
      message: error instanceof Error ? error.message : String(error),
    };
  } finally {
    setSpinner(false);
  }
};

export const addPushTokenToUser = async (pushToken: string) => {
  try {
    setSpinner(true);

    const response = await request('auth/push-token', 'POST', null, { token: pushToken } as any);

    return response;
  } catch (error) {
    return {
      res: false,
      message: error instanceof Error ? error.message : String(error),
    };
  } finally {
    setSpinner(false);
  }
};
