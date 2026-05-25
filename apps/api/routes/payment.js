const express = require('express');
const router = express.Router();
const { body, query } = require('express-validator');
const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);
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
    new winston.transports.File({ filename: 'logs/payment.log' }),
    new winston.transports.Console(),
  ],
});

// Payment model (simplified - in production would have full transaction model)
const mongoose = require('mongoose');
const paymentSchema = new mongoose.Schema({
  clientId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Client',
    required: true,
    index: true,
  },
  type: {
    type: String,
    enum: ['DEPOSIT', 'WITHDRAWAL', 'REFUND', 'SMS_CHARGE'],
    required: true,
  },
  amount: {
    type: Number,
    required: true,
    min: 0,
  },
  currency: {
    type: String,
    default: 'USD',
    enum: ['USD', 'VND'],
  },
  status: {
    type: String,
    enum: ['PENDING', 'COMPLETED', 'FAILED', 'CANCELLED'],
    default: 'PENDING',
  },
  paymentMethod: {
    type: String,
    enum: ['STRIPE', 'MOMO', 'BANK_TRANSFER', 'INTERNAL'],
    required: true,
  },
  paymentId: {
    type: String,
    sparse: true,
  },
  description: {
    type: String,
    default: '',
  },
  metadata: {
    type: mongoose.Schema.Types.Mixed,
    default: {},
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
  completedAt: {
    type: Date,
    default: null,
  },
});

const Payment = mongoose.models.Payment || mongoose.model('Payment', paymentSchema);

/**
 * @route   GET /api/v1/payment/balance
 * @desc    Get client balance
 * @access  Private (JWT)
 */
router.get(
  '/balance',
  [
    AuthMiddleware.authenticateJwt,
    AuthMiddleware.auditLog,
  ],
  async (req, res) => {
    try {
      const client = req.client;

      // Get recent transactions
      const recentTransactions = await Payment.find({
        clientId: client._id,
        status: 'COMPLETED',
      })
      .sort({ createdAt: -1 })
      .limit(10);

      return res.status(200).json({
        success: true,
        data: {
          balance: client.balance,
          currency: client.currency,
          recentTransactions,
        },
      });
    } catch (error) {
      logger.error('Failed to get balance', {
        error: error.message,
        clientId: req.client?._id,
      });

      return res.status(500).json({
        success: false,
        error: 'Failed to get balance',
      });
    }
  }
);

/**
 * @route   POST /api/v1/payment/deposit
 * @desc    Create deposit payment intent
 * @access  Private (JWT)
 */
router.post(
  '/deposit',
  [
    AuthMiddleware.authenticateJwt,
    AuthMiddleware.auditLog,
    body('amount')
      .notEmpty()
      .withMessage('Amount is required')
      .isFloat({ min: 1 })
      .withMessage('Amount must be at least 1'),
    body('currency')
      .optional()
      .isIn(['USD', 'VND'])
      .withMessage('Currency must be USD or VND'),
    body('paymentMethod')
      .notEmpty()
      .withMessage('Payment method is required')
      .isIn(['STRIPE', 'MOMO'])
      .withMessage('Payment method must be STRIPE or MOMO'),
    ValidationMiddleware.validate,
  ],
  async (req, res) => {
    try {
      const { amount, currency = 'USD', paymentMethod } = req.body;
      const client = req.client;

      // Validate amount
      const amountValidation = ValidationMiddleware.validateAmount(amount, currency);
      if (!amountValidation.valid) {
        return res.status(400).json({
          success: false,
          error: amountValidation.error,
        });
      }

      const depositAmount = amountValidation.amount;

      // Create payment record
      const payment = new Payment({
        clientId: client._id,
        type: 'DEPOSIT',
        amount: depositAmount,
        currency,
        status: 'PENDING',
        paymentMethod,
        description: `Deposit ${depositAmount} ${currency}`,
      });

      await payment.save();

      let paymentIntent;
      
      if (paymentMethod === 'STRIPE') {
        // Create Stripe payment intent
        paymentIntent = await stripe.paymentIntents.create({
          amount: Math.round(depositAmount * 100), // Convert to cents
          currency: currency.toLowerCase(),
          metadata: {
            clientId: client._id.toString(),
            paymentId: payment._id.toString(),
            email: client.email,
          },
          description: `Deposit for ${client.email}`,
        });

        payment.paymentId = paymentIntent.id;
        payment.metadata.stripe = {
          clientSecret: paymentIntent.client_secret,
          status: paymentIntent.status,
        };
      } else if (paymentMethod === 'MOMO') {
        // Momo payment integration (simplified)
        // In production, would call Momo API
        const momoPaymentId = `momo_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
        
        payment.paymentId = momoPaymentId;
        payment.metadata.momo = {
          paymentUrl: `https://payment.momo.vn/pay/${momoPaymentId}`,
          qrCode: `data:image/svg+xml;base64,${Buffer.from(`<svg>Momo QR for ${depositAmount} ${currency}</svg>`).toString('base64')}`,
        };
      }

      await payment.save();

      logger.info('Deposit payment intent created', {
        clientId: client._id,
        paymentId: payment._id,
        amount: depositAmount,
        currency,
        paymentMethod,
      });

      return res.status(200).json({
        success: true,
        message: 'Payment intent created',
        data: {
          paymentId: payment._id,
          amount: depositAmount,
          currency,
          paymentMethod,
          ...(paymentMethod === 'STRIPE' && {
            clientSecret: paymentIntent.client_secret,
          }),
          ...(paymentMethod === 'MOMO' && {
            paymentUrl: payment.metadata.momo.paymentUrl,
            qrCode: payment.metadata.momo.qrCode,
          }),
        },
      });
    } catch (error) {
      logger.error('Failed to create deposit', {
        error: error.message,
        clientId: req.client?._id,
      });

      return res.status(500).json({
        success: false,
        error: 'Failed to create deposit',
        details: process.env.NODE_ENV === 'development' ? error.message : undefined,
      });
    }
  }
);

/**
 * @route   POST /api/v1/payment/webhook/stripe
 * @desc    Stripe webhook handler
 * @access  Public (called by Stripe)
 */
router.post(
  '/webhook/stripe',
  express.raw({ type: 'application/json' }),
  async (req, res) => {
    const sig = req.headers['stripe-signature'];
    const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;

    let event;

    try {
      if (!webhookSecret) {
        throw new Error('Stripe webhook secret not configured');
      }

      event = stripe.webhooks.constructEvent(req.body, sig, webhookSecret);
    } catch (err) {
      logger.error('Stripe webhook signature verification failed', {
        error: err.message,
      });
      return res.status(400).send(`Webhook Error: ${err.message}`);
    }

    try {
      // Handle the event
      switch (event.type) {
        case 'payment_intent.succeeded':
          await handleStripePaymentSuccess(event.data.object);
          break;
        case 'payment_intent.payment_failed':
          await handleStripePaymentFailure(event.data.object);
          break;
        default:
          logger.debug(`Unhandled Stripe event type: ${event.type}`);
      }

      res.status(200).json({ received: true });
    } catch (error) {
      logger.error('Stripe webhook processing failed', {
        error: error.message,
        eventType: event.type,
      });
      res.status(500).json({ error: 'Webhook processing failed' });
    }
  }
);

/**
 * Handle successful Stripe payment
 */
async function handleStripePaymentSuccess(paymentIntent) {
  const { metadata, amount, currency } = paymentIntent;
  const clientId = metadata.clientId;
  const paymentId = metadata.paymentId;

  const payment = await Payment.findById(paymentId);
  if (!payment) {
    throw new Error(`Payment not found: ${paymentId}`);
  }

  if (payment.status === 'COMPLETED') {
    logger.warn('Payment already completed', { paymentId });
    return;
  }

  // Update payment status
  payment.status = 'COMPLETED';
  payment.completedAt = new Date();
  payment.metadata.stripe = {
    ...payment.metadata.stripe,
    paymentIntentId: paymentIntent.id,
    status: paymentIntent.status,
  };
  await payment.save();

  // Update client balance
  const client = await Client.findById(clientId);
  if (client) {
    // Convert from cents to dollars
    const amountInCurrency = amount / 100;
    await client.addBalance(amountInCurrency);
    
    logger.info('Stripe payment completed', {
      clientId,
      paymentId,
      amount: amountInCurrency,
      currency,
      newBalance: client.balance,
    });
  }
}

/**
 * Handle failed Stripe payment
 */
async function handleStripePaymentFailure(paymentIntent) {
  const { metadata } = paymentIntent;
  const paymentId = metadata.paymentId;

  const payment = await Payment.findById(paymentId);
  if (!payment) {
    throw new Error(`Payment not found: ${paymentId}`);
  }

  payment.status = 'FAILED';
  payment.metadata.stripe = {
    ...payment.metadata.stripe,
    paymentIntentId: paymentIntent.id,
    status: paymentIntent.status,
    error: paymentIntent.last_payment_error?.message || 'Payment failed',
  };
  await payment.save();

  logger.warn('Stripe payment failed', {
    paymentId,
    error: payment.metadata.stripe.error,
  });
}

/**
 * @route   POST /api/v1/payment/webhook/momo
 * @desc    Momo webhook handler
 * @access  Public (called by Momo)
 */
router.post(
  '/webhook/momo',
  express.json(),
  async (req, res) => {
    try {
      const { paymentId, status, amount, signature } = req.body;

      // Verify signature (simplified - in production would verify Momo signature)
      if (!paymentId || !status) {
        return res.status(400).json({ error: 'Invalid request' });
      }

      const payment = await Payment.findOne({ paymentId });
      if (!payment) {
        return res.status(404).json({ error: 'Payment not found' });
      }

      if (status === 'SUCCESS') {
        payment.status = 'COMPLETED';
        payment.completedAt = new Date();
        await payment.save();

        // Update client balance
        const client = await Client.findById(payment.clientId);
        if (client) {
          await client.addBalance(payment.amount);
          
          logger.info('Momo payment completed', {
            clientId: client._id,
            paymentId,
            amount: payment.amount,
            currency: payment.currency,
            newBalance: client.balance,
          });
        }
      } else {
        payment.status = 'FAILED';
        payment.metadata.momo = {
          ...payment.metadata.momo,
          status,
          error: 'Payment failed or cancelled',
        };
        await payment.save();

        logger.warn('Momo payment failed', {
          paymentId,
          status,
        });
      }

      res.status(200).json({ received: true });
    } catch (error) {
      logger.error('Momo webhook processing failed', {
        error: error.message,
        body: req.body,
      });
      res.status(500).json({ error: 'Webhook processing failed' });
    }
  }
);

/**
 * @route   GET /api/v1/payment/transactions
 * @desc    Get payment transactions
 * @access  Private (JWT)
 */
router.get(
  '/transactions',
  [
    AuthMiddleware.authenticateJwt,
    AuthMiddleware.auditLog,
    query('page')
      .optional()
      .isInt({ min: 1 })
      .withMessage('Page must be a positive integer'),
    query('limit')
      .optional()
      .isInt({ min: 1, max: 100 })
      .withMessage('Limit must be between 1 and 100'),
    query('type')
      .optional()
      .isIn(['DEPOSIT', 'WITHDRAWAL', 'REFUND', 'SMS_CHARGE'])
      .withMessage('Invalid transaction type'),
    query('status')
      .optional()
      .isIn(['PENDING', 'COMPLETED', 'FAILED', 'CANCELLED'])
      .withMessage('Invalid status'),
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
  async (req, res) => {
    try {
      const client = req.client;
      const { page = 1, limit = 20, type, status, startDate, endDate } = req.query;

      // Validate pagination
      const pagination = ValidationMiddleware.validatePagination(page, limit);
      if (!pagination.valid) {
        return res.status(400).json({
          success: false,
          error: pagination.error,
        });
      }

      // Build filter
      const filter = { clientId: client._id };
      
      if (type) filter.type = type;
      if (status) filter.status = status;
      
      if (startDate || endDate) {
        filter.createdAt = {};
        if (startDate) filter.createdAt.$gte = new Date(startDate);
        if (endDate) filter.createdAt.$lte = new Date(endDate);
      }

      // Get transactions
      const transactions = await Payment.find(filter)
        .sort({ createdAt: -1 })
        .skip(pagination.skip)
        .limit(pagination.limit);

      // Get total count
      const total = await Payment.countDocuments(filter);

      // Calculate totals
      const totals = await Payment.aggregate([
        { $match: filter },
        { $group: {
          _id: '$type',
          totalAmount: { $sum: '$amount' },
          count: { $sum: 1 },
        }},
      ]);

      return res.status(200).json({
        success: true,
        data: {
          transactions,
          pagination: {
            page: pagination.page,
            limit: pagination.limit,
            total,
            totalPages: Math.ceil(total / pagination.limit),
          },
          totals: totals.reduce((acc, item) => {
            acc[item._id] = {
              totalAmount: item.totalAmount,
              count: item.count,
            };
            return acc;
          }, {}),
        },
      });
    } catch (error) {
      logger.error('Failed to get transactions', {
        error: error.message,
        clientId: req.client?._id,
      });

      return res.status(500).json({
        success: false,
        error: 'Failed to get transactions',
      });
    }
  }
);

/**
 * @route   POST /api/v1/payment/withdraw
 * @desc    Request withdrawal
 * @access  Private (JWT)
 */
router.post(
  '/withdraw',
  [
    AuthMiddleware.authenticateJwt,
    AuthMiddleware.auditLog,
    body('amount')
      .notEmpty()
      .withMessage('Amount is required')
      .isFloat({ min: 10 })
      .withMessage('Minimum withdrawal amount is 10'),
    body('bankAccount')
      .notEmpty()
      .withMessage('Bank account information is required'),
    ValidationMiddleware.validate,
  ],
  async (req, res) => {
    try {
      const { amount, bankAccount } = req.body;
      const client = req.client;

      // Validate amount
      const amountValidation = ValidationMiddleware.validateAmount(amount, client.currency);
      if (!amountValidation.valid) {
        return res.status(400).json({
          success: false,
          error: amountValidation.error,
        });
      }

      const withdrawalAmount = amountValidation.amount;

      // Check balance
      if (client.balance < withdrawalAmount) {
        return res.status(400).json({
          success: false,
          error: 'Insufficient balance',
          balance: client.balance,
          required: withdrawalAmount,
        });
      }

      // Create withdrawal request
      const payment = new Payment({
        clientId: client._id,
        type: 'WITHDRAWAL',
        amount: withdrawalAmount,
        currency: client.currency,
        status: 'PENDING',
        paymentMethod: 'BANK_TRANSFER',
        description: `Withdrawal to ${bankAccount.substring(0, 20)}...`,
        metadata: {
          bankAccount,
          requestedAt: new Date(),
        },
      });

      await payment.save();

      // In production, would initiate bank transfer here
      // For now, just create the request

      logger.info('Withdrawal requested', {
        clientId: client._id,
        paymentId: payment._id,
        amount: withdrawalAmount,
        bankAccount: bankAccount.substring(0, 10) + '...',
      });

      return res.status(200).json({
        success: true,
        message: 'Withdrawal request submitted. It will be processed within 1-3 business days.',
        data: {
          paymentId: payment._id,
          amount: withdrawalAmount,
          currency: client.currency,
          status: 'PENDING',
          estimatedCompletion: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000), // 3 days
        },
      });
    } catch (error) {
      logger.error('Failed to request withdrawal', {
        error: error.message,
        clientId: req.client?._id,
      });

      return res.status(500).json({
        success: false,
        error: 'Failed to request withdrawal',
      });
    }
  }
);

/**
 * @route   GET /api/v1/payment/pricing
 * @desc    Get pricing information
 * @access  Public
 */
router.get(
  '/pricing',
  async (req, res) => {
    try {
      const pricing = {
        sms: {
          single: process.env.SMS_PRICE_PER_MESSAGE || 1,
          bulk: Math.floor((process.env.SMS_PRICE_PER_MESSAGE || 1) * (process.env.BULK_SMS_DISCOUNT || 0.8)),
          currency: 'USD',
          description: 'Per SMS (in cents)',
        },
        deposit: {
          minimum: 1,
          maximum: 10000,
          currency: 'USD',
          fees: {
            stripe: '2.9% + $0.30',
            momo: '1.5%',
            bankTransfer: 'Free',
          },
        },
        withdrawal: {
          minimum: 10,
          maximum: 10000,
          currency: 'USD',
          processingTime: '1-3 business days',
          fees: {
            bankTransfer: '$1.50',
          },
        },
        currencies: {
          USD: {
            symbol: '$',
            exchangeRate: 1,
          },
          VND: {
            symbol: '₫',
            exchangeRate: 23000, // Approximate
          },
        },
      };

      return res.status(200).json({
        success: true,
        data: pricing,
      });
    } catch (error) {
      logger.error('Failed to get pricing', {
        error: error.message,
      });

      return res.status(500).json({
        success: false,
        error: 'Failed to get pricing',
      });
    }
  }
);

module.exports = router;