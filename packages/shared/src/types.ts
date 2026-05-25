export interface SMSMessage {
  to: string;
  message: string;
  messageType: 'OTP' | 'MARKETING' | 'TRANSACTIONAL' | 'ALERT';
  senderId?: string;
  referenceId?: string;
}

export interface BulkSMSRequest {
  messages: SMSMessage[];
  messageType: 'OTP' | 'MARKETING' | 'TRANSACTIONAL' | 'ALERT';
}

export interface SMSResponse {
  messageId: string;
  status: 'PENDING' | 'SENT' | 'DELIVERED' | 'FAILED';
  provider: string;
  to: string;
  timestamp: Date;
  error?: string;
}

export interface Client {
  id: string;
  name: string;
  email: string;
  phone: string;
  apiKey: string;
  balance: number;
  status: 'ACTIVE' | 'SUSPENDED' | 'INACTIVE';
  createdAt: Date;
  updatedAt: Date;
}

export interface PaymentTransaction {
  id: string;
  clientId: string;
  amount: number;
  currency: string;
  paymentMethod: 'STRIPE' | 'MOMO' | 'BANK_TRANSFER';
  status: 'PENDING' | 'COMPLETED' | 'FAILED';
  reference: string;
  createdAt: Date;
}

export interface APIError {
  code: string;
  message: string;
  details?: Record<string, any>;
}

export interface PaginationParams {
  page?: number;
  limit?: number;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
}

export interface PaginatedResponse<T> {
  data: T[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}