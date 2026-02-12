import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { TranslateModule } from '@ngx-translate/core';
import { ApiService } from '../../../core/services';

interface VendorStats {
  totalProducts: number;
  totalOrders: number;
  totalRevenue: number;
  pendingOrders: number;
  recentOrders: any[];
  topProducts: any[];
}

@Component({
  selector: 'app-vendor-dashboard',
  standalone: true,
  imports: [CommonModule, RouterModule, TranslateModule],
  template: `
    <div class="container-fluid py-4">
      <div class="d-flex justify-content-between align-items-center mb-4">
        <h2>{{ 'vendor.dashboard.title' | translate }}</h2>
        <a routerLink="/vendor/products" class="btn btn-primary">
          <i class="fas fa-plus me-2"></i>
          {{ 'vendor.dashboard.addProduct' | translate }}
        </a>
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
                  <div class="stat-label">{{ 'vendor.dashboard.totalRevenue' | translate }}</div>
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
                  <div class="stat-label">{{ 'vendor.dashboard.totalOrders' | translate }}</div>
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
                  <div class="stat-label">{{ 'vendor.dashboard.totalProducts' | translate }}</div>
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
                  <div class="stat-value">{{ stats.pendingOrders }}</div>
                  <div class="stat-label">{{ 'vendor.dashboard.pendingOrders' | translate }}</div>
                </div>
                <div class="stat-icon">
                  <i class="fas fa-clock"></i>
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
                <h5 class="mb-0">{{ 'vendor.dashboard.recentOrders' | translate }}</h5>
                <a routerLink="/vendor/orders" class="btn btn-outline-primary btn-sm">
                  {{ 'common.viewAll' | translate }}
                </a>
              </div>
              <div class="card-body">
                @if (stats.recentOrders.length === 0) {
                  <div class="text-center py-4 text-muted">
                    {{ 'vendor.dashboard.noOrders' | translate }}
                  </div>
                } @else {
                  <div class="table-responsive">
                    <table class="table table-hover">
                      <thead>
                        <tr>
                          <th>{{ 'order.orderNumber' | translate }}</th>
                          <th>{{ 'product.product' | translate }}</th>
                          <th>{{ 'order.total' | translate }}</th>
                          <th>{{ 'order.status' | translate }}</th>
                          <th>{{ 'order.date' | translate }}</th>
                        </tr>
                      </thead>
                      <tbody>
                        @for (order of stats.recentOrders; track order.id) {
                          <tr>
                            <td>{{ order.orderNumber }}</td>
                            <td>{{ order.productName }}</td>
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
                }
              </div>
            </div>
          </div>

          <!-- Top Products -->
          <div class="col-lg-4">
            <div class="card">
              <div class="card-header">
                <h5 class="mb-0">{{ 'vendor.dashboard.topProducts' | translate }}</h5>
              </div>
              <div class="card-body">
                @if (stats.topProducts.length === 0) {
                  <div class="text-center py-4 text-muted">
                    {{ 'vendor.dashboard.noProducts' | translate }}
                  </div>
                } @else {
                  @for (product of stats.topProducts; track product.id; let i = $index) {
                    <div class="d-flex align-items-center py-2" [class.border-bottom]="i < stats.topProducts.length - 1">
                      <span class="rank me-3 fw-bold text-muted">{{ i + 1 }}</span>
                      <img
                        [src]="product.imageUrl || 'assets/images/placeholder.svg'"
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
export class VendorDashboardComponent implements OnInit {
  private apiService = inject(ApiService);

  loading = true;
  stats: VendorStats = {
    totalProducts: 0,
    totalOrders: 0,
    totalRevenue: 0,
    pendingOrders: 0,
    recentOrders: [],
    topProducts: []
  };

  ngOnInit(): void {
    this.loadDashboardData();
  }

  private loadDashboardData(): void {
    this.loading = true;
    this.apiService.get<VendorStats>('/vendor/dashboard').subscribe({
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
