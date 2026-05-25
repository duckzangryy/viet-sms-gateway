const express = require('express');
const router = express.Router();
const { body, param, query } = require('express-validator');
const SmsController = require('../controllers/SmsController');
const AuthMiddleware = require('../middleware/auth');
const ValidationMiddleware = require('../middleware/validation');

/**
 * @route   POST /api/v1/sms/send
 * @desc    Send single SMS
 * @access  Private (API Key)
 */
router.post(
  '/send',
  [
    AuthMiddleware.authenticateApiKey,
    AuthMiddleware.auditLog,
    body('to')
      .notEmpty()
      .withMessage('Phone number is required')
      .matches(/^(0|\+84)(3[2-9]|5[6|8|9]|7[0|6-9]|8[1-9]|9[0-9])[0-9]{7}$/)
      .withMessage('Invalid Vietnamese phone number format'),
    body('message')
      .notEmpty()
      .withMessage('Message is required')
      .isLength({ max: 160 })
      .withMessage('Message must be 160 characters or less'),
    body('messageType')
      .optional()
      .isIn(['OTP', 'MARKETING', 'TRANSACTIONAL', 'ALERT'])
      .withMessage('Invalid message type'),
    body('senderId')
      .optional()
      .isLength({ max: 11 })
      .withMessage('Sender ID must be 11 characters or less'),
    body('tags')
      .optional()
      .isArray()
      .withMessage('Tags must be an array'),
    ValidationMiddleware.validate,
  ],
  SmsController.sendSingleSms
);

/**
 * @route   POST /api/v1/sms/bulk
 * @desc    Send bulk SMS
 * @access  Private (API Key)
 */
router.post(
  '/bulk',
  [
    AuthMiddleware.authenticateApiKey,
    AuthMiddleware.auditLog,
    body('messages')
      .isArray({ min: 1, max: 1000 })
      .withMessage('Messages must be an array with 1-1000 items'),
    body('messages.*.to')
      .notEmpty()
      .withMessage('Phone number is required for each message')
      .matches(/^(0|\+84)(3[2-9]|5[6|8|9]|7[0|6-9]|8[1-9]|9[0-9])[0-9]{7}$/)
      .withMessage('Invalid Vietnamese phone number format'),
    body('messages.*.message')
      .notEmpty()
      .withMessage('Message is required for each message')
      .isLength({ max: 160 })
      .withMessage('Message must be 160 characters or less'),
    body('messageType')
      .optional()
      .isIn(['OTP', 'MARKETING', 'TRANSACTIONAL', 'ALERT'])
      .withMessage('Invalid message type'),
    body('senderId')
      .optional()
      .isLength({ max: 11 })
      .withMessage('Sender ID must be 11 characters or less'),
    ValidationMiddleware.validate,
  ],
  SmsController.sendBulkSms
);

/**
 * @route   GET /api/v1/sms/status/:messageId
 * @desc    Check SMS status
 * @access  Private (API Key or JWT)
 */
router.get(
  '/status/:messageId',
  [
    param('messageId')
      .isMongoId()
      .withMessage('Invalid message ID format'),
    ValidationMiddleware.validate,
  ],
  (req, res, next) => {
    // Allow both API key and JWT authentication for status checks
    const apiKey = AuthMiddleware.extractApiKey(req);
    const jwtToken = AuthMiddleware.extractJwtToken(req);
    
    if (apiKey) {
      return AuthMiddleware.authenticateApiKey(req, res, next);
    } else if (jwtToken) {
      return AuthMiddleware.authenticateJwt(req, res, next);
    } else {
      return res.status(401).json({
        success: false,
        error: 'Authentication required',
      });
    }
  },
  SmsController.checkSmsStatus
);

/**
 * @route   GET /api/v1/sms/statistics
 * @desc    Get SMS statistics
 * @access  Private (JWT - dashboard only)
 */
router.get(
  '/statistics',
  [
    AuthMiddleware.authenticateJwt,
    AuthMiddleware.auditLog,
    query('startDate')
      .optional()
      .isISO8601()
      .withMessage('Invalid start date format'),
    query('endDate')
      .optional()
      .isISO8601()
      .withMessage('Invalid end date format'),
    ValidationMiddleware.validate,
  ],
  SmsController.getSmsStatistics
);

/**
 * @route   GET /api/v1/sms/providers
 * @desc    Get available SMS providers
 * @access  Private (API Key or JWT)
 */
router.get(
  '/providers',
  (req, res, next) => {
    // Allow both API key and JWT authentication
    const apiKey = AuthMiddleware.extractApiKey(req);
    const jwtToken = AuthMiddleware.extractJwtToken(req);
    
    if (apiKey) {
      return AuthMiddleware.authenticateApiKey(req, res, next);
    } else if (jwtToken) {
      return AuthMiddleware.authenticateJwt(req, res, next);
    } else {
      return res.status(401).json({
        success: false,
        error: 'Authentication required',
      });
    }
  },
  async (req, res) => {
    try {
      const SmsProviderService = require('../services/SmsProviderService');
      const providers = await SmsProviderService.getProviderStats();
      
      return res.status(200).json({
        success: true,
        data: providers,
      });
    } catch (error) {
      return res.status(500).json({
        success: false,
        error: 'Failed to get providers',
      });
    }
  }
);

/**
 * @route   POST /api/v1/sms/validate
 * @desc    Validate phone number
 * @access  Public (no auth required for validation)
 */
router.post(
  '/validate',
  [
    body('phone')
      .notEmpty()
      .withMessage('Phone number is required'),
    ValidationMiddleware.validate,
  ],
  async (req, res) => {
    try {
      const SmsProviderService = require('../services/SmsProviderService');
      const { phone } = req.body;
      
      const isValid = SmsProviderService.validatePhoneNumber(phone);
      const formatted = SmsProviderService.formatPhoneNumber(phone);
      
      return res.status(200).json({
        success: true,
        data: {
          phone,
          formatted,
          isValid,
          country: isValid ? 'Vietnam' : 'Unknown',
        },
      });
    } catch (error) {
      return res.status(500).json({
        success: false,
        error: 'Validation failed',
      });
    }
  }
);

/**
 * @route   GET /api/v1/sms/pricing
 * @desc    Get SMS pricing information
 * @access  Public
 */
router.get(
  '/pricing',
  async (req, res) => {
    try {
      const basePrice = process.env.SMS_PRICE_PER_MESSAGE || 1; // in cents
      const bulkDiscount = process.env.BULK_SMS_DISCOUNT || 0.8;
      
      const pricing = {
        single: {
          price: basePrice,
          currency: 'USD',
          description: 'Per SMS',
        },
        bulk: {
          price: Math.floor(basePrice * bulkDiscount),
          currency: 'USD',
          description: 'Per SMS (1000+ messages, 20% discount)',
          discount: `${Math.round((1 - bulkDiscount) * 100)}%`,
        },
        vnd: {
          price: basePrice * 230, // Approx exchange rate
          currency: 'VND',
          description: 'Approximate VND equivalent',
        },
        limits: {
          daily: 1000,
          monthly: 30000,
          messageLength: 160,
        },
      };
      
      return res.status(200).json({
        success: true,
        data: pricing,
      });
    } catch (error) {
      return res.status(500).json({
        success: false,
        error: 'Failed to get pricing',
      });
    }
  }
);

module.exports = router;