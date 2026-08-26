import {
  Coffee,
  Cookie,
  CupSoda,
  Milk,
  Package,
  ScrollText,
  Sparkles,
  SprayCan,
  Wheat,
  type LucideIcon,
} from 'lucide-react-native';

export type CategoryVisual = {
  bg: string;
  fg: string;
  icon: LucideIcon;
};

/** Kategori renkleri — web panelindeki "Tanımlar" renkleriyle aynı aile. */
const categoryPalette: Record<string, CategoryVisual> = {
  icecek: { bg: '#E4EEFB', fg: '#1F5896', icon: CupSoda },
  kahvaltilik: { bg: '#FBEEDA', fg: '#8A560A', icon: Coffee },
  'temel-gida': { bg: '#F3E7DC', fg: '#7A4B22', icon: Wheat },
  'sut-urunleri': { bg: '#E2F1FA', fg: '#1B5E80', icon: Milk },
  atistirmalik: { bg: '#FCE6EA', fg: '#9B1C36', icon: Cookie },
  temizlik: { bg: '#E2F5E8', fg: '#1E6B3F', icon: SprayCan },
  'kisisel-bakim': { bg: '#EDE6FB', fg: '#4C2C91', icon: Sparkles },
  'kagit-urunleri': { bg: '#ECECE8', fg: '#4A4D42', icon: ScrollText },
};

export const neutralCategoryVisual: CategoryVisual = {
  bg: '#F0F0EC',
  fg: '#6B6E63',
  icon: Package,
};

const toSlug = (value: string) =>
  value
    .toLocaleLowerCase('tr-TR')
    .replace(/ı/g, 'i')
    .replace(/ğ/g, 'g')
    .replace(/ü/g, 'u')
    .replace(/ş/g, 's')
    .replace(/ö/g, 'o')
    .replace(/ç/g, 'c')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)/g, '');

export const getCategoryVisual = (categoryName: string): CategoryVisual =>
  categoryPalette[toSlug(categoryName)] ?? neutralCategoryVisual;
