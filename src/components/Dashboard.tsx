import React from 'react';
import { Users, Package, TrendingUp, Activity } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { useInventory } from '../hooks/useInventory';

export const Dashboard: React.FC = () => {
  const { user } = useAuth();
  const { inventory, transactions, sales } = useInventory();

  // Подсчет общих остатков
  const totalStock = inventory.reduce((sum, item) => sum + item.stock, 0);
  
  // Подсчет активных менеджеров (у кого есть товары)
  const activeManagers = inventory.filter(item => 
    Object.values(item.managerStock).some(stock => stock > 0)
  ).length;

  // Подсчет операций за сегодня
  const today = new Date().toDateString();
  const todayTransactions = transactions.filter(t => 
    new Date(t.date).toDateString() === today
  ).length;

  const todaySales = sales.filter(s => 
    new Date(s.date).toDateString() === today
  ).length;

  const totalTodayOperations = todayTransactions + todaySales;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-900">
          Панель управления
        </h1>
        <p className="text-gray-600">
          Добро пожаловать, {user?.name}!
        </p>
      </div>

      {/* Статистические карточки */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white p-6 rounded-lg shadow-md">
          <div className="flex items-center">
            <div className="p-3 rounded-full bg-blue-100 text-blue-600">
              <Package className="w-6 h-6" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Общий остаток</p>
              <p className="text-2xl font-bold text-gray-900">{totalStock}</p>
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow-md">
          <div className="flex items-center">
            <div className="p-3 rounded-full bg-green-100 text-green-600">
              <Users className="w-6 h-6" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Активные менеджеры</p>
              <p className="text-2xl font-bold text-gray-900">{activeManagers}</p>
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow-md">
          <div className="flex items-center">
            <div className="p-3 rounded-full bg-purple-100 text-purple-600">
              <Activity className="w-6 h-6" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Операций сегодня</p>
              <p className="text-2xl font-bold text-gray-900">{totalTodayOperations}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Быстрые действия */}
      <div className="bg-white p-6 rounded-lg shadow-md">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">
          Быстрые действия
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <button className="p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors">
            <Package className="w-8 h-8 text-blue-600 mx-auto mb-2" />
            <p className="text-sm font-medium text-gray-900">Просмотр склада</p>
          </button>
          <button className="p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors">
            <TrendingUp className="w-8 h-8 text-green-600 mx-auto mb-2" />
            <p className="text-sm font-medium text-gray-900">Передача товара</p>
          </button>
          <button className="p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors">
            <Activity className="w-8 h-8 text-purple-600 mx-auto mb-2" />
            <p className="text-sm font-medium text-gray-900">История операций</p>
          </button>
          <button className="p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors">
            <Users className="w-8 h-8 text-orange-600 mx-auto mb-2" />
            <p className="text-sm font-medium text-gray-900">Управление пользователями</p>
          </button>
        </div>
      </div>

      {/* Последние операции */}
      {(transactions.length > 0 || sales.length > 0) && (
        <div className="bg-white p-6 rounded-lg shadow-md">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">
            Последние операции
          </h2>
          <div className="space-y-3">
            {[...transactions, ...sales]
              .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
              .slice(0, 5)
              .map((operation, index) => (
                <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <div>
                    <p className="font-medium text-gray-900">
                      {'type' in operation ? 'Передача' : 'Продажа'}: {operation.productName}
                    </p>
                    <p className="text-sm text-gray-600">
                      {'toManager' in operation 
                        ? `Менеджеру: ${operation.toManager}` 
                        : `Клиент: ${operation.customerName}`
                      }
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="font-medium text-gray-900">{operation.quantity} шт</p>
                    <p className="text-sm text-gray-600">
                      {new Date(operation.date).toLocaleDateString()}
                    </p>
                  </div>
                </div>
              ))}
          </div>
        </div>
      )}
    </div>
  );
};