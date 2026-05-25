# Vietnamese SMS API - Complete API Reference

## 📋 Table of Contents
1. [Authentication](#authentication)
2. [SMS Endpoints](#sms-endpoints)
3. [Payment Endpoints](#payment-endpoints)
4. [Authentication Endpoints](#authentication-endpoints)
5. [Webhooks](#webhooks)
6. [Error Codes](#error-codes)
7. [Rate Limiting](#rate-limiting)
8. [Best Practices](#best-practices)

## 🔐 Authentication

### API Key Authentication
Use API key for machine-to-machine communication (SMS sending, status checks).

```http
Authorization: Bearer YOUR_API_KEY
```

### JWT Authentication
Use JWT token for user dashboard operations (profile, payments, statistics).

```http
Authorization: Bearer YOUR_JWT_TOKEN
```

### Getting Your API Key
1. Register at `/api/v1/auth/register`
2. Login at `/api/v1/auth/login`
3. Get API key from response or profile

## 📱 SMS Endpoints

### Send Single SMS
Send one SMS to a single recipient.

```http
POST /api/v1/sms/send
Authorization: Bearer YOUR_API_KEY
Content-Type: application/json
```

**Request Body:**
```json
{
  "to": "0912345678",
  "message": "Your OTP code is 123456",
  "messageType": "OTP",
  "senderId": "YOURBRAND",
  "tags": ["otp", "login"]
}
```

**Parameters:**
| Parameter | Type | Required | Description | Validation |
|-----------|------|----------|-------------|------------|
| `to` | string | Yes | Recipient phone number | Vietnamese format: 0xxxxxxxxx or +84xxxxxxxxx |
| `message` | string | Yes | SMS content | Max 160 characters |
| `messageType` | string | No | Type of message | `OTP`, `MARKETING`, `TRANSACTIONAL`, `ALERT` (default: `OTP`) |
| `senderId` | string | No | Sender ID (max 11 chars) | Alphanumeric only |
| `tags` | array | No | Tags for categorization | Max 10 tags, each max 50 chars |

**Response (Success):**
```json
{
  "success": true,
  "data": {
    "messageId": "507f1f77bcf86cd799439011",
    "providerMessageId": "viettel_123456789",
    "provider": "VIETTEL",
    "to": "+84912345678",
    "message": "Your OTP code is 123456",
    "messageType": "OTP",
    "price": 1,
    "currency": "USD",
    "status": "SENT",
    "sentAt": "2026-05-25T13:06:39.126Z",
    "remainingBalance": 99
  }
}
```

**Response (Error):**
```json
{
  "success": false,
  "error": "Insufficient balance",
  "balance": 0,
  "currency": "USD"
}
```

### Send Bulk SMS
Send multiple SMS in one request (max 1000 messages).

```http
POST /api/v1/sms/bulk
Authorization: Bearer YOUR_API_KEY
Content-Type: application/json
```

**Request Body:**
```json
{
  "messages": [
    {
      "to": "0912345678",
      "message": "Welcome to our service!",
      "tags": ["welcome"]
    },
    {
      "to": "0987654321",
      "message": "Your order #12345 is ready",
      "tags": ["order", "notification"]
    }
  ],
  "messageType": "MARKETING",
  "senderId": "YOURBRAND"
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "total": 2,
    "successful": 2,
    "failed": 0,
    "totalPrice": 1.6,
    "currency": "USD",
    "remainingBalance": 98.4,
    "results": [
      {
        "messageId": "507f1f77bcf86cd799439012",
        "to": "+84912345678",
        "status": "SENT",
        "providerMessageId": "viettel_123456790"
      },
      {
        "messageId": "507f1f77bcf86cd799439013",
        "to": "+84987654321",
        "status": "SENT",
        "providerMessageId": "viettel_123456791"
      }
    ]
  }
}
```

### Check SMS Status
Get the status of a specific SMS message.

```http
GET /api/v1/sms/status/{messageId}
Authorization: Bearer YOUR_API_KEY
```

**Parameters:**
| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `messageId` | string | Yes | Message ID from send response |

**Response:**
```json
{
  "success": true,
  "data": {
    "messageId": "507f1f77bcf86cd799439011",
    "to": "+84912345678",
    "message": "Your OTP code is 123456",
    "messageType": "OTP",
    "provider": "VIETTEL",
    "providerMessageId": "viettel_123456789",
    "status": "DELIVERED",
    "price": 1,
    "currency": "USD",
    "createdAt": "2026-05-25T13:06:39.126Z",
    "sentAt": "2026-05-25T13:06:40.126Z",
    "deliveredAt": "2026-05-25T13:06:45.126Z",
    "deliveryReport": {
      "status": "delivered",
      "timestamp": "2026-05-25T13:06:45.126Z"
    },
    "deliveryStatus": {
      "status": "DELIVERED",
      "lastUpdated": "2026-05-25T13:06:45.126Z"
    }
  }
}
```

### Get SMS Statistics
Get statistics for your account.

```http
GET /api/v1/sms/statistics
Authorization: Bearer YOUR_JWT_TOKEN
```

**Query Parameters:**
| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `startDate` | string | No | Start date (ISO 8601) |
| `endDate` | string | No | End date (ISO 8601) |

**Response:**
```json
{
  "success": true,
  "data": {
    "total": 150,
    "byStatus": {
      "SENT": 100,
      "DELIVERED": 90,
      "FAILED": 10,
      "PENDING": 0
    },
    "byType": {
      "OTP": 80,
      "MARKETING": 50,
      "TRANSACTIONAL": 20
    },
    "byProvider": {
      "VIETTEL": 100,
      "MOBIFONE": 30,
      "TWILIO": 20
    },
    "totalCost": 150,
    "currency": "USD",
    "dailyCounts": [
      {
        "_id": "2026-05-25",
        "count": 10,
        "cost": 10
      },
      {
        "_id": "2026-05-24",
        "count": 15,
        "cost": 15
      }
    ]
  }
}
```

### Get Available Providers
Get list of available SMS providers and their status.

```http
GET /api/v1/sms/providers
Authorization: Bearer YOUR_API_KEY
```

**Response:**
```json
{
  "success": true,
  "data": {
    "VIETTEL": {
      "name": "Viettel",
      "enabled": true,
      "priority": 1,
      "lastUsed": "2026-05-25T13:06:39.126Z"
    },
    "MOBIFONE": {
      "name": "Mobifone",
      "enabled": true,
      "priority": 2,
      "lastUsed": "2026-05-25T12:30:00.000Z"
    },
    "VINAPHONE": {
      "name": "Vinaphone",
      "enabled": false,
      "priority": 3,
      "lastUsed": null
    },
    "TWILIO": {
      "name": "Twilio",
      "enabled": true,
      "priority": 4,
      "lastUsed": "2026-05-25T10:15:00.000Z"
    }
  }
}
```

### Validate Phone Number
Validate phone number format without sending SMS.

```http
POST /api/v1/sms/validate
Content-Type: application/json
```

**Request Body:**
```json
{
  "phone": "0912345678"
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "phone": "0912345678",
    "formatted": "+84912345678",
    "isValid": true,
    "country": "Vietnam"
  }
}
```

### Get Pricing Information
Get current pricing information.

```http
GET /api/v1/sms/pricing
```

**Response:**
```json
{
  "success": true,
  "data": {
    "single": {
      "price": 1,
      "currency": "USD",
      "description": "Per SMS"
    },
    "bulk": {
      "price": 0.8,
      "currency": "USD",
      "description": "Per SMS (1000+ messages, 20% discount)",
      "discount": "20%"
    },
    "vnd": {
      "price": 230,
      "currency": "VND",
      "description": "Approximate VND equivalent"
    },
    "limits": {
      "daily": 1000,
      "monthly": 30000,
      "messageLength": 160
    }
  }
}
```

## 💰 Payment Endpoints

### Get Balance
Get current account balance.

```http
GET /api/v1/payment/balance
Authorization: Bearer YOUR_JWT_TOKEN
```

**Response:**
```json
{
  "success": true,
  "data": {
    "balance": 150,
    "currency": "USD",
    "recentTransactions": [
      {
        "_id": "507f1f77bcf86cd799439014",
        "type": "DEPOSIT",
        "amount": 100,
        "currency": "USD",
        "status": "COMPLETED",
        "paymentMethod": "STRIPE",
        "description": "Deposit 100 USD",
        "createdAt": "2026-05-25T12:00:00.000Z"
      }
    ]
  }
}
```

### Create Deposit
Create a payment intent for depositing funds.

```http
POST /api/v1/payment/deposit
Authorization: Bearer YOUR_JWT_TOKEN
Content-Type: application/json
```

**Request Body:**
```json
{
  "amount": 10,
  "currency": "USD",
  "paymentMethod": "STRIPE"
}
```

**Response (Stripe):**
```json
{
  "success": true,
  "message": "Payment intent created",
  "data": {
    "paymentId": "507f1f77bcf86cd799439015",
    "amount": 10,
    "currency": "USD",
    "paymentMethod": "STRIPE",
    "clientSecret": "pi_3Nk..._secret_..."
  }
}
```

**Response (Momo):**
```json
{
  "success": true,
  "message": "Payment intent created",
  "data": {
    "paymentId": "507f1f77bcf86cd799439016",
    "amount": 10,
    "currency": "USD",
    "paymentMethod": "MOMO",
    "paymentUrl": "https://payment.momo.vn/pay/momo_123456789",
    "qrCode": "data:image/svg+xml;base64,PD94bW..."
  }
}
```

### Get Transactions
Get transaction history.

```http
GET /api/v1/payment/transactions
Authorization: Bearer YOUR_JWT_TOKEN
```

**Query Parameters:**
| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `page` | integer | No | Page number (default: 1) |
| `limit` | integer | No | Items per page (default: 20, max: 100) |
| `type` | string | No | Transaction type: `DEPOSIT`, `WITHDRAWAL`, `REFUND`, `SMS_CHARGE` |
| `status` | string | No | Transaction status: `PENDING`, `COMPLETED`, `FAILED`, `CANCELLED` |
| `startDate` | string | No | Start date (ISO 8601) |
| `endDate` | string | No | End date (ISO 8601) |

**Response:**
```json
{
  "success": true,
  "data": {
    "transactions": [
      {
        "_id": "507f1f77bcf86cd799439014",
        "type": "DEPOSIT",
        "amount": 100,
        "currency": "USD",
        "status": "COMPLETED",
        "paymentMethod": "STRIPE",
        "description": "Deposit 100 USD",
        "createdAt": "2026-05-25T12:00:00.000Z",
        "completedAt": "2026-05-25T12:01:00.000Z"
      }
    ],
    "pagination": {
      "page": 1,
      "limit": 20,
      "total": 1,
      "totalPages": 1
    },
    "totals": {
      "DEPOSIT": {
        "totalAmount": 100,
        "count": 1
      }
    }
  }
}
```

### Request Withdrawal
Request withdrawal of funds.

```http
POST /api/v1/payment/withdraw
Authorization: Bearer YOUR_JWT_TOKEN
Content-Type: application/json
```

**Request Body:**
```json
{
  "amount": 50,
  "bankAccount": "1234567890 - Vietcombank - Nguyen Van A"
}
```

**Response:**
```json
{
  "success": true,
  "message": "Withdrawal request submitted. It will be processed within 1-3 business days.",
  "data": {
    "paymentId": "507f1f77bcf86cd799439017",
    "amount": 50,
    "currency": "USD",
    "status": "PENDING",
    "estimatedCompletion": "2026-05-28T12:00:00.000Z"
  }
}
```

### Get Pricing Information
Get payment pricing information.

```http
GET /api/v1/payment/pricing
```

**Response:**
```json
{
  "success": true,
  "data": {
    "sms": {
      "single": 1,
      "bulk": 0.8,
      "currency": "USD",
      "description": "Per SMS (in cents)"
    },
    "deposit": {
      "minimum": 1,
      "maximum": 10000,
      "currency": "USD",
      "fees": {
        "stripe": "2.9% + $0.30",
        "momo": "1.5%",
        "bankTransfer": "Free"
      }
    },
    "withdrawal": {
      "minimum": 10,
      "maximum": 10000,
      "currency": "USD",
      "processingTime": "1-3 business days",
      "fees": {
        "bankTransfer": "$1.50"
      }
    },
    "currencies": {
      "USD": {
        "symbol": "$",
        "exchangeRate": 1
      },
      "VND": {
        "symbol": "₫",
        "exchangeRate": 23000
      }
    }
  }
}
```

## 🔐 Authentication Endpoints

### Register
Register a new client account.

```http
POST /api/v1/auth/register
Content-Type: application/json
```

**Request Body:**
```json
{
  "name": "Nguyen Van A",
  "email": "nguyenvana@example.com",
  "phone": "0912345678",
  "password": "SecurePass123",
  "confirmPassword": "SecurePass123"
}
```

**Response:**
```json
{
  "success": true,
  "message": "Registration successful. Please verify your email.",
  "data": {
    "clientId": "507f1f77bcf86cd799439018",
    "name": "Nguyen Van A",
    "email": "nguyenvana@example.com",
    "phone": "0912345678",
    "status": "PENDING_VERIFICATION",
    "apiKey": "a1b2c3d4e5f6g7h8i9j0",
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
  }
}
```

### Login
Login to existing account.

```http
POST /api/v1/auth/login
Content-Type: application/json
```

**Request Body:**
```json
{
  "email": "nguyenvana@example.com",
  "password": "SecurePass123"
}
```

**Response:**
```json
{
  "success": true,
  "message": "Login successful",
  "data": {
    "clientId": "507f1f77bcf86cd799439018",
    "name": "Nguyen Van A",
    "email": "nguyenvana@example.com",
    "phone": "0912345678",
    "status": "ACTIVE",
    "apiKey": "a1b2c3d4e5f6g7h8i9j0",
    "balance": 150,
    "currency": "USD",
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "lastLoginAt": "2026-05-25T13:06:39.126Z"
  }
}
```

### Get Profile
Get client profile information.

```http
GET /api/v1/auth/profile
Authorization: Bearer YOUR_JWT_TOKEN
```

**Response:**
```json
{
  "success": true,
  "data": {
    "clientId": "507f1f77bcf86cd799439018",
    "name": "Nguyen Van A",
    "email": "nguyenvana@example.com",
    "phone": "0912345678",
    "status": "ACTIVE",
    "apiKey": "a1b2c3d4e5f6g7h8i9j0",
    "balance": 150,
    "currency": "USD",
    "defaultSenderId": "YOURBRAND",
    "webhookUrl": "https://your-webhook.com/callback",
    "preferredProvider": "AUTO",
    "dailyLimit": 1000,
    "monthlyLimit": 30000,
    "rateLimit": 10,
    "emailVerified": true,
    "phoneVerified": true,
    "lastLoginAt": "2026-05-25T13:06:39.126Z",
    "lastLoginIp": "192.168.1.1",
    "createdAt": "2026-05-20T10:00:00.000Z",
    "statistics": {
      "today": 10,
      "total": 150,
      "dailyLimit": 1000,
      "monthlyLimit": 30000,
      "remainingDaily": 990
    }
  }
}
```

### Update Profile
Update client profile information.

```http
PUT /api/v1/auth/profile
Authorization: Bearer YOUR_JWT_TOKEN
Content-Type: application/json
```

**Request Body:**
```json
{
  "name": "Nguyen Van B",
  "phone": "0987654321",
  "defaultSenderId": "NEWBRAND",
  "webhookUrl": "https://new-webhook.com/callback",
  "preferredProvider": "VIETTEL"
}
```

**Response:**
```json
{
  "success": true,
  "message": "Profile updated successfully",
  "data": {
    "name": "Nguyen Van B",
    "phone": "0987654321",
    "defaultSenderId": "NEWBRAND",
    "webhookUrl": "https://new-webhook.com/callback",
    "preferredProvider": "VIETTEL",
    "updatedAt": "2026-05-25T13:06:39.126Z"
  }
}
```

### Change Password
Change account password.

```http
POST /api/v1/auth/change-password
Authorization: Bearer YOUR_JWT_TOKEN
Content-Type: application/json
```

**Request Body:**
```json
{
  "currentPassword": "SecurePass123",
  "newPassword": "NewSecurePass456",
  "confirmPassword": "NewSecurePass456"
}
```

**Response:**
```json
{
  "success": true,
  "message": "Password changed successfully"
}
```

### Regenerate API Key
Generate a new API key (invalidates old one).

```http
POST /api/v1/auth/regenerate-api-key
Authorization: Bearer YOUR_JWT_TOKEN
```

**Response:**
```json
{
  "success": true,
  "message": "API key regenerated successfully",
  "data": {
    "apiKey": "k1l2m3n4o5p6q7r8s9t0",
    "apiKeyGeneratedAt": "2026-05-25T13:06:39.126Z"
  }
}
```

### Verify Email
Verify email address with token.

```http
POST /api/v1/auth/verify-email
Content-Type: application/json
```

**Request Body:**
```json
{
  "token": "a1b2c3d4e5f6g7h8i9j0k1l2m3n4o5p6"
}
```

**Response:**
```json
{
  "success": true,
  "message": "Email verified successfully",
  "data": {
    "clientId": "507f1f77bcf86cd799439018",
    "email": "nguyenvana@example.com",
    "status": "ACTIVE"
  }
}
```

### Forgot Password
Request password reset email.

```http
POST /api/v1/auth/forgot-password
Content-Type: application/json
```

**Request Body:**
```json
{
  "email": "nguyenvana@example.com"
}
```

**Response:**
```json
{
  "success": true,
  "message": "If your email is registered, you will receive a password reset link"
}
```

### Reset Password
Reset password with token.

```http
POST /api/v1/auth/reset-password
Content-Type: application/json
```

**Request Body:**
```json
{
  "token": "a1b2c3d4e5f6g7h8i9j0k1l2m3n4o5p6",
  "newPassword": "NewSecurePass456",
  "confirmPassword": "NewSecurePass456"
}
```

**Response:**
```json
{
  "success": true,
  "message": "Password reset successful"
}
```

## 🔔 Webhooks

### Webhook Configuration
Set webhook URL in profile to receive event notifications.

### Webhook Events

#### SMS Sent Event
Sent when SMS is successfully sent.

```json
{
  "event": "sms.sent",
  "timestamp": "2026-05-25T13:06:39.126Z",
  "data": {
    "messageId": "507f1f77bcf86cd799439011",
    "providerMessageId": "viettel_123456789",
    "provider": "VIETTEL",
    "to": "+84912345678",
    "message": "Your OTP code is 123456",
    "messageType": "OTP",
    "price": 1,
    "currency": "USD",
    "status": "SENT",
    "sentAt": "2026-05-25T13:06:39.126Z",
    "remainingBalance": 99
  }
}
```

#### SMS Delivered Event
Sent when SMS delivery is confirmed.

```json
{
  "event": "sms.delivered",
  "timestamp": "2026-05-25T13:06:45.126Z",
  "data": {
    "messageId": "507f1f77bcf86cd799439011",
    "to": "+84912345678",
    "status": "DELIVERED",
    "deliveredAt": "2026-05-25T13:06:45.126Z"
  }
}
```

#### SMS Failed Event
Sent when SMS fails to send.

```json
{
  "event": "sms.failed",
  "timestamp": "2026-05-25T13:06:39.126Z",
  "data": {
    "messageId": "507f1f77bcf86cd799439011",
    "to": "+84912345678",
    "status": "FAILED",
    "error": "Invalid phone number",
    "failedAt": "2026-05-25T13:06:39.126Z"
  }
}
```

#### Payment Completed Event
Sent when payment is completed.

```json
{
  "event": "payment.completed",
  "timestamp": "2026-05-25T13:06:39.126Z",
  "data": {
    "paymentId": "507f1f77bcf86cd799439014",
    "type": "DEPOSIT",
    "amount": 100,
    "currency": "USD",
    "status": "COMPLETED",
    "paymentMethod": "STRIPE",
    "newBalance": 250
  }
}
```

### Webhook Security
- **Signature Verification**: Include `X-VietSMS-Signature` header
- **Retry Logic**: Webhooks are retried 3 times with exponential backoff
- **Timeout**: 5-second timeout for webhook delivery

## ❌ Error Codes

### HTTP Status Codes

| Code | Description | Typical Causes |
|------|-------------|----------------|
| 200 | Success | Request completed successfully |
| 201 | Created | Resource created successfully |
| 400 | Bad Request | Invalid request parameters |
| 401 | Unauthorized | Missing or invalid authentication |
| 402 | Payment Required | Insufficient balance |
| 403 | Forbidden | Valid authentication but insufficient permissions |
| 404 | Not Found | Resource not found |
| 429 | Too Many Requests | Rate limit exceeded |
| 500 | Internal Server Error | Server error |

### Error Response Format
```json
{
  "success": false,
  "error": "Error message",
  "code": "ERROR_CODE",
  "details": {
    "field": "Additional error details"
  }
}
```

### Common Error Codes

| Code | Description | Solution |
|------|-------------|----------|
| `INVALID_API_KEY` | Invalid or missing API key | Check API key or regenerate |
| `INSUFFICIENT_BALANCE` | Not enough balance to send SMS | Deposit funds |
| `RATE_LIMIT_EXCEEDED` | Too many requests | Wait or increase rate limit |
| `INVALID_PHONE` | Invalid phone number format | Use Vietnamese format: 0xxxxxxxxx |
| `MESSAGE_TOO_LONG` | Message exceeds 160 characters | Shorten message |
| `DAILY_LIMIT_EXCEEDED` | Daily SMS limit reached | Wait until next day or increase limit |
| `PROVIDER_UNAVAILABLE` | SMS provider is down | Retry or use different provider |
| `VALIDATION_ERROR` | Request validation failed | Check request parameters |

## ⚡ Rate Limiting

### Default Limits
- **Global**: 100 requests per 15 minutes per IP
- **API**: 50 requests per 15 minutes per IP
- **Client**: Configurable per client (default: 10 requests per second)

### Rate Limit Headers
Response headers include rate limit information:

```
X-RateLimit-Limit: 50
X-RateLimit-Remaining: 49
X-RateLimit-Reset: 1622034400
```

### Handling Rate Limits
1. Monitor `X-RateLimit-Remaining` header
2. Implement exponential backoff
3. Cache responses when possible
4. Batch requests when appropriate

## 🏆 Best Practices

### SMS Sending
1. **Validate phone numbers** before sending
2. **Use appropriate message types** (OTP, marketing, transactional)
3. **Include sender ID** for brand recognition
4. **Monitor delivery status** for important messages
5. **Implement retry logic** for failed messages

### Authentication
1. **Store API keys securely** (environment variables, secret management)
2. **Rotate API keys** regularly
3. **Use different keys** for different environments
4. **Monitor API usage** for suspicious activity

### Error Handling
1. **Implement retry logic** with exponential backoff
2. **Log errors** for debugging
3. **Monitor error rates** for system health
4. **Have fallback providers** for critical messages

### Performance
1. **Use bulk endpoints** for multiple messages
2. **Implement caching** for frequent requests
3. **Monitor response times**
4. **Use webhooks** instead of polling for status updates

### Security
1. **Use HTTPS** for all API calls
2. **Validate all input** on server side
3. **Implement IP whitelisting** for sensitive operations
4. **Regular security audits**

## 📞 Support

For API support:
- **Email**: support@vietsmsapi.com
- **Documentation**: https://docs.vietsmsapi.com
- **Status Page**: https://status.vietsmsapi.com

---

**Last Updated**: 2026-05-25  
**API Version**: 1.0.0