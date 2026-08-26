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

// Splash animasyonunu ilk açılışta tam süresiyle, sonraki açılışlarda kısaltılmış halde oynatmak
// için kullanılan bayrak. SecureStore zaten projede (auth token'ları için) kullanıldığından yeni
// bir native bağımlılık (AsyncStorage vb.) eklemeye gerek kalmadı.
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

  // undefined: SecureStore'dan henüz okunmadı, true/false: splash daha önce görülmüş mü.
  const [splashSeen, setSplashSeen] = useState<boolean | undefined>(undefined);
  // Animasyonlu splash (giriş + çıkış) tamamen bitti mi — bitince overlay kaldırılır.
  const [splashDone, setSplashDone] = useState(false);

  useEffect(() => {
    SecureStore.getItemAsync(SPLASH_SEEN_KEY)
      .then((value) => setSplashSeen(value === '1'))
      .catch(() => setSplashSeen(false));
  }, []);

  // Fontlar ve oturum bilgisi hazır mı — animasyonlu splash bu true olmadan kapanmıyor.
  const appReady = fontsLoaded && hasHydrated && !isSessionLoading;

  const handleSplashFinish = useCallback(() => {
    setSplashDone(true);
    SecureStore.setItemAsync(SPLASH_SEEN_KEY, '1').catch(() => {});
  }, []);

  // Native splash'i, uygulama ilk kareyi çizer çizmez kaldırıyoruz — altında AnimatedSplash zaten
  // aynı zeminle (Colors.secondary) durduğu için kullanıcı bir renk atlaması/geçiş görmüyor.
  //
  // ÖNEMLİ: Router ağacını (Stack) hazır olana kadar unmount bırakmıyoruz. Daha önce burada
  // `if (!isReady) return null;` deseni vardı; bu, expo-router'ın ilk URL/deep-link çözümlemesini
  // henüz mount olmamış bir navigator üstünde denemesine ve "Can't perform a React state update on
  // a component that hasn't mounted yet" uyarısına yol açıyordu. Artık Stack her zaman ilk render'da
  // mount oluyor; hazırlık bitene kadar üstünü kaplayan opak AnimatedSplash örtüyor, bu yüzden
  // kullanıcı hazır olmayan bir ekran görmüyor.
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
