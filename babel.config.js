module.exports = function (api) {
  api.cache(true);
  return {
    presets: [
      ['babel-preset-expo', { jsxImportSource: 'nativewind' }],
      'nativewind/babel',
    ],
    plugins: [
      // react-native-reanimated (splash animasyonu, gorhom/bottom-sheet vb.) worklet dönüşümünü
      // yapan plugin. Reanimated 4 ile birlikte gelen yeni motor "react-native-worklets" olduğundan
      // eski "react-native-reanimated/plugin" yerine bu kullanılıyor. HER ZAMAN plugins dizisinin
      // en sonunda olmalı.
      'react-native-worklets/plugin',
    ],
  };
};
