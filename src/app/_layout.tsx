import '../../global.css';

import { Archivo_400Regular, Archivo_600SemiBold, Archivo_800ExtraBold } from '@expo-google-fonts/archivo';
import { IBMPlexMono_400Regular, IBMPlexMono_500Medium } from '@expo-google-fonts/ibm-plex-mono';
import { ThemeProvider } from 'expo-router/react-navigation';
import { useFonts } from 'expo-font';
import * as SplashScreen from 'expo-splash-screen';
import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { useEffect } from 'react';
import { useColorScheme } from 'react-native';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { KeyboardProvider } from 'react-native-keyboard-controller';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import ToastManager from 'toastify-react-native';

import { Colors } from '@/constants';
import { NAV_THEME } from '@/lib/theme';
import { useAuthStore } from '@/store/auth';

SplashScreen.preventAutoHideAsync();

export default function RootLayout() {
  const colorScheme = useColorScheme();
  const theme = colorScheme === 'dark' ? NAV_THEME.dark : NAV_THEME.light;

  const [fontsLoaded] = useFonts({
    Archivo_400Regular,
    Archivo_600SemiBold,
    Archivo_800ExtraBold,
    IBMPlexMono_400Regular,
    IBMPlexMono_500Medium,
  });

  const hasHydrated = useAuthStore((state) => state._hasHydrated);
  const isSessionLoading = useAuthStore((state) => state.isSessionLoading);
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);

  const isReady = hasHydrated && !isSessionLoading && fontsLoaded;

  useEffect(() => {
    if (isReady) {
      SplashScreen.hideAsync();
    }
  }, [isReady]);

  if (!isReady) {
    return null;
  }

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <SafeAreaProvider>
        <KeyboardProvider statusBarTranslucent navigationBarTranslucent>
          <ThemeProvider value={theme}>
            <StatusBar style={colorScheme === 'dark' ? 'light' : 'dark'} translucent />

            <ToastManager useModal={false} position="top" animationStyle="fade" topOffset={20} />

            <Stack
              screenOptions={{
                headerShown: false,
                contentStyle: { backgroundColor: Colors.canvas },
              }}
            >
              <Stack.Protected guard={isAuthenticated}>
                <Stack.Screen name="index" />
              </Stack.Protected>

              <Stack.Protected guard={!isAuthenticated}>
                <Stack.Screen
                  name="sign-in"
                  options={{ animation: 'slide_from_left', contentStyle: { backgroundColor: '#0E0F0C' } }}
                />
              </Stack.Protected>
            </Stack>
          </ThemeProvider>
        </KeyboardProvider>
      </SafeAreaProvider>
    </GestureHandlerRootView>
  );
}
