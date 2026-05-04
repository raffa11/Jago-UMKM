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
  createdAt: Timestamp;
}

export interface UserProfile {
  businessName: string;
  businessType?: string;
  currency: string;
  email?: string;
  onboardingCompleted: boolean;
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
