import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { TranslateModule } from '@ngx-translate/core';
import { ApiService } from '../../../core/services';

interface DashboardStats {
  totalUsers: number;
  totalProducts: number;
  totalOrders: number;
  totalRevenue: number;
  pendingOrders: number;
  newUsers: number;
  recentOrders: any[];
  topProducts: any[];
}

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [CommonModule, RouterModule, TranslateModule],
  template: `
    <div class="container-fluid py-4">
      <div class="d-flex justify-content-between align-items-center mb-4">
        <h2>{{ 'admin.dashboard.title' | translate }}</h2>
        <div class="text-muted">
          <i class="fas fa-calendar me-2"></i>
          {{ today | date:'fullDate' }}
        </div>
      </div>

      @if (loading) {
        <div class="loading-spinner">
          <div class="spinner-border text-primary" role="status">
            <span class="visually-hidden">Loading...</span>
          </div>
        </div>
      } @else {
        <!-- Stats Cards -->
        <div class="row g-4 mb-4">
          <div class="col-md-6 col-xl-3">
            <div class="stat-card">
              <div class="d-flex justify-content-between">
                <div>
                  <div class="stat-value">{{ stats.totalRevenue | currency }}</div>
                  <div class="stat-label">{{ 'admin.dashboard.totalRevenue' | translate }}</div>
                </div>
                <div class="stat-icon">
                  <i class="fas fa-dollar-sign"></i>
                </div>
              </div>
            </div>
          </div>
          <div class="col-md-6 col-xl-3">
            <div class="stat-card success">
              <div class="d-flex justify-content-between">
                <div>
                  <div class="stat-value">{{ stats.totalOrders }}</div>
                  <div class="stat-label">{{ 'admin.dashboard.totalOrders' | translate }}</div>
                </div>
                <div class="stat-icon">
                  <i class="fas fa-shopping-bag"></i>
                </div>
              </div>
            </div>
          </div>
          <div class="col-md-6 col-xl-3">
            <div class="stat-card warning">
              <div class="d-flex justify-content-between">
                <div>
                  <div class="stat-value">{{ stats.totalProducts }}</div>
                  <div class="stat-label">{{ 'admin.dashboard.totalProducts' | translate }}</div>
                </div>
                <div class="stat-icon">
                  <i class="fas fa-box"></i>
                </div>
              </div>
            </div>
          </div>
          <div class="col-md-6 col-xl-3">
            <div class="stat-card info">
              <div class="d-flex justify-content-between">
                <div>
                  <div class="stat-value">{{ stats.totalUsers }}</div>
                  <div class="stat-label">{{ 'admin.dashboard.totalUsers' | translate }}</div>
                </div>
                <div class="stat-icon">
                  <i class="fas fa-users"></i>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div class="row g-4">
          <!-- Recent Orders -->
          <div class="col-lg-8">
            <div class="card">
              <div class="card-header d-flex justify-content-between align-items-center">
                <h5 class="mb-0">{{ 'admin.dashboard.recentOrders' | translate }}</h5>
                <a routerLink="/admin/orders" class="btn btn-outline-primary btn-sm">
                  {{ 'common.viewAll' | translate }}
                </a>
              </div>
              <div class="card-body">
                <div class="table-responsive">
                  <table class="table table-hover">
                    <thead>
                      <tr>
                        <th>{{ 'order.orderNumber' | translate }}</th>
                        <th>{{ 'order.customer' | translate }}</th>
                        <th>{{ 'order.total' | translate }}</th>
                        <th>{{ 'order.status' | translate }}</th>
                        <th>{{ 'order.date' | translate }}</th>
                      </tr>
                    </thead>
                    <tbody>
                      @for (order of stats.recentOrders; track order.id) {
                        <tr>
                          <td>
                            <a [routerLink]="['/admin/orders', order.id]" class="text-decoration-none">
                              {{ order.orderNumber }}
                            </a>
                          </td>
                          <td>{{ order.customerName }}</td>
                          <td>{{ order.total | currency }}</td>
                          <td>
                            <span [class]="'badge ' + getStatusBadge(order.status)">
                              {{ order.status }}
                            </span>
                          </td>
                          <td>{{ order.createdAt | date:'short' }}</td>
                        </tr>
                      }
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          </div>

          <!-- Quick Stats -->
          <div class="col-lg-4">
            <div class="card mb-4">
              <div class="card-header">
                <h5 class="mb-0">{{ 'admin.dashboard.quickStats' | translate }}</h5>
              </div>
              <div class="card-body">
                <div class="quick-stat d-flex justify-content-between align-items-center py-2 border-bottom">
                  <span>{{ 'admin.dashboard.pendingOrders' | translate }}</span>
                  <span class="badge bg-warning">{{ stats.pendingOrders }}</span>
                </div>
                <div class="quick-stat d-flex justify-content-between align-items-center py-2 border-bottom">
                  <span>{{ 'admin.dashboard.newUsers' | translate }}</span>
                  <span class="badge bg-info">{{ stats.newUsers }}</span>
                </div>
              </div>
            </div>

            <div class="card">
              <div class="card-header d-flex justify-content-between align-items-center">
                <h5 class="mb-0">{{ 'admin.dashboard.topProducts' | translate }}</h5>
              </div>
              <div class="card-body">
                @for (product of stats.topProducts; track product.id; let i = $index) {
                  <div class="d-flex align-items-center py-2" [class.border-bottom]="i < stats.topProducts.length - 1">
                    <span class="rank me-3 fw-bold text-muted">{{ i + 1 }}</span>
                    <img
                      [src]="product.imageUrl || 'assets/images/placeholder.png'"
                      [alt]="product.name"
                      class="rounded me-3"
                      style="width: 40px; height: 40px; object-fit: cover;">
                    <div class="flex-grow-1">
                      <div class="small fw-semibold">{{ product.name }}</div>
                      <div class="text-muted small">{{ product.soldCount }} sold</div>
                    </div>
                    <div class="text-primary fw-bold">{{ product.revenue | currency }}</div>
                  </div>
                }
              </div>
            </div>
          </div>
        </div>
      }
    </div>
  `,
  styles: [`
    .stat-icon {
      width: 48px;
      height: 48px;
      border-radius: 12px;
      background: rgba(255, 255, 255, 0.2);
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 1.5rem;
    }

    .rank {
      width: 24px;
      text-align: center;
    }
  `]
})
export class DashboardComponent implements OnInit {
  private apiService = inject(ApiService);

  today = new Date();
  loading = true;
  stats: DashboardStats = {
    totalUsers: 0,
    totalProducts: 0,
    totalOrders: 0,
    totalRevenue: 0,
    pendingOrders: 0,
    newUsers: 0,
    recentOrders: [],
    topProducts: []
  };

  ngOnInit(): void {
    this.loadDashboardData();
  }

  private loadDashboardData(): void {
    this.loading = true;
    this.apiService.get<DashboardStats>('/admin/dashboard').subscribe({
      next: (stats) => {
        this.stats = stats;
        this.loading = false;
      },
      error: (err) => {
        console.error('Error loading dashboard:', err);
        this.loading = false;
      }
    });
  }

  getStatusBadge(status: string): string {
    const badges: Record<string, string> = {
      'Pending': 'bg-warning',
      'Confirmed': 'bg-info',
      'Processing': 'bg-info',
      'Shipped': 'bg-primary',
      'Delivered': 'bg-success',
      'Cancelled': 'bg-danger'
    };
    return badges[status] || 'bg-secondary';
  }
}
