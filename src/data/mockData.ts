import { User, Product, Warehouse, Stock, Transaction, Sale } from '../types';

export const mockUsers: User[] = [
  {
    id: '1',
    name: 'Администратор',
    email: 'admin@company.com',
    role: 'admin',
    phone: '+7 (999) 000-00-01',
    createdAt: '2025-01-01T00:00:00Z'
  },
  {
    id: '2',
    name: 'Нинель',
    email: 'ninel@company.com',
    role: 'manager',
    phone: '+7 (999) 234-56-78',
    createdAt: '2025-01-02T00:00:00Z'
  },
  {
    id: '3',
    name: 'Казбек',
    email: 'kazbek@company.com',
    role: 'manager',
    phone: '+7 (999) 345-67-89',
    createdAt: '2025-01-03T00:00:00Z'
  },
  {
    id: '4',
    name: 'Менеджер 3',
    email: 'manager3@company.com',
    role: 'manager',
    phone: '+7 (999) 456-78-90',
    createdAt: '2025-01-04T00:00:00Z'
  }
];

export const mockProducts: Product[] = [
  {
    id: '1',
    name: 'Трансмиттер MD1160',
    description: 'Трансмиттер MD1160',
    unit: 'шт',
    createdAt: '2025-01-01T00:00:00Z'
  },
  {
    id: '2',
    name: 'Сенсор глюкозы MD3660 #2',
    description: 'Сенсор глюкозы MD3660 #2',
    unit: 'шт',
    createdAt: '2025-01-01T00:00:00Z'
  },
  {
    id: '3',
    name: 'Патч-резервуар MD8200 #10',
    description: 'Патч-резервуар MD8200 #10',
    unit: 'шт',
    createdAt: '2025-01-01T00:00:00Z'
  },
  {
    id: '4',
    name: 'Помпа MD8201',
    description: 'Помпа MD8201',
    unit: 'шт',
    createdAt: '2025-01-01T00:00:00Z'
  },
  {
    id: '5',
    name: 'Nano Трансмиттер MD1158',
    description: 'Nano Трансмиттер MD1158',
    unit: 'шт',
    createdAt: '2025-01-01T00:00:00Z'
  },
  {
    id: '6',
    name: 'Nano Сенсор глюкозы MD3658 #2',
    description: 'Nano Сенсор глюкозы MD3658 #2',
    unit: 'шт',
    createdAt: '2025-01-01T00:00:00Z'
  }
];

export const mockWarehouses: Warehouse[] = [
  {
    id: 'office',
    name: 'Офисный склад',
    type: 'office',
    createdAt: '2025-01-01T00:00:00Z'
  },
  {
    id: 'manager-2',
    name: 'Склад Нинель',
    type: 'manager',
    managerId: '2',
    createdAt: '2025-01-02T00:00:00Z'
  },
  {
    id: 'manager-3',
    name: 'Склад Казбек',
    type: 'manager',
    managerId: '3',
    createdAt: '2025-01-03T00:00:00Z'
  },
  {
    id: 'manager-4',
    name: 'Склад Менеджер 3',
    type: 'manager',
    managerId: '4',
    createdAt: '2025-01-04T00:00:00Z'
  }
];

export const mockStock: Stock[] = [
  // Офисный склад
  { id: '1', productId: '1', warehouseId: 'office', quantity: 52, updatedAt: '2025-01-15T10:00:00Z' },
  { id: '2', productId: '2', warehouseId: 'office', quantity: 169, updatedAt: '2025-01-15T10:00:00Z' },
  { id: '3', productId: '3', warehouseId: 'office', quantity: 147, updatedAt: '2025-01-15T10:00:00Z' },
  { id: '4', productId: '4', warehouseId: 'office', quantity: 49, updatedAt: '2025-01-15T10:00:00Z' },
  { id: '5', productId: '5', warehouseId: 'office', quantity: 14, updatedAt: '2025-01-15T10:00:00Z' },
  { id: '6', productId: '6', warehouseId: 'office', quantity: 45, updatedAt: '2025-01-15T10:00:00Z' },
  
  // Склад Нинель
  { id: '7', productId: '1', warehouseId: 'manager-2', quantity: 0, updatedAt: '2025-01-14T15:00:00Z' },
  { id: '8', productId: '2', warehouseId: 'manager-2', quantity: 0, updatedAt: '2025-01-14T15:00:00Z' },
  { id: '9', productId: '3', warehouseId: 'manager-2', quantity: 0, updatedAt: '2025-01-14T15:00:00Z' },
  { id: '10', productId: '4', warehouseId: 'manager-2', quantity: 0, updatedAt: '2025-01-14T15:00:00Z' },
  { id: '11', productId: '5', warehouseId: 'manager-2', quantity: 0, updatedAt: '2025-01-14T15:00:00Z' },
  { id: '12', productId: '6', warehouseId: 'manager-2', quantity: 0, updatedAt: '2025-01-14T15:00:00Z' },
  
  // Склад Казбек
  { id: '13', productId: '1', warehouseId: 'manager-3', quantity: 0, updatedAt: '2025-01-13T12:00:00Z' },
  { id: '14', productId: '2', warehouseId: 'manager-3', quantity: 0, updatedAt: '2025-01-13T12:00:00Z' },
  { id: '15', productId: '3', warehouseId: 'manager-3', quantity: 0, updatedAt: '2025-01-13T12:00:00Z' },
  { id: '16', productId: '4', warehouseId: 'manager-3', quantity: 0, updatedAt: '2025-01-13T12:00:00Z' },
  { id: '17', productId: '5', warehouseId: 'manager-3', quantity: 0, updatedAt: '2025-01-13T12:00:00Z' },
  { id: '18', productId: '6', warehouseId: 'manager-3', quantity: 0, updatedAt: '2025-01-13T12:00:00Z' },
  
  // Склад Менеджер 3
  { id: '19', productId: '1', warehouseId: 'manager-4', quantity: 0, updatedAt: '2025-01-12T14:00:00Z' },
  { id: '20', productId: '2', warehouseId: 'manager-4', quantity: 0, updatedAt: '2025-01-12T14:00:00Z' },
  { id: '21', productId: '3', warehouseId: 'manager-4', quantity: 0, updatedAt: '2025-01-12T14:00:00Z' },
  { id: '22', productId: '4', warehouseId: 'manager-4', quantity: 0, updatedAt: '2025-01-12T14:00:00Z' },
  { id: '23', productId: '5', warehouseId: 'manager-4', quantity: 0, updatedAt: '2025-01-12T14:00:00Z' },
  { id: '24', productId: '6', warehouseId: 'manager-4', quantity: 0, updatedAt: '2025-01-12T14:00:00Z' }
];

export const mockTransactions: Transaction[] = [];

export const mockSales: Sale[] = [];