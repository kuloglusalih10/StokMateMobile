import { Formik } from 'formik';
import { useRouter } from 'expo-router';
import { useState } from 'react';
import { Circle, Defs, RadialGradient, Stop, Svg } from 'react-native-svg';
import {
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  Text,
  TextInput,
  View,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { login } from '@/services/auth';
import { useAuthStore } from '@/store/auth';
import { toast } from '@/lib/toast';
import { loginSchema } from '@/validations/auth';
import Logo from '@/assets/images/logo/stokmate-lockup-duo-notagline.svg';
import KoliPattern from '@/assets/images/stokmate-izometrik-koli.svg';

const BackgroundDecor = () => (
  <>
    <Svg pointerEvents="none" width="100%" height="100%" style={{ position: 'absolute', inset: 0 }}>
      <Defs>
        <RadialGradient id="limeGlow" cx="50%" cy="50%" r="50%">
          <Stop offset="0" stopColor="#D7FE47" stopOpacity={0.17} />
          <Stop offset="0.66" stopColor="#D7FE47" stopOpacity={0} />
        </RadialGradient>
        <RadialGradient id="tealGlow" cx="50%" cy="50%" r="50%">
          <Stop offset="0" stopColor="#3E8C82" stopOpacity={0.16} />
          <Stop offset="0.68" stopColor="#3E8C82" stopOpacity={0} />
        </RadialGradient>
      </Defs>
      <Circle cx="92%" cy="-6%" r={190} fill="url(#limeGlow)" />
      <Circle cx="-8%" cy="104%" r={200} fill="url(#tealGlow)" />
    </Svg>

    <KoliPattern
      pointerEvents="none"
      width={230}
      height={176}
      color="#D7FE47"
      style={{ position: 'absolute', top: 30, right: -50, opacity: 0.9 }}
    />
  </>
);

type LoginValues = {
  email: string;
  password: string;
};

export default function SignIn() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const signIn = useAuthStore((state) => state.signIn);
  const [showPassword, setShowPassword] = useState(false);

  const onSubmit = async (values: LoginValues) => {
    const response = await login(values.email, values.password);

    if (!response.res) {
      toast.error(response.message);
      return;
    }

    signIn(response.data.accessToken, response.data.refreshToken, response.data.user);
    router.replace('/');
  };

  return (
    <KeyboardAvoidingView
      className="flex-1 bg-[#0E0F0C]"
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      <BackgroundDecor />

      <ScrollView
        className="flex-1"
        contentContainerStyle={{
          flexGrow: 1,
          paddingHorizontal: 26,
          paddingTop: insets.top + 14,
          paddingBottom: insets.bottom + 24,
        }}
        keyboardShouldPersistTaps="handled"
      >
        <View className="flex-row items-center">
          <Logo width={150} height={46} />
        </View>

        <View className="flex-1 justify-center py-10">
          <Text className="font-mono text-[10.5px] uppercase tracking-[0.18em] text-[#E9EAE4]/40">
            Depo yönetimi
          </Text>

          <Text className="mb-3 mt-3.5 font-sans-extrabold text-[36px] leading-[38px] tracking-[-0.04em] text-[#E9EAE4]">
            {'Tekrar hoş\ngeldin'}
          </Text>

          <Text className="mb-8 max-w-[280px] font-sans text-[14.5px] text-[#E9EAE4]/55">
            Stok, ürün ve raf hareketlerine devam etmek için hesabına giriş yap.
          </Text>

          <Formik initialValues={{ email: '', password: '' }} validationSchema={loginSchema} onSubmit={onSubmit}>
            {({ handleChange, handleBlur, handleSubmit, values, errors, touched, isSubmitting }) => {
              return (
                <View className="gap-4">
                  <View>
                    <Text className="mb-2 font-mono text-[10px] uppercase tracking-[0.14em] text-[#E9EAE4]/45">
                      E-posta
                    </Text>
                    <View className="h-12 justify-center rounded-xl border border-[#E9EAE4]/[0.14] bg-[#E9EAE4]/[0.06] px-4">
                      <TextInput
                        className="font-sans text-[15px] text-[#E9EAE4]"
                        placeholder="ornek@stokmate.com"
                        placeholderTextColor="#E9EAE44D"
                        autoCapitalize="none"
                        autoCorrect={false}
                        keyboardType="email-address"
                        importantForAutofill="no"
                        value={values.email}
                        onChangeText={handleChange('email')}
                        onBlur={handleBlur('email')}
                      />
                    </View>
                    {touched.email && errors.email && (
                      <Text className="mt-2 font-sans text-xs text-destructive">{errors.email}</Text>
                    )}
                  </View>

                  <View>
                    <Text className="mb-2 font-mono text-[10px] uppercase tracking-[0.14em] text-[#E9EAE4]/45">
                      Şifre
                    </Text>
                    <View className="h-12 flex-row items-center rounded-xl border border-[#E9EAE4]/[0.14] bg-[#E9EAE4]/[0.06] pl-4 pr-2">
                      <TextInput
                        className="flex-1 font-mono text-[15px] tracking-[0.12em] text-[#E9EAE4]"
                        placeholder="••••••••"
                        placeholderTextColor="#E9EAE44D"
                        autoCapitalize="none"
                        autoCorrect={false}
                        secureTextEntry={!showPassword}
                        importantForAutofill="no"
                        value={values.password}
                        onChangeText={handleChange('password')}
                        onBlur={handleBlur('password')}
                      />
                      <Pressable className="px-2.5 py-2" onPress={() => setShowPassword((prev) => !prev)}>
                        <Text className="font-sans text-[13px] text-[#E9EAE4]/55">
                          {showPassword ? 'Gizle' : 'Göster'}
                        </Text>
                      </Pressable>
                    </View>
                    {touched.password && errors.password && (
                      <Text className="mt-2 font-sans text-xs text-destructive">{errors.password}</Text>
                    )}
                  </View>

                  <Pressable
                    className="mt-2 h-12 items-center justify-center rounded-xl bg-[#D7FE47] active:opacity-80 disabled:opacity-70"
                    onPress={() => handleSubmit()}
                    disabled={isSubmitting}
                  >
                    {isSubmitting ? (
                      <ActivityIndicator color="#0E0F0C" />
                    ) : (
                      <Text className="font-sans-semibold text-[15px] text-[#0E0F0C]">Giriş yap</Text>
                    )}
                  </Pressable>
                </View>
              );
            }}
          </Formik>
        </View>

        <View className="items-center">
          <View className="mb-4 h-px w-full bg-[#E9EAE4]/10" />
          <Text className="text-center font-mono text-[10.5px] leading-[18px] tracking-[0.05em] text-[#E9EAE4]/35">
            © 2026 <Text className="font-mono-medium text-[#E9EAE4]/60">Salih Kuloğlu</Text>
            {'\nTüm hakları saklıdır.'}
          </Text>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}
