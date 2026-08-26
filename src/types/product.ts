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

export type ProductsBreakdownQuery = {
  categoryId?: number;
  brandId?: number;
};

export type ProductDetail = Product & {
  supplierId: number;
  supplierName: string;
  costPrice: number;
  description: string;
  createdAt: string;
};

export type ActivityLogAction =
  | 'Created'
  | 'Updated'
  | 'Deleted'
  | 'StockIn'
  | 'StockAdjusted'
  | 'PriceChanged'
  | 'CostPriceChanged'
  | 'StatusChanged'
  | 'FeaturedChanged';

export type ActivityLog = {
  id: number;
  action: ActivityLogAction;
  description: string;
  quantityDelta: number | null;
  amountKurus: number | null;
  createdAt: string;
};
