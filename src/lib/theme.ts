import { DarkTheme, DefaultTheme } from 'expo-router/react-navigation';
import type { Theme } from '@react-navigation/native';

import { Colors } from '@/constants';

export const NAV_THEME: { light: Theme; dark: Theme } = {
  light: {
    ...DefaultTheme,
    dark: false,
    colors: {
      ...DefaultTheme.colors,
      background: Colors.canvas,
      card: Colors.white,
      text: Colors.secondary,
      primary: Colors.primary,
      border: '#D8D9D2',
      notification: Colors.accent,
    },
  },
  dark: {
    ...DarkTheme,
    dark: true,
    colors: {
      ...DarkTheme.colors,
      background: Colors.secondary,
      card: '#171813',
      text: Colors.canvas,
      primary: Colors.primary,
      border: '#26271F',
      notification: Colors.accent,
    },
  },
};
