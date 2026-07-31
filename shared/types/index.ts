export type AppRole = "owner" | "manager" | "cashier" | "storekeeper" | "accountant";

export interface Business {
  id: string;
  slug: string;
  name: string;
  tagline: string | null;
  createdAt: Date;
}

export interface Product {
  id: string;
  businessId: string;
  name: string;
  category: string | null;
  price: number;
  stockQty: number;
  lowStockThreshold: number;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface Customer {
  id: string;
  businessId: string | null;
  name: string;
  phone: string | null;
  email: string | null;
  notes: string | null;
  createdAt: Date;
}

export interface Sale {
  id: string;
  businessId: string;
  cashierId: string | null;
  customerId: string | null;
  total: number;
  paymentMethod: string;
  note: string | null;
  createdAt: Date;
}

export interface SaleItem {
  id: string;
  saleId: string;
  productId: string | null;
  productName: string;
  qty: number;
  unitPrice: number;
}

export interface Expense {
  id: string;
  businessId: string;
  category: string;
  amount: number;
  note: string | null;
  createdBy: string | null;
  createdAt: Date;
}

export interface ExpenseItem {
  id: string;
  expenseId: string;
  description: string;
  qty: number;
  unit: string | null;
  unitPrice: number;
  total: number;
  inventoryType: string | null;
  inventoryItemId: string | null;
  createdAt: Date;
}

export interface UserRole {
  id: string;
  userId: string;
  role: AppRole;
  businessId: string | null;
  createdAt: Date;
}

export interface Profile {
  id: string;
  fullName: string | null;
  createdAt: Date;
  updatedAt: Date;
}

export interface RawMaterial {
  id: string;
  businessId: string;
  name: string;
  category: string | null;
  unit: string;
  stockQty: number;
  unitCost: number;
  lowStockThreshold: number;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface RawMaterialPurchase {
  id: string;
  rawMaterialId: string;
  businessId: string;
  qtyAdded: number;
  unitCost: number;
  totalCost: number;
  note: string | null;
  expenseId: string | null;
  createdBy: string | null;
  createdAt: Date;
}

export interface CateringEvent {
  id: string;
  businessId: string;
  customerId: string | null;
  eventDate: Date;
  venue: string | null;
  guests: number;
  quotedAmount: number;
  depositPaid: number;
  status: string;
  notes: string | null;
  completedAt: Date | null;
  createdAt: Date;
  updatedAt: Date;
}

export interface CateringCost {
  id: string;
  cateringEventId: string;
  businessId: string;
  expenseId: string | null;
  category: string;
  description: string;
  amount: number;
  createdBy: string | null;
  createdAt: Date;
}

export interface FixedAsset {
  id: string;
  businessId: string;
  name: string;
  description: string | null;
  category: string;
  purchaseDate: Date | null;
  purchaseCost: number;
  currentValue: number;
  depreciationMethod: string | null;
  depreciationRate: number | null;
  depreciationFrequency: string | null;
  lastDepreciationDate: Date | null;
  createdAt: Date;
  updatedAt: Date;
}

export interface Employee {
  id: string;
  businessId: string;
  name: string;
  position: string | null;
  baseSalary: number;
  payFrequency: string;
  pensionEligible: boolean;
  pensionPercentage: number | null;
  overtimeRate: number;
  hiredDate: Date | null;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface PayrollEntry {
  id: string;
  employeeId: string;
  businessId: string;
  payPeriodStart: Date;
  payPeriodEnd: Date;
  grossPay: number;
  overtimeHours: number;
  overtimePay: number;
  pensionDeduction: number;
  payeeTax: number;
  netPay: number;
  status: string;
  paidAt: Date | null;
  notes: string | null;
  createdBy: string | null;
  createdAt: Date;
  updatedAt: Date;
}

export interface PayrollSettings {
  id: string;
  businessId: string;
  defaultPensionPercentage: number;
  defaultOvertimeRate: number;
  standardHoursPerPeriod: number;
  createdAt: Date;
  updatedAt: Date;
}

export interface PayeBracket {
  id: string;
  businessId: string;
  minIncome: number;
  maxIncome: number | null;
  ratePercent: number;
  createdAt: Date;
}

export interface ChartOfAccount {
  id: string;
  businessId: string;
  code: string;
  name: string;
  type: string;
  isSystem: boolean;
  isActive: boolean;
  createdAt: Date;
}

export interface JournalEntry {
  id: string;
  businessId: string;
  entryDate: Date;
  description: string;
  referenceType: string | null;
  referenceId: string | null;
  createdBy: string | null;
  createdAt: Date;
}

export interface JournalLine {
  id: string;
  journalEntryId: string;
  accountId: string;
  debit: number;
  credit: number;
}

export interface StockMovement {
  id: string;
  businessId: string;
  inventoryType: string;
  productId: string | null;
  rawMaterialId: string | null;
  qtyChange: number;
  previousQty: number;
  newQty: number;
  reason: string;
  note: string | null;
  createdBy: string | null;
  createdAt: Date;
}

export interface MalawiHoliday {
  id: string;
  holidayDate: Date;
  name: string;
  createdAt: Date;
}
