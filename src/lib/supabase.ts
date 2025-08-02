import { createClient } from '@supabase/supabase-js'

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY

export const supabase = createClient(supabaseUrl, supabaseAnonKey)

// Database types
export interface Product {
  id: string
  name: string
  description?: string
  unit: string
  created_at: string
}

export interface Stock {
  id: string
  product_id: string
  warehouse_id: string
  quantity: number
  updated_at: string
}

export interface Warehouse {
  id: string
  name: string
  type: 'office' | 'manager'
  manager_id?: string
  created_at: string
}

export interface Transaction {
  id: string
  type: 'receipt' | 'transfer' | 'sale' | 'return' | 'contractor_issue'
  product_id: string
  quantity: number
  from_warehouse_id?: string
  to_warehouse_id?: string
  manager_id?: string
  admin_id?: string
  date: string
  notes?: string
  customer_name?: string
  customer_phone?: string
  customer_city?: string
  sale_amount?: number
  comments?: string
  contractor_name?: string
  created_at: string
  updated_at?: string
}

export interface User {
  id: string
  name: string
  email: string
  role: 'admin' | 'manager'
  phone?: string
  created_at: string
}