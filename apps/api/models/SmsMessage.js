const mongoose = require('mongoose');

const smsMessageSchema = new mongoose.Schema({
  // User/Client information
  clientId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Client',
    required: true,
    index: true,
  },
  apiKey: {
    type: String,
    required: true,
    index: true,
  },

  // Message details
  to: {
    type: String,
    required: true,
    validate: {
      validator: function(v) {
        // Vietnamese phone number validation
        return /^(0|\+84)(3[2-9]|5[6|8|9]|7[0|6-9]|8[1-9]|9[0-9])[0-9]{7}$/.test(v);
      },
      message: props => `${props.value} is not a valid Vietnamese phone number!`,
    },
  },
  message: {
    type: String,
    required: true,
    maxlength: 160, // Standard SMS length
  },
  messageType: {
    type: String,
    enum: ['OTP', 'MARKETING', 'TRANSACTIONAL', 'ALERT'],
    default: 'OTP',
    required: true,
  },

  // Provider information
  provider: {
    type: String,
    enum: ['VIETTEL', 'MOBIFONE', 'VINAPHONE', 'TWILIO', 'FALLBACK'],
    required: true,
  },
  providerMessageId: {
    type: String,
    sparse: true,
  },

  // Delivery status
  status: {
    type: String,
    enum: ['PENDING', 'SENT', 'DELIVERED', 'FAILED', 'EXPIRED'],
    default: 'PENDING',
    required: true,
  },
  statusUpdatedAt: {
    type: Date,
    default: Date.now,
  },
  deliveryReport: {
    type: mongoose.Schema.Types.Mixed,
    default: null,
  },

  // Pricing
  price: {
    type: Number,
    required: true,
    min: 0,
  },
  currency: {
    type: String,
    default: 'USD',
    enum: ['USD', 'VND'],
  },

  // Timestamps
  createdAt: {
    type: Date,
    default: Date.now,
    expires: 90 * 24 * 60 * 60, // Auto-delete after 90 days (seconds)
  },
  sentAt: {
    type: Date,
    default: null,
  },
  deliveredAt: {
    type: Date,
    default: null,
  },

  // Metadata
  ipAddress: {
    type: String,
    required: true,
  },
  userAgent: {
    type: String,
    default: '',
  },
  tags: [{
    type: String,
    maxlength: 50,
  }],
});

// Indexes for performance
smsMessageSchema.index({ createdAt: -1 });
smsMessageSchema.index({ status: 1, createdAt: -1 });
smsMessageSchema.index({ clientId: 1, status: 1 });
smsMessageSchema.index({ to: 1, createdAt: -1 });

// Virtual for formatted phone number
smsMessageSchema.virtual('formattedTo').get(function() {
  if (this.to.startsWith('0')) {
    return '+84' + this.to.substring(1);
  }
  return this.to;
});

// Methods
smsMessageSchema.methods.markAsSent = function(providerMessageId) {
  this.status = 'SENT';
  this.providerMessageId = providerMessageId;
  this.sentAt = new Date();
  this.statusUpdatedAt = new Date();
  return this.save();
};

smsMessageSchema.methods.markAsDelivered = function(deliveryReport) {
  this.status = 'DELIVERED';
  this.deliveryReport = deliveryReport;
  this.deliveredAt = new Date();
  this.statusUpdatedAt = new Date();
  return this.save();
};

smsMessageSchema.methods.markAsFailed = function(error) {
  this.status = 'FAILED';
  this.deliveryReport = { error: error.message || error };
  this.statusUpdatedAt = new Date();
  return this.save();
};

smsMessageSchema.methods.calculatePrice = function() {
  const basePrice = process.env.SMS_PRICE_PER_MESSAGE || 1; // in cents
  let price = basePrice;
  
  // Apply discounts for bulk (would need context of total messages)
  // This is simplified - actual implementation would check client's monthly volume
  
  this.price = price;
  return price;
};

const SmsMessage = mongoose.model('SmsMessage', smsMessageSchema);

module.exports = SmsMessage;