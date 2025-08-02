import { useState, useCallback, useMemo } from 'react';
import { 
  Product, 
  Stock, 
  Warehouse, 
  Transaction, 
  Sale, 
  StockWithProduct, 
  TransactionWithDetails 
} from '../types';
import { 
  mockProducts, 
  mockStock, 
  mockWarehouses, 
  mockTransactions, 
  mockSales 
} from '../data/mockData';

export const useInventory = () => {
  const [products] = useState<Product[]>(mockProducts);
  const [stock, setStock] = useState<Stock[]>(() => {
    const savedStock = localStorage.getItem('inventoryStock');
    return savedStock ? JSON.parse(savedStock) : mockStock;
  });
  const [warehouses] = useState<Warehouse[]>(mockWarehouses);
  const [transactions, setTransactions] = useState<Transaction[]>(() => {
    const savedTransactions = localStorage.getItem('inventoryTransactions');
    return savedTransactions ? JSON.parse(savedTransactions) : mockTransactions;
  });
  const [sales, setSales] = useState<Sale[]>(() => {
    const savedSales = localStorage.getItem('inventorySales');
    return savedSales ? JSON.parse(savedSales) : mockSales;
  });

  // Сохранение данных в localStorage при изменении
  useCallback(() => {
    localStorage.setItem('inventoryStock', JSON.stringify(stock));
  }, [stock]);

  useCallback(() => {
    localStorage.setItem('inventoryTransactions', JSON.stringify(transactions));
  }, [transactions]);

  useCallback(() => {
    localStorage.setItem('inventorySales', JSON.stringify(sales));
  }, [sales]);

  // Получение остатков с информацией о товарах
  const getStockWithProducts = useCallback((warehouseId?: string): StockWithProduct[] => {
    const filteredStock = warehouseId 
      ? stock.filter(s => s.warehouseId === warehouseId)
      : stock;

    return filteredStock
      .map(stockItem => {
        const product = products.find(p => p.id === stockItem.productId);
        if (!product) return null;
        return {
          ...stockItem,
          product
        };
      })
      .filter(Boolean) as StockWithProduct[];
  }, [stock, products]);

  // Получение транзакций с деталями
  const getTransactionsWithDetails = useCallback((): TransactionWithDetails[] => {
    return transactions.map(transaction => {
      const product = products.find(p => p.id === transaction.productId);
      const fromWarehouse = transaction.fromWarehouseId 
        ? warehouses.find(w => w.id === transaction.fromWarehouseId)
        : undefined;
      const toWarehouse = transaction.toWarehouseId
        ? warehouses.find(w => w.id === transaction.toWarehouseId)
        : undefined;

      return {
        ...transaction,
        product: product!,
        fromWarehouse,
        toWarehouse
      };
    });
  }, [transactions, products, warehouses]);

  // Оприходование товара (только администратор)
  const receiveProduct = useCallback((productId: string, quantity: number, adminId: string, notes?: string) => {
    const transactionId = Date.now().toString();
    const now = new Date().toISOString();
    const today = new Date().toISOString().split('T')[0];

    // Создаем транзакцию
    const newTransaction: Transaction = {
      id: transactionId,
      type: 'receipt',
      productId,
      quantity,
      toWarehouseId: 'office',
      adminId,
      date: today,
      notes,
      createdAt: now
    };

    setTransactions(prev => [...prev, newTransaction]);

    // Обновляем остатки на офисном складе
    setStock(prev => {
      const existingStock = prev.find(s => s.productId === productId && s.warehouseId === 'office');
      
      if (existingStock) {
        return prev.map(s => 
          s.id === existingStock.id 
            ? { ...s, quantity: s.quantity + quantity, updatedAt: now }
            : s
        );
      } else {
        const newStock: Stock = {
          id: Date.now().toString(),
          productId,
          warehouseId: 'office',
          quantity,
          updatedAt: now
        };
        return [...prev, newStock];
      }
    });
  }, []);

  // Передача товара менеджеру (только администратор)
  const transferToManager = useCallback((
    productId: string, 
    quantity: number, 
    managerId: string, 
    adminId: string,
    notes?: string
  ) => {
    const managerWarehouseId = `manager-${managerId}`;
    const transactionId = Date.now().toString();
    const now = new Date().toISOString();
    const today = new Date().toISOString().split('T')[0];

    // Проверяем наличие товара на офисном складе
    const officeStock = stock.find(s => s.productId === productId && s.warehouseId === 'office');
    if (!officeStock || officeStock.quantity < quantity) {
      throw new Error('Недостаточно товара на офисном складе');
    }

    // Создаем транзакцию
    const newTransaction: Transaction = {
      id: transactionId,
      type: 'transfer',
      productId,
      quantity,
      fromWarehouseId: 'office',
      toWarehouseId: managerWarehouseId,
      managerId,
      adminId,
      date: today,
      notes,
      createdAt: now
    };

    setTransactions(prev => [...prev, newTransaction]);

    // Обновляем остатки
    setStock(prev => {
      let updatedStock = [...prev];
      
      // Списываем с офисного склада
      const officeStockIndex = updatedStock.findIndex(s => s.productId === productId && s.warehouseId === 'office');
      if (officeStockIndex !== -1) {
        updatedStock[officeStockIndex] = {
          ...updatedStock[officeStockIndex],
          quantity: updatedStock[officeStockIndex].quantity - quantity,
          updatedAt: now
        };
      }

      // Добавляем на склад менеджера
      const managerStockIndex = updatedStock.findIndex(s => s.productId === productId && s.warehouseId === managerWarehouseId);
      if (managerStockIndex !== -1) {
        updatedStock[managerStockIndex] = {
          ...updatedStock[managerStockIndex],
          quantity: updatedStock[managerStockIndex].quantity + quantity,
          updatedAt: now
        };
      } else {
        const newStock: Stock = {
          id: Date.now().toString(),
          productId,
          warehouseId: managerWarehouseId,
          quantity,
          updatedAt: now
        };
        updatedStock = [...updatedStock, newStock];
      }

      return updatedStock;
    });
  }, [stock]);

  // Оформление продажи (только менеджер)
  const createSale = useCallback((
    managerId: string,
    productId: string,
    quantity: number,
    amount: number,
    customerName: string,
    customerPhone: string,
    customerCity: string,
    date: string,
    comments?: string
  ) => {
    const managerWarehouseId = `manager-${managerId}`;
    const saleId = Date.now().toString();
    const transactionId = (Date.now() + 1).toString();
    const now = new Date().toISOString();

    // Проверяем наличие товара у менеджера
    const managerStock = stock.find(s => s.productId === productId && s.warehouseId === managerWarehouseId);
    if (!managerStock || managerStock.quantity < quantity) {
      throw new Error('Недостаточно товара на складе');
    }

    // Создаем продажу
    const newSale: Sale = {
      id: saleId,
      managerId,
      productId,
      quantity,
      amount,
      customerName,
      customerPhone,
      customerCity,
      date,
      comments,
      comments,
      createdAt: now
    };

    setSales(prev => [...prev, newSale]);

    // Создаем транзакцию
    const newTransaction: Transaction = {
      id: transactionId,
      type: 'sale',
      productId,
      quantity,
      fromWarehouseId: managerWarehouseId,
      managerId,
      date,
      customerName,
      customerPhone,
      customerCity,
      saleAmount: amount,
      comments,
      createdAt: now
    };

    setTransactions(prev => [...prev, newTransaction]);

    // Обновляем остатки
    setStock(prev => prev.map(s => 
      s.productId === productId && s.warehouseId === managerWarehouseId
        ? { ...s, quantity: s.quantity - quantity, updatedAt: now }
        : s
    ));
  }, [stock]);

  // Оформление возврата (только менеджер)
  const createReturn = useCallback((
    managerId: string,
    productId: string,
    quantity: number,
    date: string,
    comments?: string
  ) => {
    const managerWarehouseId = `manager-${managerId}`;
    const transactionId = Date.now().toString();
    const now = new Date().toISOString();

    // Создаем транзакцию
    const newTransaction: Transaction = {
      id: transactionId,
      type: 'return',
      productId,
      quantity,
      toWarehouseId: managerWarehouseId,
      managerId,
      date,
      comments,
      createdAt: now
    };

    setTransactions(prev => [...prev, newTransaction]);

    // Обновляем остатки - добавляем товар на склад менеджера
    setStock(prev => {
      const existingStock = prev.find(s => s.productId === productId && s.warehouseId === managerWarehouseId);
      
      if (existingStock) {
        return prev.map(s => 
          s.id === existingStock.id 
            ? { ...s, quantity: s.quantity + quantity, updatedAt: now }
            : s
        );
      } else {
        const newStock: Stock = {
          id: Date.now().toString(),
          productId,
          warehouseId: managerWarehouseId,
          quantity,
          updatedAt: now
        };
        return [...prev, newStock];
      }
    });
  }, []);

  // Выдача товара контрагенту (только администратор)
  const issueToContractor = useCallback((
    productId: string,
    quantity: number,
    contractorName: string,
    adminId: string,
    date: string,
    comments?: string
  ) => {
    const transactionId = Date.now().toString();
    const now = new Date().toISOString();

    // Проверяем наличие товара на офисном складе
    const officeStock = stock.find(s => s.productId === productId && s.warehouseId === 'office');
    if (!officeStock || officeStock.quantity < quantity) {
      throw new Error('Недостаточно товара на офисном складе');
    }

    // Создаем транзакцию
    const newTransaction: Transaction = {
      id: transactionId,
      type: 'contractor_issue',
      productId,
      quantity,
      fromWarehouseId: 'office',
      adminId,
      date,
      contractorName,
      comments,
      createdAt: now
    };

    setTransactions(prev => [...prev, newTransaction]);

    // Обновляем остатки - списываем с офисного склада
    setStock(prev => {
      const newStock = prev.map(s => 
        s.productId === productId && s.warehouseId === 'office'
          ? { ...s, quantity: s.quantity - quantity, updatedAt: now }
          : s
      );
      localStorage.setItem('inventoryStock', JSON.stringify(newStock));
      return newStock;
    });
  }, [stock]);

  // Редактирование продажи (только администратор)
  const updateSale = useCallback((saleId: string, updates: Partial<Sale>) => {
    setSales(prev => prev.map(sale => 
      sale.id === saleId 
        ? { ...sale, ...updates, updatedAt: new Date().toISOString() }
        : sale
    ));

    // Также обновляем соответствующую транзакцию
    setTransactions(prev => prev.map(transaction => 
      transaction.type === 'sale' && transaction.managerId === prev.find(s => s.id === saleId)?.managerId
        ? { ...transaction, ...updates, updatedAt: new Date().toISOString() }
        : transaction
    ));
  }, []);
  // Получение остатков для конкретного менеджера
  const getManagerStock = useCallback((managerId: string): StockWithProduct[] => {
    return getStockWithProducts(`manager-${managerId}`);
  }, [getStockWithProducts]);

  // Получение продаж для конкретного менеджера
  const getManagerSales = useCallback((managerId: string) => {
    return sales.filter(sale => sale.managerId === managerId);
  }, [sales]);

  // Статистика
  const getStatistics = useMemo(() => {
    const totalProducts = products.length;
    const totalStock = stock.reduce((sum, s) => sum + s.quantity, 0);
    const totalSales = sales.length;
    
    // Остатки по складам
    const officeStock = stock.filter(s => s.warehouseId === 'office').reduce((sum, s) => sum + s.quantity, 0);
    const managerStock = stock.filter(s => s.warehouseId.startsWith('manager-')).reduce((sum, s) => sum + s.quantity, 0);

    return {
      totalProducts,
      totalStock,
      officeStock,
      managerStock,
      totalSales
    };
  }, [products, stock, sales]);

  return {
    products,
    warehouses,
    stock,
    transactions,
    sales,
    getStockWithProducts,
    getTransactionsWithDetails,
    getManagerStock,
    getManagerSales,
    receiveProduct,
    transferToManager,
    createSale,
    createReturn,
    issueToContractor,
    updateSale,
    getStatistics
  };
};