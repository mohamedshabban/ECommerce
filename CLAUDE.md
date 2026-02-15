# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Build & Development Commands

### Backend (.NET 8 API)
```bash
# Navigate to API project
cd src/backend/ECommerce.API

dotnet build                    # Development build
dotnet run                      # Run locally (requires database)
dotnet build -c Release         # Release build
dotnet publish -c Release       # Publish for deployment
```

### Frontend (Angular 21)
```bash
# Navigate to frontend
cd src/frontend/ecommerce-web

npm install                     # Install dependencies
npm start                       # Dev server at localhost:4200
npm run build                   # Production build
npm test                        # Run tests (Vitest)
```

### Docker Development
```bash
# Start only databases (SQL Server, Elasticsearch, Kibana)
docker-compose -f docker-compose.dev.yml up -d

# Full production stack
docker-compose up -d --build
```

### Environment Setup
```bash
cp .env.example .env            # Create environment file, then edit with your values
```

## Architecture Overview

### Backend - Clean Architecture (4 layers)

```
src/backend/
├── ECommerce.Domain/           # Entities, enums, exceptions (no dependencies)
├── ECommerce.Application/      # DTOs, interfaces, services, validators
├── ECommerce.Infrastructure/   # DbContext, repositories, external services
└── ECommerce.API/              # Controllers, middleware, Program.cs
```

**Dependency flow**: Domain ← Application ← Infrastructure ← API

**Key patterns**:
- Repository pattern with generic base
- FluentValidation for input validation
- AutoMapper for DTO mappings
- JWT + OAuth (Google/Facebook) authentication
- Role-based authorization: Customer, Vendor, Admin

**External integrations**:
- SQL Server (EF Core 8)
- Elasticsearch 8.11 (NEST client) for product search
- PayPal for payments
- MailKit for email

### Frontend - Angular Standalone Components

```
src/frontend/ecommerce-web/src/app/
├── core/                       # Services, guards, interceptors, models
├── features/                   # Lazy-loaded modules (auth, products, cart, checkout, user, admin, vendor)
└── shared/                     # Reusable components
```

**Key services in core/**:
- AuthService - JWT handling, OAuth flows
- ApiService - Base HTTP client
- ThemeService - Dark/light mode (localStorage)
- LanguageService - i18n (English/Arabic with RTL)

**Tech stack**: Angular 21, Bootstrap 5, Font Awesome, ngx-translate

## API Structure

Main controllers in `ECommerce.API/Controllers/`:
- AuthController - Register, login, OAuth, token refresh
- ProductsController - CRUD, search with Elasticsearch
- CartController - Cart management
- OrdersController - Order processing
- CategoriesController - Product categories
- UsersController - User profiles
- AdminController - Dashboard stats, user management

## Configuration

**Backend configuration** via environment variables (see `.env.example`):
- Database: `DB_PASSWORD`
- JWT: `JWT_SECRET`, `JWT_ISSUER`, `JWT_AUDIENCE`
- OAuth: `GOOGLE_CLIENT_ID/SECRET`, `FACEBOOK_APP_ID/SECRET`
- PayPal: `PAYPAL_CLIENT_ID/SECRET`, `PAYPAL_MODE`
- SMTP: `SMTP_HOST`, `SMTP_PORT`, `SMTP_USERNAME`, `SMTP_PASSWORD`

**Frontend API base URL**: Configured in environment files, proxied via nginx in production

## Docker Services

**Production** (`docker-compose.yml`): sqlserver, elasticsearch, api (port 5000), frontend (port 80)

**Development** (`docker-compose.dev.yml`): sqlserver-dev, elasticsearch-dev, kibana-dev (port 5601)

## Rules
- Open changes in Visual Stuio Code