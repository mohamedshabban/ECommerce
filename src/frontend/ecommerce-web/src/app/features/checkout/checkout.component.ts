import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Router } from '@angular/router';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { TranslateModule } from '@ngx-translate/core';
import { CartService, OrderService, AuthService } from '../../core/services';
import { Cart, Address, PaymentMethod } from '../../core/models';

@Component({
  selector: 'app-checkout',
  standalone: true,
  imports: [CommonModule, RouterModule, ReactiveFormsModule, TranslateModule],
  template: `
    <div class="container py-4">
      <h2 class="mb-4">{{ 'checkout.title' | translate }}</h2>

      @if (loading) {
        <div class="loading-spinner">
          <div class="spinner-border text-primary" role="status">
            <span class="visually-hidden">Loading...</span>
          </div>
        </div>
      } @else if (!cart || cart.items.length === 0) {
        <div class="text-center py-5">
          <i class="fas fa-shopping-cart fa-4x text-muted mb-3"></i>
          <h4>{{ 'checkout.emptyCart' | translate }}</h4>
          <a routerLink="/products" class="btn btn-primary mt-3">
            {{ 'cart.continueShopping' | translate }}
          </a>
        </div>
      } @else {
        <!-- Checkout Steps -->
        <div class="checkout-steps mb-4">
          <div class="step" [class.active]="currentStep >= 1" [class.completed]="currentStep > 1">
            <div class="step-number">1</div>
            <span>{{ 'checkout.steps.shipping' | translate }}</span>
          </div>
          <div class="step-line" [class.active]="currentStep > 1"></div>
          <div class="step" [class.active]="currentStep >= 2" [class.completed]="currentStep > 2">
            <div class="step-number">2</div>
            <span>{{ 'checkout.steps.payment' | translate }}</span>
          </div>
          <div class="step-line" [class.active]="currentStep > 2"></div>
          <div class="step" [class.active]="currentStep >= 3">
            <div class="step-number">3</div>
            <span>{{ 'checkout.steps.review' | translate }}</span>
          </div>
        </div>

        <div class="row">
          <div class="col-lg-8">
            <!-- Step 1: Shipping Address -->
            @if (currentStep === 1) {
              <div class="card mb-4">
                <div class="card-header">
                  <h5 class="mb-0">{{ 'checkout.shippingAddress' | translate }}</h5>
                </div>
                <div class="card-body">
                  <!-- Saved Addresses -->
                  @if (savedAddresses.length > 0) {
                    <div class="saved-addresses mb-4">
                      <h6>{{ 'checkout.savedAddresses' | translate }}</h6>
                      <div class="row g-3">
                        @for (address of savedAddresses; track address.id) {
                          <div class="col-md-6">
                            <div
                              class="address-card p-3 border rounded cursor-pointer"
                              [class.selected]="selectedAddressId === address.id"
                              (click)="selectAddress(address)">
                              <div class="d-flex justify-content-between">
                                <strong>{{ address.fullName }}</strong>
                                @if (address.isDefault) {
                                  <span class="badge bg-primary">{{ 'address.default' | translate }}</span>
                                }
                              </div>
                              <div class="text-muted small">
                                {{ address.addressLine1 }}<br>
                                @if (address.addressLine2) {
                                  {{ address.addressLine2 }}<br>
                                }
                                {{ address.city }}, {{ address.state }} {{ address.postalCode }}<br>
                                {{ address.country }}
                              </div>
                              <div class="mt-2">
                                <i class="fas fa-phone me-1"></i> {{ address.phone }}
                              </div>
                            </div>
                          </div>
                        }
                      </div>
                      <div class="mt-3">
                        <button class="btn btn-outline-primary btn-sm" (click)="showNewAddressForm = !showNewAddressForm">
                          <i class="fas fa-plus me-1"></i>
                          {{ 'checkout.addNewAddress' | translate }}
                        </button>
                      </div>
                    </div>
                  }

                  <!-- New Address Form -->
                  @if (savedAddresses.length === 0 || showNewAddressForm) {
                    <form [formGroup]="addressForm">
                      <div class="row g-3">
                        <div class="col-md-6">
                          <label class="form-label">{{ 'address.fullName' | translate }}</label>
                          <input type="text" class="form-control" formControlName="fullName">
                        </div>
                        <div class="col-md-6">
                          <label class="form-label">{{ 'address.phone' | translate }}</label>
                          <input type="tel" class="form-control" formControlName="phone">
                        </div>
                        <div class="col-12">
                          <label class="form-label">{{ 'address.addressLine1' | translate }}</label>
                          <input type="text" class="form-control" formControlName="addressLine1">
                        </div>
                        <div class="col-12">
                          <label class="form-label">{{ 'address.addressLine2' | translate }}</label>
                          <input type="text" class="form-control" formControlName="addressLine2">
                        </div>
                        <div class="col-md-6">
                          <label class="form-label">{{ 'address.city' | translate }}</label>
                          <input type="text" class="form-control" formControlName="city">
                        </div>
                        <div class="col-md-3">
                          <label class="form-label">{{ 'address.state' | translate }}</label>
                          <input type="text" class="form-control" formControlName="state">
                        </div>
                        <div class="col-md-3">
                          <label class="form-label">{{ 'address.postalCode' | translate }}</label>
                          <input type="text" class="form-control" formControlName="postalCode">
                        </div>
                        <div class="col-md-6">
                          <label class="form-label">{{ 'address.country' | translate }}</label>
                          <select class="form-select" formControlName="country">
                            <option value="US">United States</option>
                            <option value="EG">Egypt</option>
                            <option value="SA">Saudi Arabia</option>
                            <option value="AE">United Arab Emirates</option>
                          </select>
                        </div>
                        <div class="col-12">
                          <div class="form-check">
                            <input type="checkbox" class="form-check-input" formControlName="saveAddress" id="saveAddress">
                            <label class="form-check-label" for="saveAddress">
                              {{ 'checkout.saveAddress' | translate }}
                            </label>
                          </div>
                        </div>
                      </div>
                    </form>
                  }

                  <div class="mt-4 d-flex justify-content-between">
                    <a routerLink="/cart" class="btn btn-outline-secondary">
                      <i class="fas fa-arrow-left me-2"></i>
                      {{ 'checkout.backToCart' | translate }}
                    </a>
                    <button
                      class="btn btn-primary"
                      [disabled]="!canProceedToPayment()"
                      (click)="currentStep = 2">
                      {{ 'checkout.continueToPayment' | translate }}
                      <i class="fas fa-arrow-right ms-2"></i>
                    </button>
                  </div>
                </div>
              </div>
            }

            <!-- Step 2: Payment Method -->
            @if (currentStep === 2) {
              <div class="card mb-4">
                <div class="card-header">
                  <h5 class="mb-0">{{ 'checkout.paymentMethod' | translate }}</h5>
                </div>
                <div class="card-body">
                  <div class="payment-methods">
                    <div
                      class="payment-option p-3 border rounded mb-3 cursor-pointer"
                      [class.selected]="selectedPaymentMethod === 'PayPal'"
                      (click)="selectedPaymentMethod = 'PayPal'">
                      <div class="d-flex align-items-center">
                        <input type="radio" name="payment" [checked]="selectedPaymentMethod === 'PayPal'" class="me-3">
                        <i class="fab fa-paypal fa-2x text-primary me-3"></i>
                        <div>
                          <strong>PayPal</strong>
                          <div class="text-muted small">{{ 'checkout.paypalDesc' | translate }}</div>
                        </div>
                      </div>
                    </div>

                    <div
                      class="payment-option p-3 border rounded mb-3 cursor-pointer"
                      [class.selected]="selectedPaymentMethod === 'CreditCard'"
                      (click)="selectedPaymentMethod = 'CreditCard'">
                      <div class="d-flex align-items-center">
                        <input type="radio" name="payment" [checked]="selectedPaymentMethod === 'CreditCard'" class="me-3">
                        <i class="fas fa-credit-card fa-2x text-secondary me-3"></i>
                        <div>
                          <strong>{{ 'checkout.creditCard' | translate }}</strong>
                          <div class="text-muted small">{{ 'checkout.creditCardDesc' | translate }}</div>
                        </div>
                      </div>
                    </div>

                    <div
                      class="payment-option p-3 border rounded cursor-pointer"
                      [class.selected]="selectedPaymentMethod === 'CashOnDelivery'"
                      (click)="selectedPaymentMethod = 'CashOnDelivery'">
                      <div class="d-flex align-items-center">
                        <input type="radio" name="payment" [checked]="selectedPaymentMethod === 'CashOnDelivery'" class="me-3">
                        <i class="fas fa-money-bill-wave fa-2x text-success me-3"></i>
                        <div>
                          <strong>{{ 'checkout.cashOnDelivery' | translate }}</strong>
                          <div class="text-muted small">{{ 'checkout.codDesc' | translate }}</div>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div class="mt-4 d-flex justify-content-between">
                    <button class="btn btn-outline-secondary" (click)="currentStep = 1">
                      <i class="fas fa-arrow-left me-2"></i>
                      {{ 'checkout.back' | translate }}
                    </button>
                    <button
                      class="btn btn-primary"
                      [disabled]="!selectedPaymentMethod"
                      (click)="currentStep = 3">
                      {{ 'checkout.reviewOrder' | translate }}
                      <i class="fas fa-arrow-right ms-2"></i>
                    </button>
                  </div>
                </div>
              </div>
            }

            <!-- Step 3: Review Order -->
            @if (currentStep === 3) {
              <div class="card mb-4">
                <div class="card-header">
                  <h5 class="mb-0">{{ 'checkout.reviewOrder' | translate }}</h5>
                </div>
                <div class="card-body">
                  <!-- Shipping Address Summary -->
                  <div class="mb-4">
                    <div class="d-flex justify-content-between">
                      <h6>{{ 'checkout.shippingAddress' | translate }}</h6>
                      <button class="btn btn-link btn-sm" (click)="currentStep = 1">
                        {{ 'common.edit' | translate }}
                      </button>
                    </div>
                    <div class="text-muted">
                      {{ getSelectedAddress()?.fullName }}<br>
                      {{ getSelectedAddress()?.addressLine1 }}<br>
                      {{ getSelectedAddress()?.city }}, {{ getSelectedAddress()?.state }} {{ getSelectedAddress()?.postalCode }}
                    </div>
                  </div>

                  <!-- Payment Method Summary -->
                  <div class="mb-4">
                    <div class="d-flex justify-content-between">
                      <h6>{{ 'checkout.paymentMethod' | translate }}</h6>
                      <button class="btn btn-link btn-sm" (click)="currentStep = 2">
                        {{ 'common.edit' | translate }}
                      </button>
                    </div>
                    <div class="text-muted">{{ selectedPaymentMethod }}</div>
                  </div>

                  <!-- Order Items -->
                  <div class="mb-4">
                    <h6>{{ 'checkout.orderItems' | translate }}</h6>
                    @for (item of cart.items; track item.id) {
                      <div class="d-flex align-items-center py-2 border-bottom">
                        <img
                          [src]="item.productImageUrl || 'assets/images/placeholder.png'"
                          [alt]="item.productName"
                          class="rounded me-3"
                          style="width: 60px; height: 60px; object-fit: cover;">
                        <div class="flex-grow-1">
                          <div>{{ item.productName }}</div>
                          <small class="text-muted">{{ 'cart.quantity' | translate }}: {{ item.quantity }}</small>
                        </div>
                        <div class="fw-semibold">{{ item.total | currency }}</div>
                      </div>
                    }
                  </div>

                  @if (orderError) {
                    <div class="alert alert-danger">{{ orderError }}</div>
                  }

                  <div class="mt-4 d-flex justify-content-between">
                    <button class="btn btn-outline-secondary" (click)="currentStep = 2">
                      <i class="fas fa-arrow-left me-2"></i>
                      {{ 'checkout.back' | translate }}
                    </button>
                    <button
                      class="btn btn-success btn-lg"
                      [disabled]="placingOrder"
                      (click)="placeOrder()">
                      @if (placingOrder) {
                        <span class="spinner-border spinner-border-sm me-2"></span>
                      }
                      {{ 'checkout.placeOrder' | translate }}
                    </button>
                  </div>
                </div>
              </div>
            }
          </div>

          <!-- Order Summary Sidebar -->
          <div class="col-lg-4">
            <div class="card order-summary">
              <div class="card-header">
                <h5 class="mb-0">{{ 'cart.orderSummary' | translate }}</h5>
              </div>
              <div class="card-body">
                @for (item of cart.items; track item.id) {
                  <div class="d-flex justify-content-between mb-2">
                    <span>{{ item.productName }} x {{ item.quantity }}</span>
                    <span>{{ item.total | currency }}</span>
                  </div>
                }
                <hr>
                <div class="d-flex justify-content-between mb-2">
                  <span>{{ 'cart.subtotal' | translate }}</span>
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
                <div class="d-flex justify-content-between">
                  <strong>{{ 'cart.total' | translate }}</strong>
                  <strong class="text-primary fs-5">{{ getTotal() | currency }}</strong>
                </div>
              </div>
            </div>
          </div>
        </div>
      }
    </div>
  `,
  styles: [`
    .checkout-steps {
      display: flex;
      align-items: center;
      justify-content: center;
    }

    .step {
      display: flex;
      align-items: center;
      gap: 0.5rem;
      color: var(--text-secondary);
    }

    .step.active {
      color: var(--primary-color);
    }

    .step.completed .step-number {
      background: var(--success-color);
    }

    .step-number {
      width: 32px;
      height: 32px;
      border-radius: 50%;
      background: var(--border-color);
      display: flex;
      align-items: center;
      justify-content: center;
      font-weight: bold;
      color: white;
    }

    .step.active .step-number {
      background: var(--primary-color);
    }

    .step-line {
      flex: 0 0 80px;
      height: 2px;
      background: var(--border-color);
      margin: 0 1rem;
    }

    .step-line.active {
      background: var(--primary-color);
    }

    .address-card.selected,
    .payment-option.selected {
      border-color: var(--primary-color) !important;
      background: rgba(37, 99, 235, 0.05);
    }

    .cursor-pointer {
      cursor: pointer;
    }

    .order-summary {
      position: sticky;
      top: 80px;
    }
  `]
})
export class CheckoutComponent implements OnInit {
  private fb = inject(FormBuilder);
  private cartService = inject(CartService);
  private orderService = inject(OrderService);
  private authService = inject(AuthService);
  private router = inject(Router);

  cart: Cart | null = null;
  savedAddresses: Address[] = [];
  loading = true;
  currentStep = 1;

  selectedAddressId: string | null = null;
  showNewAddressForm = false;
  addressForm: FormGroup;

  selectedPaymentMethod: PaymentMethod | null = null;

  placingOrder = false;
  orderError = '';

  constructor() {
    this.addressForm = this.fb.group({
      fullName: ['', Validators.required],
      phone: ['', Validators.required],
      addressLine1: ['', Validators.required],
      addressLine2: [''],
      city: ['', Validators.required],
      state: ['', Validators.required],
      postalCode: ['', Validators.required],
      country: ['US', Validators.required],
      saveAddress: [true]
    });
  }

  ngOnInit(): void {
    this.loadData();
  }

  private loadData(): void {
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

    this.orderService.getUserAddresses().subscribe({
      next: (addresses) => {
        this.savedAddresses = addresses;
        const defaultAddress = addresses.find(a => a.isDefault);
        if (defaultAddress) {
          this.selectedAddressId = defaultAddress.id;
        }
      },
      error: (err) => console.error('Error loading addresses:', err)
    });
  }

  selectAddress(address: Address): void {
    this.selectedAddressId = address.id;
    this.showNewAddressForm = false;
  }

  getSelectedAddress(): Address | null {
    if (this.selectedAddressId) {
      return this.savedAddresses.find(a => a.id === this.selectedAddressId) || null;
    }
    if (this.addressForm.valid) {
      return this.addressForm.value;
    }
    return null;
  }

  canProceedToPayment(): boolean {
    return this.selectedAddressId !== null || this.addressForm.valid;
  }

  getTotal(): number {
    if (!this.cart) return 0;
    return this.cart.subTotal - (this.cart.discount || 0) + (this.cart.shippingCost || 0);
  }

  placeOrder(): void {
    if (!this.cart || !this.selectedPaymentMethod) return;

    this.placingOrder = true;
    this.orderError = '';

    const orderData = {
      shippingAddressId: this.selectedAddressId,
      shippingAddress: this.selectedAddressId ? undefined : this.addressForm.value,
      paymentMethod: this.selectedPaymentMethod
    };

    this.orderService.createOrder(orderData).subscribe({
      next: (response) => {
        if (this.selectedPaymentMethod === 'PayPal' && response.paypalApprovalUrl) {
          // Redirect to PayPal for payment
          window.location.href = response.paypalApprovalUrl;
        } else {
          // Redirect to success page
          this.router.navigate(['/checkout/success'], {
            queryParams: { orderId: response.orderId }
          });
        }
      },
      error: (err) => {
        console.error('Error placing order:', err);
        this.orderError = err.error?.message || 'Failed to place order. Please try again.';
        this.placingOrder = false;
      }
    });
  }
}
