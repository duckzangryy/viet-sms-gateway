<img width="1920" height="959" alt="image" src="https://github.com/user-attachments/assets/705a6f05-1558-4453-9065-b9d3d279300a" />
Vietnamese SMS/OTP API Monorepo

A high-performance SMS gateway API service specifically designed for the Vietnamese market, built as a modern monorepo with separate backend API and frontend dashboard.

## 🏗️ Project Structure

```
viet-sms-api/
├── apps/
│   ├── api/              # Backend Node.js API
│   │   ├── config/       # Configuration files
│   │   ├── controllers/  # Business logic
│   │   ├── middleware/   # Authentication, validation
│   │   ├── models/       # Database models
│   │   ├── routes/       # API routes
│   │   ├── services/     # External service integrations
│   │   ├── tests/        # API tests
│   │   └── index.js      # Application entry point
│   │
│   └── web/              # Frontend Next.js Dashboard
│       ├── app/          # Next.js app router
│       ├── components/   # React components
│       ├── hooks/        # Custom React hooks
│       ├── lib/          # Utility libraries
│       ├── public/       # Static assets
│       └── package.json  # Frontend dependencies
│
├── packages/
│   └── shared/           # Shared types and utilities
│       ├── src/          # TypeScript source
│       └── dist/         # Compiled output
│
├── docs/                 # Documentation
├── scripts/              # Deployment and utility scripts
├── docker/               # Docker configurations
├── .github/              # CI/CD workflows
├── .gitignore           # Git ignore rules
├── package.json         # Root package.json (monorepo)
└── docker-compose.yml   # Docker Compose configuration
```

## 🚀 Features

### Backend API
- **High Deliverability**: Optimized for Vietnamese telecom networks (Viettel, Mobifone, Vinaphone)
- **Multiple Providers**: Automatic failover between providers
- **Real-time Delivery Reports**: Track SMS status in real-time
- **Bulk SMS Support**: Send up to 1000 messages in one request
- **Webhook Support**: Receive delivery notifications via webhooks
- **Rate Limiting**: Configurable rate limits per client
- **Payment Integration**: Stripe and Momo payment gateways

### Frontend Dashboard
- **Client Management**: Register, manage, and monitor clients
- **SMS Analytics**: Real-time statistics and delivery reports
- **Payment Processing**: Deposit funds and view transaction history
- **API Key Management**: Generate and rotate API keys
- **Usage Monitoring**: Track SMS usage and costs

## 🛠️ Tech Stack

### Backend
- **Runtime**: Node.js 18+
- **Framework**: Express.js
- **Database**: MongoDB, Redis
- **Authentication**: JWT, API Key
- **Payment**: Stripe, Momo API
- **SMS Providers**: Viettel, Mobifone, Vinaphone, Twilio (fallback)
- **Monitoring**: Winston logging, Rate limiting

### Frontend
- **Framework**: Next.js 14 (App Router)
- **UI Library**: React 19
- **Styling**: Tailwind CSS
- **Animations**: Framer Motion
- **Icons**: Lucide React
- **Type Safety**: TypeScript

### Infrastructure
- **Containerization**: Docker, Docker Compose
- **Process Management**: PM2
- **CI/CD**: GitHub Actions
- **Package Management**: npm Workspaces

## 🚀 Quick Start

### Prerequisites

- Node.js 18+
- MongoDB 6+
- Redis 7+
- Docker & Docker Compose (optional)

### Installation

1. **Clone the repository**
```bash
git clone https://github.com/yourusername/viet-sms-api.git
cd viet-sms-api
```

2. **Install dependencies**
```bash
npm install
```

3. **Configure environment variables**
```bash
cp .env.example .env
# Edit .env with your configuration
```

4. **Start development servers**
```bash
# Start both backend and frontend
npm run dev

# Or start individually
npm run dev:api    # Backend API on http://localhost:3000
npm run dev:web    # Frontend on http://localhost:3001
```

5. **Access the applications**
- API: http://localhost:3000
- Dashboard: http://localhost:3001
- Health check: http://localhost:3000/health
- API Docs: http://localhost:3000/api-docs

## 📦 Monorepo Commands

### Development
```bash
# Start all services
npm run dev

# Start backend only
npm run dev:api

# Start frontend only
npm run dev:web

# Build shared package
npm run build:shared
```

### Building
```bash
# Build all packages
npm run build

# Build specific package
npm run build:api
npm run build:web
```

### Testing
```bash
# Run all tests
npm run test

# Run API tests only
npm run test:api
```

### Linting
```bash
# Lint all packages
npm run lint

# Lint specific package
npm run lint:api
npm run lint:web
npm run lint:shared
```

### Production
```bash
# Start all services in production mode
npm run start

# Start specific service
npm run start:api
npm run start:web
```

## 🐳 Docker Deployment

### Using Docker Compose
```bash
# Build and start all services
npm run docker:up

# Stop all services
npm run docker:down

# Rebuild images
npm run docker:build
```

### Docker Compose Configuration
The project includes a multi-service Docker Compose setup:
- `api`: Backend API service
- `web`: Frontend dashboard
- `mongodb`: MongoDB database
- `redis`: Redis cache
- `nginx`: Reverse proxy (optional)

## 📚 API Documentation

### Authentication

#### Register New Client
```http
POST /api/v1/auth/register
Content-Type: application/json

{
  "name": "Your Name",
  "email": "your@email.com",
  "phone": "0912345678",
  "password": "SecurePass123"
}
```

#### Login
```http
POST /api/v1/auth/login
Content-Type: application/json

{
  "email": "your@email.com",
  "password": "SecurePass123"
}
```

#### API Key Authentication
```http
GET /api/v1/sms/providers
Authorization: Bearer YOUR_API_KEY
```

### SMS Endpoints

#### Send Single SMS
```http
POST /api/v1/sms/send
Authorization: Bearer YOUR_API_KEY
Content-Type: application/json

{
  "to": "0912345678",
  "message": "Your OTP code is 123456",
  "messageType": "OTP",
  "senderId": "YOURBRAND"
}
```

#### Send Bulk SMS
```http
POST /api/v1/sms/bulk
Authorization: Bearer YOUR_API_KEY
Content-Type: application/json

{
  "messages": [
    {
      "to": "0912345678",
      "message": "Special offer just for you!"
    },
    {
      "to": "0987654321",
      "message": "Your order has been shipped"
    }
  ],
  "messageType": "MARKETING"
}
```

## 🔧 Configuration

### Environment Variables

Create a `.env` file in the root directory:

```env
# Backend API
PORT=3000
NODE_ENV=development
MONGODB_URI=mongodb://localhost:27017/viet_sms_api
REDIS_URL=redis://localhost:6379
JWT_SECRET=your_jwt_secret_key_here

# SMS Providers
VIETTEL_API_KEY=your_viettel_api_key
MOBIFONE_API_KEY=your_mobifone_api_key
VINAPHONE_API_KEY=your_vinaphone_api_key
TWILIO_ACCOUNT_SID=your_twilio_sid
TWILIO_AUTH_TOKEN=your_twilio_token

# Payment Gateways
STRIPE_SECRET_KEY=your_stripe_secret_key
MOMO_ACCESS_KEY=your_momo_access_key
MOMO_SECRET_KEY=your_momo_secret_key

# Frontend
NEXT_PUBLIC_API_URL=http://localhost:3000
```

## 🧪 Testing

### Running Tests
```bash
# Run all tests
npm run test

# Run API tests with coverage
npm run test:api -- --coverage

# Run specific test file
npm run test:api -- tests/auth.test.js
```

### Test Structure
- **Unit Tests**: Test individual functions and modules
- **Integration Tests**: Test API endpoints and database interactions
- **E2E Tests**: Test complete user flows (coming soon)

## 📊 Monitoring & Logging

### Log Files
- `apps/api/logs/error.log` - Error logs
- `apps/api/logs/combined.log` - All logs
- `apps/api/logs/auth.log` - Authentication logs

### Health Checks
```bash
# Check API health
curl http://localhost:3000/health

# Check database connections
curl http://localhost:3000/health?deep=true
```

## 🔒 Security

### API Security
- Rate limiting per client
- IP whitelisting (optional)
- API key rotation
- JWT token expiration

### Data Protection
- Password hashing with bcrypt
- Sensitive data encryption
- Secure HTTP headers
- CORS configuration

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Commit your changes
4. Push to the branch
5. Create a Pull Request

### Development Guidelines
- Follow ESLint configuration
- Write tests for new features
- Update documentation
- Use conventional commits
- Maintain TypeScript types in shared package

## 📄 License

MIT License - see [LICENSE](LICENSE) file for details.

## 📞 Support

- **Email**: support@vietsmsapi.com
- **Documentation**: https://docs.vietsmsapi.com
- **Status Page**: https://status.vietsmsapi.com
- **Community**: Discord community

## 🚀 Deployment

### Production Deployment

1. **Set up infrastructure**
```bash
# Install PM2 for process management
npm install -g pm2

# Start API with PM2
pm2 start apps/api/index.js --name viet-sms-api

# Start frontend with PM2
pm2 start apps/web/.next/standalone/server.js --name viet-sms-web
```

2. **Configure reverse proxy (Nginx)**
```nginx
# API server
server {
    listen 80;
    server_name api.vietsmsapi.com;

    location / {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
    }
}

# Web dashboard
server {
    listen 80;
    server_name dashboard.vietsmsapi.com;

    location / {
        proxy_pass http://localhost:3001;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
    }
}
```

3. **Set up SSL with Let's Encrypt**
```bash
sudo certbot --nginx -d api.vietsmsapi.com -d dashboard.vietsmsapi.com
```

---

**Built with ❤️ for the Vietnamese market**
