const SmsMessage = require('../models/SmsMessage');
const Client = require('../models/Client');
const SmsProviderService = require('../services/SmsProviderService');
const database = require('../config/database');
const winston = require('winston');

class SmsController {
  constructor() {
    this.logger = winston.createLogger({
      level: process.env.LOG_LEVEL || 'info',
      format: winston.format.combine(
        winston.format.timestamp(),
        winston.format.json()
      ),
      transports: [
        new winston.transports.File({ filename: 'logs/sms-controller.log' }),
        new winston.transports.Console(),
      ],
    });
  }

  /**
   * Send single SMS
   */
  async sendSingleSms(req, res) {
    try {
      const { to, message, messageType = 'OTP', senderId = '' } = req.body;
      const client = req.client;
      const ipAddress = req.ip;
      const userAgent = req.get('User-Agent') || '';

      // Validate input
      if (!to || !message) {
        return res.status(400).json({
          success: false,
          error: 'Missing required fields: to and message',
        });
      }

      if (!SmsProviderService.validatePhoneNumber(to)) {
        return res.status(400).json({
          success: false,
          error: 'Invalid phone number format',
        });
      }

      if (message.length > 160) {
        return res.status(400).json({
          success: false,
          error: 'Message too long (max 160 characters)',
        });
      }

      // Check client limits
      const canSendDaily = await client.checkDailyLimit();
      if (!canSendDaily) {
        return res.status(429).json({
          success: false,
          error: 'Daily limit exceeded',
          limit: client.dailyLimit,
        });
      }

      const canSendMonthly = await client.checkMonthlyLimit();
      if (!canSendMonthly) {
        return res.status(429).json({
          success: false,
          error: 'Monthly limit exceeded',
          limit: client.monthlyLimit,
        });
      }

      // Check balance
      if (!client.hasSufficientBalance(1)) {
        return res.status(402).json({
          success: false,
          error: 'Insufficient balance',
          balance: client.balance,
          currency: client.currency,
        });
      }

      // Create SMS record
      const smsMessage = new SmsMessage({
        clientId: client._id,
        apiKey: client.apiKey,
        to,
        message,
        messageType,
        provider: client.preferredProvider || 'AUTO',
        price: 0, // Will be calculated
        currency: client.currency,
        ipAddress,
        userAgent,
        tags: req.body.tags || [],
      });

      // Calculate price
      smsMessage.calculatePrice();
      await smsMessage.save();

      // Select provider
      const provider = await SmsProviderService.selectProvider(client.preferredProvider);

      // Send SMS
      const sendResult = await SmsProviderService.sendSms(
        provider,
        to,
        message,
        messageType,
        senderId || client.defaultSenderId
      );

      // Update SMS record
      await smsMessage.markAsSent(sendResult.messageId);

      // Deduct balance
      const price = smsMessage.price;
      await client.deductBalance(price);

      // Log successful send
      this.logger.info('SMS sent successfully', {
        messageId: smsMessage._id,
        clientId: client._id,
        to,
        provider: sendResult.provider,
        price,
      });

      // Prepare response
      const response = {
        success: true,
        data: {
          messageId: smsMessage._id,
          providerMessageId: sendResult.messageId,
          provider: sendResult.provider,
          to: smsMessage.formattedTo,
          message,
          messageType,
          price,
          currency: smsMessage.currency,
          status: 'SENT',
          sentAt: smsMessage.sentAt,
          remainingBalance: client.balance,
        },
      };

      // Trigger webhook if configured
      if (client.webhookUrl) {
        this.triggerWebhook(client, response.data).catch(error => {
          this.logger.error('Webhook trigger failed', { error: error.message });
        });
      }

      return res.status(200).json(response);
    } catch (error) {
      this.logger.error('Failed to send SMS', {
        error: error.message,
        clientId: req.client?._id,
        body: req.body,
      });

      // Update SMS record as failed if it exists
      if (req.smsMessage) {
        await req.smsMessage.markAsFailed(error);
      }

      return res.status(500).json({
        success: false,
        error: 'Failed to send SMS',
        details: process.env.NODE_ENV === 'development' ? error.message : undefined,
      });
    }
  }

  /**
   * Send bulk SMS
   */
  async sendBulkSms(req, res) {
    try {
      const { messages, messageType = 'MARKETING', senderId = '' } = req.body;
      const client = req.client;

      if (!Array.isArray(messages) || messages.length === 0) {
        return res.status(400).json({
          success: false,
          error: 'Messages must be a non-empty array',
        });
      }

      if (messages.length > 1000) {
        return res.status(400).json({
          success: false,
          error: 'Maximum 1000 messages per bulk request',
        });
      }

      // Validate all messages
      for (const msg of messages) {
        if (!msg.to || !msg.message) {
          return res.status(400).json({
            success: false,
            error: 'Each message must have to and message fields',
          });
        }
        if (!SmsProviderService.validatePhoneNumber(msg.to)) {
          return res.status(400).json({
            success: false,
            error: `Invalid phone number: ${msg.to}`,
          });
        }
        if (msg.message.length > 160) {
          return res.status(400).json({
            success: false,
            error: `Message too long for ${msg.to} (max 160 characters)`,
          });
        }
      }

      // Check limits
      const canSendDaily = await client.checkDailyLimit();
      if (!canSendDaily) {
        return res.status(429).json({
          success: false,
          error: 'Daily limit exceeded',
          limit: client.dailyLimit,
        });
      }

      const canSendMonthly = await client.checkMonthlyLimit();
      if (!canSendMonthly) {
        return res.status(429).json({
          success: false,
          error: 'Monthly limit exceeded',
          limit: client.monthlyLimit,
        });
      }

      // Check balance with bulk discount
      const basePrice = process.env.SMS_PRICE_PER_MESSAGE || 1;
      const bulkDiscount = process.env.BULK_SMS_DISCOUNT || 0.8;
      const totalPrice = Math.floor(basePrice * messages.length * bulkDiscount);
      
      if (!client.hasSufficientBalance(messages.length)) {
        return res.status(402).json({
          success: false,
          error: 'Insufficient balance',
          balance: client.balance,
          required: totalPrice,
          currency: client.currency,
        });
      }

      // Create SMS records
      const smsPromises = messages.map(msg => {
        const smsMessage = new SmsMessage({
          clientId: client._id,
          apiKey: client.apiKey,
          to: msg.to,
          message: msg.message,
          messageType,
          provider: client.preferredProvider || 'AUTO',
          price: Math.floor(basePrice * bulkDiscount),
          currency: client.currency,
          ipAddress: req.ip,
          userAgent: req.get('User-Agent') || '',
          tags: msg.tags || [],
        });
        return smsMessage.save();
      });

      const smsMessages = await Promise.all(smsPromises);

      // Select provider
      const provider = await SmsProviderService.selectProvider(client.preferredProvider);

      // Send messages in batches of 50
      const batchSize = 50;
      const results = [];
      
      for (let i = 0; i < smsMessages.length; i += batchSize) {
        const batch = smsMessages.slice(i, i + batchSize);
        const batchPromises = batch.map(async (sms) => {
          try {
            const sendResult = await SmsProviderService.sendSms(
              provider,
              sms.to,
              sms.message,
              messageType,
              senderId || client.defaultSenderId
            );
            await sms.markAsSent(sendResult.messageId);
            return {
              messageId: sms._id,
              to: sms.formattedTo,
              status: 'SENT',
              providerMessageId: sendResult.messageId,
            };
          } catch (error) {
            await sms.markAsFailed(error);
            return {
              messageId: sms._id,
              to: sms.formattedTo,
              status: 'FAILED',
              error: error.message,
            };
          }
        });

        const batchResults = await Promise.all(batchPromises);
        results.push(...batchResults);
      }

      // Deduct total balance
      await client.deductBalance(totalPrice);

      // Count successes and failures
      const successful = results.filter(r => r.status === 'SENT').length;
      const failed = results.filter(r => r.status === 'FAILED').length;

      this.logger.info('Bulk SMS completed', {
        clientId: client._id,
        total: messages.length,
        successful,
        failed,
        totalPrice,
      });

      return res.status(200).json({
        success: true,
        data: {
          total: messages.length,
          successful,
          failed,
          totalPrice,
          currency: client.currency,
          remainingBalance: client.balance,
          results,
        },
      });
    } catch (error) {
      this.logger.error('Failed to send bulk SMS', {
        error: error.message,
        clientId: req.client?._id,
      });

      return res.status(500).json({
        success: false,
        error: 'Failed to send bulk SMS',
        details: process.env.NODE_ENV === 'development' ? error.message : undefined,
      });
    }
  }

  /**
   * Check SMS status
   */
  async checkSmsStatus(req, res) {
    try {
      const { messageId } = req.params;
      const client = req.client;

      const smsMessage = await SmsMessage.findOne({
        _id: messageId,
        clientId: client._id,
      });

      if (!smsMessage) {
        return res.status(404).json({
          success: false,
          error: 'Message not found',
        });
      }

      // Check delivery status with provider if needed
      let deliveryStatus = { status: smsMessage.status };
      if (smsMessage.status === 'SENT' && smsMessage.providerMessageId) {
        deliveryStatus = await SmsProviderService.checkDeliveryStatus(
          smsMessage.provider,
          smsMessage.providerMessageId
        );
        
        // Update local status if changed
        if (deliveryStatus.status !== smsMessage.status) {
          smsMessage.status = deliveryStatus.status;
          smsMessage.statusUpdatedAt = new Date();
          if (deliveryStatus.status === 'DELIVERED') {
            smsMessage.deliveredAt = new Date();
          }
          await smsMessage.save();
        }
      }

      return res.status(200).json({
        success: true,
        data: {
          messageId: smsMessage._id,
          to: smsMessage.formattedTo,
          message: smsMessage.message,
          messageType: smsMessage.messageType,
          provider: smsMessage.provider,
          providerMessageId: smsMessage.providerMessageId,
          status: smsMessage.status,
          price: smsMessage.price,
          currency: smsMessage.currency,
          createdAt: smsMessage.createdAt,
          sentAt: smsMessage.sentAt,
          deliveredAt: smsMessage.deliveredAt,
          deliveryReport: smsMessage.deliveryReport,
          deliveryStatus,
        },
      });
    } catch (error) {
      this.logger.error('Failed to check SMS status', {
        error: error.message,
        messageId: req.params.messageId,
      });

      return res.status(500).json({
        success: false,
        error: 'Failed to check SMS status',
      });
    }
  }

  /**
   * Get SMS statistics
   */
  async getSmsStatistics(req, res) {
    try {
      const client = req.client;
      const { startDate, endDate } = req.query;

      const filter = { clientId: client._id };
      
      if (startDate || endDate) {
        filter.createdAt = {};
        if (startDate) filter.createdAt.$gte = new Date(startDate);
        if (endDate) filter.createdAt.$lte = new Date(endDate);
      }

      // Get counts by status
      const statusCounts = await SmsMessage.aggregate([
        { $match: filter },
        { $group: { _id: '$status', count: { $sum: 1 } } },
      ]);

      // Get counts by message type
      const typeCounts = await SmsMessage.aggregate([
        { $match: filter },
        { $group: { _id: '$messageType', count: { $sum: 1 } } },
      ]);

      // Get counts by provider
      const providerCounts = await SmsMessage.aggregate([
        { $match: filter },
        { $group: { _id: '$provider', count: { $sum: 1 } } },
      ]);

      // Get total cost
      const costResult = await SmsMessage.aggregate([
        { $match: filter },
        { $group: { _id: null, totalCost: { $sum: '$price' } } },
      ]);

      // Get daily counts for last 30 days
      const thirtyDaysAgo = new Date();
      thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

      const dailyCounts = await SmsMessage.aggregate([
        {
          $match: {
            ...filter,
            createdAt: { $gte: thirtyDaysAgo },
          },
        },
        {
          $group: {
            _id: {
              $dateToString: { format: '%Y-%m-%d', date: '$createdAt' },
            },
            count: { $sum: 1 },
            cost: { $sum: '$price' },
          },
        },
        { $sort: { _id: 1 } },
      ]);

      const statistics = {
        total: statusCounts.reduce((sum, item) => sum + item.count, 0),
        byStatus: statusCounts.reduce((obj, item) => {
          obj[item._id] = item.count;
          return obj;
        }, {}),
        byType: typeCounts.reduce((obj, item) => {
          obj[item._id] = item.count;
          return obj;
        }, {}),
        byProvider: providerCounts.reduce((obj, item) => {
          obj[item._id] = item.count;
          return obj;
        }, {}),
        totalCost: costResult[0]?.totalCost || 0,
        currency: client.currency,
        dailyCounts,
      };

      return res.status(200).json({
        success: true,
        data: statistics,
      });
    } catch (error) {
      this.logger.error('Failed to get SMS statistics', {
        error: error.message,
        clientId: req.client?._id,
      });

      return res.status(500).json({
        success: false,
        error: 'Failed to get statistics',
      });
    }
  }

  /**
   * Trigger webhook for event
   */
  async triggerWebhook(client, data) {
    if (!client.webhookUrl) return;

    try {
      const payload = {
        event: 'sms.sent',
        timestamp: new Date().toISOString(),
        data,
      };

      // Sign payload if webhook secret is configured
      let headers = {
        'Content-Type': 'application/json',
        'User-Agent': 'VietSMS-API/1.0',
      };

      if (client.webhookSecret) {
        const crypto = require('crypto');
        const signature = crypto
          .createHmac('sha256', client.webhookSecret)
          .update(JSON.stringify(payload))
          .digest('hex');
        
        headers['X-VietSMS-Signature'] = signature;
      }

      const axios = require('axios');
      await axios.post(client.webhookUrl, payload, {
        headers,
        timeout: 5000,
      });

      this.logger.debug('Webhook triggered successfully', {
        clientId: client._id,
        event: 'sms.sent',
      });
    } catch (error) {
      this.logger.error('Webhook trigger failed', {
        clientId: client._id,
        error: error.message,
      });
      // Don't throw - webhook failures shouldn't affect main operation
    }
  }
}

module.exports = new SmsController();