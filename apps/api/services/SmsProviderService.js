const axios = require('axios');
const winston = require('winston');

class SmsProviderService {
  constructor() {
    this.logger = winston.createLogger({
      level: process.env.LOG_LEVEL || 'info',
      format: winston.format.combine(
        winston.format.timestamp(),
        winston.format.json()
      ),
      transports: [
        new winston.transports.File({ filename: 'logs/sms-provider.log' }),
        new winston.transports.Console(),
      ],
    });

    this.providers = {
      VIETTEL: {
        name: 'Viettel',
        priority: 1,
        enabled: !!process.env.VIETTEL_API_KEY,
        config: {
          baseUrl: 'https://api.viettel.com.vn/sms',
          apiKey: process.env.VIETTEL_API_KEY,
          apiSecret: process.env.VIETTEL_API_SECRET,
          brandName: process.env.VIETTEL_BRAND_NAME,
        },
      },
      MOBIFONE: {
        name: 'Mobifone',
        priority: 2,
        enabled: !!process.env.MOBIFONE_API_KEY,
        config: {
          baseUrl: 'https://api.mobifone.com.vn/sms',
          apiKey: process.env.MOBIFONE_API_KEY,
          apiSecret: process.env.MOBIFONE_API_SECRET,
        },
      },
      VINAPHONE: {
        name: 'Vinaphone',
        priority: 3,
        enabled: !!process.env.VINAPHONE_API_KEY,
        config: {
          baseUrl: 'https://api.vinaphone.com.vn/sms',
          apiKey: process.env.VINAPHONE_API_KEY,
          apiSecret: process.env.VINAPHONE_API_SECRET,
        },
      },
      TWILIO: {
        name: 'Twilio',
        priority: 4,
        enabled: !!process.env.TWILIO_ACCOUNT_SID,
        config: {
          accountSid: process.env.TWILIO_ACCOUNT_SID,
          authToken: process.env.TWILIO_AUTH_TOKEN,
          phoneNumber: process.env.TWILIO_PHONE_NUMBER,
        },
      },
    };
  }

  /**
   * Select the best provider based on priority and availability
   */
  async selectProvider(preferredProvider = 'AUTO') {
    if (preferredProvider !== 'AUTO' && this.providers[preferredProvider]?.enabled) {
      return this.providers[preferredProvider];
    }

    // Sort providers by priority
    const availableProviders = Object.values(this.providers)
      .filter(provider => provider.enabled)
      .sort((a, b) => a.priority - b.priority);

    if (availableProviders.length === 0) {
      throw new Error('No SMS providers configured');
    }

    // Check provider health (in production, would ping each provider)
    return availableProviders[0];
  }

  /**
   * Send SMS using selected provider
   */
  async sendSms(provider, to, message, messageType = 'OTP', senderId = '') {
    const providerName = provider.name.toUpperCase();
    
    try {
      switch (providerName) {
        case 'VIETTEL':
          return await this.sendViaViettel(provider.config, to, message, messageType, senderId);
        case 'MOBIFONE':
          return await this.sendViaMobifone(provider.config, to, message, messageType, senderId);
        case 'VINAPHONE':
          return await this.sendViaVinaphone(provider.config, to, message, messageType, senderId);
        case 'TWILIO':
          return await this.sendViaTwilio(provider.config, to, message, messageType);
        default:
          throw new Error(`Unsupported provider: ${providerName}`);
      }
    } catch (error) {
      this.logger.error(`Failed to send SMS via ${providerName}:`, {
        error: error.message,
        to,
        messageType,
      });
      throw error;
    }
  }

  /**
   * Viettel SMS API implementation
   */
  async sendViaViettel(config, to, message, messageType, senderId) {
    const formattedTo = to.startsWith('0') ? '84' + to.substring(1) : to.replace('+', '');
    
    const payload = {
      brandname: senderId || config.brandName,
      phone: formattedTo,
      message: message,
      message_type: messageType === 'OTP' ? '1' : '2', // 1: OTP, 2: CSKH
      request_id: this.generateRequestId(),
    };

    const response = await axios.post(`${config.baseUrl}/send`, payload, {
      headers: {
        'Content-Type': 'application/json',
        'api-key': config.apiKey,
        'api-secret': config.apiSecret,
      },
      timeout: 10000,
    });

    if (response.data.code !== 0) {
      throw new Error(`Viettel API error: ${response.data.message}`);
    }

    return {
      provider: 'VIETTEL',
      messageId: response.data.data.message_id,
      status: 'SENT',
      rawResponse: response.data,
    };
  }

  /**
   * Mobifone SMS API implementation
   */
  async sendViaMobifone(config, to, message, messageType, senderId) {
    const formattedTo = to.startsWith('0') ? '84' + to.substring(1) : to.replace('+', '');
    
    const payload = {
      msisdn: formattedTo,
      content: message,
      type: messageType === 'OTP' ? 'otp' : 'cskh',
      sender: senderId || 'DEFAULT',
      request_id: this.generateRequestId(),
    };

    const response = await axios.post(`${config.baseUrl}/v1/send`, payload, {
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${config.apiKey}`,
      },
      timeout: 10000,
    });

    if (response.data.status !== 'success') {
      throw new Error(`Mobifone API error: ${response.data.message}`);
    }

    return {
      provider: 'MOBIFONE',
      messageId: response.data.data.message_id,
      status: 'SENT',
      rawResponse: response.data,
    };
  }

  /**
   * Twilio SMS API implementation (fallback for international numbers)
   */
  async sendViaTwilio(config, to, message, messageType) {
    const twilio = require('twilio');
    const client = twilio(config.accountSid, config.authToken);

    const response = await client.messages.create({
      body: message,
      from: config.phoneNumber,
      to: to,
    });

    return {
      provider: 'TWILIO',
      messageId: response.sid,
      status: response.status,
      rawResponse: response,
    };
  }

  /**
   * Vinaphone SMS API implementation
   */
  async sendViaVinaphone(config, to, message, messageType, senderId) {
    const formattedTo = to.startsWith('0') ? '84' + to.substring(1) : to.replace('+', '');
    
    const payload = {
      phone: formattedTo,
      message: message,
      message_type: messageType === 'OTP' ? '1' : '2',
      sender: senderId || 'VINAPHONE',
      request_id: this.generateRequestId(),
    };

    const response = await axios.post(`${config.baseUrl}/api/send`, payload, {
      headers: {
        'Content-Type': 'application/json',
        'api-key': config.apiKey,
        'api-secret': config.apiSecret,
      },
      timeout: 10000,
    });

    if (response.data.error_code !== 0) {
      throw new Error(`Vinaphone API error: ${response.data.error_message}`);
    }

    return {
      provider: 'VINAPHONE',
      messageId: response.data.data.message_id,
      status: 'SENT',
      rawResponse: response.data,
    };
  }

  /**
   * Check delivery status
   */
  async checkDeliveryStatus(provider, messageId) {
    try {
      switch (provider.toUpperCase()) {
        case 'VIETTEL':
          return await this.checkViettelStatus(messageId);
        case 'MOBIFONE':
          return await this.checkMobifoneStatus(messageId);
        case 'VINAPHONE':
          return await this.checkVinaphoneStatus(messageId);
        case 'TWILIO':
          return await this.checkTwilioStatus(messageId);
        default:
          return { status: 'UNKNOWN', lastUpdated: new Date() };
      }
    } catch (error) {
      this.logger.error(`Failed to check delivery status for ${provider}:`, {
        error: error.message,
        messageId,
      });
      return { status: 'ERROR', error: error.message };
    }
  }

  /**
   * Generate unique request ID
   */
  generateRequestId() {
    return `req_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  /**
   * Get provider statistics
   */
  async getProviderStats() {
    const stats = {};
    
    for (const [key, provider] of Object.entries(this.providers)) {
      stats[key] = {
        name: provider.name,
        enabled: provider.enabled,
        priority: provider.priority,
        lastUsed: new Date().toISOString(),
      };
    }
    
    return stats;
  }

  /**
   * Validate phone number format
   */
  validatePhoneNumber(phone) {
    // Vietnamese phone number regex
    const vietnameseRegex = /^(0|\+84)(3[2-9]|5[6|8|9]|7[0|6-9]|8[1-9]|9[0-9])[0-9]{7}$/;
    
    // International format (simplified)
    const internationalRegex = /^\+[1-9]\d{1,14}$/;
    
    return vietnameseRegex.test(phone) || internationalRegex.test(phone);
  }

  /**
   * Format phone number to international format
   */
  formatPhoneNumber(phone) {
    if (phone.startsWith('0')) {
      return '+84' + phone.substring(1);
    }
    if (!phone.startsWith('+')) {
      return '+84' + phone;
    }
    return phone;
  }
}

module.exports = new SmsProviderService();