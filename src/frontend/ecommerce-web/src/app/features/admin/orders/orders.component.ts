import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { TranslateModule } from '@ngx-translate/core';
import { OrderService } from '../../../core/services';
import { Order, OrderStatus, PaginatedResponse } from '../../../core/models';

@Component({
  selector: 'app-admin-orders',
  standalone: true,
  imports: [CommonModule, FormsModule, TranslateModule],
  template: `
    <div class="container-fluid py-4">
      <div class="d-flex justify-content-between align-items-center mb-4">
        <h2>{{ 'admin.orders.title' | translate }}</h2>
      </div>

      <!-- Filters -->
      <div class="card mb-4">
        <div class="card-body">
          <div class="row g-3">
            <div class="col-md-3">
              <input
                type="text"
                class="form-control"
                placeholder="{{ 'admin.orders.searchPlaceholder' | translate }}"
                [(ngModel)]="searchQuery"
                (input)="search()">
            </div>
            <div class="col-md-2">
              <select class="form-select" [(ngModel)]="filterStatus" (change)="loadOrders()">
                <option value="">{{ 'admin.orders.allStatus' | translate }}</option>
                @for (status of orderStatuses; track status) {
                  <option [value]="status">{{ status }}</option>
                }
              </select>
            </div>
            <div class="col-md-2">
              <select class="form-select" [(ngModel)]="filterPayment" (change)="loadOrders()">
                <option value="">{{ 'admin.orders.allPayment' | translate }}</option>
                <option value="Pending">Pending</option>
                <option value="Paid">Paid</option>
                <option value="Failed">Failed</option>
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
          } @else {
            <div class="table-responsive">
              <table class="table table-hover">
                <thead>
                  <tr>
                    <th>{{ 'order.orderNumber' | translate }}</th>
                    <th>{{ 'order.customer' | translate }}</th>
                    <th>{{ 'order.items' | translate }}</th>
                    <th>{{ 'order.total' | translate }}</th>
                    <th>{{ 'order.status' | translate }}</th>
                    <th>{{ 'order.payment' | translate }}</th>
                    <th>{{ 'order.date' | translate }}</th>
                    <th>{{ 'common.actions' | translate }}</th>
                  </tr>
                </thead>
                <tbody>
                  @for (order of orders; track order.id) {
                    <tr>
                      <td>
                        <a href="#" class="text-decoration-none" (click)="viewOrder(order); $event.preventDefault()">
                          {{ order.orderNumber }}
                        </a>
                      </td>
                      <td>
                        <div>{{ order.customerName }}</div>
                        <small class="text-muted">{{ order.customerEmail }}</small>
                      </td>
                      <td>{{ order.itemCount }} items</td>
                      <td class="fw-semibold">{{ order.total | currency }}</td>
                      <td>
                        <select
                          class="form-select form-select-sm"
                          [ngModel]="order.status"
                          [class]="getStatusSelectClass(order.status)"
                          style="width: 130px;"
                          (change)="updateOrderStatus(order, $event)">
                          @for (status of orderStatuses; track status) {
                            <option [value]="status">{{ status }}</option>
                          }
                        </select>
                      </td>
                      <td>
                        <span [class]="'badge ' + getPaymentBadge(order.paymentStatus ?? 'Pending')">
                          {{ order.paymentStatus ?? 'Pending' }}
                        </span>
                      </td>
                      <td>{{ order.createdAt | date:'short' }}</td>
                      <td>
                        <div class="dropdown">
                          <button class="btn btn-link btn-sm" data-bs-toggle="dropdown">
                            <i class="fas fa-ellipsis-v"></i>
                          </button>
                          <ul class="dropdown-menu">
                            <li>
                              <button class="dropdown-item" (click)="viewOrder(order)">
                                <i class="fas fa-eye me-2"></i> {{ 'common.view' | translate }}
                              </button>
                            </li>
                            <li>
                              <button class="dropdown-item" (click)="printInvoice(order)">
                                <i class="fas fa-print me-2"></i> {{ 'order.printInvoice' | translate }}
                              </button>
                            </li>
                            @if (order.status !== 'Cancelled' && order.status !== 'Delivered') {
                              <li><hr class="dropdown-divider"></li>
                              <li>
                                <button class="dropdown-item text-danger" (click)="cancelOrder(order)">
                                  <i class="fas fa-times me-2"></i> {{ 'order.cancel' | translate }}
                                </button>
                              </li>
                            }
                          </ul>
                        </div>
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
                <div class="row">
                  <div class="col-md-6">
                    <h6>{{ 'order.customer' | translate }}</h6>
                    <p class="text-muted mb-3">
                      {{ selectedOrder.customerName }}<br>
                      {{ selectedOrder.customerEmail }}<br>
                      {{ selectedOrder.shippingAddress?.phone }}
                    </p>

                    <h6>{{ 'order.shippingAddress' | translate }}</h6>
                    <p class="text-muted">
                      {{ selectedOrder.shippingAddress?.addressLine1 }}<br>
                      {{ selectedOrder.shippingAddress?.city }}, {{ selectedOrder.shippingAddress?.state }}<br>
                      {{ selectedOrder.shippingAddress?.postalCode }}, {{ selectedOrder.shippingAddress?.country }}
                    </p>
                  </div>
                  <div class="col-md-6">
                    <h6>{{ 'order.summary' | translate }}</h6>
                    <table class="table table-sm">
                      <tr>
                        <td>{{ 'cart.subtotal' | translate }}</td>
                        <td class="text-end">{{ selectedOrder.subTotal | currency }}</td>
                      </tr>
                      <tr>
                        <td>{{ 'cart.shipping' | translate }}</td>
                        <td class="text-end">{{ selectedOrder.shippingCost | currency }}</td>
                      </tr>
                      @if (selectedOrder.discount) {
                        <tr class="text-success">
                          <td>{{ 'cart.discount' | translate }}</td>
                          <td class="text-end">-{{ selectedOrder.discount | currency }}</td>
                        </tr>
                      }
                      <tr class="fw-bold">
                        <td>{{ 'cart.total' | translate }}</td>
                        <td class="text-end">{{ selectedOrder.total | currency }}</td>
                      </tr>
                    </table>
                  </div>
                </div>

                <h6 class="mt-4">{{ 'order.items' | translate }}</h6>
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
export class AdminOrdersComponent implements OnInit {
  private orderService = inject(OrderService);

  orders: Order[] = [];
  loading = true;
  selectedOrder: Order | null = null;

  searchQuery = '';
  filterStatus = '';
  filterPayment = '';
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
    if (this.filterPayment) params.paymentStatus = this.filterPayment;
    if (this.filterDateFrom) params.fromDate = this.filterDateFrom;
    if (this.filterDateTo) params.toDate = this.filterDateTo;

    this.orderService.getAllOrders(params).subscribe({
      next: (response: PaginatedResponse<Order>) => {
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

  getStatusSelectClass(status: OrderStatus): string {
    const classes: Record<OrderStatus, string> = {
      'Pending': 'border-warning',
      'Confirmed': 'border-info',
      'Processing': 'border-info',
      'Shipped': 'border-primary',
      'Delivered': 'border-success',
      'Cancelled': 'border-danger'
    };
    return classes[status] || '';
  }

  getPaymentBadge(status: string): string {
    const badges: Record<string, string> = {
      'Paid': 'bg-success',
      'Pending': 'bg-warning',
      'Failed': 'bg-danger',
      'Refunded': 'bg-info'
    };
    return badges[status] || 'bg-secondary';
  }

  updateOrderStatus(order: Order, event: Event): void {
    const select = event.target as HTMLSelectElement;
    const newStatus = select.value as OrderStatus;

    this.orderService.updateOrderStatus(order.id, newStatus).subscribe({
      next: () => {
        order.status = newStatus;
      },
      error: (err) => {
        console.error('Error updating order status:', err);
        select.value = order.status; // Revert
      }
    });
  }

  viewOrder(order: Order): void {
    this.orderService.getOrder(order.id).subscribe({
      next: (fullOrder) => this.selectedOrder = fullOrder,
      error: (err) => console.error('Error loading order:', err)
    });
  }

  printInvoice(order: Order): void {
    this.orderService.downloadInvoice(order.id).subscribe({
      next: (blob) => {
        const url = window.URL.createObjectURL(blob);
        window.open(url);
      },
      error: (err) => console.error('Error downloading invoice:', err)
    });
  }

  cancelOrder(order: Order): void {
    if (!confirm('Are you sure you want to cancel this order?')) return;

    this.orderService.cancelOrder(order.id).subscribe({
      next: () => {
        order.status = 'Cancelled';
      },
      error: (err) => console.error('Error cancelling order:', err)
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
