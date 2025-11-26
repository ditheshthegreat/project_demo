# 🌟 INKLUSIO Backend

[![TypeScript](https://img.shields.io/badge/TypeScript-5.4-blue.svg)](https://www.typescriptlang.org/)
[![Node.js](https://img.shields.io/badge/Node.js-20.x-green.svg)](https://nodejs.org/)
[![Express](https://img.shields.io/badge/Express-4.19-lightgrey.svg)](https://expressjs.com/)
[![Prisma](https://img.shields.io/badge/Prisma-5.7-2D3748.svg)](https://www.prisma.io/)
[![PostgreSQL](https://img.shields.io/badge/PostgreSQL-15-336791.svg)](https://www.postgresql.org/)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](./LICENSE)

> **Inclusive social platform backend** - Connecting people through accessibility, empathy, and technology.

INKLUSIO is a social platform designed to connect individuals with disabilities and accessibility needs with others who share similar interests, hobbies, and goals. Built with Clean Architecture principles and modern TypeScript patterns.

---

## 📑 Table of Contents

- [Features](#-features)
- [Tech Stack](#-tech-stack)
- [Project Structure](#-project-structure)
- [Getting Started](#-getting-started)
- [Development](#-development)
- [Testing](#-testing)
- [API Documentation](#-api-documentation)
- [Environment Variables](#-environment-variables)
- [Scripts](#-scripts)
- [Architecture](#-architecture)
- [Contributing](#-contributing)
- [License](#-license)

---

## ✨ Features

### Core Functionality
- 🔐 **Firebase Authentication** - Secure user authentication with Firebase Admin SDK
- 👤 **User Management** - Complete user profile and account management
- 🚀 **Onboarding System** - 6-step guided onboarding process for new users
- ♿ **Accessibility First** - Built-in accessibility requirements and tools management
- 🎯 **Interest Matching** - Connect users based on shared interests and hobbies
- 💬 **Chat System** - Real-time messaging (coming soon)
- 🤝 **Donations** - Support and donation features (coming soon)

### Technical Features
- ✅ **Clean Architecture** - Layered architecture with clear separation of concerns
- 📦 **Monorepo Structure** - Yarn Workspaces for efficient package management
- 🔄 **Type Safety** - End-to-end TypeScript with strict typing
- 📊 **Database ORM** - Prisma for type-safe database access
- 📝 **API Documentation** - Auto-generated Swagger/OpenAPI documentation
- 🧪 **Comprehensive Testing** - Unit, integration, and live tests with Jest
- 🔒 **Security** - Helmet.js, CORS, input validation with Zod
- 🐳 **Docker Ready** - Docker Compose for local development

---

## 🛠 Tech Stack

### Core Technologies
| Technology | Purpose |
|-----------|---------|
| **Node.js 20.x** | JavaScript runtime |
| **TypeScript 5.4** | Type-safe development |
| **Express 4.19** | Web framework |
| **Prisma 5.7** | Database ORM |
| **PostgreSQL 15** | Primary database |
| **Firebase Admin** | Authentication & user management |
| **Zod 3.23** | Schema validation |

### Development Tools
| Tool | Purpose |
|------|---------|
| **Jest 29** | Testing framework |
| **Supertest** | HTTP testing |
| **Swagger** | API documentation |
| **ESLint** | Code linting |
| **Nodemon** | Development auto-reload |
| **Docker** | Containerization |

---

## 📁 Project Structure

```
inklusio/
├── packages/
│   ├── api/                    # Main API server
│   │   ├── src/
│   │   │   ├── app/           # Application entry point
│   │   │   ├── modules/       # Feature modules
│   │   │   │   ├── auth/      # Authentication module
│   │   │   │   ├── onboarding/# Onboarding module
│   │   │   │   ├── chat/      # Chat module (coming soon)
│   │   │   │   └── donations/ # Donations module (coming soon)
│   │   │   └── shared/        # Shared utilities
│   │   │       ├── middleware/# Express middleware
│   │   │       ├── infra/     # Infrastructure (Prisma, Firebase)
│   │   │       └── utils/     # Utility functions
│   │   ├── tests/             # Global test setup
│   │   └── package.json
│   └── prisma/                # Database schema & migrations
│       ├── schema.prisma      # Prisma schema
│       └── migrations/        # Database migrations
├── .env.example               # Example environment variables
├── .env.test                  # Test environment variables
├── docker-compose.yml         # Docker services
├── package.json               # Root package.json
└── README.md                  # This file
```

### Module Structure (Clean Architecture)

Each module follows Clean Architecture principles:

```
module/
├── domain/                 # Business entities & logic
│   ├── entities/          # Domain models
│   └── constants/         # Business constants
├── application/           # Use cases
│   └── usecases/         # Business operations
├── infrastructure/        # External concerns
│   └── repositories/     # Data access layer
└── interfaces/            # External interfaces
    ├── controllers/      # HTTP controllers
    ├── routes/           # Express routes
    └── dto/              # Data transfer objects
```

---

## 🚀 Getting Started

### Prerequisites

- **Node.js** 20.x or higher
- **Yarn** 1.22 or higher
- **PostgreSQL** 15 or higher
- **Firebase Project** with Admin SDK credentials

### Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/yourusername/inklusio.git
   cd inklusio
   ```

2. **Install dependencies**
   ```bash
   yarn install
   ```

3. **Set up environment variables**
   ```bash
   cp .env.example .env
   ```
   
   Edit `.env` and add your configuration:
   ```env
   DATABASE_URL="postgresql://user:password@localhost:5432/inklusio"
   FIREBASE_PROJECT_ID="your-project-id"
   FIREBASE_CLIENT_EMAIL="your-client-email"
   FIREBASE_PRIVATE_KEY="your-private-key"
   ```

4. **Start PostgreSQL** (using Docker)
   ```bash
   docker-compose up -d postgres
   ```

5. **Run database migrations**
   ```bash
   yarn db:migrate
   ```

6. **Generate Prisma Client**
   ```bash
   yarn db:generate
   ```

7. **Start development server**
   ```bash
   yarn dev
   ```

8. **Access the API**
   - API: http://localhost:3000/api
   - Swagger Docs: http://localhost:3000/api/docs

---

## 💻 Development

### Running the API Server

```bash
# Development mode with hot reload
yarn dev

# Production mode
yarn build
yarn start
```

### Database Operations

```bash
# Generate Prisma Client
yarn db:generate

# Create and apply migration
yarn db:migrate

# Open Prisma Studio (GUI)
yarn db:studio

# Reset database
yarn workspace @inklusio/api db:reset
```

### Code Quality

```bash
# Lint code
yarn lint

# Type check
yarn workspace @inklusio/api tsc --noEmit
```

---

## 🧪 Testing

### Test Commands

```bash
# Run all tests
yarn test

# Run tests with coverage
yarn test:coverage

# Run tests in watch mode
yarn workspace @inklusio/api test:watch

# Run live integration tests (requires running server)
yarn workspace @inklusio/api test:live
```

### Test Structure

```
__tests__/
├── integration/        # Integration tests
├── unit/              # Unit tests
└── onboarding-live.test.ts  # Live end-to-end tests
```

### Live Integration Tests

Live tests use **real Firebase authentication** and **real HTTP requests**:

1. **Start the API server**
   ```bash
   yarn dev
   ```

2. **In another terminal, run live tests**
   ```bash
   yarn workspace @inklusio/api test:live
   ```

Configuration required in `.env.test`:
```env
LIVE_TEST=true
TEST_USER_EMAIL=test@example.com
TEST_USER_PASSWORD=TestPassword123
FIREBASE_WEB_API_KEY=your-web-api-key
FIREBASE_AUTH_DOMAIN=your-project.firebaseapp.com
```

---

## 📚 API Documentation

### Swagger Documentation

Interactive API documentation is available at:

**http://localhost:3000/api/docs**

### Available Endpoints

#### Authentication
- `POST /api/auth/register` - Register new user
- `POST /api/auth/login` - Login user
- `POST /api/auth/logout` - Logout user
- `GET /api/auth/profile` - Get user profile

#### Onboarding
- `GET /api/onboarding/status` - Get onboarding status
- `POST /api/onboarding/step1` - Complete step 1 (Basic info)
- `POST /api/onboarding/step2` - Complete step 2 (Location)
- `POST /api/onboarding/step3` - Complete step 3 (Interests)
- `POST /api/onboarding/step4` - Complete step 4 (Hobbies)
- `POST /api/onboarding/step5/requirements` - Complete step 5.1 (Accessibility requirements)
- `POST /api/onboarding/step5/tools` - Complete step 5.2 (Accessibility tools)
- `POST /api/onboarding/step5/looking-for` - Complete step 5.3 (Looking for)
- `POST /api/onboarding/step5/communication` - Complete step 5.4 (Communication preferences)
- `POST /api/onboarding/step6` - Complete step 6 (Privacy settings)
- `POST /api/onboarding/complete` - Mark onboarding as complete

### Authentication

All protected endpoints require a Firebase ID token in the Authorization header:

```bash
Authorization: Bearer <firebase-id-token>
```

---

## 🔐 Environment Variables

### Required Variables

| Variable | Description | Example |
|----------|-------------|---------|
| `DATABASE_URL` | PostgreSQL connection string | `postgresql://user:pass@localhost:5432/inklusio` |
| `FIREBASE_PROJECT_ID` | Firebase project ID | `your-project-id` |
| `FIREBASE_CLIENT_EMAIL` | Firebase service account email | `firebase-adminsdk@your-project.iam.gserviceaccount.com` |
| `FIREBASE_PRIVATE_KEY` | Firebase private key | `-----BEGIN PRIVATE KEY-----\n...` |
| `PORT` | API server port | `3000` |
| `NODE_ENV` | Environment mode | `development` / `production` |

### Test Variables (`.env.test`)

| Variable | Description |
|----------|-------------|
| `LIVE_TEST` | Enable live integration tests | `true` / `false` |
| `TEST_USER_EMAIL` | Test user email for live tests |
| `TEST_USER_PASSWORD` | Test user password |
| `FIREBASE_WEB_API_KEY` | Firebase web API key |
| `FIREBASE_AUTH_DOMAIN` | Firebase auth domain |
| `API_URL` | API base URL for tests |

---

## 📜 Scripts

### Root Level Scripts

```bash
yarn dev              # Start development server
yarn build            # Build all packages
yarn test             # Run all tests
yarn test:coverage    # Run tests with coverage
yarn db:migrate       # Run database migrations
yarn db:generate      # Generate Prisma Client
yarn db:studio        # Open Prisma Studio
yarn clean            # Clean build artifacts
yarn lint             # Lint code
```

### Package-Specific Scripts

```bash
# API package
yarn workspace @inklusio/api dev
yarn workspace @inklusio/api test
yarn workspace @inklusio/api test:live
yarn workspace @inklusio/api db:migrate
```

---

## 🏗 Architecture

### Clean Architecture Layers

```
┌─────────────────────────────────────────┐
│         Interfaces Layer                │
│  (Controllers, Routes, DTOs)            │
├─────────────────────────────────────────┤
│         Application Layer               │
│  (Use Cases, Business Logic)            │
├─────────────────────────────────────────┤
│         Domain Layer                    │
│  (Entities, Constants, Rules)           │
├─────────────────────────────────────────┤
│         Infrastructure Layer            │
│  (Repositories, External Services)      │
└─────────────────────────────────────────┘
```

### Key Principles

1. **Dependency Rule** - Dependencies point inward (toward domain)
2. **Separation of Concerns** - Each layer has a specific responsibility
3. **Testability** - Business logic isolated from frameworks
4. **Flexibility** - Easy to swap implementations

### Design Patterns

- **Repository Pattern** - Data access abstraction
- **Dependency Injection** - Loose coupling
- **DTO Pattern** - Data transfer and validation
- **Middleware Pattern** - Request processing pipeline

---

## 🤝 Contributing

We welcome contributions! Please follow these steps:

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

### Coding Standards

- Follow TypeScript best practices
- Write tests for new features
- Update documentation
- Follow Clean Architecture principles
- Use meaningful commit messages

---

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

---

## 👥 Team

**INKLUSIO Team** - Building inclusive technology for everyone

---

## 🙏 Acknowledgments

- Firebase for authentication infrastructure
- Prisma for amazing database tooling
- The open-source community

---

## 📞 Support

For support, email support@inklusio.com or open an issue on GitHub.

---

<div align="center">

**[⬆ back to top](#-inklusio-backend)**

Made with ❤️ by the INKLUSIO Team

</div>
