import { useState, useEffect, useCallback } from 'react';
import { supabase } from '../lib/supabase';
import type { Product, Stock, Warehouse, Transaction, User } from '../lib/supabase';

export const useSupabaseInventory = () => {
  const [products, setProducts] = useState<Product[]>([]);
  const [stock, setStock] = useState<Stock[]>([]);
  const [warehouses, setWarehouses] = useState<Warehouse[]>([]);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Загрузка всех данных
  const loadData = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      const [
        { data: productsData, error: productsError },
        { data: stockData, error: stockError },
        { data: warehousesData, error: warehousesError },
        { data: transactionsData, error: transactionsError },
        { data: usersData, error: usersError }
      ] = await Promise.all([
        supabase.from('products').select('*').order('name'),
        supabase.from('stock').select('*'),
        supabase.from('warehouses').select('*').order('name'),
        supabase.from('transactions').select('*').order('created_at', { ascending: false }),
        supabase.from('users').select('*').order('name')
      ]);

      if (productsError) throw productsError;
      if (stockError) throw stockError;
      if (warehousesError) throw warehousesError;
      if (transactionsError) throw transactionsError;
      if (usersError) throw usersError;

      setProducts(productsData || []);
      setStock(stockData || []);
      setWarehouses(warehousesData || []);
      setTransactions(transactionsData || []);
      setUsers(usersData || []);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Ошибка загрузки данных');
    } finally {
      setLoading(false);
    }
  }, []);

  // Обновление остатков на складе
  const updateStock = useCallback(async (productId: string, warehouseId: string, quantity: number) => {
    try {
      const { error } = await supabase
        .from('stock')
        .upsert({
          product_id: productId,
          warehouse_id: warehouseId,
          quantity,
          updated_at: new Date().toISOString()
        }, {
          onConflict: 'product_id,warehouse_id'
        });

      if (error) throw error;
      
      // Обновляем локальное состояние
      setStock(prev => {
        const existingIndex = prev.findIndex(s => 
          s.product_id === productId && s.warehouse_id === warehouseId
        );
        
        if (existingIndex >= 0) {
          const updated = [...prev];
          updated[existingIndex] = { ...updated[existingIndex], quantity, updated_at: new Date().toISOString() };
          return updated;
        } else {
          return [...prev, {
            id: crypto.randomUUID(),
            product_id: productId,
            warehouse_id: warehouseId,
            quantity,
            updated_at: new Date().toISOString()
          }];
        }
      });
    } catch (err) {
      throw new Error(err instanceof Error ? err.message : 'Ошибка обновления остатков');
    }
  }, []);

  // Создание транзакции
  const createTransaction = useCallback(async (transactionData: Omit<Transaction, 'id' | 'created_at' | 'updated_at'>) => {
    try {
      const { data, error } = await supabase
        .from('transactions')
        .insert([{
          ...transactionData,
          created_at: new Date().toISOString()
        }])
        .select()
        .single();

      if (error) throw error;
      
      // Обновляем локальное состояние
      setTransactions(prev => [data, ...prev]);
      
      return data;
    } catch (err) {
      throw new Error(err instanceof Error ? err.message : 'Ошибка создания транзакции');
    }
  }, []);

  // Оприходование товара
  const receiveProduct = useCallback(async (
    productId: string, 
    quantity: number, 
    adminId: string, 
    notes?: string
  ) => {
    try {
      // Создаем транзакцию
      await createTransaction({
        type: 'receipt',
        product_id: productId,
        quantity,
        to_warehouse_id: 'office',
        admin_id: adminId,
        date: new Date().toISOString().split('T')[0],
        notes
      });

      // Обновляем остатки на офисном складе
      const currentStock = stock.find(s => s.product_id === productId && s.warehouse_id === 'office');
      const newQuantity = (currentStock?.quantity || 0) + quantity;
      
      await updateStock(productId, 'office', newQuantity);
    } catch (err) {
      throw new Error(err instanceof Error ? err.message : 'Ошибка оприходования товара');
    }
  }, [stock, createTransaction, updateStock]);

  // Передача товара менеджеру
  const transferToManager = useCallback(async (
    productId: string,
    quantity: number,
    managerId: string,
    adminId: string,
    notes?: string
  ) => {
    try {
      const managerWarehouseId = `manager-${managerId}`;
      
      // Проверяем наличие товара на офисном складе
      const officeStock = stock.find(s => s.product_id === productId && s.warehouse_id === 'office');
      if (!officeStock || officeStock.quantity < quantity) {
        throw new Error('Недостаточно товара на офисном складе');
      }

      // Создаем транзакцию
      await createTransaction({
        type: 'transfer',
        product_id: productId,
        quantity,
        from_warehouse_id: 'office',
        to_warehouse_id: managerWarehouseId,
        manager_id: managerId,
        admin_id: adminId,
        date: new Date().toISOString().split('T')[0],
        notes
      });

      // Обновляем остатки
      await updateStock(productId, 'office', officeStock.quantity - quantity);
      
      const managerStock = stock.find(s => s.product_id === productId && s.warehouse_id === managerWarehouseId);
      const newManagerQuantity = (managerStock?.quantity || 0) + quantity;
      await updateStock(productId, managerWarehouseId, newManagerQuantity);
    } catch (err) {
      throw new Error(err instanceof Error ? err.message : 'Ошибка передачи товара');
    }
  }, [stock, createTransaction, updateStock]);

  // Создание продажи
  const createSale = useCallback(async (
    managerId: string,
    productId: string,
    quantity: number,
    date: string,
    comments?: string
  ) => {
    try {
      const managerWarehouseId = `manager-${managerId}`;
      
      // Проверяем наличие товара у менеджера
      const managerStock = stock.find(s => s.product_id === productId && s.warehouse_id === managerWarehouseId);
      if (!managerStock || managerStock.quantity < quantity) {
        throw new Error('Недостаточно товара на складе');
      }

      // Создаем транзакцию
      await createTransaction({
        type: 'sale',
        product_id: productId,
        quantity,
        from_warehouse_id: managerWarehouseId,
        manager_id: managerId,
        date,
        comments
      });

      // Обновляем остатки
      await updateStock(productId, managerWarehouseId, managerStock.quantity - quantity);
    } catch (err) {
      throw new Error(err instanceof Error ? err.message : 'Ошибка создания продажи');
    }
  }, [stock, createTransaction, updateStock]);

  // Создание возврата
  const createReturn = useCallback(async (
    managerId: string,
    productId: string,
    quantity: number,
    date: string,
    comments?: string
  ) => {
    try {
      const managerWarehouseId = `manager-${managerId}`;

      // Создаем транзакцию
      await createTransaction({
        type: 'return',
        product_id: productId,
        quantity,
        to_warehouse_id: managerWarehouseId,
        manager_id: managerId,
        date,
        comments
      });

      // Обновляем остатки
      const managerStock = stock.find(s => s.product_id === productId && s.warehouse_id === managerWarehouseId);
      const newQuantity = (managerStock?.quantity || 0) + quantity;
      await updateStock(productId, managerWarehouseId, newQuantity);
    } catch (err) {
      throw new Error(err instanceof Error ? err.message : 'Ошибка создания возврата');
    }
  }, [stock, createTransaction, updateStock]);

  // Выдача товара контрагенту
  const issueToContractor = useCallback(async (
    productId: string,
    quantity: number,
    contractorName: string,
    adminId: string,
    date: string,
    comments?: string
  ) => {
    try {
      // Проверяем наличие товара на офисном складе
      const officeStock = stock.find(s => s.product_id === productId && s.warehouse_id === 'office');
      if (!officeStock || officeStock.quantity < quantity) {
        throw new Error('Недостаточно товара на офисном складе');
      }

      // Создаем транзакцию
      await createTransaction({
        type: 'contractor_issue',
        product_id: productId,
        quantity,
        from_warehouse_id: 'office',
        admin_id: adminId,
        date,
        contractor_name: contractorName,
        comments
      });

      // Обновляем остатки
      await updateStock(productId, 'office', officeStock.quantity - quantity);
    } catch (err) {
      throw new Error(err instanceof Error ? err.message : 'Ошибка выдачи товара контрагенту');
    }
  }, [stock, createTransaction, updateStock]);

  // Загружаем данные при монтировании
  useEffect(() => {
    loadData();
  }, [loadData]);

  return {
    products,
    stock,
    warehouses,
    transactions,
    users,
    loading,
    error,
    loadData,
    receiveProduct,
    transferToManager,
    createSale,
    createReturn,
    issueToContractor
  };
};