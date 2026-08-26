import { memo, useCallback, useState } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { Image } from 'expo-image';
import { PackageX } from 'lucide-react-native';

import { Colors } from '@/constants';
import { getCategoryVisual, neutralCategoryVisual } from '@/lib/categoryVisuals';
import { formatPriceFromKurus } from '@/utils';
import type { Product } from '@/services/products';

/* ---------------------------------------------------------------
   Tema — kart için türetilen tonlar
--------------------------------------------------------------- */

const cardColors = {
  border: 'rgba(14, 15, 12, 0.06)',
  textMuted: '#7A7D70',
  textFaint: '#9A9D92',
  textDisabled: '#6B6E63',
  warning: '#D08010',
  danger: '#DC2F2F',
} as const;

const radius = {
  sm: 6,
  md: 12,
  lg: 16,
} as const;

/* ---------------------------------------------------------------
   Stok durumu
--------------------------------------------------------------- */

type StockState = 'ok' | 'critical' | 'out';

const getStockState = (stock: number, minStock: number): StockState => {
  if (stock <= 0) return 'out';
  if (stock <= minStock) return 'critical';
  return 'ok';
};

const stockTone = {
  ok: { value: Colors.secondary, label: cardColors.textFaint, text: 'adet' },
  critical: { value: cardColors.warning, label: cardColors.warning, text: 'kritik' },
  out: { value: cardColors.danger, label: cardColors.danger, text: 'yok' },
} as const;

/* ---------------------------------------------------------------
   Bileşen
--------------------------------------------------------------- */

type Props = {
  product: Product;
  onPress?: (product: Product) => void;
};

const DEFAULT_THUMB_SIZE = 64;

function ProductCardComponent({ product, onPress }: Props) {
  const [pressed, setPressed] = useState(false);
  const [bodyHeight, setBodyHeight] = useState(DEFAULT_THUMB_SIZE);

  const handleBodyLayout = useCallback((event: { nativeEvent: { layout: { height: number } } }) => {
    setBodyHeight(event.nativeEvent.layout.height);
  }, []);

  const state = getStockState(product.stock, product.minStock);
  const isOut = state === 'out';
  const tone = stockTone[state];
  const category = isOut ? neutralCategoryVisual : getCategoryVisual(product.categoryName);
  const CategoryIcon = isOut ? PackageX : category.icon;

  return (
    <Pressable
      onPress={() => onPress?.(product)}
      onPressIn={() => setPressed(true)}
      onPressOut={() => setPressed(false)}
      accessibilityRole="button"
      accessibilityLabel={`${product.name}, ${product.categoryName}, ${product.stock} adet`}
      style={[S.card, pressed && S.cardPressed]}
    >
      <View style={[S.thumb, { height: bodyHeight, backgroundColor: category.bg }]}>
        {product.imageUrl ? (
          <Image
            source={{ uri: product.imageUrl }}
            style={S.thumbImage}
            contentFit="cover"
            transition={150}
          />
        ) : (
          <CategoryIcon size={26} color={category.fg} strokeWidth={1.75} />
        )}
      </View>

      <View style={S.body} onLayout={handleBodyLayout}>
        <View style={S.metaRow}>
          <View style={[S.badge, { backgroundColor: category.bg }]}>
            <Text style={[S.badgeText, { color: category.fg }]} numberOfLines={1}>
              {product.categoryName}
            </Text>
          </View>
          <Text style={S.sku} numberOfLines={1}>
            {product.sku}
          </Text>
        </View>

        <Text style={[S.name, isOut && S.nameMuted]} numberOfLines={1} ellipsizeMode="tail">
          {product.name}
        </Text>

        <Text style={[S.price, isOut && S.priceMuted]}>₺{formatPriceFromKurus(product.price)}</Text>
      </View>

      <View style={S.stockCol}>
        <Text style={[S.stockValue, { color: tone.value }]}>{product.stock}</Text>
        <Text style={[S.stockLabel, { color: tone.label }]}>{tone.text}</Text>
      </View>
    </Pressable>
  );
}

export const ProductCard = memo(ProductCardComponent);

/* ---------------------------------------------------------------
   Stiller
--------------------------------------------------------------- */

const S = StyleSheet.create({
  card: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    backgroundColor: Colors.white,
    borderRadius: radius.lg,
    borderWidth: 1,
    borderColor: cardColors.border,
  },
  cardPressed: {
    backgroundColor: '#FAFAF8',
  },

  thumb: {
    width: 64,
    marginRight: 12,
    borderRadius: radius.md,
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
  },
  thumbImage: {
    width: '100%',
    height: '100%',
  },

  body: {
    flex: 1,
    minWidth: 0,
    marginRight: 12,
  },

  metaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 7,
    marginBottom: 6,
  },
  badge: {
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: radius.sm,
    flexShrink: 1,
  },
  badgeText: {
    fontSize: 11,
    lineHeight: 14,
    fontFamily: 'Archivo_600SemiBold',
  },
  sku: {
    fontSize: 11,
    lineHeight: 14,
    color: cardColors.textFaint,
    fontVariant: ['tabular-nums'],
    fontFamily: 'Archivo_400Regular',
    flexShrink: 1,
  },

  name: {
    fontSize: 15,
    lineHeight: 20,
    color: Colors.secondary,
    marginBottom: 5,
    fontFamily: 'Archivo_600SemiBold',
  },
  nameMuted: {
    color: cardColors.textDisabled,
  },

  price: {
    fontSize: 13,
    lineHeight: 17,
    color: cardColors.textMuted,
    fontFamily: 'Archivo_400Regular',
  },
  priceMuted: {
    color: cardColors.textFaint,
  },

  stockCol: {
    justifyContent: 'center',
    alignItems: 'flex-end',
  },
  stockValue: {
    fontSize: 17,
    lineHeight: 21,
    marginBottom: 2,
    fontVariant: ['tabular-nums'],
    fontFamily: 'Archivo_800ExtraBold',
  },
  stockLabel: {
    fontSize: 11,
    lineHeight: 14,
    fontFamily: 'Archivo_400Regular',
  },
});
