import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { TranslateModule } from '@ngx-translate/core';
import { OrderService } from '../../../core/services';
import { Order, OrderStatus } from '../../../core/models';

@Component({
  selector: 'app-orders',
  standalone: true,
  imports: [CommonModule, RouterModule, TranslateModule],
  template: `
    <div class="container py-4">
      <div class="d-flex justify-content-between align-items-center mb-4">
        <h2>{{ 'user.myOrders' | translate }}</h2>
      </div>

      @if (loading) {
        <div class="loading-spinner">
          <div class="spinner-border text-primary" role="status">
            <span class="visually-hidden">Loading...</span>
          </div>
        </div>
      } @else if (orders.length === 0) {
        <div class="text-center py-5">
          <i class="fas fa-shopping-bag fa-4x text-muted mb-3"></i>
          <h4>{{ 'order.noOrders' | translate }}</h4>
          <p class="text-muted">{{ 'order.noOrdersDesc' | translate }}</p>
          <a routerLink="/products" class="btn btn-primary">
            {{ 'order.startShopping' | translate }}
          </a>
        </div>
      } @else {
        <!-- Status Tabs -->
        <ul class="nav nav-tabs mb-4">
          <li class="nav-item">
            <button
              class="nav-link"
              [class.active]="filterStatus === null"
              (click)="filterByStatus(null)">
              {{ 'order.allOrders' | translate }}
            </button>
          </li>
          @for (status of orderStatuses; track status) {
            <li class="nav-item">
              <button
                class="nav-link"
                [class.active]="filterStatus === status"
                (click)="filterByStatus(status)">
                {{ 'order.status.' + status | translate }}
              </button>
            </li>
          }
        </ul>

        <!-- Orders List -->
        <div class="orders-list">
          @for (order of filteredOrders; track order.id) {
            <div class="card mb-3">
              <div class="card-header d-flex justify-content-between align-items-center">
                <div>
                  <span class="fw-bold">{{ 'order.orderNumber' | translate }}: {{ order.orderNumber }}</span>
                  <span class="text-muted ms-3">{{ order.createdAt | date:'mediumDate' }}</span>
                </div>
                <span [class]="'badge ' + getStatusBadgeClass(order.status)">
                  {{ order.status }}
                </span>
              </div>
              <div class="card-body">
                <div class="row align-items-center">
                  <div class="col-md-6">
                    <div class="d-flex">
                      @for (item of order.items?.slice(0, 3); track item.id) {
                        <img
                          [src]="item.productImageUrl || 'assets/images/placeholder.png'"
                          [alt]="item.productName"
                          class="order-item-image rounded me-2">
                      }
                      @if (order.items && order.items.length > 3) {
                        <div class="more-items">+{{ order.items.length - 3 }}</div>
                      }
                    </div>
                  </div>
                  <div class="col-md-3">
                    <div class="text-muted small">{{ 'order.total' | translate }}</div>
                    <div class="fw-bold text-primary">{{ order.total | currency }}</div>
                  </div>
                  <div class="col-md-3 text-end">
                    <a [routerLink]="['/user/orders', order.id]" class="btn btn-outline-primary btn-sm">
                      {{ 'order.viewDetails' | translate }}
                    </a>
                    @if (order.status === 'Delivered') {
                      <button class="btn btn-outline-secondary btn-sm ms-2" (click)="reorder(order)">
                        {{ 'order.reorder' | translate }}
                      </button>
                    }
                  </div>
                </div>
              </div>
              @if (order.status !== 'Delivered' && order.status !== 'Cancelled') {
                <div class="card-footer bg-transparent">
                  <div class="order-tracking">
                    <div class="tracking-step" [class.active]="isStepActive(order.status, 'Pending')">
                      <div class="step-icon"><i class="fas fa-clock"></i></div>
                      <div class="step-label">{{ 'order.status.Pending' | translate }}</div>
                    </div>
                    <div class="tracking-line" [class.active]="isStepCompleted(order.status, 'Confirmed')"></div>
                    <div class="tracking-step" [class.active]="isStepActive(order.status, 'Confirmed')">
                      <div class="step-icon"><i class="fas fa-check"></i></div>
                      <div class="step-label">{{ 'order.status.Confirmed' | translate }}</div>
                    </div>
                    <div class="tracking-line" [class.active]="isStepCompleted(order.status, 'Processing')"></div>
                    <div class="tracking-step" [class.active]="isStepActive(order.status, 'Processing')">
                      <div class="step-icon"><i class="fas fa-box"></i></div>
                      <div class="step-label">{{ 'order.status.Processing' | translate }}</div>
                    </div>
                    <div class="tracking-line" [class.active]="isStepCompleted(order.status, 'Shipped')"></div>
                    <div class="tracking-step" [class.active]="isStepActive(order.status, 'Shipped')">
                      <div class="step-icon"><i class="fas fa-shipping-fast"></i></div>
                      <div class="step-label">{{ 'order.status.Shipped' | translate }}</div>
                    </div>
                    <div class="tracking-line" [class.active]="isStepCompleted(order.status, 'Delivered')"></div>
                    <div class="tracking-step" [class.active]="isStepActive(order.status, 'Delivered')">
                      <div class="step-icon"><i class="fas fa-home"></i></div>
                      <div class="step-label">{{ 'order.status.Delivered' | translate }}</div>
                    </div>
                  </div>
                </div>
              }
            </div>
          }
        </div>
      }
    </div>
  `,
  styles: [`
    .order-item-image {
      width: 50px;
      height: 50px;
      object-fit: cover;
    }

    .more-items {
      width: 50px;
      height: 50px;
      background: var(--bg-secondary);
      border-radius: 4px;
      display: flex;
      align-items: center;
      justify-content: center;
      font-weight: bold;
      color: var(--text-secondary);
    }

    .order-tracking {
      display: flex;
      align-items: center;
      justify-content: space-between;
      padding: 1rem 0;
    }

    .tracking-step {
      display: flex;
      flex-direction: column;
      align-items: center;
      color: var(--text-secondary);
    }

    .tracking-step.active {
      color: var(--primary-color);
    }

    .step-icon {
      width: 36px;
      height: 36px;
      border-radius: 50%;
      background: var(--bg-secondary);
      display: flex;
      align-items: center;
      justify-content: center;
      margin-bottom: 0.5rem;
    }

    .tracking-step.active .step-icon {
      background: var(--primary-color);
      color: white;
    }

    .step-label {
      font-size: 0.75rem;
    }

    .tracking-line {
      flex: 1;
      height: 2px;
      background: var(--border-color);
      margin: 0 0.5rem;
      margin-bottom: 1.5rem;
    }

    .tracking-line.active {
      background: var(--primary-color);
    }
  `]
})
export class OrdersComponent implements OnInit {
  private orderService = inject(OrderService);

  orders: Order[] = [];
  filteredOrders: Order[] = [];
  loading = true;
  filterStatus: OrderStatus | null = null;

  orderStatuses: OrderStatus[] = ['Pending', 'Confirmed', 'Processing', 'Shipped', 'Delivered', 'Cancelled'];
  statusOrder = ['Pending', 'Confirmed', 'Processing', 'Shipped', 'Delivered'];

  ngOnInit(): void {
    this.loadOrders();
  }

  private loadOrders(): void {
    this.loading = true;
    this.orderService.getUserOrders().subscribe({
      next: (orders) => {
        this.orders = orders;
        this.filteredOrders = orders;
        this.loading = false;
      },
      error: (err) => {
        console.error('Error loading orders:', err);
        this.loading = false;
      }
    });
  }

  filterByStatus(status: OrderStatus | null): void {
    this.filterStatus = status;
    if (status === null) {
      this.filteredOrders = this.orders;
    } else {
      this.filteredOrders = this.orders.filter(o => o.status === status);
    }
  }

  getStatusBadgeClass(status: OrderStatus): string {
    const classes: Record<OrderStatus, string> = {
      'Pending': 'bg-warning',
      'Confirmed': 'bg-info',
      'Processing': 'bg-info',
      'Shipped': 'bg-primary',
      'Delivered': 'bg-success',
      'Cancelled': 'bg-danger'
    };
    return classes[status] || 'bg-secondary';
  }

  isStepActive(currentStatus: OrderStatus, step: string): boolean {
    const currentIndex = this.statusOrder.indexOf(currentStatus);
    const stepIndex = this.statusOrder.indexOf(step);
    return stepIndex <= currentIndex;
  }

  isStepCompleted(currentStatus: OrderStatus, step: string): boolean {
    const currentIndex = this.statusOrder.indexOf(currentStatus);
    const stepIndex = this.statusOrder.indexOf(step);
    return stepIndex <= currentIndex;
  }

  reorder(order: Order): void {
    // Add all items from order to cart
    console.log('Reorder:', order.id);
  }
}
