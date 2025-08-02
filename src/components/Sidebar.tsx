import React from 'react';
import { 
  Home, 
  Package, 
  ShoppingCart, 
  TruckIcon, 
  BarChart3, 
  Users,
  FileText,
  Plus,
  ArrowRightLeft,
  X
} from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';

interface SidebarProps {
  activeView: string;
  onViewChange: (view: string) => void;
  isOpen: boolean;
  onClose: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({ activeView, onViewChange, isOpen, onClose }) => {
  const { user } = useAuth();

  const adminNavigation = [
    { name: 'Главная', icon: Home, id: 'dashboard' },
    { name: 'Остатки на складах', icon: Package, id: 'stock' },
    { name: 'Оприходование', icon: Plus, id: 'receipt' },
    { name: 'Передача товара', icon: ArrowRightLeft, id: 'transfer' },
    { name: 'Выдача контрагенту', icon: Users, id: 'contractor' },
    { name: 'Аналитика менеджеров', icon: BarChart3, id: 'analytics' },
    { name: 'История операций', icon: FileText, id: 'transactions' },
    { name: 'Отчеты', icon: BarChart3, id: 'reports' },
    { name: 'Пользователи', icon: Users, id: 'users' },
    { name: 'Редактирование продаж', icon: FileText, id: 'edit-sales' }
  ];

  const managerNavigation = [
    { name: 'Главная', icon: Home, id: 'dashboard' },
    { name: 'Мои остатки', icon: Package, id: 'my-stock' },
    { name: 'Оформить продажу', icon: ShoppingCart, id: 'sale' },
    { name: 'Возврат товара', icon: TruckIcon, id: 'return' },
    { name: 'Аналитика', icon: BarChart3, id: 'analytics' },
    { name: 'Мои продажи', icon: FileText, id: 'my-sales' }
  ];

  const navigation = user?.role === 'admin' ? adminNavigation : managerNavigation;

  const handleItemClick = (id: string) => {
    onViewChange(id);
    onClose(); // Close sidebar on mobile after selection
  };
  return (
    <div className={`bg-white w-64 min-h-screen shadow-sm border-r border-gray-100 fixed lg:relative z-50 lg:z-auto transform transition-transform duration-300 ease-in-out ${
      isOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'
    }`}>
      <div className="p-6">
        {/* Mobile close button */}
        <div className="flex justify-end lg:hidden mb-4">
          <button
            onClick={onClose}
            className="p-2 rounded-lg text-gray-600 hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <X className="h-5 w-5" />
          </button>
        </div>
        
        <nav className="space-y-1">
          {navigation.map((item) => {
            const Icon = item.icon;
            return (
              <button
                key={item.id}
                onClick={() => handleItemClick(item.id)}
                className={`${
                  activeView === item.id
                    ? 'bg-blue-50 text-blue-700 border-r-2 border-blue-700'
                    : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                } group flex items-center px-3 py-3 text-sm font-medium rounded-lg transition-all duration-200 w-full text-left`}
              >
                <Icon
                  className={`${
                    activeView === item.id ? 'text-blue-500' : 'text-gray-400 group-hover:text-gray-500'
                  } mr-3 h-5 w-5 transition-colors duration-200`}
                />
                <span className="truncate">{item.name}</span>
              </button>
            );
          })}
        </nav>

        {/* Quick stats for managers */}
        {user?.role === 'manager' && (
          <div className="mt-8 p-4 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-lg">
            <h3 className="text-sm font-medium text-gray-700 mb-2">Быстрая статистика</h3>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-gray-600">Товаров в наличии:</span>
                <span className="font-medium text-gray-900">-</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Продаж сегодня:</span>
                <span className="font-medium text-gray-900">-</span>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};