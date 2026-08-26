import { createElement } from 'react';
import { CircleAlert, CircleCheck, Info, TriangleAlert, X } from 'lucide-react-native';
import { Toast } from 'toastify-react-native';

import { Colors } from '@/constants';

type ToastType = 'success' | 'error' | 'info' | 'warn';

const ICON_BY_TYPE = {
  success: CircleCheck,
  error: CircleAlert,
  info: Info,
  warn: TriangleAlert,
};

const ACCENT_BY_TYPE: Record<ToastType, string> = {
  success: Colors.primary,
  error: Colors.accent,
  info: Colors.primary,
  warn: Colors.accent,
};

const show = (type: ToastType, message: string) => {
  Toast.show({
    type,
    text1: message,
    icon: createElement(ICON_BY_TYPE[type], { size: 20, color: ACCENT_BY_TYPE[type] }),
    closeIcon: createElement(X, { size: 18, color: `${Colors.canvas}99` }),
    backgroundColor: Colors.secondary,
    textColor: Colors.canvas,
    theme: 'dark',
  });
};

export const toast = {
  success: (message: string) => show('success', message),
  error: (message: string) => show('error', message),
  info: (message: string) => show('info', message),
  warn: (message: string) => show('warn', message),
};
