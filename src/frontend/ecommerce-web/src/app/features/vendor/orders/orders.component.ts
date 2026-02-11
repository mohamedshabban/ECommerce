import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { TranslateModule } from '@ngx-translate/core';
import { ApiService } from '../../../core/services';
import { Order, OrderStatus, PaginatedResponse } from '../../../core/models';

@Component({
  selector: 'app-vendor-orders',
  standalone: true,
  imports: [CommonModule, FormsModule, TranslateModule],
  template: `
    <div class="container-fluid py-4">
      <div class="d-flex justify-content-between align-items-center mb-4">
        <h2>{{ 'vendor.orders.title' | translate }}</h2>
      </div>

      <!-- Filters -->
      <div class="card mb-4">
        <div class="card-body">
          <div class="row g-3">
            <div class="col-md-3">
              <input
                type="text"
                class="form-control"
                placeholder="{{ 'vendor.orders.searchPlaceholder' | translate }}"
                [(ngModel)]="searchQuery"
                (input)="search()">
            </div>
            <div class="col-md-2">
              <select class="form-select" [(ngModel)]="filterStatus" (change)="loadOrders()">
                <option value="">{{ 'vendor.orders.allStatus' | translate }}</option>
                @for (status of orderStatuses; track status) {
                  <option [value]="status">{{ status }}</option>
                }
              </select>
            </div>
            <div class="col-md-2">
              <input type="date" class="form-control" [(ngModel)]="filterDateFrom" (change)="loadOrders()">
            </div>
            <div class="col-md-2">
              <input type="date" class="form-control" [(ngModel)]="filterDateTo" (change)="loadOrders()">
            </div>
          </div>
        </div>
      </div>

      <!-- Orders Table -->
      <div class="card">
        <div class="card-body">
          @if (loading) {
            <div class="loading-spinner">
              <div class="spinner-border text-primary" role="status">
                <span class="visually-hidden">Loading...</span>
              </div>
            </div>
          } @else if (orders.length === 0) {
            <div class="text-center py-5">
              <i class="fas fa-shopping-bag fa-4x text-muted mb-3"></i>
              <h4>{{ 'vendor.orders.noOrders' | translate }}</h4>
              <p class="text-muted">{{ 'vendor.orders.noOrdersDesc' | translate }}</p>
            </div>
          } @else {
            <div class="table-responsive">
              <table class="table table-hover">
                <thead>
                  <tr>
                    <th>{{ 'order.orderNumber' | translate }}</th>
                    <th>{{ 'product.product' | translate }}</th>
                    <th>{{ 'order.customer' | translate }}</th>
                    <th>{{ 'product.quantity' | translate }}</th>
                    <th>{{ 'order.total' | translate }}</th>
                    <th>{{ 'order.status' | translate }}</th>
                    <th>{{ 'order.date' | translate }}</th>
                    <th>{{ 'common.actions' | translate }}</th>
                  </tr>
                </thead>
                <tbody>
                  @for (order of orders; track order.id) {
                    <tr>
                      <td>{{ order.orderNumber }}</td>
                      <td>
                        <div class="d-flex align-items-center">
                          <img
                            [src]="order.items?.[0]?.productImageUrl || 'assets/images/placeholder.png'"
                            class="rounded me-2"
                            style="width: 40px; height: 40px; object-fit: cover;">
                          <div>
                            <div class="small fw-semibold">{{ order.items?.[0]?.productName }}</div>
                            @if (order.items && order.items.length > 1) {
                              <small class="text-muted">+{{ order.items.length - 1 }} more</small>
                            }
                          </div>
                        </div>
                      </td>
                      <td>{{ order.customerName }}</td>
                      <td>{{ order.itemCount }}</td>
                      <td class="fw-semibold">{{ order.total | currency }}</td>
                      <td>
                        <span [class]="'badge ' + getStatusBadge(order.status)">
                          {{ order.status }}
                        </span>
                      </td>
                      <td>{{ order.createdAt | date:'short' }}</td>
                      <td>
                        <button class="btn btn-outline-primary btn-sm" (click)="viewOrder(order)">
                          <i class="fas fa-eye"></i>
                        </button>
                      </td>
                    </tr>
                  }
                </tbody>
              </table>
            </div>

            <!-- Pagination -->
            @if (totalPages > 1) {
              <nav class="mt-4">
                <ul class="pagination justify-content-center">
                  <li class="page-item" [class.disabled]="currentPage === 1">
                    <button class="page-link" (click)="goToPage(currentPage - 1)">
                      <i class="fas fa-chevron-left"></i>
                    </button>
                  </li>
                  @for (page of getPageNumbers(); track page) {
                    <li class="page-item" [class.active]="page === currentPage">
                      <button class="page-link" (click)="goToPage(page)">{{ page }}</button>
                    </li>
                  }
                  <li class="page-item" [class.disabled]="currentPage === totalPages">
                    <button class="page-link" (click)="goToPage(currentPage + 1)">
                      <i class="fas fa-chevron-right"></i>
                    </button>
                  </li>
                </ul>
              </nav>
            }
          }
        </div>
      </div>

      <!-- Order Detail Modal -->
      @if (selectedOrder) {
        <div class="modal show d-block" tabindex="-1" style="background: rgba(0,0,0,0.5);">
          <div class="modal-dialog modal-lg">
            <div class="modal-content">
              <div class="modal-header">
                <h5 class="modal-title">{{ 'order.orderNumber' | translate }}: {{ selectedOrder.orderNumber }}</h5>
                <button type="button" class="btn-close" (click)="selectedOrder = null"></button>
              </div>
              <div class="modal-body">
                <div class="row mb-4">
                  <div class="col-md-6">
                    <h6>{{ 'order.customer' | translate }}</h6>
                    <p class="text-muted mb-0">
                      {{ selectedOrder.customerName }}<br>
                      {{ selectedOrder.shippingAddress?.addressLine1 }}<br>
                      {{ selectedOrder.shippingAddress?.city }}, {{ selectedOrder.shippingAddress?.state }}<br>
                      {{ selectedOrder.shippingAddress?.phone }}
                    </p>
                  </div>
                  <div class="col-md-6 text-md-end">
                    <h6>{{ 'order.status' | translate }}</h6>
                    <span [class]="'badge fs-6 ' + getStatusBadge(selectedOrder.status)">
                      {{ selectedOrder.status }}
                    </span>
                    <p class="text-muted mt-2 mb-0">
                      {{ 'order.placedOn' | translate }}: {{ selectedOrder.createdAt | date:'medium' }}
                    </p>
                  </div>
                </div>

                <h6>{{ 'order.items' | translate }}</h6>
                <table class="table">
                  <thead>
                    <tr>
                      <th>{{ 'product.product' | translate }}</th>
                      <th class="text-center">{{ 'product.quantity' | translate }}</th>
                      <th class="text-end">{{ 'product.price' | translate }}</th>
                      <th class="text-end">{{ 'cart.total' | translate }}</th>
                    </tr>
                  </thead>
                  <tbody>
                    @for (item of selectedOrder.items; track item.id) {
                      <tr>
                        <td>
                          <div class="d-flex align-items-center">
                            <img [src]="item.productImageUrl" class="rounded me-2" style="width: 40px; height: 40px; object-fit: cover;">
                            {{ item.productName }}
                          </div>
                        </td>
                        <td class="text-center">{{ item.quantity }}</td>
                        <td class="text-end">{{ item.price | currency }}</td>
                        <td class="text-end">{{ item.total | currency }}</td>
                      </tr>
                    }
                  </tbody>
                  <tfoot>
                    <tr>
                      <td colspan="3" class="text-end fw-bold">{{ 'vendor.orders.yourEarnings' | translate }}</td>
                      <td class="text-end fw-bold text-primary">{{ selectedOrder.vendorTotal | currency }}</td>
                    </tr>
                  </tfoot>
                </table>
              </div>
              <div class="modal-footer">
                <button type="button" class="btn btn-secondary" (click)="selectedOrder = null">
                  {{ 'common.close' | translate }}
                </button>
              </div>
            </div>
          </div>
        </div>
      }
    </div>
  `,
  styles: [`
    .loading-spinner {
      min-height: 300px;
    }
  `]
})
export class VendorOrdersComponent implements OnInit {
  private apiService = inject(ApiService);

  orders: Order[] = [];
  loading = true;
  selectedOrder: Order | null = null;

  searchQuery = '';
  filterStatus = '';
  filterDateFrom = '';
  filterDateTo = '';

  orderStatuses: OrderStatus[] = ['Pending', 'Confirmed', 'Processing', 'Shipped', 'Delivered', 'Cancelled'];

  currentPage = 1;
  pageSize = 10;
  totalItems = 0;
  totalPages = 0;

  ngOnInit(): void {
    this.loadOrders();
  }

  loadOrders(): void {
    this.loading = true;
    const params: any = {
      page: this.currentPage,
      pageSize: this.pageSize
    };

    if (this.searchQuery) params.search = this.searchQuery;
    if (this.filterStatus) params.status = this.filterStatus;
    if (this.filterDateFrom) params.fromDate = this.filterDateFrom;
    if (this.filterDateTo) params.toDate = this.filterDateTo;

    this.apiService.get<PaginatedResponse<Order>>('/vendor/orders', { params }).subscribe({
      next: (response) => {
        this.orders = response.items;
        this.totalItems = response.totalCount;
        this.totalPages = response.totalPages;
        this.loading = false;
      },
      error: (err) => {
        console.error('Error loading orders:', err);
        this.loading = false;
      }
    });
  }

  search(): void {
    this.currentPage = 1;
    this.loadOrders();
  }

  getStatusBadge(status: OrderStatus): string {
    const badges: Record<OrderStatus, string> = {
      'Pending': 'bg-warning',
      'Confirmed': 'bg-info',
      'Processing': 'bg-info',
      'Shipped': 'bg-primary',
      'Delivered': 'bg-success',
      'Cancelled': 'bg-danger'
    };
    return badges[status] || 'bg-secondary';
  }

  viewOrder(order: Order): void {
    this.apiService.get<Order>(`/vendor/orders/${order.id}`).subscribe({
      next: (fullOrder) => this.selectedOrder = fullOrder,
      error: (err) => console.error('Error loading order:', err)
    });
  }

  goToPage(page: number): void {
    if (page >= 1 && page <= this.totalPages) {
      this.currentPage = page;
      this.loadOrders();
    }
  }

  getPageNumbers(): number[] {
    const pages: number[] = [];
    const maxPages = 5;
    let start = Math.max(1, this.currentPage - Math.floor(maxPages / 2));
    let end = Math.min(this.totalPages, start + maxPages - 1);

    if (end - start + 1 < maxPages) {
      start = Math.max(1, end - maxPages + 1);
    }

    for (let i = start; i <= end; i++) {
      pages.push(i);
    }
    return pages;
  }
}
