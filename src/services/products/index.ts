import { request } from '../request';

export type Product = {
  id: number;
  name: string;
  sku: string;
  barcode: string;
  imageUrl: string;
  categoryId: number;
  categoryName: string;
  categoryColor: string;
  brandId: number;
  brandName: string;
  price: number;
  stock: number;
  minStock: number;
  unit: number;
  status: number;
  isFeatured: boolean;
  updatedAt: string;
};

export type ProductsResponse = {
  items: Product[];
  total: number;
  page: number;
  pageSize: number;
};

export type StockStatus = 'low' | 'out';

export type ProductsQuery = {
  q?: string;
  categoryId?: number;
  brandId?: number;
  status?: number;
  stockStatus?: StockStatus;
  featured?: boolean;
  page?: number;
  pageSize?: number;
  sort?: 'name' | 'price' | 'stock' | 'updatedAt' | 'category' | 'brand' | 'status';
  dir?: 'asc' | 'desc';
};

const buildQueryString = (query: ProductsQuery) => {
  const params = new URLSearchParams();

  Object.entries(query).forEach(([key, value]) => {
    if (value !== undefined && value !== null && value !== '') {
      params.append(key, String(value));
    }
  });

  const qs = params.toString();
  return qs ? `?${qs}` : '';
};

export const getProducts = (query: ProductsQuery = {}) =>
  request<ProductsResponse>(`products${buildQueryString(query)}`, 'GET');

export type CategoryBreakdown = {
  categoryId: number;
  categoryName: string;
  categoryColor: string;
  productCount: number;
  stockValue: number;
  healthyCount: number;
  lowStockCount: number;
  outOfStockCount: number;
};

export type BrandBreakdown = {
  brandId: number;
  brandName: string;
  productCount: number;
};

export type ProductsBreakdown = {
  totalProducts: number;
  totalInventoryValue: number;
  totalCostValue: number;
  featuredCount: number;
  recentlyAddedCount: number;
  healthyStockCount: number;
  lowStockCount: number;
  outOfStockCount: number;
  byCategory: CategoryBreakdown[];
  byBrand: BrandBreakdown[];
};

export const getProductsBreakdown = () => request<ProductsBreakdown>('products/stats/breakdown', 'GET');
