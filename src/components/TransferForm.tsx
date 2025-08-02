import React, { useState } from 'react';
import { ArrowRightLeft, AlertCircle, CheckCircle, User } from 'lucide-react';
import { useInventory } from '../hooks/useInventory';
import { useAuth } from '../contexts/AuthContext';
import { mockUsers } from '../data/mockData';

export const TransferForm: React.FC = () => {
  const { user } = useAuth();
  const { products, getStockWithProducts, transferToManager } = useInventory();
  const [formData, setFormData] = useState({
    productId: '',
    quantity: '',
    managerId: '',
    notes: ''
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  const managers = mockUsers.filter(u => u.role === 'manager');
  const officeStock = getStockWithProducts('office');
  const selectedProduct = products.find(p => p.id === formData.productId);
  const selectedProductStock = officeStock.find(s => s.productId === formData.productId);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;

    setIsSubmitting(true);
    setMessage(null);

    try {
      const quantity = parseInt(formData.quantity);
      if (quantity <= 0) {
        throw new Error('Количество должно быть больше 0');
      }

      if (!selectedProductStock || selectedProductStock.quantity < quantity) {
        throw new Error('Недостаточно товара на офисном складе');
      }

      transferToManager(
        formData.productId,
        quantity,
        formData.managerId,
        user.id,
        formData.notes || undefined
      );

      setMessage({ type: 'success', text: 'Товар успешно передан менеджеру' });
      setFormData({ productId: '', quantity: '', managerId: '', notes: '' });
    } catch (error) {
      setMessage({ 
        type: 'error', 
        text: error instanceof Error ? error.message : 'Произошла ошибка' 
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-gray-900">Передача товара менеджеру</h2>
        <p className="text-gray-600 mt-1">Выдача товара с офисного склада менеджеру</p>
      </div>

      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Менеджер *
            </label>
            <select
              required
              value={formData.managerId}
              onChange={(e) => setFormData({ ...formData, managerId: e.target.value })}
              className="block w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="">Выберите менеджера</option>
              {managers.map(manager => (
                <option key={manager.id} value={manager.id}>
                  {manager.name} ({manager.email})
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Товар *
            </label>
            <select
              required
              value={formData.productId}
              onChange={(e) => setFormData({ ...formData, productId: e.target.value, quantity: '' })}
              className="block w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="">Выберите товар</option>
              {officeStock.map(stockItem => (
                <option key={stockItem.productId} value={stockItem.productId}>
                  {stockItem.product.name} (в наличии: {stockItem.quantity} {stockItem.product.unit})
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Количество *
            </label>
            <input
              type="number"
              required
              min="1"
              max={selectedProductStock?.quantity || 0}
              value={formData.quantity}
              onChange={(e) => setFormData({ ...formData, quantity: e.target.value })}
              className="block w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="Введите количество"
            />
            {selectedProductStock && (
              <p className="mt-1 text-sm text-gray-500">
                Доступно на складе: {selectedProductStock.quantity} {selectedProduct?.unit}
              </p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Комментарий
            </label>
            <textarea
              value={formData.notes}
              onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
              rows={3}
              className="block w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="Комментарий к передаче товара (необязательно)"
            />
          </div>

          {message && (
            <div className={`flex items-center space-x-2 p-3 rounded-lg ${
              message.type === 'success' 
                ? 'bg-green-50 text-green-700' 
                : 'bg-red-50 text-red-700'
            }`}>
              {message.type === 'success' ? (
                <CheckCircle className="h-5 w-5" />
              ) : (
                <AlertCircle className="h-5 w-5" />
              )}
              <span className="text-sm">{message.text}</span>
            </div>
          )}

          <div className="flex space-x-3">
            <button
              type="submit"
              disabled={isSubmitting || !formData.productId || !formData.managerId}
              className="flex-1 inline-flex justify-center items-center px-4 py-2 border border-transparent text-sm font-medium rounded-lg text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200"
            >
              <ArrowRightLeft className="h-4 w-4 mr-2" />
              {isSubmitting ? 'Передача...' : 'Передать товар'}
            </button>
          </div>
        </form>
      </div>

      {/* Информационная панель */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
        <div className="flex items-start">
          <User className="h-5 w-5 text-blue-600 mt-0.5 mr-3" />
          <div>
            <h3 className="text-sm font-medium text-blue-800">Информация о передаче</h3>
            <div className="mt-2 text-sm text-blue-700">
              <ul className="list-disc list-inside space-y-1">
                <li>Товар будет списан с офисного склада</li>
                <li>Товар будет добавлен на склад выбранного менеджера</li>
                <li>Операция будет зафиксирована в истории</li>
                <li>Менеджер сможет видеть товар в своих остатках</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};