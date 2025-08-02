import React, { useState, useMemo } from 'react';
import { BarChart3, Package, Users, TrendingUp, Calendar, Filter, Download } from 'lucide-react';
import { useInventory } from '../hooks/useInventory';
import { useAuth } from '../contexts/AuthContext';
import { mockUsers } from '../data/mockData';

export const Reports: React.FC = () => {
  const { user } = useAuth();
  const { 
    getStockWithProducts, 
    getTransactionsWithDetails, 
    warehouses, 
    products,
    getStatistics 
  } = useInventory();
  
  const [dateFrom, setDateFrom] = useState('');
  const [dateTo, setDateTo] = useState('');
  const [selectedProduct, setSelectedProduct] = useState('');
  const [selectedManager, setSelectedManager] = useState('');
  const [reportType, setReportType] = useState<'stock' | 'transactions' | 'sales'>('stock');

  const allTransactions = getTransactionsWithDetails();
  const allStock = getStockWithProducts();
  const managers = mockUsers.filter(u => u.role === 'manager');
  const stats = getStatistics;

  // Фильтрация транзакций
  const filteredTransactions = useMemo(() => {
    return allTransactions.filter(transaction => {
      const transactionDate = new Date(transaction.date);
      const fromDate = dateFrom ? new Date(dateFrom) : null;
      const toDate = dateTo ? new Date(dateTo) : null;

      if (fromDate && transactionDate < fromDate) return false;
      if (toDate && transactionDate > toDate) return false;
      if (selectedProduct && transaction.productId !== selectedProduct) return false;
      if (selectedManager && transaction.managerId !== selectedManager) return false;

      return true;
    });
  }, [allTransactions, dateFrom, dateTo, selectedProduct, selectedManager]);

  // Группировка остатков по складам
  const stockByWarehouse = useMemo(() => {
    const grouped = allStock.reduce((acc, item) => {
      const warehouse = warehouses.find(w => w.id === item.warehouseId);
      const warehouseName = warehouse?.name || 'Неизвестный склад';
      
      if (!acc[warehouseName]) {
        acc[warehouseName] = [];
      }
      acc[warehouseName].push(item);
      return acc;
    }, {} as Record<string, typeof allStock>);

    return grouped;
  }, [allStock, warehouses]);

  // Статистика по менеджерам
  const managerStats = useMemo(() => {
    return managers.map(manager => {
      const managerTransactions = filteredTransactions.filter(t => t.managerId === manager.id);
      const sales = managerTransactions.filter(t => t.type === 'sale');
      const totalSales = sales.reduce((sum, sale) => sum + (sale.saleAmount || 0), 0);
      const managerStock = allStock.filter(s => s.warehouseId === `manager-${manager.id}`);
      const totalStock = managerStock.reduce((sum, item) => sum + item.quantity, 0);

      return {
        manager,
        salesCount: sales.length,
        totalSales,
        totalStock,
        stockItems: managerStock.length
      };
    });
  }, [managers, filteredTransactions, allStock]);

  const exportToCSV = () => {
    let csvContent = '';
    let headers = '';
    let rows = '';

    if (reportType === 'stock') {
      headers = 'Склад,Товар,Количество,Единица,Обновлено\n';
      Object.entries(stockByWarehouse).forEach(([warehouseName, items]) => {
        items.forEach(item => {
          rows += `"${warehouseName}","${item.product.name}",${item.quantity},"${item.product.unit}","${new Date(item.updatedAt).toLocaleDateString('ru-RU')}"\n`;
        });
      });
    } else if (reportType === 'transactions') {
      headers = 'Дата,Тип,Товар,Количество,От,К,Менеджер,Сумма\n';
      filteredTransactions.forEach(transaction => {
        const manager = mockUsers.find(u => u.id === transaction.managerId);
        rows += `"${new Date(transaction.date).toLocaleDateString('ru-RU')}","${transaction.type}","${transaction.product.name}",${transaction.quantity},"${transaction.fromWarehouse?.name || ''}","${transaction.toWarehouse?.name || ''}","${manager?.name || ''}","${transaction.saleAmount || ''}"\n`;
      });
    }

    csvContent = headers + rows;
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', `report_${reportType}_${new Date().toISOString().split('T')[0]}.csv`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-gray-900">Отчеты и аналитика</h2>
        <p className="text-gray-600 mt-1">Детальная отчетность по движению товаров</p>
      </div>

      {/* Фильтры */}
      <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-gray-900 flex items-center">
            <Filter className="h-5 w-5 mr-2 text-blue-600" />
            Фильтры отчета
          </h3>
          <button
            onClick={exportToCSV}
            className="inline-flex items-center px-3 py-2 border border-gray-300 shadow-sm text-sm font-medium rounded-lg text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
          >
            <Download className="h-4 w-4 mr-2" />
            Экспорт CSV
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Тип отчета
            </label>
            <select
              value={reportType}
              onChange={(e) => setReportType(e.target.value as any)}
              className="block w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="stock">Остатки на складах</option>
              <option value="transactions">История операций</option>
              <option value="sales">Статистика продаж</option>
            </select>
          </div>

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
              Товар
            </label>
            <select
              value={selectedProduct}
              onChange={(e) => setSelectedProduct(e.target.value)}
              className="block w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="">Все товары</option>
              {products.map(product => (
                <option key={product.id} value={product.id}>
                  {product.name}
                </option>
              ))}
            </select>
          </div>
        </div>

        {reportType === 'transactions' && (
          <div className="mt-4">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Менеджер
            </label>
            <select
              value={selectedManager}
              onChange={(e) => setSelectedManager(e.target.value)}
              className="block w-full md:w-64 px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="">Все менеджеры</option>
              {managers.map(manager => (
                <option key={manager.id} value={manager.id}>
                  {manager.name}
                </option>
              ))}
            </select>
          </div>
        )}
      </div>

      {/* Общая статистика */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
          <div className="flex items-center">
            <div className="bg-blue-50 p-3 rounded-lg">
              <Package className="h-6 w-6 text-blue-600" />
            </div>
            <div className="ml-4">
              <p className="text-2xl font-semibold text-gray-900">{stats.totalProducts}</p>
              <p className="text-sm text-gray-500">Видов товаров</p>
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
          <div className="flex items-center">
            <div className="bg-green-50 p-3 rounded-lg">
              <TrendingUp className="h-6 w-6 text-green-600" />
            </div>
            <div className="ml-4">
              <p className="text-2xl font-semibold text-gray-900">{stats.totalStock}</p>
              <p className="text-sm text-gray-500">Общий остаток</p>
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
          <div className="flex items-center">
            <div className="bg-purple-50 p-3 rounded-lg">
              <BarChart3 className="h-6 w-6 text-purple-600" />
            </div>
            <div className="ml-4">
              <p className="text-2xl font-semibold text-gray-900">{stats.totalSales}</p>
              <p className="text-sm text-gray-500">Всего продаж</p>
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
          <div className="flex items-center">
            <div className="bg-yellow-50 p-3 rounded-lg">
              <Users className="h-6 w-6 text-yellow-600" />
            </div>
            <div className="ml-4">
              <p className="text-2xl font-semibold text-gray-900">{managers.length}</p>
              <p className="text-sm text-gray-500">Активных менеджеров</p>
            </div>
          </div>
        </div>
      </div>

      {/* Контент отчета */}
      {reportType === 'stock' && (
        <div className="space-y-6">
          <h3 className="text-lg font-semibold text-gray-900">Остатки по складам</h3>
          {Object.entries(stockByWarehouse).map(([warehouseName, items]) => (
            <div key={warehouseName} className="bg-white rounded-lg shadow-sm border border-gray-200">
              <div className="px-6 py-4 border-b border-gray-200 bg-gray-50">
                <h4 className="text-md font-semibold text-gray-900 flex items-center">
                  <Package className="h-5 w-5 mr-2 text-blue-600" />
                  {warehouseName}
                </h4>
                <p className="text-sm text-gray-500 mt-1">
                  Товаров: {items.length} | Общее количество: {items.reduce((sum, item) => sum + item.quantity, 0)}
                </p>
              </div>
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Товар</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Количество</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Единица</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Обновлено</th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {items.map((item) => (
                      <tr key={item.id}>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                          {item.product.name}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                            item.quantity > 10 
                              ? 'bg-green-100 text-green-800'
                              : item.quantity > 0
                              ? 'bg-yellow-100 text-yellow-800'
                              : 'bg-red-100 text-red-800'
                          }`}>
                            {item.quantity}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          {item.product.unit}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {new Date(item.updatedAt).toLocaleDateString('ru-RU')}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          ))}
        </div>
      )}

      {reportType === 'transactions' && (
        <div className="bg-white rounded-lg shadow-sm border border-gray-200">
          <div className="px-6 py-4 border-b border-gray-200">
            <h3 className="text-lg font-semibold text-gray-900">История операций</h3>
            <p className="text-sm text-gray-500 mt-1">
              Найдено операций: {filteredTransactions.length}
            </p>
          </div>
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Дата</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Тип</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Товар</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Количество</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Детали</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {filteredTransactions.map((transaction) => {
                  const manager = mockUsers.find(u => u.id === transaction.managerId);
                  return (
                    <tr key={transaction.id}>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {new Date(transaction.date).toLocaleDateString('ru-RU')}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                          transaction.type === 'receipt' ? 'bg-blue-100 text-blue-800' :
                          transaction.type === 'transfer' ? 'bg-yellow-100 text-yellow-800' :
                          'bg-green-100 text-green-800'
                        }`}>
                          {transaction.type === 'receipt' ? 'Оприходование' :
                           transaction.type === 'transfer' ? 'Передача' : 'Продажа'}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {transaction.product.name}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {transaction.quantity} {transaction.product.unit}
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-500">
                        {transaction.type === 'sale' && (
                          <div>
                            <div><strong>Покупатель:</strong> {transaction.customerName}</div>
                            <div><strong>Сумма:</strong> {transaction.saleAmount?.toLocaleString()} ₽</div>
                          </div>
                        )}
                        {transaction.type === 'transfer' && (
                          <div>
                            <div><strong>От:</strong> {transaction.fromWarehouse?.name}</div>
                            <div><strong>К:</strong> {transaction.toWarehouse?.name}</div>
                            {manager && <div><strong>Менеджер:</strong> {manager.name}</div>}
                          </div>
                        )}
                        {transaction.type === 'receipt' && (
                          <div><strong>На склад:</strong> {transaction.toWarehouse?.name}</div>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {reportType === 'sales' && (
        <div className="bg-white rounded-lg shadow-sm border border-gray-200">
          <div className="px-6 py-4 border-b border-gray-200">
            <h3 className="text-lg font-semibold text-gray-900">Статистика по менеджерам</h3>
          </div>
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Менеджер</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Продаж</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Выручка</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Остаток товаров</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Видов товаров</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {managerStats.map(({ manager, salesCount, totalSales, totalStock, stockItems }) => (
                  <tr key={manager.id}>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-gray-900">{manager.name}</div>
                      <div className="text-sm text-gray-500">{manager.email}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {salesCount}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {totalSales.toLocaleString()} ₽
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {totalStock}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {stockItems}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
};