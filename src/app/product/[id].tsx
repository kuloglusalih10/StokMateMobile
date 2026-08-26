import { useCallback, useEffect, useState } from 'react';
import { ActivityIndicator, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Image } from 'expo-image';
import {
  ArrowDownToLine,
  ChevronLeft,
  Package,
  PackageX,
  Pencil,
  RefreshCcw,
  Star,
  Tag,
  ToggleLeft,
  Trash2,
  Wallet,
  type LucideIcon,
} from 'lucide-react-native';

import { Colors } from '@/constants';
import { STOCK_STATUS_COLORS, getStockHealth } from '@/constants/stock';
import { formatPriceFromKurus, formatRelativeTime, hexWithAlpha } from '@/utils';
import { toast } from '@/lib/toast';
import { getCategoryVisual, neutralCategoryVisual } from '@/lib/categoryVisuals';
import { getProductById, getProductLogs } from '@/services/products';
import type { ActivityLog, ActivityLogAction, ProductDetail } from '@/services/products';
import { StockUpdateSheet } from '@/components/product/StockUpdateSheet';

const cardColors = {
  border: 'rgba(14, 15, 12, 0.06)',
  textMuted: '#7A7D70',
  textFaint: '#9A9D92',
  warning: '#D08010',
  danger: '#DC2F2F',
  positive: '#4C7A00',
} as const;

const UNIT_LABELS: Record<number, string> = { 1: 'Adet', 2: 'Kg', 3: 'Lt', 4: 'Paket' };

const ACTION_VISUALS: Record<ActivityLogAction, { icon: LucideIcon; bg: string; fg: string }> = {
  Created: { icon: Package, bg: '#F0F0EC', fg: cardColors.textMuted },
  Updated: { icon: Pencil, bg: '#F0F0EC', fg: cardColors.textMuted },
  Deleted: { icon: Trash2, bg: hexWithAlpha(cardColors.danger, 0.12), fg: cardColors.danger },
  StockIn: { icon: ArrowDownToLine, bg: hexWithAlpha(Colors.primary, 0.4), fg: cardColors.positive },
  StockAdjusted: { icon: RefreshCcw, bg: hexWithAlpha(cardColors.warning, 0.15), fg: cardColors.warning },
  PriceChanged: { icon: Tag, bg: '#E4EEFB', fg: '#1F5896' },
  CostPriceChanged: { icon: Wallet, bg: '#E4EEFB', fg: '#1F5896' },
  StatusChanged: { icon: ToggleLeft, bg: '#F0F0EC', fg: cardColors.textMuted },
  FeaturedChanged: { icon: Star, bg: hexWithAlpha(Colors.primary, 0.4), fg: cardColors.positive },
};

const STATUS_TONE = {
  healthy: { label: 'Eşiğin üzerinde', bg: hexWithAlpha(Colors.primary, 0.35), fg: cardColors.positive },
  low: { label: 'Kritik eşikte', bg: hexWithAlpha(STOCK_STATUS_COLORS.low, 0.15), fg: STOCK_STATUS_COLORS.low },
  out: { label: 'Stok tükendi', bg: hexWithAlpha(STOCK_STATUS_COLORS.out, 0.15), fg: STOCK_STATUS_COLORS.out },
} as const;

const getStockScale = (stock: number, minStock: number) => {
  const raw = Math.max(stock * 1.2, minStock * 4, 40);
  return Math.ceil(raw / 20) * 20;
};

export default function ProductDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const productId = Number(id);

  const [product, setProduct] = useState<ProductDetail | null>(null);
  const [logs, setLogs] = useState<ActivityLog[]>([]);
  const [loading, setLoading] = useState(true);
  const [sheetVisible, setSheetVisible] = useState(false);

  const load = useCallback(async () => {
    const [productRes, logsRes] = await Promise.all([
      getProductById(productId),
      getProductLogs(productId, 5),
    ]);

    if (productRes.res) {
      setProduct(productRes.data);
    } else {
      toast.error(productRes.message);
    }

    if (logsRes.res) {
      setLogs(logsRes.data);
    }

    setLoading(false);
  }, [productId]);

  useEffect(() => {
    load();
  }, [load]);

  const handleUpdated = () => {
    toast.success('Stok güncellendi');
    load();
  };

  if (loading || !product) {
    return (
      <View style={[S.screen, S.center]}>
        <ActivityIndicator color={Colors.secondary} />
      </View>
    );
  }

  const health = getStockHealth(product.stock, product.minStock);
  const isOut = health === 'out';
  const tone = STATUS_TONE[health];
  const category = isOut ? neutralCategoryVisual : getCategoryVisual(product.categoryName);
  const CategoryIcon = isOut ? PackageX : category.icon;
  const unitLabel = UNIT_LABELS[product.unit] ?? 'Adet';

  const scale = getStockScale(product.stock, product.minStock);
  const fillPct = Math.min(1, product.stock / scale) * 100;
  const thresholdPct = Math.min(1, product.minStock / scale) * 100;

  const margin = product.price > 0 ? Math.round(((product.price - product.costPrice) / product.price) * 100) : 0;
  const stockCostKurus = product.costPrice * product.stock;
  const stockSaleKurus = product.price * product.stock;
  const potentialKurus = stockSaleKurus - stockCostKurus;

  return (
    <View style={S.screen}>
      <ScrollView contentContainerStyle={S.scrollContent} showsVerticalScrollIndicator={false}>
        <View style={[S.header, { paddingTop: insets.top + 10 }]}>
          <View style={S.headerTop}>
            <Pressable style={S.iconBtn} hitSlop={6} onPress={() => router.back()}>
              <ChevronLeft size={18} color={Colors.white} />
            </Pressable>
            <Text style={S.headerSku} numberOfLines={1}>
              {product.sku}
            </Text>
            <View style={S.iconBtnSpacer} />
          </View>

          <View style={S.productRow}>
            <View style={[S.thumb, { backgroundColor: category.bg }]}>
              {product.imageUrl ? (
                <Image
                  source={{ uri: product.imageUrl }}
                  style={S.thumbImage}
                  contentFit="cover"
                  transition={150}
                />
              ) : (
                <CategoryIcon size={24} color={category.fg} strokeWidth={1.75} />
              )}
            </View>

            <View style={S.productTextCol}>
              <View style={S.badgeRow}>
                <View style={S.categoryBadge}>
                  <Text style={S.categoryBadgeTxt} numberOfLines={1}>
                    {product.categoryName}
                  </Text>
                </View>
                {product.isFeatured ? (
                  <View style={S.featuredBadge}>
                    <Text style={S.featuredBadgeTxt}>Öne çıkan</Text>
                  </View>
                ) : null}
              </View>

              <Text style={S.productName} numberOfLines={2}>
                {product.name}
              </Text>
              <Text style={S.productSubtitle} numberOfLines={1}>
                {product.brandName} · {unitLabel}
              </Text>
            </View>
          </View>

          <View style={S.priceRow}>
            <View style={S.priceCol}>
              <Text style={S.priceLabel}>Satış fiyatı</Text>
              <Text style={S.priceValue}>₺{formatPriceFromKurus(product.price)}</Text>
            </View>
            <View style={S.priceCol}>
              <Text style={S.priceLabel}>Maliyet</Text>
              <Text style={S.priceValue}>₺{formatPriceFromKurus(product.costPrice)}</Text>
            </View>
            <View style={S.priceCol}>
              <Text style={S.priceLabel}>Marj</Text>
              <Text style={[S.priceValue, S.priceValueAccent]}>%{margin}</Text>
            </View>
          </View>
        </View>

        <View style={S.body}>
          <View style={S.stockCard}>
            <View style={S.stockCardTop}>
              <Text style={S.stockCardLabel}>Mevcut stok</Text>
              <View style={[S.statusPill, { backgroundColor: tone.bg }]}>
                <Text style={[S.statusPillTxt, { color: tone.fg }]}>{tone.label}</Text>
              </View>
            </View>

            <View style={S.stockValueRow}>
              <Text style={S.stockValue}>{product.stock}</Text>
              <Text style={S.stockUnit}>{unitLabel.toLowerCase()}</Text>
            </View>

            <View style={S.progressTrack}>
              <View style={[S.progressFill, { width: `${fillPct}%` }]} />
              <View style={[S.progressTick, { left: `${thresholdPct}%` }]} />
            </View>

            <View style={S.progressLegend}>
              <Text style={S.progressLegendTxt}>
                Kritik eşik · <Text style={S.progressLegendStrong}>{product.minStock}</Text>
              </Text>
              <Text style={S.progressLegendTxt}>
                Ölçek · <Text style={S.progressLegendStrong}>{scale}</Text>
              </Text>
            </View>
          </View>

          <View style={S.statsRow}>
            <View style={S.statCard}>
              <Text style={S.statLabel}>Stok maliyeti</Text>
              <Text style={S.statValue} numberOfLines={1}>
                ₺{formatPriceFromKurus(stockCostKurus)}
              </Text>
            </View>
            <View style={S.statCard}>
              <Text style={S.statLabel}>Satış değeri</Text>
              <Text style={S.statValue} numberOfLines={1}>
                ₺{formatPriceFromKurus(stockSaleKurus)}
              </Text>
            </View>
            <View style={S.statCard}>
              <Text style={S.statLabel}>Potansiyel</Text>
              <Text style={[S.statValue, S.statValueAccent]} numberOfLines={1}>
                ₺{formatPriceFromKurus(potentialKurus)}
              </Text>
            </View>
          </View>

          <View style={S.infoCard}>
            <Text style={S.infoCardTitle}>Künye</Text>

            <View style={S.infoRow}>
              <Text style={S.infoLabel}>Barkod</Text>
              <Text style={S.infoValue} numberOfLines={1}>
                {product.barcode || '—'}
              </Text>
            </View>
            <View style={S.hr} />
            <View style={S.infoRow}>
              <Text style={S.infoLabel}>Tedarikçi</Text>
              <Text style={S.infoValue} numberOfLines={1}>
                {product.supplierName}
              </Text>
            </View>
            <View style={S.hr} />
            <View style={S.infoRow}>
              <Text style={S.infoLabel}>Marka</Text>
              <Text style={S.infoValue} numberOfLines={1}>
                {product.brandName}
              </Text>
            </View>
          </View>

          {product.description ? (
            <View style={S.infoCard}>
              <Text style={S.infoCardTitle}>Açıklama</Text>
              <Text style={S.descriptionTxt}>{product.description}</Text>
            </View>
          ) : null}

          <View style={S.infoCard}>
            <Text style={S.infoCardTitle}>Son hareketler</Text>

            {logs.length === 0 ? (
              <Text style={S.emptyLogsTxt}>Henüz hareket kaydı yok.</Text>
            ) : (
              logs.map((log, index) => {
                const visual = ACTION_VISUALS[log.action] ?? ACTION_VISUALS.Updated;
                const LogIcon = visual.icon;

                return (
                  <View key={log.id}>
                    {index > 0 ? <View style={S.hr} /> : null}
                    <View style={S.logRow}>
                      <View style={[S.logIcon, { backgroundColor: visual.bg }]}>
                        <LogIcon size={15} color={visual.fg} strokeWidth={2} />
                      </View>
                      <View style={S.logTextCol}>
                        <Text style={S.logDescription} numberOfLines={1}>
                          {log.description}
                        </Text>
                        <Text style={S.logDate}>{formatRelativeTime(log.createdAt)}</Text>
                      </View>
                      {log.quantityDelta !== null ? (
                        <Text
                          style={[
                            S.logDelta,
                            { color: log.quantityDelta < 0 ? cardColors.danger : cardColors.positive },
                          ]}
                        >
                          {log.quantityDelta > 0 ? '+' : ''}
                          {log.quantityDelta}
                        </Text>
                      ) : log.amountKurus !== null ? (
                        <Text style={S.logDelta}>₺{formatPriceFromKurus(log.amountKurus)}</Text>
                      ) : null}
                    </View>
                  </View>
                );
              })
            )}
          </View>
        </View>
      </ScrollView>

      <View style={[S.footer, { paddingBottom: insets.bottom + 12 }]}>
        <Pressable style={S.updateBtn} onPress={() => setSheetVisible(true)}>
          <Text style={S.updateBtnTxt}>Stok güncelle</Text>
        </Pressable>
      </View>

      <StockUpdateSheet
        visible={sheetVisible}
        product={product}
        onClose={() => setSheetVisible(false)}
        onUpdated={handleUpdated}
      />
    </View>
  );
}

const S = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: Colors.canvas,
  },
  center: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  scrollContent: {
    paddingBottom: 120,
  },
  header: {
    backgroundColor: Colors.secondary,
    paddingHorizontal: 16,
    paddingBottom: 18,
    borderBottomLeftRadius: 20,
    borderBottomRightRadius: 20,
  },
  headerTop: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 16,
  },
  iconBtn: {
    width: 32,
    height: 32,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(255,255,255,0.08)',
  },
  iconBtnSpacer: {
    width: 32,
    height: 32,
  },
  headerSku: {
    fontSize: 12.5,
    fontFamily: 'Archivo_600SemiBold',
    color: hexWithAlpha(Colors.canvas, 0.55),
    letterSpacing: 0.4,
  },
  productRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    marginBottom: 18,
  },
  thumb: {
    width: 56,
    height: 56,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
  },
  thumbImage: {
    width: '100%',
    height: '100%',
  },
  productTextCol: {
    flex: 1,
    minWidth: 0,
  },
  badgeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginBottom: 6,
  },
  categoryBadge: {
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
    backgroundColor: 'rgba(255,255,255,0.08)',
    flexShrink: 1,
  },
  categoryBadgeTxt: {
    fontSize: 11,
    lineHeight: 14,
    fontFamily: 'Archivo_600SemiBold',
    color: hexWithAlpha(Colors.canvas, 0.8),
  },
  featuredBadge: {
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
    backgroundColor: hexWithAlpha(Colors.primary, 0.16),
  },
  featuredBadgeTxt: {
    fontSize: 11,
    lineHeight: 14,
    fontFamily: 'Archivo_600SemiBold',
    color: Colors.primary,
  },
  productName: {
    fontSize: 16.5,
    lineHeight: 21,
    fontFamily: 'Archivo_800ExtraBold',
    color: Colors.white,
    marginBottom: 3,
  },
  productSubtitle: {
    fontSize: 12.5,
    fontFamily: 'Archivo_400Regular',
    color: hexWithAlpha(Colors.canvas, 0.45),
  },
  priceRow: {
    flexDirection: 'row',
    backgroundColor: 'rgba(255,255,255,0.06)',
    borderRadius: 14,
    paddingVertical: 12,
  },
  priceCol: {
    flex: 1,
    alignItems: 'center',
    gap: 4,
  },
  priceLabel: {
    fontSize: 11,
    fontFamily: 'Archivo_400Regular',
    color: hexWithAlpha(Colors.canvas, 0.45),
  },
  priceValue: {
    fontSize: 14.5,
    fontFamily: 'Archivo_800ExtraBold',
    color: Colors.white,
  },
  priceValueAccent: {
    color: Colors.primary,
  },
  body: {
    paddingHorizontal: 14,
    paddingTop: 14,
    gap: 12,
  },
  stockCard: {
    backgroundColor: Colors.white,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: cardColors.border,
    padding: 16,
  },
  stockCardTop: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 10,
  },
  stockCardLabel: {
    fontSize: 13,
    fontFamily: 'Archivo_400Regular',
    color: cardColors.textMuted,
  },
  statusPill: {
    paddingHorizontal: 9,
    paddingVertical: 3,
    borderRadius: 999,
  },
  statusPillTxt: {
    fontSize: 11,
    fontFamily: 'Archivo_600SemiBold',
  },
  stockValueRow: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    gap: 5,
    marginBottom: 12,
  },
  stockValue: {
    fontSize: 30,
    lineHeight: 34,
    fontFamily: 'Archivo_800ExtraBold',
    color: Colors.secondary,
    fontVariant: ['tabular-nums'],
  },
  stockUnit: {
    fontSize: 13,
    fontFamily: 'Archivo_400Regular',
    color: cardColors.textMuted,
    marginBottom: 4,
  },
  progressTrack: {
    height: 8,
    borderRadius: 4,
    backgroundColor: hexWithAlpha(Colors.secondary, 0.08),
    overflow: 'visible',
    marginBottom: 8,
  },
  progressFill: {
    height: 8,
    borderRadius: 4,
    backgroundColor: Colors.secondary,
  },
  progressTick: {
    position: 'absolute',
    top: -3,
    width: 2,
    height: 14,
    borderRadius: 1,
    backgroundColor: cardColors.warning,
  },
  progressLegend: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  progressLegendTxt: {
    fontSize: 11.5,
    fontFamily: 'Archivo_400Regular',
    color: cardColors.textFaint,
  },
  progressLegendStrong: {
    fontFamily: 'Archivo_600SemiBold',
    color: cardColors.textMuted,
  },
  statsRow: {
    flexDirection: 'row',
    gap: 10,
  },
  statCard: {
    flex: 1,
    backgroundColor: Colors.white,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: cardColors.border,
    paddingVertical: 12,
    paddingHorizontal: 10,
    gap: 5,
  },
  statLabel: {
    fontSize: 10.5,
    fontFamily: 'Archivo_400Regular',
    color: cardColors.textMuted,
  },
  statValue: {
    fontSize: 13.5,
    fontFamily: 'Archivo_800ExtraBold',
    color: Colors.secondary,
  },
  statValueAccent: {
    color: cardColors.positive,
  },
  infoCard: {
    backgroundColor: Colors.white,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: cardColors.border,
    padding: 16,
  },
  infoCardTitle: {
    fontSize: 14.5,
    fontFamily: 'Archivo_800ExtraBold',
    color: Colors.secondary,
    marginBottom: 10,
  },
  infoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 9,
    gap: 10,
  },
  infoLabel: {
    fontSize: 13,
    fontFamily: 'Archivo_400Regular',
    color: cardColors.textMuted,
  },
  infoValue: {
    fontSize: 13,
    fontFamily: 'Archivo_600SemiBold',
    color: Colors.secondary,
    flexShrink: 1,
    textAlign: 'right',
  },
  hr: {
    height: 1,
    backgroundColor: cardColors.border,
  },
  descriptionTxt: {
    fontSize: 13,
    lineHeight: 19,
    fontFamily: 'Archivo_400Regular',
    color: cardColors.textMuted,
  },
  emptyLogsTxt: {
    fontSize: 13,
    fontFamily: 'Archivo_400Regular',
    color: cardColors.textFaint,
  },
  logRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    paddingVertical: 10,
  },
  logIcon: {
    width: 32,
    height: 32,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
  },
  logTextCol: {
    flex: 1,
    minWidth: 0,
  },
  logDescription: {
    fontSize: 13,
    fontFamily: 'Archivo_600SemiBold',
    color: Colors.secondary,
    marginBottom: 2,
  },
  logDate: {
    fontSize: 11,
    fontFamily: 'Archivo_400Regular',
    color: cardColors.textFaint,
  },
  logDelta: {
    fontSize: 13,
    fontFamily: 'Archivo_800ExtraBold',
    color: Colors.secondary,
    fontVariant: ['tabular-nums'],
  },
  footer: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: Colors.canvas,
    paddingHorizontal: 14,
    paddingTop: 10,
    borderTopWidth: 1,
    borderTopColor: cardColors.border,
  },
  updateBtn: {
    backgroundColor: Colors.primary,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 15,
  },
  updateBtnTxt: {
    fontSize: 14.5,
    fontFamily: 'Archivo_800ExtraBold',
    color: Colors.secondary,
  },
});
