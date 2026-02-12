// User models
export interface User {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  phone?: string;
  phoneNumber?: string;
  role: UserRole;
  avatarUrl?: string;
  isActive: boolean;
  emailConfirmed: boolean;
  createdAt: Date;
}

export enum UserRole {
  Customer = 'Customer',
  Vendor = 'Vendor',
  Admin = 'Admin'
}

export interface AuthResponse {
  userId: string;
  email: string;
  firstName: string;
  lastName: string;
  role: UserRole;
  accessToken: string;
  refreshToken: string;
  expiresAt: Date;
}

export interface LoginRequest {
  email: string;
  password: string;
}

export interface RegisterRequest {
  email: string;
  password: string;
  firstName: string;
  lastName: string;
  phoneNumber?: string;
  role?: UserRole;
}

// Product models
export interface Product {
  id: string;
  vendorId: string;
  vendorName?: string;
  categoryId: string;
  categoryName?: string;
  categoryNameEn?: string;
  categoryNameAr?: string;
  categorySlug?: string;
  nameEn: string;
  nameAr?: string;
  shortDescription?: string;
  descriptionEn?: string;
  descriptionAr?: string;
  sku?: string;
  price: number;
  originalPrice?: number;
  discountPrice?: number;
  currentPrice?: number;
  discountPercentage?: number;
  stockQuantity: number;
  inStock?: boolean;
  isActive: boolean;
  isFeatured?: boolean;
  brand?: string;
  tags?: string;
  averageRating?: number;
  reviewCount?: number;
  imageUrl?: string;
  primaryImageUrl?: string;
  images?: ProductImage[];
  createdAt?: Date;
}

export interface ProductImage {
  id: string;
  imageUrl: string;
  altText?: string;
  isPrimary: boolean;
  sortOrder: number;
}

export interface ProductReview {
  id: string;
  productId: string;
  userId: string;
  userName: string;
  rating: number;
  comment: string;
  createdAt: Date;
}

export interface ProductListItem {
  id: string;
  nameEn: string;
  nameAr: string;
  categoryNameEn: string;
  categoryNameAr: string;
  price: number;
  discountPrice?: number;
  currentPrice: number;
  stockQuantity: number;
  inStock: boolean;
  isFeatured: boolean;
  primaryImageUrl?: string;
  averageRating: number;
  reviewCount: number;
}

export interface ProductFilter {
  categoryId?: number;
  vendorId?: string;
  minPrice?: number;
  maxPrice?: number;
  inStock?: boolean;
  isFeatured?: boolean;
  brand?: string;
  sortBy?: string;
  sortDescending?: boolean;
}

export interface ProductSearchRequest {
  query?: string;
  categoryId?: number;
  minPrice?: number;
  maxPrice?: number;
  brand?: string;
  pageNumber: number;
  pageSize: number;
  sortBy?: string;
  sortDescending?: boolean;
}

// Category models
export interface Category {
  id: string;
  nameEn: string;
  nameAr?: string;
  slug: string;
  description?: string;
  descriptionEn?: string;
  descriptionAr?: string;
  icon?: string;
  imageUrl?: string;
  parentId?: string;
  parentCategoryId?: string;
  parentCategoryName?: string;
  isActive: boolean;
  sortOrder?: number;
  productCount?: number;
  subCategories?: Category[];
}

// Cart models
export interface Cart {
  id: string;
  items: CartItem[];
  subTotal: number;
  totalItems: number;
  discount?: number;
  shippingCost?: number;
}

export interface CartItem {
  id: string;
  productId: string;
  productName?: string;
  productNameEn?: string;
  productNameAr?: string;
  productImageUrl?: string;
  productSku?: string;
  price: number;
  unitPrice?: number;
  quantity: number;
  total: number;
  availableStock?: number;
}

// Order models
export interface Order {
  id: string;
  orderNumber: string;
  userId: string;
  customerName?: string;
  customerEmail?: string;
  status: OrderStatus;
  shippingAddress?: Address;
  subTotal: number;
  shippingCost?: number;
  tax?: number;
  discount?: number;
  total: number;
  paymentMethod?: PaymentMethod;
  paymentStatus?: PaymentStatus;
  payPalTransactionId?: string;
  trackingNumber?: string;
  notes?: string;
  items?: OrderItem[];
  itemCount?: number;
  vendorTotal?: number;
  createdAt: Date;
  shippedAt?: Date;
  deliveredAt?: Date;
}

export interface OrderItem {
  id: string;
  productId: string;
  productName: string;
  productImageUrl?: string;
  quantity: number;
  price: number;
  unitPrice?: number;
  total: number;
  vendorName?: string;
}

export type OrderStatus = 'Pending' | 'Confirmed' | 'Processing' | 'Shipped' | 'Delivered' | 'Cancelled';

export type PaymentMethod = 'PayPal' | 'CreditCard' | 'CashOnDelivery';

export type PaymentStatus = 'Pending' | 'Paid' | 'Failed' | 'Refunded';

// Address model
export interface Address {
  id: string;
  label?: string;
  fullName: string;
  phone: string;
  addressLine1: string;
  addressLine2?: string;
  street?: string;
  city: string;
  state: string;
  country: string;
  postalCode: string;
  isDefault: boolean;
}

// Common models
export interface ApiResponse<T> {
  success: boolean;
  message?: string;
  data?: T;
  errors?: { [key: string]: string[] };
}

export interface PaginatedResponse<T> {
  items: T[];
  pageNumber: number;
  pageSize: number;
  totalPages: number;
  totalCount: number;
  hasPreviousPage: boolean;
  hasNextPage: boolean;
}

export interface PaginatedList<T> {
  items: T[];
  pageNumber: number;
  pageSize: number;
  totalPages: number;
  totalCount: number;
  hasPreviousPage: boolean;
  hasNextPage: boolean;
}

export interface PaginationParams {
  pageNumber: number;
  pageSize: number;
}
