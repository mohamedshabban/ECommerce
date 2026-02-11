import { Routes } from '@angular/router';
import { AuthGuard, AdminGuard, VendorGuard, GuestGuard } from './core/guards/auth.guard';

export const routes: Routes = [
  {
    path: '',
    loadComponent: () => import('./features/products/home/home.component').then(m => m.HomeComponent)
  },
  {
    path: 'auth',
    canActivate: [GuestGuard],
    children: [
      {
        path: 'login',
        loadComponent: () => import('./features/auth/login/login.component').then(m => m.LoginComponent)
      },
      {
        path: 'register',
        loadComponent: () => import('./features/auth/register/register.component').then(m => m.RegisterComponent)
      },
      {
        path: 'forgot-password',
        loadComponent: () => import('./features/auth/forgot-password/forgot-password.component').then(m => m.ForgotPasswordComponent)
      }
    ]
  },
  {
    path: 'products',
    children: [
      {
        path: '',
        loadComponent: () => import('./features/products/product-list/product-list.component').then(m => m.ProductListComponent)
      },
      {
        path: 'search',
        loadComponent: () => import('./features/products/product-list/product-list.component').then(m => m.ProductListComponent)
      },
      {
        path: 'category/:slug',
        loadComponent: () => import('./features/products/product-list/product-list.component').then(m => m.ProductListComponent)
      },
      {
        path: ':id',
        loadComponent: () => import('./features/products/product-detail/product-detail.component').then(m => m.ProductDetailComponent)
      }
    ]
  },
  {
    path: 'cart',
    canActivate: [AuthGuard],
    loadComponent: () => import('./features/cart/cart.component').then(m => m.CartComponent)
  },
  {
    path: 'checkout',
    canActivate: [AuthGuard],
    children: [
      {
        path: '',
        loadComponent: () => import('./features/checkout/checkout.component').then(m => m.CheckoutComponent)
      },
      {
        path: 'success',
        loadComponent: () => import('./features/checkout/order-success/order-success.component').then(m => m.OrderSuccessComponent)
      }
    ]
  },
  {
    path: 'user',
    canActivate: [AuthGuard],
    children: [
      {
        path: 'profile',
        loadComponent: () => import('./features/user/profile/profile.component').then(m => m.ProfileComponent)
      },
      {
        path: 'orders',
        loadComponent: () => import('./features/user/orders/orders.component').then(m => m.OrdersComponent)
      },
      {
        path: 'orders/:id',
        loadComponent: () => import('./features/user/order-detail/order-detail.component').then(m => m.OrderDetailComponent)
      },
      {
        path: 'addresses',
        loadComponent: () => import('./features/user/addresses/addresses.component').then(m => m.AddressesComponent)
      }
    ]
  },
  {
    path: 'admin',
    canActivate: [AuthGuard, AdminGuard],
    children: [
      {
        path: '',
        loadComponent: () => import('./features/admin/dashboard/dashboard.component').then(m => m.DashboardComponent)
      },
      {
        path: 'users',
        loadComponent: () => import('./features/admin/users/users.component').then(m => m.UsersComponent)
      },
      {
        path: 'products',
        loadComponent: () => import('./features/admin/products/products.component').then(m => m.AdminProductsComponent)
      },
      {
        path: 'categories',
        loadComponent: () => import('./features/admin/categories/categories.component').then(m => m.CategoriesComponent)
      },
      {
        path: 'orders',
        loadComponent: () => import('./features/admin/orders/orders.component').then(m => m.AdminOrdersComponent)
      }
    ]
  },
  {
    path: 'vendor',
    canActivate: [AuthGuard, VendorGuard],
    children: [
      {
        path: '',
        loadComponent: () => import('./features/vendor/dashboard/dashboard.component').then(m => m.VendorDashboardComponent)
      },
      {
        path: 'products',
        loadComponent: () => import('./features/vendor/products/products.component').then(m => m.VendorProductsComponent)
      },
      {
        path: 'orders',
        loadComponent: () => import('./features/vendor/orders/orders.component').then(m => m.VendorOrdersComponent)
      }
    ]
  },
  {
    path: '**',
    redirectTo: ''
  }
];
