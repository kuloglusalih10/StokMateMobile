import { useCallback, useEffect, useRef, useState } from 'react';
import {
  ActivityIndicator,
  FlatList,
  Pressable,
  RefreshControl,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { ChevronDown, LogOut, Package, Search } from 'lucide-react-native';

import { Colors } from '@/constants';
import { STOCK_STATUS_COLORS } from '@/constants/stock';
import { hexWithAlpha } from '@/utils';
import { toast } from '@/lib/toast';
import { logout } from '@/services/auth';
import { useAuthStore } from '@/store/auth';
import { getProducts, getProductsBreakdown } from '@/services/products';
import type { FilterOption, Product, ProductsBreakdown, StockStatus } from '@/types';
import { ProductCard } from '@/components/home/ProductCard';
import { ConfirmModal } from '@/components/ui/ConfirmModal';
import { FilterSheet } from '@/components/home/FilterSheet';
import { getCategoryVisual } from '@/lib/categoryVisuals';
import StokMateIcon from '@/assets/images/logo/stokmate-icon-black.svg';

const PAGE_SIZE = 20;
type StockFilter = 'all' | StockStatus;

const getInitials = (fullName?: string) => {
  if (!fullName) return '?';

  const initials = fullName
    .trim()
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase() ?? '')
    .join('');

  return initials || '?';
};

export default function Home() {
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const user = useAuthStore((state) => state.user);
  const refreshToken = useAuthStore((state) => state.refreshToken);
  const signOut = useAuthStore((state) => state.signOut);

  const [searchInput, setSearchInput] = useState('');
  const [search, setSearch] = useState('');
  const [categoryId, setCategoryId] = useState<number | null>(null);
  const [brandId, setBrandId] = useState<number | null>(null);
  const [stockFilter, setStockFilter] = useState<StockFilter>('all');

  const [categorySheetOpen, setCategorySheetOpen] = useState(false);
  const [brandSheetOpen, setBrandSheetOpen] = useState(false);
  const [signOutModalVisible, setSignOutModalVisible] = useState(false);

  const [breakdown, setBreakdown] = useState<ProductsBreakdown | null>(null);

  const [products, setProducts] = useState<Product[]>([]);
  const [page, setPage] = useState(1);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [refreshing, setRefreshing] = useState(false);

  const requestId = useRef(0);
  const hasLoadedOnce = useRef(false);

  useEffect(() => {
    const timeout = setTimeout(() => setSearch(searchInput.trim()), 400);
    return () => clearTimeout(timeout);
  }, [searchInput]);

  const loadBreakdown = useCallback(async () => {
    const response = await getProductsBreakdown({
      categoryId: categoryId ?? undefined,
      brandId: brandId ?? undefined,
    });

    if (response.res) {
      setBreakdown(response.data);
    }
  }, [categoryId, brandId]);

  const loadProducts = useCallback(
    async (pageNum: number, replace: boolean) => {
      const currentRequest = ++requestId.current;

      if (replace) {
        setLoading(pageNum === 1 && !hasLoadedOnce.current);
      } else {
        setLoadingMore(true);
      }

      const response = await getProducts({
        q: search || undefined,
        categoryId: categoryId ?? undefined,
        brandId: brandId ?? undefined,
        stockStatus: stockFilter === 'all' ? undefined : stockFilter,
        page: pageNum,
        pageSize: PAGE_SIZE,
        sort: 'updatedAt',
        dir: 'desc',
      });

      if (currentRequest !== requestId.current) {
        return;
      }

      if (response.res) {
        setProducts((prev) => (replace ? response.data.items : [...prev, ...response.data.items]));
        setTotal(response.data.total);
        setPage(pageNum);
      } else {
        toast.error(response.message);
      }

      hasLoadedOnce.current = true;
      setLoading(false);
      setLoadingMore(false);
      setRefreshing(false);
    },
    [search, categoryId, brandId, stockFilter]
  );

  useEffect(() => {
    loadProducts(1, true);
  }, [search, categoryId, brandId, stockFilter]);

  useEffect(() => {
    loadBreakdown();
  }, [loadBreakdown]);

  const handleRefresh = () => {
    setRefreshing(true);
    loadBreakdown();
    loadProducts(1, true);
  };

  const handleLoadMore = () => {
    if (loading || loadingMore || refreshing) return;
    if (products.length >= total) return;

    loadProducts(page + 1, false);
  };

  const handleSignOut = async () => {
    setSignOutModalVisible(false);

    if (refreshToken) {
      await logout(refreshToken);
    }

    signOut();
  };

  const categoryOptions: FilterOption[] =
    breakdown?.byCategory.map((c) => {
      const visual = getCategoryVisual(c.categoryName);

      return {
        id: c.categoryId,
        name: c.categoryName,
        count: c.productCount,
        icon: visual.icon,
        iconBg: visual.bg,
        iconFg: visual.fg,
      };
    }) ?? [];

  const brandOptions: FilterOption[] =
    breakdown?.byBrand.map((b) => ({
      id: b.brandId,
      name: b.brandName,
      count: b.productCount,
    })) ?? [];

  const selectedCategoryName = categoryOptions.find((c) => c.id === categoryId)?.name;
  const selectedBrandName = brandOptions.find((b) => b.id === brandId)?.name;

  const totalCount = breakdown?.totalProducts ?? total;
  const lowStockCount = breakdown?.lowStockCount ?? 0;
  const outOfStockCount = breakdown?.outOfStockCount ?? 0;

  return (
    <View style={S.screen}>
      <View style={[S.header, { paddingTop: insets.top + 10 }]}>
        <View style={S.headerTop}>
          <View style={S.brand}>
            <View style={S.brandIcon}>
              <StokMateIcon width={20} height={22} />
            </View>
            <View style={S.brandTextCol}>
              <Text style={S.brandTitle} numberOfLines={1}>
                <Text style={S.brandTitleStok}>Stok</Text>
                <Text style={S.brandTitleMate}>Mate</Text>
              </Text>
              <Text style={S.brandSubtitle} numberOfLines={1}>
                Depo 01 · Saha
              </Text>
            </View>
          </View>

          <Pressable style={S.accountPill} hitSlop={4} onPress={() => setSignOutModalVisible(true)}>
            <View style={S.avatar}>
              <Text style={S.avatarTxt}>{getInitials(user?.fullName)}</Text>
            </View>
            <Text style={S.accountName} numberOfLines={1}>
              {user?.fullName?.split(' ')[0] ?? 'Hesap'}
            </Text>
            <LogOut size={15} color={hexWithAlpha(Colors.canvas, 0.45)} />
          </Pressable>
        </View>

        <View style={S.panel}>
          <View style={S.row}>
            <TextInput
              style={S.input}
              placeholder="Ürün adı, SKU veya barkod ara"
              placeholderTextColor={hexWithAlpha(Colors.canvas, 0.35)}
              value={searchInput}
              onChangeText={setSearchInput}
              returnKeyType="search"
              autoCapitalize="none"
              autoCorrect={false}
            />
            <Search size={18} color={Colors.primary} />
          </View>

          <View style={S.hr} />

          <View style={S.row}>
            <Pressable style={S.dropdown} onPress={() => { console.log('[Home] category dropdown tapped'); setCategorySheetOpen(true); }}>
              <Text style={S.dropdownTxt} numberOfLines={1}>
                {selectedCategoryName ?? 'Tüm kategoriler'}
              </Text>
              <ChevronDown size={16} color={hexWithAlpha(Colors.canvas, 0.4)} />
            </Pressable>

            <View style={S.vr} />

            <Pressable style={S.dropdown} onPress={() => { console.log('[Home] brand dropdown tapped'); setBrandSheetOpen(true); }}>
              <Text style={S.dropdownTxt} numberOfLines={1}>
                {selectedBrandName ?? 'Tüm markalar'}
              </Text>
              <ChevronDown size={16} color={hexWithAlpha(Colors.canvas, 0.4)} />
            </Pressable>
          </View>
        </View>

        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          style={S.chipsScroll}
          contentContainerStyle={S.chipsRow}
        >
          <Pressable
            style={[S.chip, stockFilter === 'all' && S.chipOn]}
            onPress={() => setStockFilter('all')}
          >
            <Text style={[S.chipTxt, stockFilter === 'all' && S.chipTxtOn]}>Tüm ürünler</Text>
            <Text style={[S.chipCount, stockFilter === 'all' && S.chipCountOn]}>{totalCount}</Text>
          </Pressable>

          <Pressable
            style={[S.chip, stockFilter === 'low' && S.chipOn]}
            onPress={() => setStockFilter('low')}
          >
            <View style={[S.dot, { backgroundColor: STOCK_STATUS_COLORS.low }]} />
            <Text style={[S.chipTxt, stockFilter === 'low' && S.chipTxtOn]}>Kritik stok</Text>
            <Text style={[S.chipCount, stockFilter === 'low' && S.chipCountOn]}>{lowStockCount}</Text>
          </Pressable>

          <Pressable
            style={[S.chip, stockFilter === 'out' && S.chipOn]}
            onPress={() => setStockFilter('out')}
          >
            <View style={[S.dot, { backgroundColor: STOCK_STATUS_COLORS.out }]} />
            <Text style={[S.chipTxt, stockFilter === 'out' && S.chipTxtOn]}>Stok tükendi</Text>
            <Text style={[S.chipCount, stockFilter === 'out' && S.chipCountOn]}>{outOfStockCount}</Text>
          </Pressable>
        </ScrollView>
      </View>

      {loading ? (
        <View style={S.center}>
          <ActivityIndicator color={Colors.secondary} />
        </View>
      ) : (
        <FlatList
          data={products}
          keyExtractor={(item) => String(item.id)}
          renderItem={({ item }) => (
            <ProductCard product={item} onPress={(p) => router.push(`/product/${p.id}`)} />
          )}
          contentContainerStyle={S.listContent}
          ItemSeparatorComponent={() => <View style={{ height: 10 }} />}
          onEndReachedThreshold={0.4}
          onEndReached={handleLoadMore}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={handleRefresh}
              tintColor={Colors.secondary}
            />
          }
          ListEmptyComponent={
            <View style={S.empty}>
              <Package size={32} color={hexWithAlpha(Colors.secondary, 0.3)} />
              <Text style={S.emptyTxt}>Ürün bulunamadı</Text>
            </View>
          }
          ListFooterComponent={
            loadingMore ? (
              <View style={{ paddingVertical: 18 }}>
                <ActivityIndicator color={Colors.secondary} />
              </View>
            ) : null
          }
        />
      )}

      <FilterSheet
        visible={categorySheetOpen}
        title="Kategori seç"
        options={categoryOptions}
        selectedId={categoryId}
        onSelect={setCategoryId}
        onClose={() => setCategorySheetOpen(false)}
      />

      <FilterSheet
        visible={brandSheetOpen}
        title="Marka seç"
        options={brandOptions}
        selectedId={brandId}
        onSelect={setBrandId}
        onClose={() => setBrandSheetOpen(false)}
      />

      <ConfirmModal
        visible={signOutModalVisible}
        title="Çıkış yap"
        message="Hesabından çıkış yapmak istediğine emin misin?"
        cancelText="Vazgeç"
        confirmText="Çıkış Yap"
        destructive
        onCancel={() => setSignOutModalVisible(false)}
        onConfirm={handleSignOut}
      />
    </View>
  );
}

const S = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: Colors.canvas,
  },
  header: {
    backgroundColor: Colors.secondary,
    paddingHorizontal: 14,
    paddingBottom: 16,
    borderBottomLeftRadius: 20,
    borderBottomRightRadius: 20,
  },
  headerTop: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 2,
    marginBottom: 14,
  },
  brand: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    flexShrink: 1,
  },
  brandIcon: {
    width: 38,
    height: 38,
    borderRadius: 12,
    backgroundColor: Colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  brandTextCol: {
    flexShrink: 1,
    justifyContent: 'center',
  },
  brandTitle: {
    fontSize: 17,
    lineHeight: 20,
  },
  brandTitleStok: {
    fontFamily: 'Archivo_800ExtraBold',
    color: Colors.white,
  },
  brandTitleMate: {
    fontFamily: 'Archivo_800ExtraBold',
    color: Colors.primary,
  },
  brandSubtitle: {
    fontSize: 11.5,
    fontFamily: 'Archivo_400Regular',
    color: hexWithAlpha(Colors.canvas, 0.45),
    marginTop: 1,
  },
  accountPill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 7,
    backgroundColor: 'rgba(255,255,255,0.07)',
    borderRadius: 999,
    paddingLeft: 4,
    paddingRight: 10,
    paddingVertical: 4,
  },
  avatar: {
    width: 26,
    height: 26,
    borderRadius: 13,
    backgroundColor: hexWithAlpha(Colors.primary, 0.18),
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarTxt: {
    fontSize: 11,
    fontFamily: 'Archivo_600SemiBold',
    color: Colors.primary,
  },
  accountName: {
    fontSize: 13.5,
    fontFamily: 'Archivo_600SemiBold',
    color: Colors.white,
    maxWidth: 90,
  },
  panel: {
    backgroundColor: 'rgba(255,255,255,0.07)',
    borderRadius: 16,
    overflow: 'hidden',
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 14,
    height: 48,
    gap: 10,
  },
  hr: {
    height: 1,
    backgroundColor: 'rgba(255,255,255,0.10)',
  },
  vr: {
    width: 1,
    backgroundColor: 'rgba(255,255,255,0.10)',
    marginVertical: 12,
  },
  input: {
    flex: 1,
    fontSize: 14,
    fontFamily: 'Archivo_400Regular',
    color: Colors.white,
    padding: 0,
  },
  dropdown: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 6,
  },
  dropdownTxt: {
    flexShrink: 1,
    fontSize: 13.5,
    fontFamily: 'Archivo_400Regular',
    color: hexWithAlpha(Colors.canvas, 0.85),
  },
  chipsScroll: {
    marginTop: 12,
  },
  chipsRow: {
    gap: 10,
    paddingRight: 4,
  },
  chip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 7,
    borderRadius: 999,
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.16)',
  },
  chipOn: {
    backgroundColor: Colors.primary,
    borderColor: Colors.primary,
  },
  chipTxt: {
    fontSize: 13,
    fontFamily: 'Archivo_600SemiBold',
    color: Colors.canvas,
  },
  chipTxtOn: {
    color: Colors.secondary,
  },
  chipCount: {
    fontSize: 12,
    fontFamily: 'IBMPlexMono_400Regular',
    color: hexWithAlpha(Colors.canvas, 0.5),
  },
  chipCountOn: {
    color: hexWithAlpha(Colors.secondary, 0.55),
  },
  dot: {
    width: 7,
    height: 7,
    borderRadius: 3.5,
  },
  listContent: {
    paddingHorizontal: 14,
    paddingTop: 16,
    paddingBottom: 24,
    flexGrow: 1,
  },
  center: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  empty: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 10,
    paddingTop: 80,
  },
  emptyTxt: {
    fontSize: 14,
    fontFamily: 'Archivo_400Regular',
    color: hexWithAlpha(Colors.secondary, 0.45),
  },
});
