import { useCallback, useEffect, useRef, type ElementRef } from 'react';
import { Alert, Pressable, StyleSheet, Text, View } from 'react-native';
import BottomSheet, {
  BottomSheetBackdrop,
  BottomSheetFlatList,
  type BottomSheetBackdropProps,
} from '@gorhom/bottom-sheet';
import { Check, LayoutGrid, X, type LucideIcon } from 'lucide-react-native';

import { Colors } from '@/constants';
import { neutralCategoryVisual } from '@/lib/categoryVisuals';
import { hexWithAlpha } from '@/utils';

export type FilterOption = {
  id: number;
  name: string;
  count: number;
  icon?: LucideIcon;
  iconBg?: string;
  iconFg?: string;
};

type Props = {
  visible: boolean;
  title: string;
  options: FilterOption[];
  selectedId: number | null;
  onSelect: (id: number | null) => void;
  onClose: () => void;
};

const MUTED = hexWithAlpha(Colors.secondary, 0.45);
const SNAP_POINTS = ['65%'];

export function FilterSheet({ visible, title, options, selectedId, onSelect, onClose }: Props) {
  const sheetRef = useRef<ElementRef<typeof BottomSheet>>(null);

  useEffect(() => {
    if (!sheetRef.current) {
      if (visible) {
        Alert.alert('[Debug]', `${title}: sheetRef.current is NULL.`);
      }
      return;
    }

    try {
      if (visible) {
        sheetRef.current.snapToIndex(0);
      } else {
        sheetRef.current.close();
      }
    } catch (err) {
      Alert.alert('[Debug]', `${title}: snapToIndex/close threw: ${String(err)}`);
    }
  }, [visible, title]);

  const renderBackdrop = useCallback(
    (props: BottomSheetBackdropProps) => (
      <BottomSheetBackdrop
        {...props}
        appearsOnIndex={0}
        disappearsOnIndex={-1}
        opacity={0.5}
        pressBehavior="close"
      />
    ),
    []
  );

  const handleSelect = (id: number | null) => {
    onSelect(id);
    onClose();
  };

  const totalCount = options.reduce((sum, o) => sum + o.count, 0);

  const renderRow = (
    id: number | null,
    name: string,
    count: number,
    icon: LucideIcon | undefined,
    iconBg: string | undefined,
    iconFg: string | undefined
  ) => {
    const isSelected = selectedId === id;
    const Icon = icon ?? (id === null ? LayoutGrid : undefined);
    const bg = iconBg ?? neutralCategoryVisual.bg;
    const fg = iconFg ?? neutralCategoryVisual.fg;
    const initial = name.charAt(0).toUpperCase();

    return (
      <Pressable
        key={id ?? 'all'}
        style={[S.row, isSelected && S.rowSelected]}
        onPress={() => handleSelect(id)}
      >
        <View style={[S.swatch, { backgroundColor: bg }]}>
          {Icon ? (
            <Icon size={19} color={fg} strokeWidth={2} />
          ) : (
            <Text style={[S.swatchInitial, { color: fg }]}>{initial}</Text>
          )}
        </View>
        <Text style={[S.rowTxt, isSelected && S.rowTxtOn]} numberOfLines={1}>
          {name}
        </Text>
        <Text style={S.rowCount}>{count}</Text>
        {isSelected ? (
          <View style={S.selectedBadge}>
            <Check size={14} color={Colors.secondary} strokeWidth={3} />
          </View>
        ) : (
          <View style={S.selectedBadgePlaceholder} />
        )}
      </Pressable>
    );
  };

  return (
    <BottomSheet
      ref={sheetRef}
      index={-1}
      snapPoints={SNAP_POINTS}
      enableDynamicSizing={false}
      enablePanDownToClose
      onClose={onClose}
      backdropComponent={renderBackdrop}
      backgroundStyle={S.sheetBg}
      handleIndicatorStyle={S.handleIndicator}
    >
      <View style={S.header}>
        <Text style={S.headerTxt}>{title}</Text>
        <View style={S.headerActions}>
          <Pressable hitSlop={10} onPress={() => onSelect(null)}>
            <Text style={S.resetTxt}>Sıfırla</Text>
          </Pressable>
          <Pressable style={S.closeBtn} hitSlop={6} onPress={() => sheetRef.current?.close()}>
            <X size={16} color={hexWithAlpha(Colors.secondary, 0.6)} />
          </Pressable>
        </View>
      </View>

      <BottomSheetFlatList
        data={options}
        keyExtractor={(item) => String(item.id)}
        ListHeaderComponent={() => renderRow(null, 'Tümü', totalCount, undefined, undefined, undefined)}
        renderItem={({ item }) => renderRow(item.id, item.name, item.count, item.icon, item.iconBg, item.iconFg)}
        contentContainerStyle={S.listContent}
      />
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
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 18,
    paddingBottom: 14,
  },
  headerTxt: {
    fontSize: 18,
    fontFamily: 'Archivo_800ExtraBold',
    color: Colors.secondary,
  },
  headerActions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14,
  },
  resetTxt: {
    fontSize: 13.5,
    fontFamily: 'Archivo_400Regular',
    color: MUTED,
  },
  closeBtn: {
    width: 34,
    height: 34,
    borderRadius: 17,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: hexWithAlpha(Colors.secondary, 0.06),
  },
  listContent: {
    paddingHorizontal: 14,
    paddingBottom: 24,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    paddingVertical: 6,
    paddingHorizontal: 8,
    borderRadius: 14,
    marginBottom: 2,
  },
  rowSelected: {
    backgroundColor: Colors.white,
    shadowColor: Colors.secondary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.08,
    shadowRadius: 12,
    elevation: 2,
  },
  swatch: {
    width: 40,
    height: 40,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
  },
  swatchInitial: {
    fontSize: 15,
    fontFamily: 'Archivo_600SemiBold',
  },
  rowTxt: {
    flex: 1,
    fontSize: 14.5,
    fontFamily: 'Archivo_400Regular',
    color: hexWithAlpha(Colors.secondary, 0.8),
  },
  rowTxtOn: {
    fontFamily: 'Archivo_600SemiBold',
    color: Colors.secondary,
  },
  rowCount: {
    fontSize: 12,
    fontFamily: 'Archivo_400Regular',
    color: MUTED,
  },
  selectedBadge: {
    width: 26,
    height: 26,
    borderRadius: 13,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: Colors.primary,
  },
  selectedBadgePlaceholder: {
    width: 26,
  },
});
