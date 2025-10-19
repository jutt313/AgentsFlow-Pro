# AgentFlow PRO

**Stop building AI tools. Start hiring AI employees.**

AgentFlow PRO is a revolutionary platform that transforms businesses by providing complete AI workforces. Users describe their business needs in plain English, and the platform automatically builds, deploys, and manages teams of AI agents that work together like human employees.

## 🚀 Features

- **Designer Agent**: Business consultant that understands your needs and designs AI workflows
- **Builder Agent**: AI engineer that builds and deploys your AI workforce  
- **Health Monitor Agent**: Guardian that ensures 99.9% uptime with auto-healing
- **Complete Automation**: End-to-end business operation automation
- **50+ Integrations**: Connect to e-commerce, marketing, communication platforms
- **Enterprise Security**: GDPR, SOC2, HIPAA compliance

## 🛠️ Tech Stack

- **Frontend**: Next.js 14, React, TypeScript, Tailwind CSS
- **Backend**: Node.js, Express.js, TypeScript
- **Database**: PostgreSQL with Prisma ORM
- **AI**: DeepSeek R1 v3, LangChain, LangGraph
- **Message Queue**: Redis with BullMQ
- **Deployment**: Docker (Docker-in-Docker)
- **Monitoring**: OpenTelemetry

## 📋 Prerequisites

- Node.js 20+
- Docker & Docker Compose
- PostgreSQL 15+
- Redis 7+

## 🚀 Getting Started

### 1. Clone the repository

```bash
cd "/Users/chaffanjutt/Downloads/dev/AgentFlow PRO"
```

### 2. Install dependencies

```bash
npm install
```

### 3. Setup environment variables

Copy `env.example` to `.env` and update the values:

```bash
cp env.example .env
```

Update the following variables in `.env`:
- `DATABASE_URL`: PostgreSQL connection string
- `REDIS_HOST` and `REDIS_PORT`: Redis connection details
- `JWT_SECRET` and `JWT_REFRESH_SECRET`: Strong secret keys
- `DEEPSEEK_API_KEY`: Your DeepSeek API key

### 4. Start Docker services

```bash
docker-compose up -d
```

This will start:
- PostgreSQL database
- Redis server
- Application server

### 5. Setup database

```bash
# Generate Prisma client
npm run prisma:generate

# Run migrations
npm run prisma:migrate

# Seed database (optional)
npm run prisma:seed
```

### 6. Start development server

```bash
npm run dev
```

The application will be available at `http://localhost:3000`

## 📁 Project Structure

```
/
├── app/                    # Next.js app directory
│   ├── api/               # API routes
│   │   ├── auth/         # Authentication endpoints
│   │   ├── workflows/    # Workflow management
│   │   ├── agents/       # Agent communication
│   │   └── monitoring/   # Monitoring endpoints
│   ├── layout.tsx        # Root layout
│   ├── page.tsx          # Home page
│   └── globals.css       # Global styles
├── lib/                   # Shared libraries
│   ├── auth.ts           # Authentication utilities
│   ├── prisma.ts         # Prisma client
│   ├── redis.ts          # Redis client
│   ├── queue.ts          # BullMQ queue setup
│   └── queue-handlers/   # Queue job handlers
│       ├── designer-handler.ts
│       ├── builder-handler.ts
│       └── monitor-handler.ts
├── prisma/                # Database schema and migrations
│   ├── schema.prisma     # Prisma schema
│   ├── migrations/       # Database migrations
│   └── seed.ts           # Seed data
├── docker-compose.yml     # Docker services
├── Dockerfile            # Application container
├── package.json          # Dependencies
└── tsconfig.json         # TypeScript config
```

## 🔧 Available Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm start` - Start production server
- `npm run lint` - Run ESLint
- `npm test` - Run tests
- `npm run prisma:generate` - Generate Prisma client
- `npm run prisma:migrate` - Run database migrations
- `npm run prisma:studio` - Open Prisma Studio
- `npm run prisma:seed` - Seed database

## 📡 API Endpoints

### Authentication
- `POST /api/auth/register` - Register new user
- `POST /api/auth/login` - Login user
- `POST /api/auth/logout` - Logout user
- `POST /api/auth/refresh` - Refresh access token

### Workflows
- `GET /api/workflows` - List user's workflows
- `POST /api/workflows` - Create new workflow
- `GET /api/workflows/:id` - Get workflow details
- `PUT /api/workflows/:id` - Update workflow
- `DELETE /api/workflows/:id` - Delete workflow

### Agents
- `POST /api/agents/designer/chat` - Chat with Designer Agent
- `POST /api/agents/builder/deploy` - Deploy workflow with Builder Agent
- `GET /api/agents/monitor/health` - Get health status
- `POST /api/agents/monitor/heal` - Trigger auto-healing

### Monitoring
- `GET /api/monitoring/workflows` - Get workflow status overview
- `GET /api/monitoring/agents/:id` - Get agent-specific monitoring
- `GET /api/monitoring/logs/:id` - Get agent logs
- `GET /api/monitoring/metrics/:id` - Get performance metrics

## 🧪 Testing

```bash
# Run all tests
npm test

# Run tests in watch mode
npm run test:watch

# Run tests with coverage
npm run test:coverage
```

## 🚀 Deployment

### Production Build

```bash
npm run build
npm start
```

### Docker Deployment

```bash
docker-compose -f docker-compose.yml up -d
```

## 📊 Phase 1 Status

✅ **Completed**:
- Project setup with Next.js 14 + TypeScript
- Database schema design (12 tables)
- JWT authentication system
- REST API endpoints for workflows
- Redis + BullMQ message queue system
- Queue handlers for all agents
- Docker-in-Docker configuration
- Environment configuration

🚧 **Next Steps** (Phase 2):
- Designer Agent AI integration (DeepSeek R1 v3)
- Builder Agent deployment system
- AgentFlowProToolkit development
- Container orchestration

## 🤝 Contributing

This is a private project. Contact the team for contribution guidelines.

## 📄 License

Proprietary - All Rights Reserved

## 📞 Support

For support, please contact: [Your Contact Information]

---

**AgentFlow PRO - The Future of Business Automation** 🚀

