export interface User {
  id: string;
  name: string;
  email: string;
  role: 'admin' | 'manager';
  phone?: string;
  createdAt: string;
}

export interface Product {
  id: string;
  name: string;
  description?: string;
  unit: string; // единица измерения (шт, кг, л и т.д.)
  createdAt: string;
}

export interface Stock {
  id: string;
  productId: string;
  warehouseId: string;
  quantity: number;
  updatedAt: string;
}

export interface Warehouse {
  id: string;
  name: string;
  type: 'office' | 'manager';
  managerId?: string; // для складов менеджеров
  createdAt: string;
}

export interface Transaction {
  id: string;
  type: 'receipt' | 'transfer' | 'sale' | 'return' | 'contractor_issue';
  productId: string;
  quantity: number;
  fromWarehouseId?: string;
  toWarehouseId?: string;
  managerId?: string;
  adminId?: string;
  date: string;
  notes?: string;
  // Для продаж
  customerName?: string;
  customerPhone?: string;
  customerCity?: string;
  saleAmount?: number;
  comments?: string;
  // Для выдачи контрагентам
  contractorName?: string;
  createdAt: string;
  updatedAt?: string;
}

export interface Sale {
  id: string;
  managerId: string;
  productId: string;
  quantity: number;
  amount: number;
  customerName: string;
  customerPhone: string;
  customerCity: string;
  date: string;
  comments?: string;
  createdAt: string;
  updatedAt?: string;
}

export interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
}

export interface StockWithProduct extends Stock {
  product: Product;
}

export interface TransactionWithDetails extends Transaction {
  product: Product;
  fromWarehouse?: Warehouse;
  toWarehouse?: Warehouse;
  manager?: User;
  admin?: User;
}