const express = require('express');
const router = express.Router();
const { body } = require('express-validator');
const Client = require('../models/Client');
const AuthMiddleware = require('../middleware/auth');
const ValidationMiddleware = require('../middleware/validation');
const winston = require('winston');

const logger = winston.createLogger({
  level: process.env.LOG_LEVEL || 'info',
  format: winston.format.combine(
    winston.format.timestamp(),
    winston.format.json()
  ),
  transports: [
    new winston.transports.File({ filename: 'logs/auth-routes.log' }),
    new winston.transports.Console(),
  ],
});

/**
 * @route   POST /api/v1/auth/register
 * @desc    Register new client
 * @access  Public
 */
router.post(
  '/register',
  [
    body('name')
      .notEmpty()
      .withMessage('Name is required')
      .isLength({ min: 2, max: 100 })
      .withMessage('Name must be between 2 and 100 characters'),
    body('email')
      .notEmpty()
      .withMessage('Email is required')
      .isEmail()
      .withMessage('Invalid email format')
      .normalizeEmail(),
    body('phone')
      .notEmpty()
      .withMessage('Phone number is required')
      .matches(/^(0|\+84)(3[2-9]|5[6|8|9]|7[0|6-9]|8[1-9]|9[0-9])[0-9]{7}$/)
      .withMessage('Invalid Vietnamese phone number format'),
    body('password')
      .notEmpty()
      .withMessage('Password is required')
      .isLength({ min: 8 })
      .withMessage('Password must be at least 8 characters')
      .matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/)
      .withMessage('Password must contain at least one uppercase letter, one lowercase letter, and one number'),
    body('confirmPassword')
      .notEmpty()
      .withMessage('Confirm password is required')
      .custom((value, { req }) => value === req.body.password)
      .withMessage('Passwords do not match'),
    ValidationMiddleware.validate,
  ],
  async (req, res) => {
    try {
      const { name, email, phone, password } = req.body;

      // Check if email already exists
      const existingClient = await Client.findOne({ email });
      if (existingClient) {
        return res.status(400).json({
          success: false,
          error: 'Email already registered',
        });
      }

      // Check if phone already exists
      const existingPhone = await Client.findOne({ phone });
      if (existingPhone) {
        return res.status(400).json({
          success: false,
          error: 'Phone number already registered',
        });
      }

      // Create new client
      const client = new Client({
        name,
        email,
        phone,
        password,
        status: 'PENDING_VERIFICATION',
      });

      // Generate API key
      client.generateApiKey();
      
      // Generate verification token
      const verificationToken = client.generateVerificationToken();
      
      await client.save();

      // Generate JWT token
      const token = AuthMiddleware.generateToken(client);

      // Log registration
      logger.info('New client registered', {
        clientId: client._id,
        email: client.email,
        ip: req.ip,
      });

      // In production, send verification email here
      // await sendVerificationEmail(client.email, verificationToken);

      return res.status(201).json({
        success: true,
        message: 'Registration successful. Please verify your email.',
        data: {
          clientId: client._id,
          name: client.name,
          email: client.email,
          phone: client.phone,
          status: client.status,
          apiKey: client.apiKey,
          token,
          // verificationToken: process.env.NODE_ENV === 'development' ? verificationToken : undefined,
        },
      });
    } catch (error) {
      logger.error('Registration failed', {
        error: error.message,
        email: req.body.email,
        ip: req.ip,
      });

      return res.status(500).json({
        success: false,
        error: 'Registration failed',
        details: process.env.NODE_ENV === 'development' ? error.message : undefined,
      });
    }
  }
);

/**
 * @route   POST /api/v1/auth/login
 * @desc    Login client
 * @access  Public
 */
router.post(
  '/login',
  [
    body('email')
      .notEmpty()
      .withMessage('Email is required')
      .isEmail()
      .withMessage('Invalid email format')
      .normalizeEmail(),
    body('password')
      .notEmpty()
      .withMessage('Password is required'),
    ValidationMiddleware.validate,
  ],
  async (req, res) => {
    try {
      const { email, password } = req.body;
      const ipAddress = req.ip;

      // Find client with password
      const client = await Client.findOne({ email }).select('+password');
      
      if (!client) {
        // Record failed login attempt for security
        await Client.findOneAndUpdate(
          { email },
          { $inc: { failedLoginAttempts: 1 } }
        );

        return res.status(401).json({
          success: false,
          error: 'Invalid email or password',
        });
      }

      // Check if account is locked
      if (client.isAccountLocked()) {
        return res.status(423).json({
          success: false,
          error: 'Account temporarily locked due to too many failed attempts',
          lockedUntil: client.accountLockedUntil,
        });
      }

      // Check password
      const isPasswordValid = await client.comparePassword(password);
      
      if (!isPasswordValid) {
        // Record failed login attempt
        await client.recordFailedLogin();
        
        return res.status(401).json({
          success: false,
          error: 'Invalid email or password',
          remainingAttempts: 5 - client.failedLoginAttempts,
        });
      }

      // Check account status
      if (client.status !== 'ACTIVE') {
        return res.status(403).json({
          success: false,
          error: `Account is ${client.status.toLowerCase()}`,
          status: client.status,
        });
      }

      // Record successful login
      await client.recordLogin(ipAddress);

      // Generate JWT token
      const token = AuthMiddleware.generateToken(client);

      logger.info('Client logged in', {
        clientId: client._id,
        email: client.email,
        ip: ipAddress,
      });

      return res.status(200).json({
        success: true,
        message: 'Login successful',
        data: {
          clientId: client._id,
          name: client.name,
          email: client.email,
          phone: client.phone,
          status: client.status,
          apiKey: client.apiKey,
          balance: client.balance,
          currency: client.currency,
          token,
          lastLoginAt: client.lastLoginAt,
        },
      });
    } catch (error) {
      logger.error('Login failed', {
        error: error.message,
        email: req.body.email,
        ip: req.ip,
      });

      return res.status(500).json({
        success: false,
        error: 'Login failed',
        details: process.env.NODE_ENV === 'development' ? error.message : undefined,
      });
    }
  }
);

/**
 * @route   GET /api/v1/auth/profile
 * @desc    Get client profile
 * @access  Private (JWT)
 */
router.get(
  '/profile',
  [
    AuthMiddleware.authenticateJwt,
    AuthMiddleware.auditLog,
  ],
  async (req, res) => {
    try {
      const client = req.client;

      // Get SMS statistics for dashboard
      const SmsMessage = require('../models/SmsMessage');
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      
      const todayCount = await SmsMessage.countDocuments({
        clientId: client._id,
        createdAt: { $gte: today },
        status: { $in: ['SENT', 'DELIVERED'] },
      });

      const totalCount = await SmsMessage.countDocuments({
        clientId: client._id,
        status: { $in: ['SENT', 'DELIVERED'] },
      });

      const profile = {
        clientId: client._id,
        name: client.name,
        email: client.email,
        phone: client.phone,
        status: client.status,
        apiKey: client.apiKey,
        balance: client.balance,
        currency: client.currency,
        defaultSenderId: client.defaultSenderId,
        webhookUrl: client.webhookUrl,
        preferredProvider: client.preferredProvider,
        dailyLimit: client.dailyLimit,
        monthlyLimit: client.monthlyLimit,
        rateLimit: client.rateLimit,
        emailVerified: client.emailVerified,
        phoneVerified: client.phoneVerified,
        lastLoginAt: client.lastLoginAt,
        lastLoginIp: client.lastLoginIp,
        createdAt: client.createdAt,
        statistics: {
          today: todayCount,
          total: totalCount,
          dailyLimit: client.dailyLimit,
          monthlyLimit: client.monthlyLimit,
          remainingDaily: Math.max(0, client.dailyLimit - todayCount),
        },
      };

      return res.status(200).json({
        success: true,
        data: profile,
      });
    } catch (error) {
      logger.error('Failed to get profile', {
        error: error.message,
        clientId: req.client?._id,
      });

      return res.status(500).json({
        success: false,
        error: 'Failed to get profile',
      });
    }
  }
);

/**
 * @route   PUT /api/v1/auth/profile
 * @desc    Update client profile
 * @access  Private (JWT)
 */
router.put(
  '/profile',
  [
    AuthMiddleware.authenticateJwt,
    AuthMiddleware.auditLog,
    body('name')
      .optional()
      .isLength({ min: 2, max: 100 })
      .withMessage('Name must be between 2 and 100 characters'),
    body('phone')
      .optional()
      .matches(/^(0|\+84)(3[2-9]|5[6|8|9]|7[0|6-9]|8[1-9]|9[0-9])[0-9]{7}$/)
      .withMessage('Invalid Vietnamese phone number format'),
    body('defaultSenderId')
      .optional()
      .isLength({ max: 11 })
      .withMessage('Sender ID must be 11 characters or less'),
    body('webhookUrl')
      .optional()
      .isURL()
      .withMessage('Invalid URL format'),
    body('preferredProvider')
      .optional()
      .isIn(['VIETTEL', 'MOBIFONE', 'VINAPHONE', 'AUTO'])
      .withMessage('Invalid provider'),
    ValidationMiddleware.validate,
  ],
  async (req, res) => {
    try {
      const client = req.client;
      const updates = req.body;

      // Remove fields that shouldn't be updated directly
      delete updates.email;
      delete updates.password;
      delete updates.apiKey;
      delete updates.balance;
      delete updates.status;

      // Update client
      Object.assign(client, updates);
      await client.save();

      logger.info('Profile updated', {
        clientId: client._id,
        updates: Object.keys(updates),
      });

      return res.status(200).json({
        success: true,
        message: 'Profile updated successfully',
        data: {
          name: client.name,
          phone: client.phone,
          defaultSenderId: client.defaultSenderId,
          webhookUrl: client.webhookUrl,
          preferredProvider: client.preferredProvider,
          updatedAt: client.updatedAt,
        },
      });
    } catch (error) {
      logger.error('Failed to update profile', {
        error: error.message,
        clientId: req.client?._id,
      });

      return res.status(500).json({
        success: false,
        error: 'Failed to update profile',
      });
    }
  }
);

/**
 * @route   POST /api/v1/auth/change-password
 * @desc    Change password
 * @access  Private (JWT)
 */
router.post(
  '/change-password',
  [
    AuthMiddleware.authenticateJwt,
    AuthMiddleware.auditLog,
    body('currentPassword')
      .notEmpty()
      .withMessage('Current password is required'),
    body('newPassword')
      .notEmpty()
      .withMessage('New password is required')
      .isLength({ min: 8 })
      .withMessage('New password must be at least 8 characters')
      .matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/)
      .withMessage('New password must contain at least one uppercase letter, one lowercase letter, and one number'),
    body('confirmPassword')
      .notEmpty()
      .withMessage('Confirm password is required')
      .custom((value, { req }) => value === req.body.newPassword)
      .withMessage('Passwords do not match'),
    ValidationMiddleware.validate,
  ],
  async (req, res) => {
    try {
      const { currentPassword, newPassword } = req.body;
      const client = req.client;

      // Verify current password
      const isPasswordValid = await client.comparePassword(currentPassword);
      
      if (!isPasswordValid) {
        return res.status(401).json({
          success: false,
          error: 'Current password is incorrect',
        });
      }

      // Update password
      client.password = newPassword;
      await client.save();

      logger.info('Password changed', {
        clientId: client._id,
      });

      return res.status(200).json({
        success: true,
        message: 'Password changed successfully',
      });
    } catch (error) {
      logger.error('Failed to change password', {
        error: error.message,
        clientId: req.client?._id,
      });

      return res.status(500).json({
        success: false,
        error: 'Failed to change password',
      });
    }
  }
);

/**
 * @route   POST /api/v1/auth/regenerate-api-key
 * @desc    Regenerate API key
 * @access  Private (JWT)
 */
router.post(
  '/regenerate-api-key',
  [
    AuthMiddleware.authenticateJwt,
    AuthMiddleware.auditLog,
  ],
  async (req, res) => {
    try {
      const client = req.client;

      // Generate new API key
      const newApiKey = client.generateApiKey();
      await client.save();

      logger.info('API key regenerated', {
        clientId: client._id,
      });

      return res.status(200).json({
        success: true,
        message: 'API key regenerated successfully',
        data: {
          apiKey: newApiKey,
          apiKeyGeneratedAt: client.apiKeyGeneratedAt,
        },
      });
    } catch (error) {
      logger.error('Failed to regenerate API key', {
        error: error.message,
        clientId: req.client?._id,
      });

      return res.status(500).json({
        success: false,
        error: 'Failed to regenerate API key',
      });
    }
  }
);

/**
 * @route   POST /api/v1/auth/verify-email
 * @desc    Verify email with token
 * @access  Public
 */
router.post(
  '/verify-email',
  [
    body('token')
      .notEmpty()
      .withMessage('Verification token is required'),
    ValidationMiddleware.validate,
  ],
  async (req, res) => {
    try {
      const { token } = req.body;

      const client = await Client.findOne({
        verificationToken: token,
        verificationTokenExpires: { $gt: new Date() },
      });

      if (!client) {
        return res.status(400).json({
          success: false,
          error: 'Invalid or expired verification token',
        });
      }

      // Update client status
      client.emailVerified = true;
      client.verificationToken = undefined;
      client.verificationTokenExpires = undefined;
      
      // If phone is also verified, activate account
      if (client.phoneVerified) {
        client.status = 'ACTIVE';
      }
      
      await client.save();

      logger.info('Email verified', {
        clientId: client._id,
        email: client.email,
      });

      return res.status(200).json({
        success: true,
        message: 'Email verified successfully',
        data: {
          clientId: client._id,
          email: client.email,
          status: client.status,
        },
      });
    } catch (error) {
      logger.error('Email verification failed', {
        error: error.message,
        token: req.body.token,
      });

      return res.status(500).json({
        success: false,
        error: 'Email verification failed',
      });
    }
  }
);

/**
 * @route   POST /api/v1/auth/forgot-password
 * @desc    Request password reset
 * @access  Public
 */
router.post(
  '/forgot-password',
  [
    body('email')
      .notEmpty()
      .withMessage('Email is required')
      .isEmail()
      .withMessage('Invalid email format')
      .normalizeEmail(),
    ValidationMiddleware.validate,
  ],
  async (req, res) => {
    try {
      const { email } = req.body;

      const client = await Client.findOne({ email });
      
      if (!client) {
        // Don't reveal that email doesn't exist for security
        return res.status(200).json({
          success: true,
          message: 'If your email is registered, you will receive a password reset link',
        });
      }

      // Generate reset token
      const resetToken = client.generateResetPasswordToken();
      await client.save();

      // In production, send reset email here
      // await sendPasswordResetEmail(client.email, resetToken);

      logger.info('Password reset requested', {
        clientId: client._id,
        email: client.email,
      });

      return res.status(200).json({
        success: true,
        message: 'If your email is registered, you will receive a password reset link',
        // For development only
        ...(process.env.NODE_ENV === 'development' && { resetToken }),
      });
    } catch (error) {
      logger.error('Password reset request failed', {
        error: error.message,
        email: req.body.email,
      });

      return res.status(500).json({
        success: false,
        error: 'Password reset request failed',
      });
    }
  }
);

/**
 * @route   POST /api/v1/auth/reset-password
 * @desc    Reset password with token
 * @access  Public
 */
router.post(
  '/reset-password',
  [
    body('token')
      .notEmpty()
      .withMessage('Reset token is required'),
    body('newPassword')
      .notEmpty()
      .withMessage('New password is required')
      .isLength({ min: 8 })
      .withMessage('New password must be at least 8 characters')
      .matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/)
      .withMessage('New password must contain at least one uppercase letter, one lowercase letter, and one number'),
    body('confirmPassword')
      .notEmpty()
      .withMessage('Confirm password is required')
      .custom((value, { req }) => value === req.body.newPassword)
      .withMessage('Passwords do not match'),
    ValidationMiddleware.validate,
  ],
  async (req, res) => {
    try {
      const { token, newPassword } = req.body;

      const client = await Client.findOne({
        resetPasswordToken: token,
        resetPasswordExpires: { $gt: new Date() },
      });

      if (!client) {
        return res.status(400).json({
          success: false,
          error: 'Invalid or expired reset token',
        });
      }

      // Update password
      client.password = newPassword;
      client.resetPasswordToken = undefined;
      client.resetPasswordExpires = undefined;
      client.failedLoginAttempts = 0;
      client.accountLockedUntil = null;
      
      await client.save();

      logger.info('Password reset successful', {
        clientId: client._id,
        email: client.email,
      });

      return res.status(200).json({
        success: true,
        message: 'Password reset successful',
      });
    } catch (error) {
      logger.error('Password reset failed', {
        error: error.message,
        token: req.body.token,
      });

      return res.status(500).json({
        success: false,
        error: 'Password reset failed',
      });
    }
  }
);

module.exports = router;