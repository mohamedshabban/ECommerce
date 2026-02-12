import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, ActivatedRoute } from '@angular/router';
import { TranslateModule } from '@ngx-translate/core';
import { OrderService } from '../../../core/services';
import { Order } from '../../../core/models';

@Component({
  selector: 'app-order-detail',
  standalone: true,
  imports: [CommonModule, RouterModule, TranslateModule],
  template: `
    <div class="container py-4">
      <a routerLink="/user/orders" class="btn btn-link mb-3 ps-0">
        <i class="fas fa-arrow-left me-2"></i>
        {{ 'order.backToOrders' | translate }}
      </a>

      @if (loading) {
        <div class="loading-spinner">
          <div class="spinner-border text-primary" role="status">
            <span class="visually-hidden">Loading...</span>
          </div>
        </div>
      } @else if (!order) {
        <div class="text-center py-5">
          <i class="fas fa-exclamation-circle fa-4x text-muted mb-3"></i>
          <h4>{{ 'order.notFound' | translate }}</h4>
        </div>
      } @else {
        <div class="row">
          <div class="col-lg-8">
            <!-- Order Header -->
            <div class="card mb-4">
              <div class="card-body">
                <div class="d-flex justify-content-between align-items-start">
                  <div>
                    <h4 class="mb-1">{{ 'order.orderNumber' | translate }}: {{ order.orderNumber }}</h4>
                    <p class="text-muted mb-0">
                      {{ 'order.placedOn' | translate }}: {{ order.createdAt | date:'medium' }}
                    </p>
                  </div>
                  <div class="text-end">
                    <span [class]="'badge fs-6 ' + getStatusBadgeClass(order.status)">
                      {{ order.status }}
                    </span>
                    <div class="mt-2">
                      <span [class]="'badge ' + getPaymentBadgeClass(order.paymentStatus ?? 'Pending')">
                        {{ 'order.payment' | translate }}: {{ order.paymentStatus ?? 'Pending' }}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <!-- Order Items -->
            <div class="card mb-4">
              <div class="card-header">
                <h5 class="mb-0">{{ 'order.items' | translate }}</h5>
              </div>
              <div class="card-body">
                @for (item of order.items; track item.id) {
                  <div class="d-flex py-3 border-bottom">
                    <img
                      [src]="item.productImageUrl || 'assets/images/placeholder.svg'"
                      [alt]="item.productName"
                      class="rounded me-3"
                      style="width: 80px; height: 80px; object-fit: cover;">
                    <div class="flex-grow-1">
                      <h6 class="mb-1">{{ item.productName }}</h6>
                      <div class="text-muted small">
                        {{ 'product.quantity' | translate }}: {{ item.quantity }}
                      </div>
                      <div class="text-muted small">
                        {{ 'product.price' | translate }}: {{ item.price | currency }}
                      </div>
                    </div>
                    <div class="text-end">
                      <div class="fw-bold">{{ item.total | currency }}</div>
                    </div>
                  </div>
                }
              </div>
            </div>

            <!-- Shipping Info -->
            <div class="card mb-4">
              <div class="card-header">
                <h5 class="mb-0">{{ 'order.shippingInfo' | translate }}</h5>
              </div>
              <div class="card-body">
                <div class="row">
                  <div class="col-md-6">
                    <h6>{{ 'order.shippingAddress' | translate }}</h6>
                    <div class="text-muted">
                      {{ order.shippingAddress?.fullName }}<br>
                      {{ order.shippingAddress?.addressLine1 }}<br>
                      @if (order.shippingAddress?.addressLine2) {
                        {{ order.shippingAddress?.addressLine2 }}<br>
                      }
                      {{ order.shippingAddress?.city }}, {{ order.shippingAddress?.state }} {{ order.shippingAddress?.postalCode }}<br>
                      {{ order.shippingAddress?.country }}<br>
                      <i class="fas fa-phone me-1"></i> {{ order.shippingAddress?.phone }}
                    </div>
                  </div>
                  <div class="col-md-6">
                    <h6>{{ 'order.paymentMethod' | translate }}</h6>
                    <div class="text-muted">{{ order.paymentMethod }}</div>
                    @if (order.trackingNumber) {
                      <h6 class="mt-3">{{ 'order.trackingNumber' | translate }}</h6>
                      <div class="text-muted">{{ order.trackingNumber }}</div>
                    }
                  </div>
                </div>
              </div>
            </div>
          </div>

          <!-- Order Summary -->
          <div class="col-lg-4">
            <div class="card">
              <div class="card-header">
                <h5 class="mb-0">{{ 'order.summary' | translate }}</h5>
              </div>
              <div class="card-body">
                <div class="d-flex justify-content-between mb-2">
                  <span>{{ 'cart.subtotal' | translate }}</span>
                  <span>{{ order.subTotal | currency }}</span>
                </div>
                @if (order.discount && order.discount > 0) {
                  <div class="d-flex justify-content-between mb-2 text-success">
                    <span>{{ 'cart.discount' | translate }}</span>
                    <span>-{{ order.discount | currency }}</span>
                  </div>
                }
                <div class="d-flex justify-content-between mb-2">
                  <span>{{ 'cart.shipping' | translate }}</span>
                  <span>{{ order.shippingCost ? (order.shippingCost | currency) : 'Free' }}</span>
                </div>
                @if (order.tax && order.tax > 0) {
                  <div class="d-flex justify-content-between mb-2">
                    <span>{{ 'order.tax' | translate }}</span>
                    <span>{{ order.tax | currency }}</span>
                  </div>
                }
                <hr>
                <div class="d-flex justify-content-between">
                  <strong>{{ 'cart.total' | translate }}</strong>
                  <strong class="text-primary fs-5">{{ order.total | currency }}</strong>
                </div>
              </div>
            </div>

            <!-- Actions -->
            <div class="mt-3">
              @if (order.status === 'Pending') {
                <button class="btn btn-outline-danger w-100 mb-2" (click)="cancelOrder()">
                  <i class="fas fa-times me-2"></i>
                  {{ 'order.cancel' | translate }}
                </button>
              }
              @if (order.status === 'Delivered') {
                <button class="btn btn-outline-primary w-100 mb-2" (click)="reorder()">
                  <i class="fas fa-redo me-2"></i>
                  {{ 'order.reorder' | translate }}
                </button>
              }
              <button class="btn btn-outline-secondary w-100" (click)="downloadInvoice()">
                <i class="fas fa-download me-2"></i>
                {{ 'order.downloadInvoice' | translate }}
              </button>
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
export class OrderDetailComponent implements OnInit {
  private route = inject(ActivatedRoute);
  private orderService = inject(OrderService);

  order: Order | null = null;
  loading = true;

  ngOnInit(): void {
    this.route.params.subscribe(params => {
      const orderId = params['id'];
      if (orderId) {
        this.loadOrder(orderId);
      }
    });
  }

  private loadOrder(orderId: string): void {
    this.loading = true;
    this.orderService.getOrder(orderId).subscribe({
      next: (order) => {
        this.order = order;
        this.loading = false;
      },
      error: (err) => {
        console.error('Error loading order:', err);
        this.loading = false;
      }
    });
  }

  getStatusBadgeClass(status: string): string {
    const classes: Record<string, string> = {
      'Pending': 'bg-warning',
      'Confirmed': 'bg-info',
      'Processing': 'bg-info',
      'Shipped': 'bg-primary',
      'Delivered': 'bg-success',
      'Cancelled': 'bg-danger'
    };
    return classes[status] || 'bg-secondary';
  }

  getPaymentBadgeClass(status: string): string {
    const classes: Record<string, string> = {
      'Paid': 'bg-success',
      'Pending': 'bg-warning',
      'Failed': 'bg-danger',
      'Refunded': 'bg-info'
    };
    return classes[status] || 'bg-secondary';
  }

  cancelOrder(): void {
    if (!this.order || !confirm('Are you sure you want to cancel this order?')) return;

    this.orderService.cancelOrder(this.order.id).subscribe({
      next: () => {
        if (this.order) {
          this.order.status = 'Cancelled';
        }
      },
      error: (err) => console.error('Error cancelling order:', err)
    });
  }

  reorder(): void {
    // Add items to cart
    console.log('Reorder:', this.order?.id);
  }

  downloadInvoice(): void {
    if (!this.order) return;
    this.orderService.downloadInvoice(this.order.id).subscribe({
      next: (blob) => {
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `invoice-${this.order?.orderNumber}.pdf`;
        a.click();
        window.URL.revokeObjectURL(url);
      },
      error: (err) => console.error('Error downloading invoice:', err)
    });
  }
}
