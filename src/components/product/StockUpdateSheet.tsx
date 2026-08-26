import { useEffect, useRef, useState, type ElementRef, type ReactNode } from 'react';
import { Animated, Dimensions, Pressable, StyleSheet, Text, TextInput, View } from 'react-native';
import BottomSheet, {
  BottomSheetBackdrop,
  BottomSheetScrollView,
  type BottomSheetBackdropProps,
} from '@gorhom/bottom-sheet';
import { Minus, Plus, TriangleAlert, X } from 'lucide-react-native';

import { Colors } from '@/constants';
import { hexWithAlpha } from '@/utils';
import { addProductStockEntry, updateProductStock } from '@/services/products';
import type { ProductDetail } from '@/types';

const warning = '#D08010';
const danger = '#DC2F2F';

const SCREEN_HEIGHT = Dimensions.get('window').height;
const MAX_SHEET_HEIGHT = SCREEN_HEIGHT * 0.85;

type Mode = 'sayim' | 'giris' | 'fire';

const MODES: { key: Mode; label: string }[] = [
  { key: 'sayim', label: 'Sayım' },
  { key: 'giris', label: 'Giriş' },
  { key: 'fire', label: 'Fire' },
];

type Props = {
  visible: boolean;
  product: ProductDetail | null;
  onClose: () => void;
  onUpdated: () => void;
};

function AnimatedBanner({
  show,
  style,
  children,
}: {
  show: boolean;
  style: object | object[];
  children: ReactNode;
}) {
  const [mounted, setMounted] = useState(show);
  const progress = useRef(new Animated.Value(show ? 1 : 0)).current;
  const wasShowRef = useRef(show);

  useEffect(() => {
    if (wasShowRef.current === show) return;
    wasShowRef.current = show;

    if (show) {
      setMounted(true);
      Animated.timing(progress, {
        toValue: 1,
        duration: 240,
        useNativeDriver: true,
      }).start();
      return;
    }

    Animated.timing(progress, {
      toValue: 0,
      duration: 170,
      useNativeDriver: true,
    }).start(({ finished }) => {
      if (finished) setMounted(false);
    });
  }, [show, progress]);

  if (!mounted) {
    return null;
  }

  return (
    <Animated.View
      style={[
        style,
        {
          opacity: progress,
          transform: [
            { translateY: progress.interpolate({ inputRange: [0, 1], outputRange: [-8, 0] }) },
            { scale: progress.interpolate({ inputRange: [0, 1], outputRange: [0.94, 1] }) },
          ],
        },
      ]}
    >
      {children}
    </Animated.View>
  );
}

export function StockUpdateSheet({ visible, product, onClose, onUpdated }: Props) {
  const sheetRef = useRef<ElementRef<typeof BottomSheet>>(null);

  const [mode, setMode] = useState<Mode>('sayim');
  const [valueText, setValueText] = useState('0');
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (visible && product) {
      setMode('sayim');
      setValueText(String(product.stock));
      setSaving(false);
      sheetRef.current?.snapToIndex(0);
    } else {
      sheetRef.current?.close();
    }
  }, [visible, product]);

  const renderBackdrop = (props: BottomSheetBackdropProps) => (
    <BottomSheetBackdrop
      {...props}
      appearsOnIndex={0}
      disappearsOnIndex={-1}
      opacity={0.5}
      pressBehavior="close"
    />
  );

  if (!product) {
    return null;
  }

  const value = Math.max(0, Math.round(Number(valueText) || 0));

  const handleChangeMode = (next: Mode) => {
    setMode(next);
    setValueText(next === 'sayim' ? String(product.stock) : '0');
  };

  const step = (delta: number) => {
    setValueText(String(Math.max(0, value + delta)));
  };

  const delta = value - product.stock;

  const handleSave = async () => {
    if (saving) return;

    if (mode === 'sayim') {
      if (delta === 0) return;

      setSaving(true);
      const response = await updateProductStock(product.id, value);
      setSaving(false);

      if (response.res) {
        onUpdated();
        onClose();
      }
      return;
    }

    if (value <= 0) return;

    setSaving(true);
    const response =
      mode === 'giris'
        ? await addProductStockEntry(product.id, value)
        : await updateProductStock(product.id, Math.max(0, product.stock - value));
    setSaving(false);

    if (response.res) {
      onUpdated();
      onClose();
    }
  };

  const canSave = mode === 'sayim' ? delta !== 0 : value > 0;

  const bannerShow = mode === 'sayim' ? delta !== 0 : value > 0;
  const bannerStyle =
    mode === 'sayim' ? S.banner : mode === 'giris' ? [S.banner, S.bannerPositive] : [S.banner, S.bannerNegative];
  const bannerContent =
    mode === 'sayim' ? (
      <>
        <TriangleAlert size={16} color={warning} strokeWidth={2} />
        <View style={S.bannerTextCol}>
          <Text style={S.bannerTitle}>
            {Math.abs(delta)} adet {delta < 0 ? 'eksik' : 'fazla'}
          </Text>
          <Text style={S.bannerSubtitle}>Fark hareket kaydı olarak işlenecek</Text>
        </View>
      </>
    ) : mode === 'giris' ? (
      <>
        <TriangleAlert size={16} color={Colors.secondary} strokeWidth={2} />
        <View style={S.bannerTextCol}>
          <Text style={S.bannerTitle}>{value} adet depoya girecek</Text>
          <Text style={S.bannerSubtitle}>
            Stok {product.stock} → {product.stock + value} olacak
          </Text>
        </View>
      </>
    ) : (
      <>
        <TriangleAlert size={16} color={danger} strokeWidth={2} />
        <View style={S.bannerTextCol}>
          <Text style={[S.bannerTitle, { color: danger }]}>{value} adet fire olarak düşülecek</Text>
          <Text style={S.bannerSubtitle}>
            Stok {product.stock} → {Math.max(0, product.stock - value)} olacak
          </Text>
        </View>
      </>
    );

  return (
    <BottomSheet
      ref={sheetRef}
      index={-1}
      enableDynamicSizing
      maxDynamicContentSize={MAX_SHEET_HEIGHT}
      enablePanDownToClose
      onClose={onClose}
      backdropComponent={renderBackdrop}
      backgroundStyle={S.sheetBg}
      handleIndicatorStyle={S.handleIndicator}
    >
      <BottomSheetScrollView
        contentContainerStyle={S.content}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
      >
        <View style={S.header}>
          <View style={S.headerTextCol}>
            <Text style={S.title}>Stok güncelle</Text>
            <Text style={S.subtitle} numberOfLines={1}>
              {product.name} · {product.sku}
            </Text>
          </View>
          <Pressable style={S.closeBtn} hitSlop={6} onPress={() => sheetRef.current?.close()}>
            <X size={16} color={hexWithAlpha(Colors.secondary, 0.6)} />
          </Pressable>
        </View>

        <View style={S.systemRow}>
          <Text style={S.systemLabel}>Sistemdeki stok</Text>
          <Text style={S.systemValue}>{product.stock}</Text>
        </View>

        <Text style={S.sectionLabel}>Sayılan miktar</Text>
        <View style={S.stepperRow}>
          <Pressable style={S.stepperBtn} onPress={() => step(-1)} hitSlop={6}>
            <Minus size={16} color={Colors.secondary} />
          </Pressable>

          <View style={S.valueBox}>
            <TextInput
              style={S.valueInput}
              value={valueText}
              onChangeText={(text) => setValueText(text.replace(/[^0-9]/g, ''))}
              keyboardType="number-pad"
              textAlign="center"
              maxLength={6}
            />
          </View>

          <Pressable style={S.stepperBtn} onPress={() => step(1)} hitSlop={6}>
            <Plus size={16} color={Colors.secondary} />
          </Pressable>
        </View>

        <Text style={S.sectionLabel}>İşlem türü</Text>
        <View style={S.modeRow}>
          {MODES.map((m) => {
            const on = mode === m.key;
            return (
              <Pressable
                key={m.key}
                style={[S.modeBtn, on && S.modeBtnOn]}
                onPress={() => handleChangeMode(m.key)}
              >
                <Text style={[S.modeTxt, on && S.modeTxtOn]}>{m.label}</Text>
              </Pressable>
            );
          })}
        </View>

        <AnimatedBanner show={bannerShow} style={bannerStyle}>
          {bannerContent}
        </AnimatedBanner>

        <Pressable
          style={[S.saveBtn, !canSave && S.saveBtnDisabled]}
          onPress={handleSave}
          disabled={!canSave || saving}
        >
          <Text style={S.saveTxt}>{saving ? 'Kaydediliyor…' : 'Kaydet'}</Text>
        </Pressable>
      </BottomSheetScrollView>
    </BottomSheet>
  );
}

const S = StyleSheet.create({
  sheetBg: {
    backgroundColor: Colors.canvas,
  },
  handleIndicator: {
    backgroundColor: hexWithAlpha(Colors.secondary, 0.2),
    width: 40,
  },
  content: {
    paddingHorizontal: 18,
    paddingBottom: 22,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    gap: 10,
    marginBottom: 16,
  },
  headerTextCol: {
    flexShrink: 1,
  },
  title: {
    fontSize: 17,
    fontFamily: 'Archivo_800ExtraBold',
    color: Colors.secondary,
  },
  subtitle: {
    fontSize: 12,
    fontFamily: 'Archivo_400Regular',
    color: hexWithAlpha(Colors.secondary, 0.45),
    marginTop: 2,
  },
  closeBtn: {
    width: 32,
    height: 32,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: hexWithAlpha(Colors.secondary, 0.06),
  },
  systemRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: Colors.white,
    borderRadius: 14,
    paddingHorizontal: 16,
    paddingVertical: 14,
    marginBottom: 18,
  },
  systemLabel: {
    fontSize: 13.5,
    fontFamily: 'Archivo_400Regular',
    color: hexWithAlpha(Colors.secondary, 0.5),
  },
  systemValue: {
    fontSize: 18,
    fontFamily: 'Archivo_800ExtraBold',
    color: Colors.secondary,
    fontVariant: ['tabular-nums'],
  },
  sectionLabel: {
    fontSize: 12.5,
    fontFamily: 'Archivo_600SemiBold',
    color: hexWithAlpha(Colors.secondary, 0.5),
    marginBottom: 8,
  },
  stepperRow: {
    flexDirection: 'row',
    alignItems: 'stretch',
    gap: 10,
    marginBottom: 18,
  },
  stepperBtn: {
    width: 46,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: Colors.white,
    borderWidth: 1,
    borderColor: hexWithAlpha(Colors.secondary, 0.08),
  },
  valueBox: {
    flex: 1,
    borderRadius: 14,
    backgroundColor: Colors.white,
    borderWidth: 1.5,
    borderColor: Colors.secondary,
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
  },
  valueInput: {
    width: '100%',
    fontSize: 24,
    lineHeight: 30,
    paddingVertical: 12,
    fontFamily: 'Archivo_800ExtraBold',
    color: Colors.secondary,
    fontVariant: ['tabular-nums'],
  },
  modeRow: {
    flexDirection: 'row',
    gap: 8,
    marginBottom: 16,
  },
  modeBtn: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: Colors.white,
    borderWidth: 1,
    borderColor: hexWithAlpha(Colors.secondary, 0.08),
  },
  modeBtnOn: {
    backgroundColor: Colors.secondary,
    borderColor: Colors.secondary,
  },
  modeTxt: {
    fontSize: 13.5,
    fontFamily: 'Archivo_600SemiBold',
    color: Colors.secondary,
  },
  modeTxtOn: {
    color: Colors.white,
  },
  banner: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 10,
    backgroundColor: hexWithAlpha(warning, 0.12),
    borderRadius: 14,
    padding: 12,
    marginBottom: 16,
  },
  bannerPositive: {
    backgroundColor: hexWithAlpha(Colors.primary, 0.35),
  },
  bannerNegative: {
    backgroundColor: hexWithAlpha(danger, 0.1),
  },
  bannerTextCol: {
    flex: 1,
  },
  bannerTitle: {
    fontSize: 13,
    fontFamily: 'Archivo_600SemiBold',
    color: warning,
    marginBottom: 2,
  },
  bannerSubtitle: {
    fontSize: 12,
    fontFamily: 'Archivo_400Regular',
    color: hexWithAlpha(Colors.secondary, 0.55),
  },
  saveBtn: {
    backgroundColor: Colors.primary,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 15,
  },
  saveBtnDisabled: {
    opacity: 0.4,
  },
  saveTxt: {
    fontSize: 14.5,
    fontFamily: 'Archivo_800ExtraBold',
    color: Colors.secondary,
  },
});

export default StockUpdateSheet;
