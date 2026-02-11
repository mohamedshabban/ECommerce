# E-Commerce Application

A full-featured e-commerce application built with Angular and .NET 8.

## Features

- **Product Management**: Browse, search, filter products with pagination
- **Shopping Cart**: Add/remove items, update quantities, apply coupons
- **User Authentication**: Email/password login, Google and Facebook OAuth
- **Role-based Access**: Customer, Vendor, and Admin roles
- **Order Management**: Place orders, track status, order history
- **Payment Integration**: PayPal checkout
- **Search**: Elasticsearch-powered product search
- **Multi-language**: English and Arabic with RTL support
- **Theming**: Dark and Light mode support
- **Admin Dashboard**: Manage users, products, categories, orders
- **Vendor Dashboard**: Manage products and view orders

## Tech Stack

### Frontend
- Angular 18+
- Bootstrap 5
- ngx-translate (i18n)
- Font Awesome icons

### Backend
- .NET 8 Web API
- Entity Framework Core
- SQL Server
- JWT Authentication
- AutoMapper

### Infrastructure
- Docker & Docker Compose
- Elasticsearch
- Nginx (production)

## Project Structure

```
├── src/
│   ├── backend/
│   │   ├── ECommerce.API/           # Web API controllers and middleware
│   │   ├── ECommerce.Application/   # DTOs, interfaces, mappings
│   │   ├── ECommerce.Domain/        # Domain entities and enums
│   │   ├── ECommerce.Infrastructure/# Data access, external services
│   │   └── Dockerfile
│   └── frontend/
│       └── ecommerce-web/           # Angular application
│           ├── src/app/
│           │   ├── core/            # Services, guards, interceptors
│           │   ├── features/        # Feature modules (auth, products, etc.)
│           │   └── shared/          # Shared components
│           ├── Dockerfile
│           └── nginx.conf
├── docker-compose.yml               # Production deployment
├── docker-compose.dev.yml           # Development (databases only)
└── .env.example                     # Environment variables template
```

## Getting Started

### Prerequisites

- Node.js 20+
- .NET 8 SDK
- Docker and Docker Compose
- SQL Server (or use Docker)

### Development Setup

1. **Clone the repository**
   ```bash
   git clone https://github.com/yourusername/e-commerce.git
   cd e-commerce
   ```

2. **Set up environment variables**
   ```bash
   cp .env.example .env
   # Edit .env with your configuration
   ```

3. **Start development databases**
   ```bash
   docker-compose -f docker-compose.dev.yml up -d
   ```

4. **Run the backend**
   ```bash
   cd src/backend/ECommerce.API
   dotnet run
   ```
   API will be available at `https://localhost:5001`

5. **Run the frontend**
   ```bash
   cd src/frontend/ecommerce-web
   npm install
   npm start
   ```
   App will be available at `http://localhost:4200`

### Production Deployment

1. **Configure environment**
   ```bash
   cp .env.example .env
   # Update with production values
   ```

2. **Build and run with Docker Compose**
   ```bash
   docker-compose up -d --build
   ```

3. **Access the application**
   - Frontend: http://localhost
   - API: http://localhost:5000/api

## API Endpoints

### Authentication
- `POST /api/auth/register` - Register new user
- `POST /api/auth/login` - Login
- `POST /api/auth/google` - Google OAuth
- `POST /api/auth/facebook` - Facebook OAuth
- `POST /api/auth/forgot-password` - Request password reset

### Products
- `GET /api/products` - List products with pagination
- `GET /api/products/{id}` - Get product details
- `GET /api/products/search` - Search products (Elasticsearch)
- `POST /api/products` - Create product (Vendor/Admin)
- `PUT /api/products/{id}` - Update product (Vendor/Admin)
- `DELETE /api/products/{id}` - Delete product (Vendor/Admin)

### Cart
- `GET /api/cart` - Get current cart
- `POST /api/cart/items` - Add item to cart
- `PUT /api/cart/items/{id}` - Update cart item
- `DELETE /api/cart/items/{id}` - Remove from cart

### Orders
- `POST /api/orders` - Create order
- `GET /api/orders` - List user orders
- `GET /api/orders/{id}` - Get order details
- `POST /api/orders/{id}/cancel` - Cancel order

### Admin
- `GET /api/admin/dashboard` - Dashboard statistics
- `GET /api/admin/users` - Manage users
- `GET /api/admin/orders` - Manage all orders

## Configuration

### Environment Variables

| Variable | Description |
|----------|-------------|
| `DB_PASSWORD` | SQL Server password |
| `JWT_SECRET` | JWT signing key (min 32 chars) |
| `PAYPAL_CLIENT_ID` | PayPal API client ID |
| `PAYPAL_CLIENT_SECRET` | PayPal API secret |
| `GOOGLE_CLIENT_ID` | Google OAuth client ID |
| `GOOGLE_CLIENT_SECRET` | Google OAuth secret |
| `FACEBOOK_APP_ID` | Facebook OAuth app ID |
| `FACEBOOK_APP_SECRET` | Facebook OAuth secret |

## Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## License

This project is licensed under the MIT License.
