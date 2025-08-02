import React, { useState } from 'react';
import { RotateCcw, AlertCircle, CheckCircle } from 'lucide-react';
import { useInventory } from '../hooks/useInventory';
import { useAuth } from '../contexts/AuthContext';

export const ReturnForm: React.FC = () => {
  const { user } = useAuth();
  const { getManagerStock, createReturn } = useInventory();
  const [formData, setFormData] = useState({
    productId: '',
    quantity: '',
    date: new Date().toISOString().split('T')[0],
    comments: ''
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  const managerStock = user ? getManagerStock(user.id) : [];
  const selectedProductStock = managerStock.find(s => s.productId === formData.productId);

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

      createReturn(
        user.id,
        formData.productId,
        quantity,
        formData.date,
        formData.comments || undefined
      );

      setMessage({ type: 'success', text: 'Возврат успешно оформлен' });
      setFormData({
        productId: '',
        quantity: '',
        date: new Date().toISOString().split('T')[0],
        comments: ''
      });
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
        <h2 className="text-2xl font-bold text-gray-900">Возврат товара</h2>
        <p className="text-gray-600 mt-1">Оформление возврата товара на склад</p>
      </div>

      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Информация о товаре */}
          <div className="border-b border-gray-200 pb-6">
            <h3 className="text-lg font-medium text-gray-900 mb-4">Информация о товаре</h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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
                  {managerStock.map(stockItem => (
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
                    Доступно: {selectedProductStock.quantity} {selectedProductStock.product.unit}
                  </p>
                )}
              </div>
            </div>

            <div className="mt-4">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Дата возврата *
              </label>
              <input
                type="date"
                required
                value={formData.date}
                onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                className="block w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>

            <div className="mt-4">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Комментарий
              </label>
              <textarea
                value={formData.comments}
                onChange={(e) => setFormData({ ...formData, comments: e.target.value })}
                rows={3}
                className="block w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="Причина возврата или дополнительная информация"
              />
            </div>
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
              disabled={isSubmitting}
              className="flex-1 inline-flex justify-center items-center px-4 py-2 border border-transparent text-sm font-medium rounded-lg text-white bg-orange-600 hover:bg-orange-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-orange-500 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200"
            >
              <RotateCcw className="h-4 w-4 mr-2" />
              {isSubmitting ? 'Оформление...' : 'Оформить возврат'}
            </button>
          </div>
        </form>
      </div>

      {/* Информационная панель */}
      <div className="bg-orange-50 border border-orange-200 rounded-lg p-4">
        <div className="flex items-start">
          <RotateCcw className="h-5 w-5 text-orange-600 mt-0.5 mr-3" />
          <div>
            <h3 className="text-sm font-medium text-orange-800">Информация о возврате</h3>
            <div className="mt-2 text-sm text-orange-700">
              <ul className="list-disc list-inside space-y-1">
                <li>Товар будет возвращен на ваш склад</li>
                <li>Возврат будет зафиксирован в системе</li>
                <li>Остатки обновятся автоматически</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};