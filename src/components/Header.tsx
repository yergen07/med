import React from 'react';
import { LogOut, User, Package, Menu } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';

interface HeaderProps {
  onMenuClick: () => void;
}

export const Header: React.FC<HeaderProps> = ({ onMenuClick }) => {
  const { user, logout } = useAuth();

  const getRoleText = (role: string) => {
    return role === 'admin' ? 'Администратор' : 'Менеджер по продажам';
  };

  return (
    <header className="bg-white shadow-sm border-b border-gray-100 sticky top-0 z-10">
      <div className="w-full px-4 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Mobile menu button */}
          <button
            onClick={onMenuClick}
            className="lg:hidden p-2 rounded-lg text-gray-600 hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <Menu className="h-6 w-6" />
          </button>
          
          {/* Logo */}
          <div className="flex items-center min-w-0 lg:ml-0 ml-2">
            <div className="bg-gradient-to-r from-blue-600 to-indigo-600 p-2 rounded-lg">
              <Package className="h-5 w-5 lg:h-6 lg:w-6 text-white" />
            </div>
            <div className="ml-3 min-w-0">
              <h1 className="text-lg lg:text-xl font-bold text-gray-900 truncate">InventoryPro</h1>
              <p className="text-xs text-gray-500 hidden lg:block">Система учета товаров</p>
            </div>
          </div>

          {/* User info and actions */}
          <div className="flex items-center space-x-2 lg:space-x-4">
            <div className="hidden md:flex items-center space-x-3">
              <div className="bg-gray-100 p-2 rounded-lg">
                <User className="h-5 w-5 text-gray-600" />
              </div>
              <div className="text-right">
                <p className="text-sm font-medium text-gray-900">{user?.name}</p>
                <p className="text-xs text-gray-500">{getRoleText(user?.role || '')}</p>
              </div>
            </div>
            
            <button
              onClick={logout}
              className="inline-flex items-center px-3 py-2 border border-transparent text-sm font-medium rounded-lg text-gray-600 hover:text-gray-900 hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-all duration-200"
            >
              <LogOut className="h-4 w-4 mr-2" />
              <span className="hidden md:inline">Выйти</span>
            </button>
          </div>
        </div>
      </div>
    </header>
  );
};