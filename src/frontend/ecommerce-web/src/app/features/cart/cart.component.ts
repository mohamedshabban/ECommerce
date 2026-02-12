import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Router } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { TranslateModule } from '@ngx-translate/core';
import { CartService } from '../../core/services';
import { Cart, CartItem } from '../../core/models';

@Component({
  selector: 'app-cart',
  standalone: true,
  imports: [CommonModule, RouterModule, FormsModule, TranslateModule],
  template: `
    <div class="container py-4">
      <h2 class="mb-4">{{ 'cart.title' | translate }}</h2>

      @if (loading) {
        <div class="loading-spinner">
          <div class="spinner-border text-primary" role="status">
            <span class="visually-hidden">Loading...</span>
          </div>
        </div>
      } @else if (!cart || cart.items.length === 0) {
        <div class="empty-cart text-center py-5">
          <i class="fas fa-shopping-cart fa-4x text-muted mb-3"></i>
          <h4>{{ 'cart.empty' | translate }}</h4>
          <p class="text-muted">{{ 'cart.emptyDesc' | translate }}</p>
          <a routerLink="/products" class="btn btn-primary">
            {{ 'cart.continueShopping' | translate }}
          </a>
        </div>
      } @else {
        <div class="row">
          <!-- Cart Items -->
          <div class="col-lg-8">
            <div class="card mb-4">
              <div class="card-body">
                <div class="table-responsive">
                  <table class="table align-middle">
                    <thead>
                      <tr>
                        <th scope="col">{{ 'cart.product' | translate }}</th>
                        <th scope="col" class="text-center">{{ 'cart.price' | translate }}</th>
                        <th scope="col" class="text-center">{{ 'cart.quantity' | translate }}</th>
                        <th scope="col" class="text-center">{{ 'cart.total' | translate }}</th>
                        <th scope="col"></th>
                      </tr>
                    </thead>
                    <tbody>
                      @for (item of cart.items; track item.id) {
                        <tr>
                          <td>
                            <div class="d-flex align-items-center">
                              <img
                                [src]="item.productImageUrl || 'assets/images/placeholder.svg'"
                                [alt]="item.productName"
                                class="cart-item-image rounded me-3">
                              <div>
                                <a [routerLink]="['/products', item.productId]" class="text-decoration-none">
                                  <h6 class="mb-0">{{ item.productName }}</h6>
                                </a>
                                @if (item.productSku) {
                                  <small class="text-muted">SKU: {{ item.productSku }}</small>
                                }
                              </div>
                            </div>
                          </td>
                          <td class="text-center">
                            {{ item.price | currency }}
                          </td>
                          <td class="text-center">
                            <div class="quantity-selector d-inline-flex align-items-center">
                              <button
                                class="btn btn-outline-secondary btn-sm"
                                [disabled]="updatingItem === item.id"
                                (click)="updateQuantity(item, item.quantity - 1)">
                                <i class="fas fa-minus"></i>
                              </button>
                              <input
                                type="number"
                                class="form-control form-control-sm text-center mx-2"
                                [value]="item.quantity"
                                [min]="1"
                                style="width: 50px;"
                                (change)="onQuantityChange($event, item)">
                              <button
                                class="btn btn-outline-secondary btn-sm"
                                [disabled]="updatingItem === item.id"
                                (click)="updateQuantity(item, item.quantity + 1)">
                                <i class="fas fa-plus"></i>
                              </button>
                            </div>
                          </td>
                          <td class="text-center fw-semibold">
                            {{ item.total | currency }}
                          </td>
                          <td class="text-end">
                            <button
                              class="btn btn-link text-danger"
                              [disabled]="removingItem === item.id"
                              (click)="removeItem(item)">
                              @if (removingItem === item.id) {
                                <span class="spinner-border spinner-border-sm"></span>
                              } @else {
                                <i class="fas fa-trash"></i>
                              }
                            </button>
                          </td>
                        </tr>
                      }
                    </tbody>
                  </table>
                </div>

                <div class="d-flex justify-content-between align-items-center mt-3">
                  <a routerLink="/products" class="btn btn-outline-primary">
                    <i class="fas fa-arrow-left me-2"></i>
                    {{ 'cart.continueShopping' | translate }}
                  </a>
                  <button class="btn btn-outline-danger" (click)="clearCart()">
                    <i class="fas fa-trash me-2"></i>
                    {{ 'cart.clearCart' | translate }}
                  </button>
                </div>
              </div>
            </div>

            <!-- Coupon Code -->
            <div class="card">
              <div class="card-body">
                <h6 class="card-title">{{ 'cart.couponCode' | translate }}</h6>
                <div class="input-group">
                  <input
                    type="text"
                    class="form-control"
                    placeholder="{{ 'cart.enterCoupon' | translate }}"
                    [(ngModel)]="couponCode">
                  <button
                    class="btn btn-primary"
                    [disabled]="!couponCode || applyingCoupon"
                    (click)="applyCoupon()">
                    @if (applyingCoupon) {
                      <span class="spinner-border spinner-border-sm"></span>
                    } @else {
                      {{ 'cart.apply' | translate }}
                    }
                  </button>
                </div>
                @if (couponError) {
                  <div class="text-danger small mt-2">{{ couponError }}</div>
                }
                @if (couponApplied) {
                  <div class="text-success small mt-2">
                    <i class="fas fa-check-circle me-1"></i>
                    {{ 'cart.couponApplied' | translate }}
                  </div>
                }
              </div>
            </div>
          </div>

          <!-- Order Summary -->
          <div class="col-lg-4">
            <div class="card order-summary">
              <div class="card-header">
                <h5 class="mb-0">{{ 'cart.orderSummary' | translate }}</h5>
              </div>
              <div class="card-body">
                <div class="d-flex justify-content-between mb-2">
                  <span>{{ 'cart.subtotal' | translate }} ({{ cart.totalItems }} {{ 'cart.items' | translate }})</span>
                  <span>{{ cart.subTotal | currency }}</span>
                </div>
                @if (cart.discount && cart.discount > 0) {
                  <div class="d-flex justify-content-between mb-2 text-success">
                    <span>{{ 'cart.discount' | translate }}</span>
                    <span>-{{ cart.discount | currency }}</span>
                  </div>
                }
                <div class="d-flex justify-content-between mb-2">
                  <span>{{ 'cart.shipping' | translate }}</span>
                  <span>{{ cart.shippingCost ? (cart.shippingCost | currency) : 'Free' }}</span>
                </div>
                <hr>
                <div class="d-flex justify-content-between mb-3">
                  <strong>{{ 'cart.total' | translate }}</strong>
                  <strong class="text-primary fs-5">{{ getTotal() | currency }}</strong>
                </div>

                <button
                  class="btn btn-primary w-100 btn-lg"
                  [disabled]="cart.items.length === 0"
                  (click)="proceedToCheckout()">
                  {{ 'cart.checkout' | translate }}
                  <i class="fas fa-arrow-right ms-2"></i>
                </button>

                <!-- Payment Methods -->
                <div class="payment-methods mt-4 text-center">
                  <small class="text-muted d-block mb-2">{{ 'cart.acceptedPayments' | translate }}</small>
                  <div class="d-flex justify-content-center gap-2">
                    <i class="fab fa-cc-visa fa-2x text-muted"></i>
                    <i class="fab fa-cc-mastercard fa-2x text-muted"></i>
                    <i class="fab fa-cc-paypal fa-2x text-muted"></i>
                    <i class="fab fa-cc-amex fa-2x text-muted"></i>
                  </div>
                </div>
              </div>
            </div>

            <!-- Secure Shopping -->
            <div class="mt-3 text-center">
              <small class="text-muted">
                <i class="fas fa-lock me-1"></i>
                {{ 'cart.secureCheckout' | translate }}
              </small>
            </div>
          </div>
        </div>
      }
    </div>
  `,
  styles: [`
    .cart-item-image {
      width: 80px;
      height: 80px;
      object-fit: cover;
    }

    .quantity-selector input {
      -moz-appearance: textfield;
    }

    .quantity-selector input::-webkit-outer-spin-button,
    .quantity-selector input::-webkit-inner-spin-button {
      -webkit-appearance: none;
      margin: 0;
    }

    .order-summary {
      position: sticky;
      top: 80px;
    }

    .payment-methods i {
      opacity: 0.6;
    }
  `]
})
export class CartComponent implements OnInit {
  private cartService = inject(CartService);
  private router = inject(Router);

  cart: Cart | null = null;
  loading = true;
  updatingItem: string | null = null;
  removingItem: string | null = null;

  couponCode = '';
  applyingCoupon = false;
  couponError = '';
  couponApplied = false;

  ngOnInit(): void {
    this.loadCart();
  }

  private loadCart(): void {
    this.loading = true;
    this.cartService.getCart().subscribe({
      next: (cart) => {
        this.cart = cart;
        this.loading = false;
      },
      error: (err) => {
        console.error('Error loading cart:', err);
        this.loading = false;
      }
    });
  }

  onQuantityChange(event: Event, item: CartItem): void {
    const input = event.target as HTMLInputElement;
    const quantity = parseInt(input.value, 10);
    if (quantity > 0) {
      this.updateQuantity(item, quantity);
    }
  }

  updateQuantity(item: CartItem, quantity: number): void {
    if (quantity < 1) return;

    this.updatingItem = item.id;
    this.cartService.updateCartItem(item.id, quantity).subscribe({
      next: (cart) => {
        this.cart = cart;
        this.updatingItem = null;
      },
      error: (err) => {
        console.error('Error updating cart item:', err);
        this.updatingItem = null;
      }
    });
  }

  removeItem(item: CartItem): void {
    this.removingItem = item.id;
    this.cartService.removeFromCart(item.id).subscribe({
      next: (cart) => {
        this.cart = cart;
        this.removingItem = null;
      },
      error: (err) => {
        console.error('Error removing item:', err);
        this.removingItem = null;
      }
    });
  }

  clearCart(): void {
    if (confirm('Are you sure you want to clear your cart?')) {
      this.cartService.clearCart().subscribe({
        next: () => {
          this.cart = null;
        },
        error: (err) => console.error('Error clearing cart:', err)
      });
    }
  }

  applyCoupon(): void {
    if (!this.couponCode) return;

    this.applyingCoupon = true;
    this.couponError = '';

    this.cartService.applyCoupon(this.couponCode).subscribe({
      next: (cart) => {
        this.cart = cart;
        this.couponApplied = true;
        this.applyingCoupon = false;
      },
      error: (err) => {
        this.couponError = err.error?.message || 'Invalid coupon code';
        this.applyingCoupon = false;
      }
    });
  }

  getTotal(): number {
    if (!this.cart) return 0;
    return this.cart.subTotal - (this.cart.discount || 0) + (this.cart.shippingCost || 0);
  }

  proceedToCheckout(): void {
    this.router.navigate(['/checkout']);
  }
}
