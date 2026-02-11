import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, ActivatedRoute } from '@angular/router';
import { TranslateModule } from '@ngx-translate/core';
import { OrderService } from '../../../core/services';
import { Order } from '../../../core/models';

@Component({
  selector: 'app-order-success',
  standalone: true,
  imports: [CommonModule, RouterModule, TranslateModule],
  template: `
    <div class="container py-5">
      <div class="row justify-content-center">
        <div class="col-md-8 col-lg-6">
          <div class="card text-center">
            <div class="card-body py-5">
              <div class="success-icon mb-4">
                <i class="fas fa-check-circle fa-5x text-success"></i>
              </div>

              <h2 class="mb-3">{{ 'checkout.success.title' | translate }}</h2>
              <p class="text-muted mb-4">{{ 'checkout.success.subtitle' | translate }}</p>

              @if (order) {
                <div class="order-details bg-light rounded p-4 mb-4">
                  <div class="row">
                    <div class="col-6 text-start">
                      <small class="text-muted">{{ 'order.orderNumber' | translate }}</small>
                      <div class="fw-bold">{{ order.orderNumber }}</div>
                    </div>
                    <div class="col-6 text-end">
                      <small class="text-muted">{{ 'order.total' | translate }}</small>
                      <div class="fw-bold text-primary">{{ order.total | currency }}</div>
                    </div>
                  </div>
                  <hr>
                  <div class="row">
                    <div class="col-6 text-start">
                      <small class="text-muted">{{ 'order.status' | translate }}</small>
                      <div>
                        <span class="badge bg-warning">{{ order.status }}</span>
                      </div>
                    </div>
                    <div class="col-6 text-end">
                      <small class="text-muted">{{ 'order.paymentStatus' | translate }}</small>
                      <div>
                        <span [class]="'badge ' + (order.paymentStatus === 'Paid' ? 'bg-success' : 'bg-secondary')">
                          {{ order.paymentStatus }}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>

                <div class="order-items text-start mb-4">
                  <h6>{{ 'checkout.orderItems' | translate }}</h6>
                  @for (item of order.items; track item.id) {
                    <div class="d-flex align-items-center py-2 border-bottom">
                      <img
                        [src]="item.productImageUrl || 'assets/images/placeholder.png'"
                        [alt]="item.productName"
                        class="rounded me-3"
                        style="width: 50px; height: 50px; object-fit: cover;">
                      <div class="flex-grow-1">
                        <div>{{ item.productName }}</div>
                        <small class="text-muted">{{ 'cart.quantity' | translate }}: {{ item.quantity }}</small>
                      </div>
                      <div>{{ item.total | currency }}</div>
                    </div>
                  }
                </div>

                <div class="shipping-info text-start mb-4">
                  <h6>{{ 'checkout.shippingAddress' | translate }}</h6>
                  <div class="text-muted">
                    {{ order.shippingAddress?.fullName }}<br>
                    {{ order.shippingAddress?.addressLine1 }}<br>
                    {{ order.shippingAddress?.city }}, {{ order.shippingAddress?.state }} {{ order.shippingAddress?.postalCode }}
                  </div>
                </div>
              }

              <div class="confirmation-message p-3 bg-info bg-opacity-10 rounded mb-4">
                <i class="fas fa-envelope me-2 text-info"></i>
                {{ 'checkout.success.emailSent' | translate }}
              </div>

              <div class="d-flex gap-3 justify-content-center">
                <a routerLink="/user/orders" class="btn btn-primary">
                  <i class="fas fa-list me-2"></i>
                  {{ 'checkout.success.viewOrders' | translate }}
                </a>
                <a routerLink="/products" class="btn btn-outline-primary">
                  {{ 'cart.continueShopping' | translate }}
                </a>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .success-icon {
      animation: scaleIn 0.5s ease-out;
    }

    @keyframes scaleIn {
      0% {
        transform: scale(0);
        opacity: 0;
      }
      50% {
        transform: scale(1.2);
      }
      100% {
        transform: scale(1);
        opacity: 1;
      }
    }

    .order-details {
      border: 1px solid var(--border-color);
    }
  `]
})
export class OrderSuccessComponent implements OnInit {
  private route = inject(ActivatedRoute);
  private orderService = inject(OrderService);

  order: Order | null = null;

  ngOnInit(): void {
    this.route.queryParams.subscribe(params => {
      const orderId = params['orderId'];
      if (orderId) {
        this.loadOrder(orderId);
      }
    });
  }

  private loadOrder(orderId: string): void {
    this.orderService.getOrder(orderId).subscribe({
      next: (order) => this.order = order,
      error: (err) => console.error('Error loading order:', err)
    });
  }
}
