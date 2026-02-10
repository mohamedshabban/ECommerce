# E-Commerce Application - Implementation Plan

## Overview

A full-featured e-commerce platform with Angular frontend, .NET 8 Web API backend, SQL Server database, and Elasticsearch for search functionality.

---

## 1. Project Structure

```
E-Commerce/
├── src/                                    # Source code
│   ├── backend/                            # .NET Backend
│   │   ├── ECommerce.API/                  # Web API (Controllers, Middleware)
│   │   ├── ECommerce.Application/          # Business Logic, DTOs, Interfaces
│   │   ├── ECommerce.Domain/               # Entities, Enums, Value Objects
│   │   ├── ECommerce.Infrastructure/       # Data Access, External Services
│   │   └── ECommerce.sln                   # Solution file
│   │
│   └── frontend/                           # Angular Frontend
│       ├── src/
│       │   ├── app/
│       │   │   ├── core/                   # Singleton services, guards, interceptors
│       │   │   ├── shared/                 # Shared components, pipes, directives
│       │   │   ├── features/               # Feature modules (lazy loaded)
│       │   │   │   ├── auth/               # Login, Register, OAuth
│       │   │   │   ├── products/           # Product listing, details
│       │   │   │   ├── cart/               # Shopping cart
│       │   │   │   ├── checkout/           # Checkout flow
│       │   │   │   ├── admin/              # Admin dashboard
│       │   │   │   ├── vendor/             # Vendor dashboard
│       │   │   │   └── user/               # User profile, orders
│       │   │   └── app.component.ts
│       │   ├── assets/
│       │   │   ├── i18n/                   # Translation files (en.json, ar.json)
│       │   │   └── images/
│       │   ├── environments/
│       │   └── styles/                     # Global SCSS, themes
│       ├── angular.json
│       └── package.json
│
├── build/                                  # Build outputs
│   ├── backend/                            # Published .NET API
│   └── frontend/                           # Angular dist files
│
├── docker/                                 # Docker configuration
│   ├── docker-compose.yml
│   ├── docker-compose.override.yml
│   ├── backend.Dockerfile
│   ├── frontend.Dockerfile
│   └── elasticsearch.Dockerfile
│
├── scripts/                                # Utility scripts
│   ├── setup.ps1
│   └── seed-data.sql
│
└── docs/                                   # Documentation
    └── api/                                # API documentation
```

---

## 2. Database Schema (SQL Server)

### Core Entities

```
Users
├── Id (GUID, PK)
├── Email (unique)
├── PasswordHash
├── FirstName
├── LastName
├── PhoneNumber
├── Role (enum: Customer, Vendor, Admin)
├── AvatarUrl
├── IsActive
├── EmailConfirmed
├── CreatedAt
└── UpdatedAt

ExternalLogins
├── Id (GUID, PK)
├── UserId (FK -> Users)
├── Provider (Google, Facebook)
├── ProviderKey
└── CreatedAt

Categories
├── Id (int, PK)
├── NameEn
├── NameAr
├── Slug
├── ImageUrl
├── ParentCategoryId (FK -> Categories, nullable)
├── IsActive
├── SortOrder
├── CreatedAt
└── UpdatedAt

Products
├── Id (GUID, PK)
├── VendorId (FK -> Users)
├── CategoryId (FK -> Categories)
├── NameEn
├── NameAr
├── DescriptionEn
├── DescriptionAr
├── SKU (unique)
├── Price
├── DiscountPrice (nullable)
├── StockQuantity
├── IsActive
├── IsFeatured
├── CreatedAt
└── UpdatedAt

ProductImages
├── Id (int, PK)
├── ProductId (FK -> Products)
├── ImageUrl
├── IsPrimary
└── SortOrder

ProductReviews
├── Id (GUID, PK)
├── ProductId (FK -> Products)
├── UserId (FK -> Users)
├── Rating (1-5)
├── Comment
├── IsApproved
├── CreatedAt
└── UpdatedAt

Addresses
├── Id (GUID, PK)
├── UserId (FK -> Users)
├── Label (Home, Work, etc.)
├── Street
├── City
├── State
├── Country
├── PostalCode
├── IsDefault
├── CreatedAt
└── UpdatedAt

Orders
├── Id (GUID, PK)
├── UserId (FK -> Users)
├── OrderNumber (unique, generated)
├── Status (enum: Pending, Confirmed, Processing, Shipped, Delivered, Cancelled)
├── ShippingAddressId (FK -> Addresses)
├── SubTotal
├── ShippingCost
├── Tax
├── Total
├── PaymentMethod
├── PaymentStatus (enum: Pending, Paid, Failed, Refunded)
├── PayPalTransactionId
├── Notes
├── CreatedAt
└── UpdatedAt

OrderItems
├── Id (GUID, PK)
├── OrderId (FK -> Orders)
├── ProductId (FK -> Products)
├── VendorId (FK -> Users)
├── ProductNameSnapshot
├── Quantity
├── UnitPrice
├── Total
└── CreatedAt

Carts
├── Id (GUID, PK)
├── UserId (FK -> Users, nullable for guest)
├── SessionId (for guest carts)
├── CreatedAt
└── UpdatedAt

CartItems
├── Id (GUID, PK)
├── CartId (FK -> Carts)
├── ProductId (FK -> Products)
├── Quantity
├── CreatedAt
└── UpdatedAt

Wishlists
├── Id (GUID, PK)
├── UserId (FK -> Users)
├── ProductId (FK -> Products)
└── CreatedAt
```

---

## 3. Backend Architecture (.NET 8)

### Clean Architecture Layers

**ECommerce.Domain** (No dependencies)
- Entities (User, Product, Order, etc.)
- Enums (UserRole, OrderStatus, PaymentStatus)
- Value Objects
- Domain Events
- Exceptions

**ECommerce.Application** (Depends on Domain)
- DTOs (Request/Response models)
- Interfaces (IRepository, IEmailService, IPaymentService, ISearchService)
- Services (Business logic)
- Validators (FluentValidation)
- Mappings (AutoMapper profiles)
- CQRS patterns (optional, using MediatR)

**ECommerce.Infrastructure** (Depends on Application, Domain)
- DbContext (Entity Framework Core)
- Repositories (Generic + Specific)
- External Services:
  - EmailService (SMTP)
  - PayPalService
  - ElasticsearchService
  - FileStorageService (local)
- Identity configuration
- OAuth providers setup

**ECommerce.API** (Depends on all layers)
- Controllers
- Middleware (Exception handling, Localization)
- Filters
- Extensions (Service registration)
- Configuration

### Key NuGet Packages
- Microsoft.EntityFrameworkCore.SqlServer
- Microsoft.AspNetCore.Identity.EntityFrameworkCore
- Microsoft.AspNetCore.Authentication.JwtBearer
- Microsoft.AspNetCore.Authentication.Google
- Microsoft.AspNetCore.Authentication.Facebook
- NEST (Elasticsearch client)
- AutoMapper
- FluentValidation
- Serilog
- Swashbuckle (Swagger)

### API Endpoints

```
Auth:
POST   /api/auth/register
POST   /api/auth/login
POST   /api/auth/refresh-token
POST   /api/auth/forgot-password
POST   /api/auth/reset-password
POST   /api/auth/confirm-email
GET    /api/auth/google
GET    /api/auth/facebook
POST   /api/auth/external-login-callback

Users:
GET    /api/users                    (Admin)
GET    /api/users/{id}               (Admin/Self)
PUT    /api/users/{id}               (Admin/Self)
DELETE /api/users/{id}               (Admin)
GET    /api/users/profile            (Authenticated)
PUT    /api/users/profile            (Authenticated)

Categories:
GET    /api/categories
GET    /api/categories/{id}
POST   /api/categories               (Admin)
PUT    /api/categories/{id}          (Admin)
DELETE /api/categories/{id}          (Admin)

Products:
GET    /api/products                 (with pagination, filters)
GET    /api/products/{id}
GET    /api/products/search?q=       (Elasticsearch)
POST   /api/products                 (Vendor/Admin)
PUT    /api/products/{id}            (Vendor owner/Admin)
DELETE /api/products/{id}            (Vendor owner/Admin)
POST   /api/products/{id}/images     (Vendor owner/Admin)
DELETE /api/products/{id}/images/{imageId}

Reviews:
GET    /api/products/{id}/reviews
POST   /api/products/{id}/reviews    (Customer)
PUT    /api/reviews/{id}             (Owner)
DELETE /api/reviews/{id}             (Owner/Admin)

Cart:
GET    /api/cart
POST   /api/cart/items
PUT    /api/cart/items/{id}
DELETE /api/cart/items/{id}
DELETE /api/cart                     (Clear cart)

Orders:
GET    /api/orders                   (User's orders / Admin: all)
GET    /api/orders/{id}
POST   /api/orders                   (Create from cart)
PUT    /api/orders/{id}/status       (Admin/Vendor)
PUT    /api/orders/{id}/cancel       (Customer before shipping)

Checkout:
POST   /api/checkout/create-paypal-order
POST   /api/checkout/capture-paypal-order

Addresses:
GET    /api/addresses
POST   /api/addresses
PUT    /api/addresses/{id}
DELETE /api/addresses/{id}

Admin Dashboard:
GET    /api/admin/dashboard/stats
GET    /api/admin/dashboard/sales
GET    /api/admin/dashboard/orders
GET    /api/admin/vendors
PUT    /api/admin/vendors/{id}/approve

Vendor Dashboard:
GET    /api/vendor/dashboard/stats
GET    /api/vendor/products
GET    /api/vendor/orders
```

---

## 4. Frontend Architecture (Angular 18+)

### Core Module
- AuthService (JWT handling, OAuth)
- HttpInterceptor (Token injection, error handling)
- AuthGuard, RoleGuard
- ThemeService (Dark/Light mode)
- LanguageService (i18n)

### Shared Module
- Components: Navbar, Footer, Sidebar, ProductCard, Pagination, Loading, Modal
- Pipes: CurrencyPipe, TranslatePipe
- Directives: RtlDirective

### Feature Modules (Lazy Loaded)
1. **AuthModule**: Login, Register, Forgot Password, OAuth callbacks
2. **ProductsModule**: List, Details, Search results
3. **CartModule**: Cart view, quantity management
4. **CheckoutModule**: Address selection, PayPal integration, Order confirmation
5. **UserModule**: Profile, Orders, Addresses, Wishlist
6. **AdminModule**: Dashboard, Users, Products, Orders, Categories, Vendors
7. **VendorModule**: Dashboard, Products, Orders

### State Management
- Angular Signals (Angular 18+) for local state
- NgRx or simple services for cart state

### i18n Setup
- @ngx-translate/core
- Translation files: assets/i18n/en.json, assets/i18n/ar.json
- RTL support via CSS and directives

### Theming (Dark/Light)
- Bootstrap 5 CSS variables
- Theme toggle stored in localStorage
- CSS custom properties for easy switching

---

## 5. Elasticsearch Integration

### Index: products
```json
{
  "mappings": {
    "properties": {
      "id": { "type": "keyword" },
      "nameEn": { "type": "text", "analyzer": "english" },
      "nameAr": { "type": "text", "analyzer": "arabic" },
      "descriptionEn": { "type": "text", "analyzer": "english" },
      "descriptionAr": { "type": "text", "analyzer": "arabic" },
      "categoryName": { "type": "text" },
      "vendorName": { "type": "text" },
      "price": { "type": "float" },
      "sku": { "type": "keyword" },
      "isActive": { "type": "boolean" },
      "createdAt": { "type": "date" }
    }
  }
}
```

### Search Features
- Full-text search across name, description
- Filters: category, price range, vendor
- Sorting: relevance, price, date
- Autocomplete suggestions

---

## 6. Docker Configuration

### Services
1. **ecommerce-api**: .NET 8 API
2. **ecommerce-web**: Angular (nginx)
3. **sqlserver**: SQL Server 2022
4. **elasticsearch**: Elasticsearch 8.x
5. **smtp4dev**: Local email testing

### Volumes
- SQL Server data
- Elasticsearch data
- Uploaded images

---

## 7. Implementation Phases

### Phase 1: Foundation (Backend Setup)
- [ ] Create solution structure with Clean Architecture
- [ ] Set up Entity Framework Core with SQL Server
- [ ] Implement entities and database migrations
- [ ] Configure Identity with JWT authentication
- [ ] Set up OAuth (Google, Facebook)
- [ ] Implement generic repository pattern
- [ ] Add Swagger/OpenAPI documentation

### Phase 2: Core Backend Features
- [ ] User management (CRUD, roles)
- [ ] Category management
- [ ] Product management with image upload
- [ ] Cart functionality
- [ ] Address management
- [ ] Order creation and management

### Phase 3: Search & Payment
- [ ] Elasticsearch integration
- [ ] Product indexing and search
- [ ] PayPal integration
- [ ] Email service (SMTP)

### Phase 4: Frontend Foundation
- [ ] Angular project setup with Bootstrap
- [ ] Core module (auth, interceptors, guards)
- [ ] Shared components (navbar, footer, etc.)
- [ ] i18n setup (English/Arabic)
- [ ] Theme switching (Dark/Light)
- [ ] RTL support

### Phase 5: Frontend Features
- [ ] Auth module (login, register, OAuth)
- [ ] Products module (list, details, search)
- [ ] Cart module
- [ ] Checkout module with PayPal
- [ ] User module (profile, orders)

### Phase 6: Admin & Vendor
- [ ] Admin dashboard
- [ ] Admin management screens
- [ ] Vendor dashboard
- [ ] Vendor product management

### Phase 7: DevOps & Polish
- [ ] Docker configuration
- [ ] Build scripts
- [ ] Seed data
- [ ] Testing
- [ ] Documentation

---

## 8. Key Technical Decisions

| Decision | Choice | Rationale |
|----------|--------|-----------|
| Architecture | Clean Architecture | Separation of concerns, testability |
| ORM | Entity Framework Core | .NET standard, migrations support |
| Auth | JWT + Cookies | SPA-friendly, secure refresh tokens |
| State | Angular Signals | Modern, built-in, lightweight |
| CSS | Bootstrap 5 + SCSS | RTL support, theming via CSS vars |
| Search | NEST client | Official .NET Elasticsearch client |
| Validation | FluentValidation | Readable, testable validation rules |
| Mapping | AutoMapper | Reduce boilerplate DTO mapping |

---

## 9. Security Considerations

- Password hashing with ASP.NET Core Identity (bcrypt)
- JWT with short expiration + refresh tokens
- HTTPS only in production
- CORS configuration
- Input validation on all endpoints
- SQL injection prevention (EF Core parameterized queries)
- XSS prevention (Angular sanitization)
- CSRF protection
- Rate limiting on auth endpoints
- File upload validation (type, size)

---

## Ready to Implement

This plan covers all requirements:
- View list items with pagination
- View Item in details page
- Add/remove/update item
- Search by anything using Elasticsearch
- Shopping Cart
- Manage users
- Admin Dashboard
- Login and Sign Up (including OAuth)
- Categories
- Checkout page with PayPal
- Source code in `src/`, build output in `build/`
- Dark/Light mode support
- Arabic (RTL) and English support

**Estimated files to create: ~150+ files**
