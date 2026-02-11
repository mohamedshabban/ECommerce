import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { TranslateModule } from '@ngx-translate/core';
import { OrderService } from '../../../core/services';
import { Address } from '../../../core/models';

@Component({
  selector: 'app-addresses',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, TranslateModule],
  template: `
    <div class="container py-4">
      <div class="d-flex justify-content-between align-items-center mb-4">
        <h2>{{ 'user.myAddresses' | translate }}</h2>
        <button class="btn btn-primary" (click)="showAddForm()">
          <i class="fas fa-plus me-2"></i>
          {{ 'address.addNew' | translate }}
        </button>
      </div>

      @if (loading) {
        <div class="loading-spinner">
          <div class="spinner-border text-primary" role="status">
            <span class="visually-hidden">Loading...</span>
          </div>
        </div>
      } @else {
        <!-- Address Form Modal -->
        @if (showForm) {
          <div class="card mb-4">
            <div class="card-header">
              <h5 class="mb-0">{{ editingAddress ? ('address.edit' | translate) : ('address.addNew' | translate) }}</h5>
            </div>
            <div class="card-body">
              <form [formGroup]="addressForm" (ngSubmit)="saveAddress()">
                <div class="row g-3">
                  <div class="col-md-6">
                    <label class="form-label">{{ 'address.fullName' | translate }}</label>
                    <input type="text" class="form-control" formControlName="fullName"
                      [class.is-invalid]="addressForm.get('fullName')?.invalid && addressForm.get('fullName')?.touched">
                  </div>
                  <div class="col-md-6">
                    <label class="form-label">{{ 'address.phone' | translate }}</label>
                    <input type="tel" class="form-control" formControlName="phone"
                      [class.is-invalid]="addressForm.get('phone')?.invalid && addressForm.get('phone')?.touched">
                  </div>
                  <div class="col-12">
                    <label class="form-label">{{ 'address.addressLine1' | translate }}</label>
                    <input type="text" class="form-control" formControlName="addressLine1"
                      [class.is-invalid]="addressForm.get('addressLine1')?.invalid && addressForm.get('addressLine1')?.touched">
                  </div>
                  <div class="col-12">
                    <label class="form-label">{{ 'address.addressLine2' | translate }}</label>
                    <input type="text" class="form-control" formControlName="addressLine2">
                  </div>
                  <div class="col-md-6">
                    <label class="form-label">{{ 'address.city' | translate }}</label>
                    <input type="text" class="form-control" formControlName="city"
                      [class.is-invalid]="addressForm.get('city')?.invalid && addressForm.get('city')?.touched">
                  </div>
                  <div class="col-md-3">
                    <label class="form-label">{{ 'address.state' | translate }}</label>
                    <input type="text" class="form-control" formControlName="state"
                      [class.is-invalid]="addressForm.get('state')?.invalid && addressForm.get('state')?.touched">
                  </div>
                  <div class="col-md-3">
                    <label class="form-label">{{ 'address.postalCode' | translate }}</label>
                    <input type="text" class="form-control" formControlName="postalCode"
                      [class.is-invalid]="addressForm.get('postalCode')?.invalid && addressForm.get('postalCode')?.touched">
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
                  <div class="col-md-6">
                    <div class="form-check mt-4">
                      <input type="checkbox" class="form-check-input" formControlName="isDefault" id="isDefault">
                      <label class="form-check-label" for="isDefault">
                        {{ 'address.setDefault' | translate }}
                      </label>
                    </div>
                  </div>
                </div>

                <div class="mt-4 d-flex gap-2">
                  <button type="submit" class="btn btn-primary" [disabled]="addressForm.invalid || saving">
                    @if (saving) {
                      <span class="spinner-border spinner-border-sm me-2"></span>
                    }
                    {{ 'common.save' | translate }}
                  </button>
                  <button type="button" class="btn btn-outline-secondary" (click)="cancelForm()">
                    {{ 'common.cancel' | translate }}
                  </button>
                </div>
              </form>
            </div>
          </div>
        }

        <!-- Addresses List -->
        @if (addresses.length === 0 && !showForm) {
          <div class="text-center py-5">
            <i class="fas fa-map-marker-alt fa-4x text-muted mb-3"></i>
            <h4>{{ 'address.noAddresses' | translate }}</h4>
            <p class="text-muted">{{ 'address.noAddressesDesc' | translate }}</p>
          </div>
        } @else {
          <div class="row g-4">
            @for (address of addresses; track address.id) {
              <div class="col-md-6">
                <div class="card h-100" [class.border-primary]="address.isDefault">
                  <div class="card-body">
                    <div class="d-flex justify-content-between align-items-start mb-2">
                      <h6 class="mb-0">{{ address.fullName }}</h6>
                      @if (address.isDefault) {
                        <span class="badge bg-primary">{{ 'address.default' | translate }}</span>
                      }
                    </div>
                    <div class="text-muted">
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
                  <div class="card-footer bg-transparent">
                    <div class="d-flex gap-2">
                      <button class="btn btn-outline-primary btn-sm" (click)="editAddress(address)">
                        <i class="fas fa-edit me-1"></i> {{ 'common.edit' | translate }}
                      </button>
                      @if (!address.isDefault) {
                        <button class="btn btn-outline-secondary btn-sm" (click)="setAsDefault(address)">
                          {{ 'address.setDefault' | translate }}
                        </button>
                      }
                      <button class="btn btn-outline-danger btn-sm" (click)="deleteAddress(address)">
                        <i class="fas fa-trash me-1"></i>
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            }
          </div>
        }
      }
    </div>
  `,
  styles: [`
    .loading-spinner {
      min-height: 300px;
    }
  `]
})
export class AddressesComponent implements OnInit {
  private fb = inject(FormBuilder);
  private orderService = inject(OrderService);

  addresses: Address[] = [];
  loading = true;
  showForm = false;
  editingAddress: Address | null = null;
  saving = false;

  addressForm: FormGroup;

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
      isDefault: [false]
    });
  }

  ngOnInit(): void {
    this.loadAddresses();
  }

  private loadAddresses(): void {
    this.loading = true;
    this.orderService.getUserAddresses().subscribe({
      next: (addresses) => {
        this.addresses = addresses;
        this.loading = false;
      },
      error: (err) => {
        console.error('Error loading addresses:', err);
        this.loading = false;
      }
    });
  }

  showAddForm(): void {
    this.editingAddress = null;
    this.addressForm.reset({ country: 'US', isDefault: false });
    this.showForm = true;
  }

  editAddress(address: Address): void {
    this.editingAddress = address;
    this.addressForm.patchValue(address);
    this.showForm = true;
  }

  cancelForm(): void {
    this.showForm = false;
    this.editingAddress = null;
    this.addressForm.reset();
  }

  saveAddress(): void {
    if (this.addressForm.invalid) return;

    this.saving = true;
    const addressData = this.addressForm.value;

    const request = this.editingAddress
      ? this.orderService.updateAddress(this.editingAddress.id, addressData)
      : this.orderService.addAddress(addressData);

    request.subscribe({
      next: () => {
        this.loadAddresses();
        this.cancelForm();
        this.saving = false;
      },
      error: (err) => {
        console.error('Error saving address:', err);
        this.saving = false;
      }
    });
  }

  setAsDefault(address: Address): void {
    this.orderService.setDefaultAddress(address.id).subscribe({
      next: () => this.loadAddresses(),
      error: (err) => console.error('Error setting default address:', err)
    });
  }

  deleteAddress(address: Address): void {
    if (!confirm('Are you sure you want to delete this address?')) return;

    this.orderService.deleteAddress(address.id).subscribe({
      next: () => {
        this.addresses = this.addresses.filter(a => a.id !== address.id);
      },
      error: (err) => console.error('Error deleting address:', err)
    });
  }
}
