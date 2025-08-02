import React, { useState, useMemo } from 'react';
import { BarChart3, TrendingUp, TrendingDown, Calendar, User, Package } from 'lucide-react';
import { useInventory } from '../hooks/useInventory';
import { useAuth } from '../contexts/AuthContext';
import { mockUsers } from '../data/mockData';

export const ManagerAnalytics: React.FC = () => {
  const { user } = useAuth();
  const { getTransactionsWithDetails, products } = useInventory();
  const [dateFrom, setDateFrom] = useState('');
  const [dateTo, setDateTo] = useState('');
  const [selectedManager, setSelectedManager] = useState('');

  const allTransactions = getTransactionsWithDetails();
  const managers = mockUsers.filter(u => u.role === 'manager');

  // Фильтрация транзакций
  const filteredTransactions = useMemo(() => {
    return allTransactions.filter(transaction => {
      const transactionDate = new Date(transaction.date);
      const fromDate = dateFrom ? new Date(dateFrom) : null;
      const toDate = dateTo ? new Date(dateTo) : null;

      if (fromDate && transactionDate < fromDate) return false;
      if (toDate && transactionDate > toDate) return false;
      if (selectedManager && transaction.managerId !== selectedManager) return false;

      return true;
    });
  }, [allTransactions, dateFrom, dateTo, selectedManager]);

  // Аналитика по менеджерам
  const managerAnalytics = useMemo(() => {
    const analytics = managers.map(manager => {
      const managerTransactions = filteredTransactions.filter(t => t.managerId === manager.id);
      
      // Приход товаров (передачи от администратора)
      const transfers = managerTransactions.filter(t => t.type === 'transfer');
      const totalReceived = transfers.reduce((sum, t) => sum + t.quantity, 0);
      
      // Продажи
      const sales = managerTransactions.filter(t => t.type === 'sale');
      const totalSold = sales.reduce((sum, t) => sum + t.quantity, 0);
      
      // Возвраты
      const returns = managerTransactions.filter(t => t.type === 'return');
      const totalReturned = returns.reduce((sum, t) => sum + t.quantity, 0);

      return {
        manager,
        totalReceived,
        totalSold,
        totalReturned,
        transfersCount: transfers.length,
        salesCount: sales.length,
        returnsCount: returns.length
      };
    });

    return analytics;
  }, [managers, filteredTransactions]);

  // Детальная таблица по товарам
  const productAnalytics = useMemo(() => {
    const productMap = new Map();

    filteredTransactions.forEach(transaction => {
      if (!transaction.managerId) return;
      
      const key = `${transaction.managerId}-${transaction.productId}`;
      if (!productMap.has(key)) {
        const manager = managers.find(m => m.id === transaction.managerId);
        const product = products.find(p => p.id === transaction.productId);
        
        productMap.set(key, {
          manager,
          product,
          received: 0,
          sold: 0,
          returned: 0
        });
      }

      const item = productMap.get(key);
      if (transaction.type === 'transfer') {
        item.received += transaction.quantity;
      } else if (transaction.type === 'sale') {
        item.sold += transaction.quantity;
      } else if (transaction.type === 'return') {
        item.returned += transaction.quantity;
      }
    });

    return Array.from(productMap.values()).filter(item => 
      item.received > 0 || item.sold > 0 || item.returned > 0
    );
  }, [filteredTransactions, managers, products]);

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-gray-900">Аналитика по менеджерам</h2>
        <p className="text-gray-600 mt-1">Статистика прихода и продаж товаров</p>
      </div>

      {/* Фильтры */}
      <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-gray-900 flex items-center">
            <Calendar className="h-5 w-5 mr-2 text-blue-600" />
            Фильтры
          </h3>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Дата с
            </label>
            <input
              type="date"
              value={dateFrom}
              onChange={(e) => setDateFrom(e.target.value)}
              className="block w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Дата по
            </label>
            <input
              type="date"
              value={dateTo}
              onChange={(e) => setDateTo(e.target.value)}
              className="block w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Менеджер
            </label>
            <select
              value={selectedManager}
              onChange={(e) => setSelectedManager(e.target.value)}
              className="block w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="">Все менеджеры</option>
              {managers.map(manager => (
                <option key={manager.id} value={manager.id}>
                  {manager.name}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Сводная статистика по менеджерам */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200">
        <div className="px-6 py-4 border-b border-gray-200">
          <h3 className="text-lg font-semibold text-gray-900">Сводная статистика</h3>
        </div>
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Менеджер</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Получено товаров</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Продано</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Возвращено</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Операции</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {managerAnalytics.map(({ manager, totalReceived, totalSold, totalReturned, transfersCount, salesCount, returnsCount }) => (
                <tr key={manager.id}>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      <div className="bg-blue-50 p-2 rounded-lg mr-3">
                        <User className="h-5 w-5 text-blue-600" />
                      </div>
                      <div>
                        <div className="text-sm font-medium text-gray-900">{manager.name}</div>
                        <div className="text-sm text-gray-500">{manager.email}</div>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      <TrendingUp className="h-4 w-4 text-green-500 mr-2" />
                      <span className="text-sm font-medium text-gray-900">{totalReceived}</span>
                      <span className="text-xs text-gray-500 ml-1">({transfersCount} операций)</span>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      <TrendingDown className="h-4 w-4 text-blue-500 mr-2" />
                      <span className="text-sm font-medium text-gray-900">{totalSold}</span>
                      <span className="text-xs text-gray-500 ml-1">({salesCount} продаж)</span>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      <TrendingUp className="h-4 w-4 text-orange-500 mr-2" />
                      <span className="text-sm font-medium text-gray-900">{totalReturned}</span>
                      <span className="text-xs text-gray-500 ml-1">({returnsCount} возвратов)</span>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {transfersCount + salesCount + returnsCount} всего
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Детальная таблица по товарам */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200">
        <div className="px-6 py-4 border-b border-gray-200">
          <h3 className="text-lg font-semibold text-gray-900">Детализация по товарам</h3>
        </div>
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Менеджер</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Товар</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Получено</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Продано</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Возвращено</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Остаток</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {productAnalytics.map((item, index) => (
                <tr key={index}>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {item.manager?.name}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      <Package className="h-4 w-4 text-gray-400 mr-2" />
                      <span className="text-sm font-medium text-gray-900">{item.product?.name}</span>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className="inline-flex px-2 py-1 text-xs font-semibold rounded-full bg-green-100 text-green-800">
                      +{item.received}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className="inline-flex px-2 py-1 text-xs font-semibold rounded-full bg-blue-100 text-blue-800">
                      -{item.sold}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className="inline-flex px-2 py-1 text-xs font-semibold rounded-full bg-orange-100 text-orange-800">
                      +{item.returned}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                    {item.received - item.sold + item.returned}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};