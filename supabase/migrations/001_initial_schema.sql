-- Lorencia Database Migration
-- Run this in Supabase SQL Editor after creating a new project

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Create custom enum
DO $$ BEGIN
  CREATE TYPE app_role AS ENUM ('owner', 'manager', 'cashier', 'storekeeper', 'accountant');
EXCEPTION
  WHEN duplicate_object THEN null;
END $$;

-- =====================================================
-- PROFILES (extends Supabase auth.users)
-- =====================================================
CREATE TABLE IF NOT EXISTS profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  full_name TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- =====================================================
-- BUSINESSES
-- =====================================================
CREATE TABLE IF NOT EXISTS businesses (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  slug TEXT NOT NULL UNIQUE,
  name TEXT NOT NULL,
  tagline TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- =====================================================
-- USER ROLES
-- =====================================================
CREATE TABLE IF NOT EXISTS user_roles (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  role app_role NOT NULL,
  business_id UUID REFERENCES businesses(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(user_id, business_id, role)
);

CREATE INDEX idx_user_roles_user ON user_roles(user_id);
CREATE INDEX idx_user_roles_business ON user_roles(business_id);

-- =====================================================
-- PRODUCTS
-- =====================================================
CREATE TABLE IF NOT EXISTS products (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  business_id UUID NOT NULL REFERENCES businesses(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  category TEXT,
  price NUMERIC(12,2) NOT NULL DEFAULT 0,
  stock_qty NUMERIC(12,2) NOT NULL DEFAULT 0,
  low_stock_threshold NUMERIC(12,2) NOT NULL DEFAULT 5,
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_products_biz_active ON products(business_id) WHERE is_active = true;

-- =====================================================
-- CUSTOMERS
-- =====================================================
CREATE TABLE IF NOT EXISTS customers (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  business_id UUID REFERENCES businesses(id) ON DELETE SET NULL,
  name TEXT NOT NULL,
  phone TEXT,
  email TEXT,
  notes TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_customers_biz ON customers(business_id);

-- =====================================================
-- SALES
-- =====================================================
CREATE TABLE IF NOT EXISTS sales (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  business_id UUID NOT NULL REFERENCES businesses(id) ON DELETE CASCADE,
  cashier_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  customer_id UUID REFERENCES customers(id) ON DELETE SET NULL,
  total NUMERIC(14,2) NOT NULL DEFAULT 0,
  payment_method TEXT NOT NULL DEFAULT 'cash',
  note TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_sales_biz_created ON sales(business_id, created_at DESC);
CREATE INDEX idx_sales_cashier ON sales(cashier_id);

-- =====================================================
-- SALE ITEMS
-- =====================================================
CREATE TABLE IF NOT EXISTS sale_items (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  sale_id UUID NOT NULL REFERENCES sales(id) ON DELETE CASCADE,
  product_id UUID REFERENCES products(id) ON DELETE SET NULL,
  product_name TEXT NOT NULL,
  qty NUMERIC(12,2) NOT NULL DEFAULT 1,
  unit_price NUMERIC(12,2) NOT NULL DEFAULT 0
);

CREATE INDEX idx_sale_items_sale ON sale_items(sale_id);
CREATE INDEX idx_sale_items_product ON sale_items(product_id);

-- =====================================================
-- EXPENSES
-- =====================================================
CREATE TABLE IF NOT EXISTS expenses (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  business_id UUID NOT NULL REFERENCES businesses(id) ON DELETE CASCADE,
  category TEXT NOT NULL,
  amount NUMERIC(14,2) NOT NULL,
  note TEXT,
  created_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_expenses_biz_created ON expenses(business_id, created_at DESC);

-- =====================================================
-- EXPENSE ITEMS
-- =====================================================
CREATE TABLE IF NOT EXISTS expense_items (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  expense_id UUID NOT NULL REFERENCES expenses(id) ON DELETE CASCADE,
  description TEXT NOT NULL,
  qty NUMERIC(12,2) NOT NULL DEFAULT 1,
  unit TEXT,
  unit_price NUMERIC(14,2) NOT NULL DEFAULT 0,
  total NUMERIC(14,2) NOT NULL DEFAULT 0,
  inventory_type TEXT,
  inventory_item_id UUID,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_expense_items_expense ON expense_items(expense_id);

-- =====================================================
-- CATERING EVENTS
-- =====================================================
CREATE TABLE IF NOT EXISTS catering_events (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  business_id UUID NOT NULL REFERENCES businesses(id) ON DELETE CASCADE,
  customer_id UUID REFERENCES customers(id) ON DELETE SET NULL,
  event_date DATE NOT NULL,
  venue TEXT,
  guests INT NOT NULL DEFAULT 0,
  quoted_amount NUMERIC(14,2) NOT NULL DEFAULT 0,
  deposit_paid NUMERIC(14,2) NOT NULL DEFAULT 0,
  status TEXT NOT NULL DEFAULT 'pending',
  notes TEXT,
  completed_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_catering_events_status ON catering_events(business_id, status, completed_at DESC);

-- =====================================================
-- CATERING COSTS
-- =====================================================
CREATE TABLE IF NOT EXISTS catering_costs (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  catering_event_id UUID NOT NULL REFERENCES catering_events(id) ON DELETE CASCADE,
  business_id UUID NOT NULL REFERENCES businesses(id) ON DELETE CASCADE,
  expense_id UUID REFERENCES expenses(id) ON DELETE SET NULL,
  category TEXT NOT NULL DEFAULT 'Catering Cost',
  description TEXT NOT NULL,
  amount NUMERIC(14,2) NOT NULL CHECK (amount >= 0),
  created_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_catering_costs_event ON catering_costs(catering_event_id);

-- =====================================================
-- RAW MATERIALS
-- =====================================================
CREATE TABLE IF NOT EXISTS raw_materials (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  business_id UUID NOT NULL REFERENCES businesses(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  category TEXT,
  unit TEXT NOT NULL DEFAULT 'kg',
  stock_qty NUMERIC(12,2) NOT NULL DEFAULT 0,
  unit_cost NUMERIC(12,2) NOT NULL DEFAULT 0,
  low_stock_threshold NUMERIC(12,2) NOT NULL DEFAULT 5,
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_raw_materials_biz_active ON raw_materials(business_id) WHERE is_active = true;

-- =====================================================
-- RAW MATERIAL PURCHASES
-- =====================================================
CREATE TABLE IF NOT EXISTS raw_material_purchases (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  raw_material_id UUID NOT NULL REFERENCES raw_materials(id) ON DELETE CASCADE,
  business_id UUID NOT NULL REFERENCES businesses(id) ON DELETE CASCADE,
  qty_added NUMERIC(12,2) NOT NULL,
  unit_cost NUMERIC(12,2) NOT NULL,
  total_cost NUMERIC(14,2) NOT NULL,
  note TEXT,
  expense_id UUID REFERENCES expenses(id) ON DELETE SET NULL,
  created_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_rm_purchases_material ON raw_material_purchases(raw_material_id);

-- =====================================================
-- CHART OF ACCOUNTS
-- =====================================================
CREATE TABLE IF NOT EXISTS chart_of_accounts (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  business_id UUID NOT NULL REFERENCES businesses(id) ON DELETE CASCADE,
  code TEXT NOT NULL,
  name TEXT NOT NULL,
  type TEXT NOT NULL CHECK (type IN ('asset', 'liability', 'equity', 'income', 'expense')),
  is_system BOOLEAN NOT NULL DEFAULT false,
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(business_id, code)
);

CREATE INDEX idx_coa_business ON chart_of_accounts(business_id);

-- =====================================================
-- JOURNAL ENTRIES
-- =====================================================
CREATE TABLE IF NOT EXISTS journal_entries (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  business_id UUID NOT NULL REFERENCES businesses(id) ON DELETE CASCADE,
  entry_date DATE NOT NULL,
  description TEXT NOT NULL,
  reference_type TEXT,
  reference_id UUID,
  created_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_journal_entries_biz_date ON journal_entries(business_id, entry_date);

-- =====================================================
-- JOURNAL LINES
-- =====================================================
CREATE TABLE IF NOT EXISTS journal_lines (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  journal_entry_id UUID NOT NULL REFERENCES journal_entries(id) ON DELETE CASCADE,
  account_id UUID NOT NULL REFERENCES chart_of_accounts(id) ON DELETE RESTRICT,
  debit NUMERIC(14,2) NOT NULL DEFAULT 0 CHECK (debit >= 0),
  credit NUMERIC(14,2) NOT NULL DEFAULT 0 CHECK (credit >= 0),
  CHECK ((debit > 0 AND credit = 0) OR (credit > 0 AND debit = 0))
);

CREATE INDEX idx_journal_lines_entry ON journal_lines(journal_entry_id);
CREATE INDEX idx_journal_lines_account ON journal_lines(account_id);

-- =====================================================
-- STOCK MOVEMENTS
-- =====================================================
CREATE TABLE IF NOT EXISTS stock_movements (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  business_id UUID NOT NULL REFERENCES businesses(id) ON DELETE CASCADE,
  inventory_type TEXT NOT NULL CHECK (inventory_type IN ('product', 'raw_material')),
  product_id UUID REFERENCES products(id) ON DELETE SET NULL,
  raw_material_id UUID REFERENCES raw_materials(id) ON DELETE SET NULL,
  qty_change NUMERIC(12,2) NOT NULL,
  previous_qty NUMERIC(12,2) NOT NULL,
  new_qty NUMERIC(12,2) NOT NULL,
  reason TEXT NOT NULL DEFAULT 'stock_update',
  note TEXT,
  created_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_stock_movements_biz ON stock_movements(business_id, created_at DESC);

-- =====================================================
-- FIXED ASSETS
-- =====================================================
CREATE TABLE IF NOT EXISTS fixed_assets (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  business_id UUID NOT NULL REFERENCES businesses(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  description TEXT,
  category TEXT NOT NULL DEFAULT 'Equipment',
  purchase_date DATE,
  purchase_cost NUMERIC(14,2) NOT NULL DEFAULT 0,
  current_value NUMERIC(14,2) NOT NULL DEFAULT 0,
  depreciation_method TEXT,
  depreciation_rate NUMERIC(5,2),
  depreciation_frequency TEXT,
  last_depreciation_date DATE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_fixed_assets_business ON fixed_assets(business_id);

-- =====================================================
-- EMPLOYEES
-- =====================================================
CREATE TABLE IF NOT EXISTS employees (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  business_id UUID NOT NULL REFERENCES businesses(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  position TEXT,
  base_salary NUMERIC(12,2) NOT NULL DEFAULT 0,
  pay_frequency TEXT NOT NULL DEFAULT 'monthly',
  pension_eligible BOOLEAN NOT NULL DEFAULT false,
  pension_percentage NUMERIC(5,2),
  overtime_rate NUMERIC(3,2) NOT NULL DEFAULT 2,
  hired_date DATE,
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_employees_business ON employees(business_id);

-- =====================================================
-- PAYROLL
-- =====================================================
CREATE TABLE IF NOT EXISTS payroll_settings (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  business_id UUID NOT NULL UNIQUE REFERENCES businesses(id) ON DELETE CASCADE,
  default_pension_percentage NUMERIC(5,2) NOT NULL DEFAULT 5,
  default_overtime_rate NUMERIC(3,2) NOT NULL DEFAULT 2,
  standard_hours_per_period NUMERIC(6,2) NOT NULL DEFAULT 176,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS paye_brackets (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  business_id UUID NOT NULL REFERENCES businesses(id) ON DELETE CASCADE,
  min_income NUMERIC(12,2) NOT NULL DEFAULT 0,
  max_income NUMERIC(12,2),
  rate_percent NUMERIC(5,2) NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_paye_brackets_business ON paye_brackets(business_id);

CREATE TABLE IF NOT EXISTS payroll_entries (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  employee_id UUID NOT NULL REFERENCES employees(id) ON DELETE CASCADE,
  business_id UUID NOT NULL REFERENCES businesses(id) ON DELETE CASCADE,
  pay_period_start DATE NOT NULL,
  pay_period_end DATE NOT NULL,
  gross_pay NUMERIC(12,2) NOT NULL DEFAULT 0,
  overtime_hours NUMERIC(6,2) NOT NULL DEFAULT 0,
  overtime_pay NUMERIC(12,2) NOT NULL DEFAULT 0,
  pension_deduction NUMERIC(12,2) NOT NULL DEFAULT 0,
  payee_tax NUMERIC(12,2) NOT NULL DEFAULT 0,
  net_pay NUMERIC(12,2) NOT NULL DEFAULT 0,
  status TEXT NOT NULL DEFAULT 'draft',
  paid_at TIMESTAMPTZ,
  notes TEXT,
  created_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_payroll_entries_biz ON payroll_entries(business_id, created_at DESC);

-- =====================================================
-- MALAWI HOLIDAYS
-- =====================================================
CREATE TABLE IF NOT EXISTS malawi_holidays (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  holiday_date DATE NOT NULL UNIQUE,
  name TEXT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- =====================================================
-- FUNCTIONS
-- =====================================================

-- Auto-create profile on user signup
CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, full_name)
  VALUES (NEW.id, NEW.raw_user_meta_data->>'full_name');
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Assign first user as owner
CREATE OR REPLACE FUNCTION assign_first_user_owner()
RETURNS TRIGGER AS $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM public.user_roles LIMIT 1) THEN
    INSERT INTO public.user_roles (user_id, role)
    VALUES (NEW.id, 'owner');
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Auto-update updated_at
CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- =====================================================
-- TRIGGERS
-- =====================================================

-- Profile on signup
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION handle_new_user();

-- First user becomes owner
CREATE TRIGGER on_first_user_owner
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION assign_first_user_owner();

-- Auto-update timestamps
CREATE TRIGGER products_updated BEFORE UPDATE ON products
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

CREATE TRIGGER catering_updated BEFORE UPDATE ON catering_events
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

CREATE TRIGGER raw_materials_updated BEFORE UPDATE ON raw_materials
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

CREATE TRIGGER fixed_assets_updated BEFORE UPDATE ON fixed_assets
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

CREATE TRIGGER employees_updated BEFORE UPDATE ON employees
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

CREATE TRIGGER payroll_settings_updated BEFORE UPDATE ON payroll_settings
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

CREATE TRIGGER payroll_entries_updated BEFORE UPDATE ON payroll_entries
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

-- =====================================================
-- RLS POLICIES (basic, can be tightened later)
-- =====================================================

ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_roles ENABLE ROW LEVEL SECURITY;
ALTER TABLE businesses ENABLE ROW LEVEL SECURITY;
ALTER TABLE products ENABLE ROW LEVEL SECURITY;
ALTER TABLE customers ENABLE ROW LEVEL SECURITY;
ALTER TABLE sales ENABLE ROW LEVEL SECURITY;
ALTER TABLE sale_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE expenses ENABLE ROW LEVEL SECURITY;
ALTER TABLE expense_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE catering_events ENABLE ROW LEVEL SECURITY;
ALTER TABLE catering_costs ENABLE ROW LEVEL SECURITY;
ALTER TABLE raw_materials ENABLE ROW LEVEL SECURITY;
ALTER TABLE raw_material_purchases ENABLE ROW LEVEL SECURITY;
ALTER TABLE chart_of_accounts ENABLE ROW LEVEL SECURITY;
ALTER TABLE journal_entries ENABLE ROW LEVEL SECURITY;
ALTER TABLE journal_lines ENABLE ROW LEVEL SECURITY;
ALTER TABLE stock_movements ENABLE ROW LEVEL SECURITY;
ALTER TABLE fixed_assets ENABLE ROW LEVEL SECURITY;
ALTER TABLE employees ENABLE ROW LEVEL SECURITY;
ALTER TABLE payroll_settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE paye_brackets ENABLE ROW LEVEL SECURITY;
ALTER TABLE payroll_entries ENABLE ROW LEVEL SECURITY;
ALTER TABLE malawi_holidays ENABLE ROW LEVEL SECURITY;

-- Allow authenticated users to read
CREATE POLICY "Authenticated read" ON profiles FOR SELECT USING (auth.role() = 'authenticated');
CREATE POLICY "Authenticated read" ON user_roles FOR SELECT USING (auth.role() = 'authenticated');
CREATE POLICY "Authenticated read" ON businesses FOR SELECT USING (auth.role() = 'authenticated');
CREATE POLICY "Authenticated read" ON products FOR SELECT USING (auth.role() = 'authenticated');
CREATE POLICY "Authenticated read" ON customers FOR SELECT USING (auth.role() = 'authenticated');
CREATE POLICY "Authenticated read" ON sales FOR SELECT USING (auth.role() = 'authenticated');
CREATE POLICY "Authenticated read" ON sale_items FOR SELECT USING (auth.role() = 'authenticated');
CREATE POLICY "Authenticated read" ON expenses FOR SELECT USING (auth.role() = 'authenticated');
CREATE POLICY "Authenticated read" ON expense_items FOR SELECT USING (auth.role() = 'authenticated');
CREATE POLICY "Authenticated read" ON catering_events FOR SELECT USING (auth.role() = 'authenticated');
CREATE POLICY "Authenticated read" ON catering_costs FOR SELECT USING (auth.role() = 'authenticated');
CREATE POLICY "Authenticated read" ON raw_materials FOR SELECT USING (auth.role() = 'authenticated');
CREATE POLICY "Authenticated read" ON raw_material_purchases FOR SELECT USING (auth.role() = 'authenticated');
CREATE POLICY "Authenticated read" ON chart_of_accounts FOR SELECT USING (auth.role() = 'authenticated');
CREATE POLICY "Authenticated read" ON journal_entries FOR SELECT USING (auth.role() = 'authenticated');
CREATE POLICY "Authenticated read" ON journal_lines FOR SELECT USING (auth.role() = 'authenticated');
CREATE POLICY "Authenticated read" ON stock_movements FOR SELECT USING (auth.role() = 'authenticated');
CREATE POLICY "Authenticated read" ON fixed_assets FOR SELECT USING (auth.role() = 'authenticated');
CREATE POLICY "Authenticated read" ON employees FOR SELECT USING (auth.role() = 'authenticated');
CREATE POLICY "Authenticated read" ON payroll_settings FOR SELECT USING (auth.role() = 'authenticated');
CREATE POLICY "Authenticated read" ON paye_brackets FOR SELECT USING (auth.role() = 'authenticated');
CREATE POLICY "Authenticated read" ON payroll_entries FOR SELECT USING (auth.role() = 'authenticated');
CREATE POLICY "Authenticated read" ON malawi_holidays FOR SELECT USING (auth.role() = 'authenticated');

-- Allow authenticated users to write (can be tightened per role later)
CREATE POLICY "Authenticated insert" ON products FOR INSERT WITH CHECK (auth.role() = 'authenticated');
CREATE POLICY "Authenticated update" ON products FOR UPDATE USING (auth.role() = 'authenticated');
CREATE POLICY "Authenticated insert" ON customers FOR INSERT WITH CHECK (auth.role() = 'authenticated');
CREATE POLICY "Authenticated update" ON customers FOR UPDATE USING (auth.role() = 'authenticated');
CREATE POLICY "Authenticated insert" ON sales FOR INSERT WITH CHECK (auth.role() = 'authenticated');
CREATE POLICY "Authenticated insert" ON sale_items FOR INSERT WITH CHECK (auth.role() = 'authenticated');
CREATE POLICY "Authenticated insert" ON expenses FOR INSERT WITH CHECK (auth.role() = 'authenticated');
CREATE POLICY "Authenticated insert" ON expense_items FOR INSERT WITH CHECK (auth.role() = 'authenticated');
CREATE POLICY "Authenticated insert" ON catering_events FOR INSERT WITH CHECK (auth.role() = 'authenticated');
CREATE POLICY "Authenticated update" ON catering_events FOR UPDATE USING (auth.role() = 'authenticated');
CREATE POLICY "Authenticated insert" ON catering_costs FOR INSERT WITH CHECK (auth.role() = 'authenticated');
CREATE POLICY "Authenticated insert" ON raw_materials FOR INSERT WITH CHECK (auth.role() = 'authenticated');
CREATE POLICY "Authenticated update" ON raw_materials FOR UPDATE USING (auth.role() = 'authenticated');
CREATE POLICY "Authenticated insert" ON raw_material_purchases FOR INSERT WITH CHECK (auth.role() = 'authenticated');
CREATE POLICY "Authenticated insert" ON chart_of_accounts FOR INSERT WITH CHECK (auth.role() = 'authenticated');
CREATE POLICY "Authenticated insert" ON journal_entries FOR INSERT WITH CHECK (auth.role() = 'authenticated');
CREATE POLICY "Authenticated insert" ON journal_lines FOR INSERT WITH CHECK (auth.role() = 'authenticated');
CREATE POLICY "Authenticated insert" ON stock_movements FOR INSERT WITH CHECK (auth.role() = 'authenticated');
CREATE POLICY "Authenticated insert" ON fixed_assets FOR INSERT WITH CHECK (auth.role() = 'authenticated');
CREATE POLICY "Authenticated update" ON fixed_assets FOR UPDATE USING (auth.role() = 'authenticated');
CREATE POLICY "Authenticated insert" ON employees FOR INSERT WITH CHECK (auth.role() = 'authenticated');
CREATE POLICY "Authenticated update" ON employees FOR UPDATE USING (auth.role() = 'authenticated');
CREATE POLICY "Authenticated insert" ON payroll_entries FOR INSERT WITH CHECK (auth.role() = 'authenticated');
CREATE POLICY "Authenticated update" ON payroll_entries FOR UPDATE USING (auth.role() = 'authenticated');
CREATE POLICY "Authenticated insert" ON user_roles FOR INSERT WITH CHECK (auth.role() = 'authenticated');
CREATE POLICY "Authenticated update" ON user_roles FOR UPDATE USING (auth.role() = 'authenticated');
CREATE POLICY "Authenticated manage" ON profiles FOR ALL USING (auth.uid() = id);
CREATE POLICY "Authenticated manage" ON payroll_settings FOR ALL USING (auth.role() = 'authenticated');
CREATE POLICY "Authenticated manage" ON paye_brackets FOR ALL USING (auth.role() = 'authenticated');
CREATE POLICY "Authenticated manage" ON malawi_holidays FOR ALL USING (auth.role() = 'authenticated');

-- Allow service_role full access (for NestJS backend)
-- Service role bypasses RLS by default in Supabase
