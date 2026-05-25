export * from './types';
export * from './utils';

// Constants
export const SMS_PROVIDERS = {
  VIETTEL: 'viettel',
  MOBIFONE: 'mobifone',
  VINAPHONE: 'vinaphone',
  TWILIO: 'twilio'
} as const;

export const MESSAGE_TYPES = {
  OTP: 'OTP',
  MARKETING: 'MARKETING',
  TRANSACTIONAL: 'TRANSACTIONAL',
  ALERT: 'ALERT'
} as const;

export const PAYMENT_METHODS = {
  STRIPE: 'STRIPE',
  MOMO: 'MOMO',
  BANK_TRANSFER: 'BANK_TRANSFER'
} as const;

export const CLIENT_STATUS = {
  ACTIVE: 'ACTIVE',
  SUSPENDED: 'SUSPENDED',
  INACTIVE: 'INACTIVE'
} as const;

export const TRANSACTION_STATUS = {
  PENDING: 'PENDING',
  COMPLETED: 'COMPLETED',
  FAILED: 'FAILED'
} as const;

export const SMS_STATUS = {
  PENDING: 'PENDING',
  SENT: 'SENT',
  DELIVERED: 'DELIVERED',
  FAILED: 'FAILED'
} as const;

// Configuration
export const DEFAULT_CONFIG = {
  SMS_PRICE_PER_MESSAGE: 1, // 1 cent
  MAX_MESSAGE_LENGTH: 1000,
  BULK_SMS_LIMIT: 1000,
  RATE_LIMIT_WINDOW_MS: 60000, // 1 minute
  RATE_LIMIT_MAX_REQUESTS: 100,
  JWT_EXPIRY: '24h',
  API_KEY_EXPIRY_DAYS: 365
} as const;