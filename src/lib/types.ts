export interface Company {
  id: number;
  name: string;
  gstin: string;
  pan: string;
  state: string;
  address: string;
  fy_start: string;
  fy_end: string;
  is_active: boolean;
}

export interface Ledger {
  id: number;
  company_id: number;
  name: string;
  group_name: string;
  category: string;
  opening_balance: number;
  balance: number;
  balance_type: string;
}

export interface Voucher {
  id: number;
  company_id: number;
  voucher_no: string;
  voucher_type: string;
  date: string;
  party: string;
  debit_ledger: string;
  credit_ledger: string;
  amount: number;
  narration: string;
}

export interface InvoiceItem {
  name: string;
  qty: number;
  rate: number;
  gst: number;
}

export interface Invoice {
  id: number;
  company_id: number;
  invoice_no: string;
  inv_type: string;
  party: string;
  date: string;
  due_date: string;
  subtotal: number;
  cgst: number;
  sgst: number;
  igst: number;
  total: number;
  status: string;
  items: InvoiceItem[];
}

export interface StockItem {
  id: number;
  company_id: number;
  name: string;
  hsn: string;
  category: string;
  unit: string;
  quantity: number;
  rate: number;
  reorder_level: number;
  gst_rate: number;
}

export interface Party {
  id: number;
  company_id: number;
  name: string;
  party_type: string;
  gstin: string;
  phone: string;
  email: string;
  address: string;
  balance: number;
}

export interface GstRecord {
  id: number;
  company_id: number;
  period: string;
  return_type: string;
  taxable_value: number;
  tax_amount: number;
  itc_claimed: number;
  status: string;
  filed_on: string;
}

export interface BankAccount {
  id: number;
  company_id: number;
  bank_name: string;
  account_no: string;
  ifsc: string;
  account_type: string;
  balance: number;
}

export interface BankTxn {
  id: number;
  account_id: number;
  date: string;
  description: string;
  txn_type: string;
  amount: number;
  reconciled: boolean;
}

export interface Employee {
  id: number;
  company_id: number;
  name: string;
  designation: string;
  department: string;
  basic: number;
  hra: number;
  allowances: number;
  deductions: number;
  net_salary: number;
  status: string;
}

export interface PayrollRun {
  id: number;
  company_id: number;
  month: string;
  employees_count: number;
  gross_total: number;
  deductions_total: number;
  net_total: number;
  status: string;
}

export interface AppUser {
  id: number;
  name: string;
  email: string;
  role: string;
  status: string;
  last_login: string;
}
