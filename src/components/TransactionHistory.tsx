import React, { useState } from 'react';
import { FileText, Search, Filter, Package, ArrowRightLeft, ShoppingCart } from 'lucide-react';
import { useInventory } from '../hooks/useInventory';
import { useAuth } from '../contexts/AuthContext';
import { mockUsers } from '../data/mockData';

export const TransactionHistory: React.FC = () => {
  const { user } = useAuth();
  const { getTransactionsWithDetails } = useInventory();
  const [searchQuery, setSearchQuery] = useState('');
  const [typeFilter, setTypeFilter] = useState('all');
  const [dateFromFilter, setDateFromFilter] = useState('');
  const [dateToFilter, setDateToFilter] = useState('');

  const allTransactions = getTransactionsWithDetails();
  
  // Фильтруем транзакции для менеджеров
  const transactions = user?.role === 'manager' 
    ? allTransactions.filter(t => t.managerId === user.id)
    : allTransactions;

  const filteredTransactions = transactions.filter(transaction => {
    const matchesSearch = transaction.product.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         transaction.customerName?.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         transaction.notes?.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesType = typeFilter === 'all' || transaction.type === typeFilter;
    
    const transactionDate = new Date(transaction.date);
    const fromDate = dateFromFilter ? new Date(dateFromFilter) : null;
    const toDate = dateToFilter ? new Date(dateToFilter) : null;
    
    const matchesDateRange = (!fromDate || transactionDate >= fromDate) && 
                            (!toDate || transactionDate <= toDate);
    
    return matchesSearch && matchesType && matchesDateRange;
  });

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'receipt': return Package;
      case 'transfer': return ArrowRightLeft;
      case 'sale': return ShoppingCart;
      default: return FileText;
    }
  };

  const getTypeText = (type: string) => {
    switch (type) {
      case 'receipt': return 'Оприходование';
      case 'transfer': return 'Передача';
      case 'sale': return 'Продажа';
      default: return type;
    }
  };

  const getTypeColor = (type: string) => {
    switch (type) {
      case 'receipt': return 'bg-blue-100 text-blue-800';
      case 'transfer': return 'bg-yellow-100 text-yellow-800';
      case 'sale': return 'bg-green-100 text-green-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-gray-900">
          {user?.role === 'admin' ? 'История операций' : 'Мои операции'}
        </h2>
        <p className="text-gray-600 mt-1">
          {user?.role === 'admin' 
            ? 'Все операции в системе' 
            : 'История ваших операций с товарами'
          }
        </p>
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
                placeholder="Поиск по товару, покупателю или примечанию..."
              />
            </div>
          </div>
          
          <div className="sm:w-48">
            <select
              value={typeFilter}
              onChange={(e) => setTypeFilter(e.target.value)}
              className="block w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="all">Все операции</option>
              <option value="receipt">Оприходование</option>
              <option value="transfer">Передача</option>
              <option value="sale">Продажа</option>
            </select>
          </div>

          <div className="sm:w-40">
            <input
              type="date"
              value={dateFromFilter}
              onChange={(e) => setDateFromFilter(e.target.value)}
              className="block w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="Дата с"
            />
          </div>

          <div className="sm:w-40">
            <input
              type="date"
              value={dateToFilter}
              onChange={(e) => setDateToFilter(e.target.value)}
              className="block w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="Дата по"
            />
          </div>
        </div>
      </div>

      {/* Список транзакций */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200">
        {filteredTransactions.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Операция
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Товар
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Количество
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Детали
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Дата
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {filteredTransactions.map((transaction) => {
                  const TypeIcon = getTypeIcon(transaction.type);
                  const manager = mockUsers.find(u => u.id === transaction.managerId);
                  const admin = mockUsers.find(u => u.id === transaction.adminId);
                  
                  return (
                    <tr key={transaction.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          <div className={`p-2 rounded-lg ${getTypeColor(transaction.type).replace('text-', 'bg-').replace('800', '100')}`}>
                            <TypeIcon className={`h-4 w-4 ${getTypeColor(transaction.type).split(' ')[1]}`} />
                          </div>
                          <div className="ml-3">
                            <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getTypeColor(transaction.type)}`}>
                              {getTypeText(transaction.type)}
                            </span>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="text-sm font-medium text-gray-900">
                          {transaction.product.name}
                        </div>
                        <div className="text-sm text-gray-500">
                          {transaction.product.description}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-900">
                          {transaction.quantity} {transaction.product.unit}
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="text-sm text-gray-900">
                          {transaction.type === 'sale' && (
                            <>
                              <div><strong>Покупатель:</strong> {transaction.customerName}</div>
                              <div><strong>Количество:</strong> {transaction.quantity} {transaction.product.unit}</div>
                            </>
                          )}
                          {transaction.type === 'transfer' && (
                            <>
                              <div><strong>От:</strong> {transaction.fromWarehouse?.name}</div>
                              <div><strong>К:</strong> {transaction.toWarehouse?.name}</div>
                              {manager && <div><strong>Менеджер:</strong> {manager.name}</div>}
                              {admin && <div><strong>Администратор:</strong> {admin.name}</div>}
                            </>
                          )}
                          {transaction.type === 'receipt' && (
                            <>
                              <div><strong>На склад:</strong> {transaction.toWarehouse?.name}</div>
                              {admin && <div><strong>Администратор:</strong> {admin.name}</div>}
                            </>
                          )}
                          {transaction.notes && (
                            <div className="mt-1 text-gray-500">
                              <strong>Примечание:</strong> {transaction.notes}
                            </div>
                          )}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {new Date(transaction.date).toLocaleDateString('ru-RU')}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="text-center py-12">
            <FileText className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-500">Операции не найдены</p>
          </div>
        )}
      </div>
    </div>
  );
};