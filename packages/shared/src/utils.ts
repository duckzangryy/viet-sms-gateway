import { APIError } from './types';

export class ValidationError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'ValidationError';
  }
}

export class APIErrorResponse extends Error {
  public readonly code: string;
  public readonly details?: Record<string, any>;

  constructor(error: APIError) {
    super(error.message);
    this.name = 'APIErrorResponse';
    this.code = error.code;
    this.details = error.details;
  }
}

export function validatePhoneNumber(phone: string): boolean {
  // Vietnamese phone number validation
  const vietnamesePhoneRegex = /^(0|\+84)(3[2-9]|5[6|8|9]|7[0|6-9]|8[1-9]|9[0-9])[0-9]{7}$/;
  return vietnamesePhoneRegex.test(phone);
}

export function formatPhoneNumber(phone: string): string {
  // Convert to international format
  if (phone.startsWith('0')) {
    return `+84${phone.substring(1)}`;
  }
  if (phone.startsWith('84')) {
    return `+${phone}`;
  }
  if (phone.startsWith('+84')) {
    return phone;
  }
  return phone;
}

export function generateApiKey(): string {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  let result = '';
  for (let i = 0; i < 32; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return result;
}

export function generateMessageId(): string {
  const timestamp = Date.now().toString(36);
  const random = Math.random().toString(36).substring(2, 8);
  return `msg_${timestamp}_${random}`;
}

export function calculateSmsCost(message: string, messageType: string): number {
  const basePrice = 1; // 1 cent per SMS
  const messageLength = message.length;
  const smsCount = Math.ceil(messageLength / 160); // 160 characters per SMS
  
  let multiplier = 1;
  switch (messageType) {
    case 'OTP':
      multiplier = 1;
      break;
    case 'MARKETING':
      multiplier = 1.2;
      break;
    case 'TRANSACTIONAL':
      multiplier = 1.1;
      break;
    case 'ALERT':
      multiplier = 1;
      break;
    default:
      multiplier = 1;
  }
  
  return basePrice * smsCount * multiplier;
}

export function sanitizeMessage(message: string): string {
  // Remove potentially harmful characters
  return message
    .replace(/[<>]/g, '')
    .trim()
    .substring(0, 1000); // Limit to 1000 characters
}

export function delay(ms: number): Promise<void> {
  return new Promise(resolve => setTimeout(resolve, ms));
}