import { useState, useCallback, useMemo } from 'react';
import { Task, FilterState } from '../types';
import { mockTasks } from '../data/mockData';

export const useTasks = () => {
  const [tasks, setTasks] = useState<Task[]>(mockTasks);
  const [filters, setFilters] = useState<FilterState>({
    status: '',
    priority: '',
    category: '',
    search: ''
  });

  const filteredTasks = useMemo(() => {
    return tasks.filter(task => {
      if (filters.status && task.status !== filters.status) return false;
      if (filters.priority && task.priority !== filters.priority) return false;
      if (filters.category && !task.category.toLowerCase().includes(filters.category.toLowerCase())) return false;
      if (filters.search && !task.title.toLowerCase().includes(filters.search.toLowerCase()) &&
          !task.description.toLowerCase().includes(filters.search.toLowerCase())) return false;
      return true;
    });
  }, [tasks, filters]);

  const addTask = useCallback((taskData: Partial<Task>) => {
    const newTask: Task = {
      id: Date.now().toString(),
      title: taskData.title || '',
      description: taskData.description || '',
      status: taskData.status || 'pending',
      priority: taskData.priority || 'medium',
      category: taskData.category || '',
      dueDate: taskData.dueDate || '',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    setTasks(prev => [...prev, newTask]);
  }, []);

  const updateTask = useCallback((taskId: string, updates: Partial<Task>) => {
    setTasks(prev => prev.map(task => 
      task.id === taskId 
        ? { ...task, ...updates, updatedAt: new Date().toISOString() }
        : task
    ));
  }, []);

  const deleteTask = useCallback((taskId: string) => {
    setTasks(prev => prev.filter(task => task.id !== taskId));
  }, []);

  const updateTaskStatus = useCallback((taskId: string, status: Task['status']) => {
    updateTask(taskId, { status });
  }, [updateTask]);

  return {
    tasks,
    filteredTasks,
    filters,
    setFilters,
    addTask,
    updateTask,
    deleteTask,
    updateTaskStatus
  };
};