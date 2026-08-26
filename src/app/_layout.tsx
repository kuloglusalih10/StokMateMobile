import '../../global.css';

import { Archivo_400Regular, Archivo_600SemiBold, Archivo_800ExtraBold } from '@expo-google-fonts/archivo';
import { IBMPlexMono_400Regular, IBMPlexMono_500Medium } from '@expo-google-fonts/ibm-plex-mono';
import { ThemeProvider } from 'expo-router/react-navigation';
import { useFonts } from 'expo-font';
import * as SecureStore from 'expo-secure-store';
import * as SplashScreen from 'expo-splash-screen';
import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { useCallback, useEffect, useRef, useState } from 'react';
import { useColorScheme } from 'react-native';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { KeyboardProvider } from 'react-native-keyboard-controller';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import ToastManager from 'toastify-react-native';

import AnimatedSplash from '@/components/splash/AnimatedSplash';
import { Colors } from '@/constants';
import { NAV_THEME } from '@/lib/theme';
import { useAuthStore } from '@/store/auth';

const SPLASH_SEEN_KEY = 'splash_seen_v2';

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

  const [splashSeen, setSplashSeen] = useState<boolean | undefined>(undefined);
  const [splashDone, setSplashDone] = useState(false);

  useEffect(() => {
    SecureStore.getItemAsync(SPLASH_SEEN_KEY)
      .then((value) => setSplashSeen(value === '1'))
      .catch(() => setSplashSeen(false));
  }, []);

  const appReady = fontsLoaded && hasHydrated && !isSessionLoading;

  const handleSplashFinish = useCallback(() => {
    setSplashDone(true);
    SecureStore.setItemAsync(SPLASH_SEEN_KEY, '1').catch(() => {});
  }, []);

  const hasHiddenNativeSplash = useRef(false);
  const onRootLayout = useCallback(() => {
    if (hasHiddenNativeSplash.current) return;
    hasHiddenNativeSplash.current = true;
    SplashScreen.hideAsync();
  }, []);

  return (
    <GestureHandlerRootView style={{ flex: 1 }} onLayout={onRootLayout}>
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
                <Stack.Screen name="product/[id]" options={{ animation: 'slide_from_right' }} />
              </Stack.Protected>

              <Stack.Protected guard={!isAuthenticated}>
                <Stack.Screen
                  name="sign-in"
                  options={{ animation: 'slide_from_left', contentStyle: { backgroundColor: '#0E0F0C' } }}
                />
              </Stack.Protected>
            </Stack>

            {!splashDone && (
              <AnimatedSplash short={splashSeen} ready={appReady} onFinish={handleSplashFinish} />
            )}
          </ThemeProvider>
        </KeyboardProvider>
      </SafeAreaProvider>
    </GestureHandlerRootView>
  );
}
