import React from 'react';
import { Calendar, Flag, Clock, MoreHorizontal } from 'lucide-react';
import { Task } from '../types';

interface TaskCardProps {
  task: Task;
  onEdit: (task: Task) => void;
  onDelete: (taskId: string) => void;
  onStatusChange: (taskId: string, status: Task['status']) => void;
}

export const TaskCard: React.FC<TaskCardProps> = ({ task, onEdit, onDelete, onStatusChange }) => {
  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high': return 'text-red-600 bg-red-50';
      case 'medium': return 'text-yellow-600 bg-yellow-50';
      case 'low': return 'text-green-600 bg-green-50';
      default: return 'text-gray-600 bg-gray-50';
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed': return 'text-green-600 bg-green-50';
      case 'in-progress': return 'text-blue-600 bg-blue-50';
      case 'pending': return 'text-gray-600 bg-gray-50';
      default: return 'text-gray-600 bg-gray-50';
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'completed': return 'Завершена';
      case 'in-progress': return 'В работе';
      case 'pending': return 'Ожидает';
      default: return status;
    }
  };

  const getPriorityText = (priority: string) => {
    switch (priority) {
      case 'high': return 'Высокий';
      case 'medium': return 'Средний';
      case 'low': return 'Низкий';
      default: return priority;
    }
  };

  const isOverdue = new Date(task.dueDate) < new Date() && task.status !== 'completed';

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 hover:shadow-md transition-all duration-200 group">
      <div className="flex justify-between items-start mb-4">
        <div className="flex-1">
          <h3 className="text-lg font-semibold text-gray-900 mb-2 group-hover:text-blue-600 transition-colors duration-200">
            {task.title}
          </h3>
          <p className="text-gray-600 text-sm line-clamp-2">{task.description}</p>
        </div>
        
        <div className="ml-4 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
          <button className="p-1 hover:bg-gray-100 rounded transition-colors duration-200">
            <MoreHorizontal className="h-4 w-4 text-gray-400" />
          </button>
        </div>
      </div>

      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center space-x-4">
          <span
            className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(task.status)}`}
          >
            {getStatusText(task.status)}
          </span>
          
          <span
            className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${getPriorityColor(task.priority)}`}
          >
            <Flag className="h-3 w-3 mr-1" />
            {getPriorityText(task.priority)}
          </span>
        </div>

        <span className="text-xs text-gray-500 bg-gray-50 px-2 py-1 rounded">
          {task.category}
        </span>
      </div>

      <div className="flex items-center justify-between text-sm text-gray-500">
        <div className="flex items-center">
          <Calendar className="h-4 w-4 mr-1" />
          <span className={isOverdue ? 'text-red-600 font-medium' : ''}>
            {new Date(task.dueDate).toLocaleDateString('ru-RU')}
          </span>
          {isOverdue && (
            <div className="ml-2 flex items-center text-red-600">
              <Clock className="h-3 w-3 mr-1" />
              <span className="text-xs font-medium">Просрочена</span>
            </div>
          )}
        </div>
      </div>

      <div className="mt-4 flex space-x-2">
        <button
          onClick={() => onEdit(task)}
          className="flex-1 py-2 px-3 text-sm text-blue-600 hover:bg-blue-50 rounded-lg transition-colors duration-200"
        >
          Редактировать
        </button>
        {task.status !== 'completed' && (
          <button
            onClick={() => onStatusChange(task.id, task.status === 'pending' ? 'in-progress' : 'completed')}
            className="flex-1 py-2 px-3 text-sm text-green-600 hover:bg-green-50 rounded-lg transition-colors duration-200"
          >
            {task.status === 'pending' ? 'Начать' : 'Завершить'}
          </button>
        )}
        <button
          onClick={() => onDelete(task.id)}
          className="py-2 px-3 text-sm text-red-600 hover:bg-red-50 rounded-lg transition-colors duration-200"
        >
          Удалить
        </button>
      </div>
    </div>
  );
};