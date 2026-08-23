import { Text, View } from 'react-native';

export default function Index() {
  return (
    <View className="flex-1 items-center justify-center bg-background px-6">
      <Text className="text-2xl font-semibold text-foreground">StokMate</Text>
      <Text className="mt-2 text-center text-base text-muted-foreground">
        Proje altyapısı hazır — ekranlarını buradan (src/app) oluşturmaya başlayabilirsin.
      </Text>
    </View>
  );
}
