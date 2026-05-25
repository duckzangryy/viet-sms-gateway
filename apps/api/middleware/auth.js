const jwt = require('jsonwebtoken');
const Client = require('../models/Client');
const database = require('../config/database');
const winston = require('winston');

class AuthMiddleware {
  constructor() {
    this.logger = winston.createLogger({
      level: process.env.LOG_LEVEL || 'info',
      format: winston.format.combine(
        winston.format.timestamp(),
        winston.format.json()
      ),
      transports: [
        new winston.transports.File({ filename: 'logs/auth.log' }),
        new winston.transports.Console(),
      ],
    });
  }

  /**
   * Authenticate using API key (for machine-to-machine)
   */
  async authenticateApiKey(req, res, next) {
    try {
      const apiKey = this.extractApiKey(req);
      
      if (!apiKey) {
        return res.status(401).json({
          success: false,
          error: 'API key required',
        });
      }

      // Check Redis cache first
      const redisClient = database.getRedisClient();
      const cachedClient = await redisClient.get(`client:${apiKey}`);
      
      let client;
      if (cachedClient) {
        client = JSON.parse(cachedClient);
      } else {
        // Fetch from database
        client = await Client.findOne({ 
          apiKey,
          status: 'ACTIVE',
        }).select('-password -apiSecret -verificationToken -resetPasswordToken');
        
        if (!client) {
          return res.status(401).json({
            success: false,
            error: 'Invalid API key',
          });
        }

        // Cache client data for 5 minutes
        await redisClient.setEx(
          `client:${apiKey}`,
          300,
          JSON.stringify(client.toObject())
        );
      }

      // Check if account is locked
      if (client.accountLockedUntil && new Date(client.accountLockedUntil) > new Date()) {
        return res.status(423).json({
          success: false,
          error: 'Account temporarily locked',
          lockedUntil: client.accountLockedUntil,
        });
      }

      // Attach client to request
      req.client = client;

      // Rate limiting check
      await this.checkRateLimit(req, client);

      next();
    } catch (error) {
      this.logger.error('API key authentication failed', {
        error: error.message,
        ip: req.ip,
      });

      return res.status(500).json({
        success: false,
        error: 'Authentication error',
      });
    }
  }

  /**
   * Authenticate using JWT (for user dashboard)
   */
  async authenticateJwt(req, res, next) {
    try {
      const token = this.extractJwtToken(req);
      
      if (!token) {
        return res.status(401).json({
          success: false,
          error: 'Authentication token required',
        });
      }

      // Verify JWT
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      
      // Fetch client
      const client = await Client.findById(decoded.clientId).select('-password -apiSecret');
      
      if (!client || client.status !== 'ACTIVE') {
        return res.status(401).json({
          success: false,
          error: 'Invalid token or inactive account',
        });
      }

      // Check if account is locked
      if (client.accountLockedUntil && new Date(client.accountLockedUntil) > new Date()) {
        return res.status(423).json({
          success: false,
          error: 'Account temporarily locked',
          lockedUntil: client.accountLockedUntil,
        });
      }

      // Attach client to request
      req.client = client;
      req.user = decoded; // JWT payload

      next();
    } catch (error) {
      if (error.name === 'JsonWebTokenError') {
        return res.status(401).json({
          success: false,
          error: 'Invalid token',
        });
      }
      
      if (error.name === 'TokenExpiredError') {
        return res.status(401).json({
          success: false,
          error: 'Token expired',
        });
      }

      this.logger.error('JWT authentication failed', {
        error: error.message,
        ip: req.ip,
      });

      return res.status(500).json({
        success: false,
        error: 'Authentication error',
      });
    }
  }

  /**
   * Extract API key from request
   */
  extractApiKey(req) {
    // Check Authorization header
    const authHeader = req.headers.authorization;
    if (authHeader && authHeader.startsWith('Bearer ')) {
      return authHeader.substring(7);
    }

    // Check query parameter
    if (req.query.api_key) {
      return req.query.api_key;
    }

    // Check body (for POST requests)
    if (req.body && req.body.api_key) {
      return req.body.api_key;
    }

    return null;
  }

  /**
   * Extract JWT token from request
   */
  extractJwtToken(req) {
    // Check Authorization header
    const authHeader = req.headers.authorization;
    if (authHeader && authHeader.startsWith('Bearer ')) {
      return authHeader.substring(7);
    }

    // Check cookies
    if (req.cookies && req.cookies.token) {
      return req.cookies.token;
    }

    return null;
  }

  /**
   * Rate limiting based on client configuration
   */
  async checkRateLimit(req, client) {
    const redisClient = database.getRedisClient();
    const key = `rate_limit:${client.apiKey}:${Math.floor(Date.now() / 1000)}`;
    
    // Increment counter
    const current = await redisClient.incr(key);
    
    // Set expiry if this is the first request in this second
    if (current === 1) {
      await redisClient.expire(key, 1);
    }
    
    // Check if rate limit exceeded
    if (current > client.rateLimit) {
      throw new Error('Rate limit exceeded');
    }
  }

  /**
   * Generate JWT token for client
   */
  generateToken(client) {
    const payload = {
      clientId: client._id,
      email: client.email,
      name: client.name,
    };

    return jwt.sign(payload, process.env.JWT_SECRET, {
      expiresIn: process.env.JWT_EXPIRES_IN || '24h',
    });
  }

  /**
   * Validate phone number ownership (for sensitive operations)
   */
  async validatePhoneOwnership(req, res, next) {
    try {
      const { phone } = req.body;
      const client = req.client;

      if (!phone) {
        return next(); // No phone to validate
      }

      // Verify that the phone belongs to the client
      if (client.phone !== phone) {
        return res.status(403).json({
          success: false,
          error: 'Phone number does not belong to your account',
        });
      }

      next();
    } catch (error) {
      this.logger.error('Phone ownership validation failed', {
        error: error.message,
        clientId: req.client?._id,
      });

      return res.status(500).json({
        success: false,
        error: 'Validation error',
      });
    }
  }

  /**
   * Check if client has required role/permission
   */
  requirePermission(permission) {
    return (req, res, next) => {
      // For now, all active clients have same permissions
      // In future, could implement role-based permissions
      if (req.client.status !== 'ACTIVE') {
        return res.status(403).json({
          success: false,
          error: 'Account not active',
        });
      }

      // Check specific permissions if implemented
      // const hasPermission = req.client.permissions.includes(permission);
      // if (!hasPermission) {
      //   return res.status(403).json({
      //     success: false,
      //     error: 'Insufficient permissions',
      //   });
      // }

      next();
    };
  }

  /**
   * Log request for audit purposes
   */
  auditLog(req, res, next) {
    const startTime = Date.now();
    
    // Log after response is sent
    res.on('finish', () => {
      const duration = Date.now() - startTime;
      
      this.logger.info('API Request', {
        method: req.method,
        url: req.originalUrl,
        clientId: req.client?._id,
        statusCode: res.statusCode,
        duration,
        ip: req.ip,
        userAgent: req.get('User-Agent'),
        timestamp: new Date().toISOString(),
      });
    });

    next();
  }

  /**
   * Validate API request signature
   */
  async validateSignature(req, res, next) {
    // This would be used for webhook verification or signed API requests
    // For now, it's a placeholder for future implementation
    
    const signature = req.headers['x-api-signature'];
    if (!signature) {
      return next(); // No signature required for now
    }

    // Future implementation would:
    // 1. Get client's API secret
    // 2. Generate expected signature from request body
    // 3. Compare with provided signature
    // 4. Reject if mismatch

    next();
  }
}

module.exports = new AuthMiddleware();