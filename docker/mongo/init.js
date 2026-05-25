// MongoDB initialization script
// Creates database, collections, and indexes for Viet SMS API

db = db.getSiblingDB('viet_sms_api');

// Create collections
db.createCollection('clients');
db.createCollection('sms_messages');
db.createCollection('payments');
db.createCollection('api_keys');
db.createCollection('sms_providers');
db.createCollection('audit_logs');

// Create indexes for clients collection
db.clients.createIndex({ email: 1 }, { unique: true });
db.clients.createIndex({ phone: 1 }, { unique: true });
db.clients.createIndex({ apiKey: 1 }, { unique: true });
db.clients.createIndex({ status: 1 });
db.clients.createIndex({ createdAt: -1 });

// Create indexes for sms_messages collection
db.sms_messages.createIndex({ messageId: 1 }, { unique: true });
db.sms_messages.createIndex({ clientId: 1 });
db.sms_messages.createIndex({ to: 1 });
db.sms_messages.createIndex({ status: 1 });
db.sms_messages.createIndex({ createdAt: -1 });
db.sms_messages.createIndex({ provider: 1 });
db.sms_messages.createIndex({ referenceId: 1 });

// Create indexes for payments collection
db.payments.createIndex({ transactionId: 1 }, { unique: true });
db.payments.createIndex({ clientId: 1 });
db.payments.createIndex({ status: 1 });
db.payments.createIndex({ createdAt: -1 });
db.payments.createIndex({ paymentMethod: 1 });

// Create indexes for api_keys collection
db.api_keys.createIndex({ key: 1 }, { unique: true });
db.api_keys.createIndex({ clientId: 1 });
db.api_keys.createIndex({ status: 1 });
db.api_keys.createIndex({ expiresAt: 1 });

// Create indexes for audit_logs collection
db.audit_logs.createIndex({ clientId: 1 });
db.audit_logs.createIndex({ action: 1 });
db.audit_logs.createIndex({ timestamp: -1 });
db.audit_logs.createIndex({ ipAddress: 1 });

// Create default admin user
db.clients.insertOne({
  _id: new ObjectId(),
  name: 'Admin User',
  email: 'admin@vietsmsapi.com',
  phone: '0912345678',
  password: '$2a$10$YourHashedPasswordHere', // Should be replaced with actual hash
  apiKey: 'admin_default_key_should_be_changed',
  balance: 1000,
  status: 'ACTIVE',
  role: 'ADMIN',
  createdAt: new Date(),
  updatedAt: new Date()
});

// Create default SMS providers configuration
db.sms_providers.insertMany([
  {
    _id: new ObjectId(),
    name: 'Viettel',
    code: 'viettel',
    priority: 1,
    enabled: true,
    config: {
      apiUrl: 'https://api.viettel.com/sms',
      timeout: 10000,
      retryCount: 3
    },
    createdAt: new Date(),
    updatedAt: new Date()
  },
  {
    _id: new ObjectId(),
    name: 'Mobifone',
    code: 'mobifone',
    priority: 2,
    enabled: true,
    config: {
      apiUrl: 'https://api.mobifone.com/sms',
      timeout: 10000,
      retryCount: 3
    },
    createdAt: new Date(),
    updatedAt: new Date()
  },
  {
    _id: new ObjectId(),
    name: 'Vinaphone',
    code: 'vinaphone',
    priority: 3,
    enabled: true,
    config: {
      apiUrl: 'https://api.vinaphone.com/sms',
      timeout: 10000,
      retryCount: 3
    },
    createdAt: new Date(),
    updatedAt: new Date()
  },
  {
    _id: new ObjectId(),
    name: 'Twilio',
    code: 'twilio',
    priority: 4,
    enabled: true,
    config: {
      apiUrl: 'https://api.twilio.com/2010-04-01',
      timeout: 15000,
      retryCount: 2
    },
    createdAt: new Date(),
    updatedAt: new Date()
  }
]);

print('MongoDB initialization completed successfully!');