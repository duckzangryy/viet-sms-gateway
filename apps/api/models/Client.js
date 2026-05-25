const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const crypto = require('crypto');

const clientSchema = new mongoose.Schema({
  // Basic information
  name: {
    type: String,
    required: true,
    trim: true,
    maxlength: 100,
  },
  email: {
    type: String,
    required: true,
    unique: true,
    lowercase: true,
    trim: true,
    validate: {
      validator: function(v) {
        return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v);
      },
      message: props => `${props.value} is not a valid email address!`,
    },
  },
  phone: {
    type: String,
    required: true,
    validate: {
      validator: function(v) {
        return /^(0|\+84)(3[2-9]|5[6|8|9]|7[0|6-9]|8[1-9]|9[0-9])[0-9]{7}$/.test(v);
      },
      message: props => `${props.value} is not a valid Vietnamese phone number!`,
    },
  },

  // Authentication
  password: {
    type: String,
    required: true,
    minlength: 8,
    select: false,
  },
  apiKey: {
    type: String,
    unique: true,
    sparse: true,
  },
  apiSecret: {
    type: String,
    select: false,
  },
  apiKeyGeneratedAt: {
    type: Date,
    default: null,
  },

  // Billing information
  balance: {
    type: Number,
    default: 0,
    min: 0,
  },
  currency: {
    type: String,
    default: 'USD',
    enum: ['USD', 'VND'],
  },
  billingAddress: {
    street: String,
    city: String,
    state: String,
    country: {
      type: String,
      default: 'Vietnam',
    },
    postalCode: String,
  },
  taxId: {
    type: String,
    sparse: true,
  },

  // Settings
  defaultSenderId: {
    type: String,
    maxlength: 11,
    default: '',
  },
  webhookUrl: {
    type: String,
    default: '',
    validate: {
      validator: function(v) {
        if (!v) return true;
        try {
          new URL(v);
          return true;
        } catch {
          return false;
        }
      },
      message: props => `${props.value} is not a valid URL!`,
    },
  },
  webhookSecret: {
    type: String,
    select: false,
    default: '',
  },
  preferredProvider: {
    type: String,
    enum: ['VIETTEL', 'MOBIFONE', 'VINAPHONE', 'AUTO', null],
    default: 'AUTO',
  },

  // Status
  status: {
    type: String,
    enum: ['ACTIVE', 'SUSPENDED', 'DELETED', 'PENDING_VERIFICATION'],
    default: 'PENDING_VERIFICATION',
  },
  emailVerified: {
    type: Boolean,
    default: false,
  },
  phoneVerified: {
    type: Boolean,
    default: false,
  },

  // Limits
  dailyLimit: {
    type: Number,
    default: 1000,
    min: 0,
  },
  monthlyLimit: {
    type: Number,
    default: 30000,
    min: 0,
  },
  rateLimit: {
    type: Number,
    default: 10, // requests per second
    min: 1,
    max: 100,
  },

  // Security
  lastLoginAt: {
    type: Date,
    default: null,
  },
  lastLoginIp: {
    type: String,
    default: '',
  },
  failedLoginAttempts: {
    type: Number,
    default: 0,
    min: 0,
  },
  accountLockedUntil: {
    type: Date,
    default: null,
  },

  // Verification
  verificationToken: {
    type: String,
    select: false,
  },
  verificationTokenExpires: {
    type: Date,
    select: false,
  },
  resetPasswordToken: {
    type: String,
    select: false,
  },
  resetPasswordExpires: {
    type: Date,
    select: false,
  },

  // Timestamps
  createdAt: {
    type: Date,
    default: Date.now,
  },
  updatedAt: {
    type: Date,
    default: Date.now,
  },
});

// Indexes
clientSchema.index({ email: 1 });
clientSchema.index({ apiKey: 1 });
clientSchema.index({ status: 1 });
clientSchema.index({ createdAt: -1 });

// Pre-save middleware
clientSchema.pre('save', async function(next) {
  if (this.isModified('password')) {
    this.password = await bcrypt.hash(this.password, parseInt(process.env.BCRYPT_SALT_ROUNDS) || 10);
  }
  
  if (this.isModified('apiKey') && !this.apiKey) {
    this.generateApiKey();
  }
  
  this.updatedAt = new Date();
  next();
});

// Methods
clientSchema.methods.generateApiKey = function() {
  this.apiKey = crypto.randomBytes(32).toString('hex');
  this.apiSecret = crypto.randomBytes(64).toString('hex');
  this.apiKeyGeneratedAt = new Date();
  return this.apiKey;
};

clientSchema.methods.comparePassword = async function(candidatePassword) {
  return bcrypt.compare(candidatePassword, this.password);
};

clientSchema.methods.generateVerificationToken = function() {
  this.verificationToken = crypto.randomBytes(32).toString('hex');
  this.verificationTokenExpires = new Date(Date.now() + 24 * 60 * 60 * 1000); // 24 hours
  return this.verificationToken;
};

clientSchema.methods.generateResetPasswordToken = function() {
  this.resetPasswordToken = crypto.randomBytes(32).toString('hex');
  this.resetPasswordExpires = new Date(Date.now() + 1 * 60 * 60 * 1000); // 1 hour
  return this.resetPasswordToken;
};

clientSchema.methods.checkDailyLimit = async function() {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  
  const SmsMessage = mongoose.model('SmsMessage');
  const count = await SmsMessage.countDocuments({
    clientId: this._id,
    createdAt: { $gte: today },
    status: { $in: ['SENT', 'DELIVERED'] },
  });
  
  return count < this.dailyLimit;
};

clientSchema.methods.checkMonthlyLimit = async function() {
  const now = new Date();
  const firstDayOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
  
  const SmsMessage = mongoose.model('SmsMessage');
  const count = await SmsMessage.countDocuments({
    clientId: this._id,
    createdAt: { $gte: firstDayOfMonth },
    status: { $in: ['SENT', 'DELIVERED'] },
  });
  
  return count < this.monthlyLimit;
};

clientSchema.methods.hasSufficientBalance = function(messageCount = 1) {
  const pricePerMessage = process.env.SMS_PRICE_PER_MESSAGE || 1; // in cents
  const totalCost = pricePerMessage * messageCount;
  
  if (this.currency === 'VND') {
    // Convert USD cents to VND (approx 23,000 VND per USD)
    const totalCostVND = totalCost * 230;
    return this.balance >= totalCostVND;
  }
  
  return this.balance >= totalCost;
};

clientSchema.methods.deductBalance = function(amount) {
  this.balance -= amount;
  if (this.balance < 0) this.balance = 0;
  return this.save();
};

clientSchema.methods.addBalance = function(amount) {
  this.balance += amount;
  return this.save();
};

clientSchema.methods.recordLogin = function(ipAddress) {
  this.lastLoginAt = new Date();
  this.lastLoginIp = ipAddress;
  this.failedLoginAttempts = 0;
  this.accountLockedUntil = null;
  return this.save();
};

clientSchema.methods.recordFailedLogin = function() {
  this.failedLoginAttempts += 1;
  
  // Lock account after 5 failed attempts for 15 minutes
  if (this.failedLoginAttempts >= 5) {
    this.accountLockedUntil = new Date(Date.now() + 15 * 60 * 1000);
  }
  
  return this.save();
};

clientSchema.methods.isAccountLocked = function() {
  if (!this.accountLockedUntil) return false;
  return new Date() < this.accountLockedUntil;
};

const Client = mongoose.model('Client', clientSchema);

module.exports = Client;