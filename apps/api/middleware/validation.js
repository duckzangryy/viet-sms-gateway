const { validationResult } = require('express-validator');
const winston = require('winston');

class ValidationMiddleware {
  constructor() {
    this.logger = winston.createLogger({
      level: process.env.LOG_LEVEL || 'info',
      format: winston.format.combine(
        winston.format.timestamp(),
        winston.format.json()
      ),
      transports: [
        new winston.transports.File({ filename: 'logs/validation.log' }),
        new winston.transports.Console(),
      ],
    });
  }

  /**
   * Validate request using express-validator results
   */
  validate(req, res, next) {
    const errors = validationResult(req);
    
    if (!errors.isEmpty()) {
      const errorMessages = errors.array().map(error => ({
        field: error.path,
        message: error.msg,
        value: error.value,
      }));

      this.logger.warn('Validation failed', {
        errors: errorMessages,
        path: req.path,
        method: req.method,
        ip: req.ip,
      });

      return res.status(400).json({
        success: false,
        error: 'Validation failed',
        details: errorMessages,
      });
    }

    next();
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
   * Validate message content
   */
  validateMessage(message, messageType = 'OTP') {
    const maxLength = 160;
    
    if (typeof message !== 'string') {
      return { valid: false, error: 'Message must be a string' };
    }
    
    if (message.length === 0) {
      return { valid: false, error: 'Message cannot be empty' };
    }
    
    if (message.length > maxLength) {
      return { 
        valid: false, 
        error: `Message too long (max ${maxLength} characters)`,
        length: message.length,
        maxLength,
      };
    }
    
    // Additional validation based on message type
    if (messageType === 'OTP') {
      // OTP messages should be short and contain digits
      if (message.length > 20) {
        return { 
          valid: false, 
          error: 'OTP messages should be short (max 20 characters)',
        };
      }
    }
    
    return { valid: true, length: message.length };
  }

  /**
   * Validate sender ID
   */
  validateSenderId(senderId) {
    const maxLength = 11;
    
    if (!senderId) {
      return { valid: true }; // Sender ID is optional
    }
    
    if (typeof senderId !== 'string') {
      return { valid: false, error: 'Sender ID must be a string' };
    }
    
    if (senderId.length > maxLength) {
      return { 
        valid: false, 
        error: `Sender ID too long (max ${maxLength} characters)`,
        length: senderId.length,
        maxLength,
      };
    }
    
    // Sender ID should be alphanumeric
    if (!/^[a-zA-Z0-9]+$/.test(senderId)) {
      return { 
        valid: false, 
        error: 'Sender ID must contain only letters and numbers',
      };
    }
    
    return { valid: true, length: senderId.length };
  }

  /**
   * Validate tags array
   */
  validateTags(tags) {
    if (!tags) {
      return { valid: true }; // Tags are optional
    }
    
    if (!Array.isArray(tags)) {
      return { valid: false, error: 'Tags must be an array' };
    }
    
    if (tags.length > 10) {
      return { valid: false, error: 'Maximum 10 tags allowed' };
    }
    
    for (const tag of tags) {
      if (typeof tag !== 'string') {
        return { valid: false, error: 'Each tag must be a string' };
      }
      
      if (tag.length > 50) {
        return { valid: false, error: 'Tag too long (max 50 characters)' };
      }
      
      if (!/^[a-zA-Z0-9_-]+$/.test(tag)) {
        return { 
          valid: false, 
          error: 'Tag can only contain letters, numbers, underscores, and hyphens',
        };
      }
    }
    
    return { valid: true, count: tags.length };
  }

  /**
   * Validate date range
   */
  validateDateRange(startDate, endDate) {
    if (startDate && endDate) {
      const start = new Date(startDate);
      const end = new Date(endDate);
      
      if (isNaN(start.getTime())) {
        return { valid: false, error: 'Invalid start date' };
      }
      
      if (isNaN(end.getTime())) {
        return { valid: false, error: 'Invalid end date' };
      }
      
      if (start > end) {
        return { valid: false, error: 'Start date must be before end date' };
      }
      
      // Limit date range to 1 year
      const oneYearAgo = new Date();
      oneYearAgo.setFullYear(oneYearAgo.getFullYear() - 1);
      
      if (start < oneYearAgo) {
        return { valid: false, error: 'Date range cannot exceed 1 year' };
      }
    }
    
    return { valid: true };
  }

  /**
   * Validate pagination parameters
   */
  validatePagination(page, limit) {
    const pageNum = parseInt(page) || 1;
    const limitNum = parseInt(limit) || 20;
    
    if (pageNum < 1) {
      return { valid: false, error: 'Page must be at least 1' };
    }
    
    if (limitNum < 1 || limitNum > 100) {
      return { valid: false, error: 'Limit must be between 1 and 100' };
    }
    
    return { 
      valid: true, 
      page: pageNum, 
      limit: limitNum,
      skip: (pageNum - 1) * limitNum,
    };
  }

  /**
   * Validate webhook URL
   */
  validateWebhookUrl(url) {
    if (!url) {
      return { valid: true }; // Webhook URL is optional
    }
    
    try {
      const parsedUrl = new URL(url);
      
      // Only allow HTTPS in production
      if (process.env.NODE_ENV === 'production' && parsedUrl.protocol !== 'https:') {
        return { valid: false, error: 'Webhook URL must use HTTPS in production' };
      }
      
      // Check for common webhook endpoints
      const path = parsedUrl.pathname;
      if (!path.includes('/webhook') && !path.includes('/callback')) {
        this.logger.warn('Webhook URL might not be a webhook endpoint', { url });
      }
      
      return { valid: true, url: parsedUrl.toString() };
    } catch (error) {
      return { valid: false, error: 'Invalid URL format' };
    }
  }

  /**
   * Validate currency
   */
  validateCurrency(currency) {
    const allowedCurrencies = ['USD', 'VND'];
    
    if (!allowedCurrencies.includes(currency)) {
      return { 
        valid: false, 
        error: `Currency must be one of: ${allowedCurrencies.join(', ')}`,
      };
    }
    
    return { valid: true, currency };
  }

  /**
   * Validate amount (for payments/balance)
   */
  validateAmount(amount, currency = 'USD') {
    const amountNum = parseFloat(amount);
    
    if (isNaN(amountNum)) {
      return { valid: false, error: 'Amount must be a number' };
    }
    
    if (amountNum <= 0) {
      return { valid: false, error: 'Amount must be greater than 0' };
    }
    
    // Set maximum limits based on currency
    const limits = {
      USD: 10000, // $10,000
      VND: 230000000, // ~230 million VND
    };
    
    if (amountNum > limits[currency]) {
      return { 
        valid: false, 
        error: `Amount exceeds maximum limit of ${limits[currency]} ${currency}`,
      };
    }
    
    // Validate decimal places
    const decimalPlaces = (amountNum.toString().split('.')[1] || '').length;
    const maxDecimals = currency === 'USD' ? 2 : 0;
    
    if (decimalPlaces > maxDecimals) {
      return { 
        valid: false, 
        error: `Amount can have at most ${maxDecimals} decimal places for ${currency}`,
      };
    }
    
    return { valid: true, amount: amountNum };
  }

  /**
   * Sanitize input (basic XSS prevention)
   */
  sanitizeInput(input) {
    if (typeof input === 'string') {
      // Remove script tags and dangerous attributes
      return input
        .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '')
        .replace(/on\w+="[^"]*"/gi, '')
        .replace(/javascript:/gi, '')
        .trim();
    }
    
    if (Array.isArray(input)) {
      return input.map(item => this.sanitizeInput(item));
    }
    
    if (typeof input === 'object' && input !== null) {
      const sanitized = {};
      for (const key in input) {
        sanitized[key] = this.sanitizeInput(input[key]);
      }
      return sanitized;
    }
    
    return input;
  }

  /**
   * Log validation attempt
   */
  logValidationAttempt(req, validationResult) {
    this.logger.debug('Validation attempt', {
      path: req.path,
      method: req.method,
      ip: req.ip,
      userAgent: req.get('User-Agent'),
      validationResult,
      timestamp: new Date().toISOString(),
    });
  }
}

module.exports = new ValidationMiddleware();