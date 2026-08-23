import '../../global.css';

import { ThemeProvider } from '@react-navigation/native';
import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { useColorScheme } from 'react-native';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { KeyboardProvider } from 'react-native-keyboard-controller';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import ToastManager from 'toastify-react-native';

import { Colors } from '@/constants';
import { NAV_THEME } from '@/lib/theme';

export default function RootLayout() {
  const colorScheme = useColorScheme();
  const theme = colorScheme === 'dark' ? NAV_THEME.dark : NAV_THEME.light;

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <SafeAreaProvider>
        <KeyboardProvider>
          <ThemeProvider value={theme}>
            <StatusBar style={colorScheme === 'dark' ? 'light' : 'dark'} />

            <ToastManager
              useModal={false}
              position="top"
              animationStyle="fade"
              topOffset={20}
              theme={colorScheme === 'dark' ? 'dark' : 'light'}
              style={{ backgroundColor: Colors.secondary }}
            />

            <Stack
              screenOptions={{
                headerShown: false,
                contentStyle: { backgroundColor: Colors.canvas },
              }}
            />
          </ThemeProvider>
        </KeyboardProvider>
      </SafeAreaProvider>
    </GestureHandlerRootView>
  );
}
