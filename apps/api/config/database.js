const mongoose = require('mongoose');
const redis = require('redis');

class Database {
  constructor() {
    this.mongoConnected = false;
    this.redisConnected = false;
    this.redisClient = null;
  }

  async connectMongo() {
    try {
      await mongoose.connect(process.env.MONGODB_URI, {
        useNewUrlParser: true,
        useUnifiedTopology: true,
      });
      this.mongoConnected = true;
      console.log('✅ MongoDB connected successfully');
    } catch (error) {
      console.error('❌ MongoDB connection error:', error);
      throw error;
    }
  }

  async connectRedis() {
    try {
      this.redisClient = redis.createClient({
        url: process.env.REDIS_URL,
      });

      this.redisClient.on('error', (err) => {
        console.error('❌ Redis error:', err);
      });

      await this.redisClient.connect();
      this.redisConnected = true;
      console.log('✅ Redis connected successfully');
    } catch (error) {
      console.error('❌ Redis connection error:', error);
      throw error;
    }
  }

  async disconnect() {
    try {
      if (this.mongoConnected) {
        await mongoose.disconnect();
        console.log('✅ MongoDB disconnected');
      }
      if (this.redisConnected && this.redisClient) {
        await this.redisClient.quit();
        console.log('✅ Redis disconnected');
      }
    } catch (error) {
      console.error('❌ Error disconnecting databases:', error);
    }
  }

  getRedisClient() {
    if (!this.redisConnected) {
      throw new Error('Redis not connected');
    }
    return this.redisClient;
  }
}

module.exports = new Database();