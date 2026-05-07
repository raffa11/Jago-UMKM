import { Timestamp } from 'firebase/firestore';

export enum TransactionType {
  INCOME = 'income',
  EXPENSE = 'expense',
}

export interface Transaction {
  id: string;
  type: TransactionType;
  amount: number;
  category: string;
  description: string;
  date: Timestamp;
  userId: string;
  branchId: string;
  createdAt: Timestamp;
  productId?: string;
  quantity?: number;
}

export interface Branch {
  id: string;
  name: string;
  address: string;
  phone: string;
  userId: string;
  createdAt: Timestamp;
}

export interface UserProfile {
  businessName: string;
  businessType?: string;
  currency: string;
  email?: string;
  onboardingCompleted: boolean;
  activeBranchId?: string;
  createdAt: Timestamp;
}

export interface Product {
  id: string;
  name: string;
  sku?: string;
  stock: number;
  unit: string;
  price: number;
  cost: number;
  userId: string;
  branchId: string;
  createdAt: Timestamp;
}

export interface Customer {
  id: string;
  name: string;
  phone?: string;
  email?: string;
  totalSpent: number;
  totalDebt: number;
  userId: string;
  branchId: string;
  createdAt: Timestamp;
}

export interface InvoiceItem {
  productId: string;
  name: string;
  quantity: number;
  price: number;
  cost: number;
}

export interface Invoice {
  id: string;
  invoiceNumber: string;
  customerId?: string;
  customerName?: string;
  items: InvoiceItem[];
  totalAmount: number;
  totalCost: number;
  profit: number;
  status: 'Lunas' | 'Belum Lunas';
  userId: string;
  branchId: string;
  date: Timestamp;
  createdAt: Timestamp;
}

export interface Category {
  id: string;
  name: string;
  type: 'income' | 'expense' | 'both';
  iconName: string;
}

export enum OperationType {
  CREATE = 'create',
  UPDATE = 'update',
  DELETE = 'delete',
  LIST = 'list',
  GET = 'get',
  WRITE = 'write',
}

export interface FirestoreErrorInfo {
  error: string;
  operationType: OperationType;
  path: string | null;
  authInfo: {
    userId?: string | null;
    email?: string | null;
    emailVerified?: boolean | null;
    isAnonymous?: boolean | null;
    tenantId?: string | null;
    providerInfo?: {
      providerId?: string | null;
      email?: string | null;
    }[];
  }
}
