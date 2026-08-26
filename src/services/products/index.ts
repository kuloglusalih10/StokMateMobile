import { request } from '../request';
import type {
  ActivityLog,
  Product,
  ProductDetail,
  ProductsBreakdown,
  ProductsBreakdownQuery,
  ProductsQuery,
  ProductsResponse,
} from '@/types';

export type {
  ActivityLog,
  ActivityLogAction,
  BrandBreakdown,
  CategoryBreakdown,
  Product,
  ProductDetail,
  ProductsBreakdown,
  ProductsBreakdownQuery,
  ProductsQuery,
  ProductsResponse,
  StockStatus,
} from '@/types';

const buildQueryString = (query: Record<string, unknown>) => {
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

export const getProductsBreakdown = (query: ProductsBreakdownQuery = {}) =>
  request<ProductsBreakdown>(`products/stats/breakdown${buildQueryString(query)}`, 'GET');

export const getProductById = (id: number) => request<ProductDetail>(`products/${id}`, 'GET');

export const getProductLogs = (id: number, limit = 5) =>
  request<ActivityLog[]>(`products/${id}/logs?limit=${limit}`, 'GET');

export const updateProductStock = (id: number, stock: number) =>
  request<Product>(`products/${id}/stock`, 'PATCH', { stock });

export const addProductStockEntry = (id: number, quantity: number) =>
  request<Product>(`products/${id}/stock-entries`, 'POST', { quantity });
