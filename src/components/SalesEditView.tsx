import React, { useState } from 'react';
import { Edit, Search, Filter, User, Package } from 'lucide-react';
import { useInventory } from '../hooks/useInventory';
import { mockUsers } from '../data/mockData';
import { SaleEditModal } from './SaleEditModal';
import { Sale } from '../types';

export const SalesEditView: React.FC = () => {
  const { sales, products, updateSale } = useInventory();
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedManager, setSelectedManager] = useState('');
  const [dateFrom, setDateFrom] = useState('');
  const [dateTo, setDateTo] = useState('');
  const [editingSale, setEditingSale] = useState<Sale | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const managers = mockUsers.filter(u => u.role === 'manager');

  const filteredSales = sales.filter(sale => {
    const manager = managers.find(m => m.id === sale.managerId);
    const product = products.find(p => p.id === sale.productId);
    
    const matchesSearch = product?.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         manager?.name.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesManager = !selectedManager || sale.managerId === selectedManager;
    
    const saleDate = new Date(sale.date);
    const fromDate = dateFrom ? new Date(dateFrom) : null;
    const toDate = dateTo ? new Date(dateTo) : null;
    
    const matchesDateRange = (!fromDate || saleDate >= fromDate) && 
                            (!toDate || saleDate <= toDate);
    
    return matchesSearch && matchesManager && matchesDateRange;
  });

  const handleEditSale = (sale: Sale) => {
    setEditingSale(sale);
    setIsModalOpen(true);
  };

  const handleSaveSale = (saleId: string, updates: Partial<Sale>) => {
    updateSale(saleId, updates);
    setIsModalOpen(false);
    setEditingSale(null);
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-gray-900">Редактирование продаж</h2>
        <p className="text-gray-600 mt-1">Управление продажами менеджеров</p>
      </div>

      {/* Фильтры */}
      <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-200">
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="flex-1">
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <Search className="h-5 w-5 text-gray-400" />
              </div>
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="Поиск по товару или менеджеру..."
              />
            </div>
          </div>
          
          <div className="sm:w-48">
            <select
              value={selectedManager}
              onChange={(e) => setSelectedManager(e.target.value)}
              className="block w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="">Все менеджеры</option>
              {managers.map(manager => (
                <option key={manager.id} value={manager.id}>
                  {manager.name}
                </option>
              ))}
            </select>
          </div>

          <div className="sm:w-40">
            <input
              type="date"
              value={dateFrom}
              onChange={(e) => setDateFrom(e.target.value)}
              className="block w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="Дата с"
            />
          </div>

          <div className="sm:w-40">
            <input
              type="date"
              value={dateTo}
              onChange={(e) => setDateTo(e.target.value)}
              className="block w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="Дата по"
            />
          </div>
        </div>
      </div>

      {/* Список продаж */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200">
        <div className="px-6 py-4 border-b border-gray-200">
          <h3 className="text-lg font-semibold text-gray-900">Продажи менеджеров</h3>
          <p className="text-sm text-gray-500 mt-1">
            Найдено продаж: {filteredSales.length}
          </p>
        </div>
        
        {filteredSales.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Менеджер
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Товар
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Количество
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Дата
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Комментарий
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Действия
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {filteredSales.map((sale) => {
                  const manager = managers.find(m => m.id === sale.managerId);
                  const product = products.find(p => p.id === sale.productId);
                  
                  return (
                    <tr key={sale.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          <div className="bg-blue-50 p-2 rounded-lg mr-3">
                            <User className="h-4 w-4 text-blue-600" />
                          </div>
                          <div>
                            <div className="text-sm font-medium text-gray-900">
                              {manager?.name}
                            </div>
                            <div className="text-sm text-gray-500">
                              {manager?.email}
                            </div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          <Package className="h-4 w-4 text-gray-400 mr-2" />
                          <div className="text-sm font-medium text-gray-900">
                            {product?.name}
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className="inline-flex px-2 py-1 text-xs font-semibold rounded-full bg-green-100 text-green-800">
                          {sale.quantity} {product?.unit}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {new Date(sale.date).toLocaleDateString('ru-RU')}
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-500 max-w-xs truncate">
                        {sale.comments || '-'}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                        <button
                          onClick={() => handleEditSale(sale)}
                          className="inline-flex items-center px-3 py-1 border border-transparent text-sm font-medium rounded-lg text-blue-600 hover:bg-blue-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors duration-200"
                        >
                          <Edit className="h-4 w-4 mr-1" />
                          Редактировать
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="text-center py-12">
            <Edit className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-500">Продажи не найдены</p>
          </div>
        )}
      </div>

      {/* Модальное окно редактирования */}
      <SaleEditModal
        isOpen={isModalOpen}
        onClose={() => {
          setIsModalOpen(false);
          setEditingSale(null);
        }}
        sale={editingSale}
        onSave={handleSaveSale}
      />
    </div>
  );
};