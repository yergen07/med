/*
  # Создание таблиц для системы учета товаров

  1. Новые таблицы
    - `users` - пользователи системы
    - `products` - товары
    - `warehouses` - склады
    - `stock` - остатки товаров на складах
    - `transactions` - история операций

  2. Безопасность
    - Включен RLS для всех таблиц
    - Политики доступа для аутентифицированных пользователей
*/

-- Создание таблицы пользователей
CREATE TABLE IF NOT EXISTS users (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  email text UNIQUE NOT NULL,
  role text NOT NULL CHECK (role IN ('admin', 'manager')),
  phone text,
  created_at timestamptz DEFAULT now()
);

-- Создание таблицы товаров
CREATE TABLE IF NOT EXISTS products (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  description text,
  unit text NOT NULL DEFAULT 'шт',
  created_at timestamptz DEFAULT now()
);

-- Создание таблицы складов
CREATE TABLE IF NOT EXISTS warehouses (
  id text PRIMARY KEY,
  name text NOT NULL,
  type text NOT NULL CHECK (type IN ('office', 'manager')),
  manager_id uuid REFERENCES users(id),
  created_at timestamptz DEFAULT now()
);

-- Создание таблицы остатков
CREATE TABLE IF NOT EXISTS stock (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  product_id uuid NOT NULL REFERENCES products(id),
  warehouse_id text NOT NULL REFERENCES warehouses(id),
  quantity numeric NOT NULL DEFAULT 0,
  updated_at timestamptz DEFAULT now(),
  UNIQUE(product_id, warehouse_id)
);

-- Создание таблицы транзакций
CREATE TABLE IF NOT EXISTS transactions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  type text NOT NULL CHECK (type IN ('receipt', 'transfer', 'sale', 'return', 'contractor_issue')),
  product_id uuid NOT NULL REFERENCES products(id),
  quantity numeric NOT NULL,
  from_warehouse_id text REFERENCES warehouses(id),
  to_warehouse_id text REFERENCES warehouses(id),
  manager_id uuid REFERENCES users(id),
  admin_id uuid REFERENCES users(id),
  date date NOT NULL,
  notes text,
  customer_name text,
  customer_phone text,
  customer_city text,
  sale_amount numeric,
  comments text,
  contractor_name text,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Включение RLS
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE products ENABLE ROW LEVEL SECURITY;
ALTER TABLE warehouses ENABLE ROW LEVEL SECURITY;
ALTER TABLE stock ENABLE ROW LEVEL SECURITY;
ALTER TABLE transactions ENABLE ROW LEVEL SECURITY;

-- Политики доступа для пользователей
CREATE POLICY "Users can read all users"
  ON users
  FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Admins can manage users"
  ON users
  FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM users 
      WHERE id = auth.uid() AND role = 'admin'
    )
  );

-- Политики для товаров
CREATE POLICY "All users can read products"
  ON products
  FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Admins can manage products"
  ON products
  FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM users 
      WHERE id = auth.uid() AND role = 'admin'
    )
  );

-- Политики для складов
CREATE POLICY "All users can read warehouses"
  ON warehouses
  FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Admins can manage warehouses"
  ON warehouses
  FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM users 
      WHERE id = auth.uid() AND role = 'admin'
    )
  );

-- Политики для остатков
CREATE POLICY "All users can read stock"
  ON stock
  FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Admins can manage stock"
  ON stock
  FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM users 
      WHERE id = auth.uid() AND role = 'admin'
    )
  );

-- Политики для транзакций
CREATE POLICY "All users can read transactions"
  ON transactions
  FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Users can create transactions"
  ON transactions
  FOR INSERT
  TO authenticated
  WITH CHECK (true);

CREATE POLICY "Admins can manage transactions"
  ON transactions
  FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM users 
      WHERE id = auth.uid() AND role = 'admin'
    )
  );