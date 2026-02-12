import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { TranslateModule } from '@ngx-translate/core';
import { AuthService } from '../../../core/services';
import { User } from '../../../core/models';

@Component({
  selector: 'app-profile',
  standalone: true,
  imports: [CommonModule, RouterModule, ReactiveFormsModule, TranslateModule],
  template: `
    <div class="container py-4">
      <div class="row">
        <!-- Sidebar -->
        <div class="col-lg-3 mb-4">
          <div class="card">
            <div class="card-body text-center">
              <div class="avatar mb-3">
                <img
                  [src]="user?.avatarUrl || 'assets/images/avatar-placeholder.svg'"
                  alt="Avatar"
                  class="rounded-circle">
              </div>
              <h5 class="mb-1">{{ user?.firstName }} {{ user?.lastName }}</h5>
              <p class="text-muted small">{{ user?.email }}</p>
              <span class="badge bg-primary">{{ user?.role }}</span>
            </div>
            <ul class="list-group list-group-flush">
              <a routerLink="/user/profile" routerLinkActive="active" class="list-group-item list-group-item-action">
                <i class="fas fa-user me-2"></i> {{ 'user.profile' | translate }}
              </a>
              <a routerLink="/user/orders" routerLinkActive="active" class="list-group-item list-group-item-action">
                <i class="fas fa-shopping-bag me-2"></i> {{ 'user.orders' | translate }}
              </a>
              <a routerLink="/user/addresses" routerLinkActive="active" class="list-group-item list-group-item-action">
                <i class="fas fa-map-marker-alt me-2"></i> {{ 'user.addresses' | translate }}
              </a>
              <button class="list-group-item list-group-item-action text-danger" (click)="logout()">
                <i class="fas fa-sign-out-alt me-2"></i> {{ 'auth.logout' | translate }}
              </button>
            </ul>
          </div>
        </div>

        <!-- Main Content -->
        <div class="col-lg-9">
          <div class="card">
            <div class="card-header">
              <h5 class="mb-0">{{ 'user.profileSettings' | translate }}</h5>
            </div>
            <div class="card-body">
              @if (successMessage) {
                <div class="alert alert-success">{{ successMessage }}</div>
              }
              @if (errorMessage) {
                <div class="alert alert-danger">{{ errorMessage }}</div>
              }

              <form [formGroup]="profileForm" (ngSubmit)="updateProfile()">
                <div class="row g-3">
                  <div class="col-md-6">
                    <label class="form-label">{{ 'auth.firstName' | translate }}</label>
                    <input type="text" class="form-control" formControlName="firstName">
                  </div>
                  <div class="col-md-6">
                    <label class="form-label">{{ 'auth.lastName' | translate }}</label>
                    <input type="text" class="form-control" formControlName="lastName">
                  </div>
                  <div class="col-md-6">
                    <label class="form-label">{{ 'auth.email' | translate }}</label>
                    <input type="email" class="form-control" formControlName="email" readonly>
                  </div>
                  <div class="col-md-6">
                    <label class="form-label">{{ 'auth.phone' | translate }}</label>
                    <input type="tel" class="form-control" formControlName="phone">
                  </div>
                </div>

                <div class="mt-4">
                  <button type="submit" class="btn btn-primary" [disabled]="profileForm.invalid || saving">
                    @if (saving) {
                      <span class="spinner-border spinner-border-sm me-2"></span>
                    }
                    {{ 'common.save' | translate }}
                  </button>
                </div>
              </form>
            </div>
          </div>

          <!-- Change Password -->
          <div class="card mt-4">
            <div class="card-header">
              <h5 class="mb-0">{{ 'user.changePassword' | translate }}</h5>
            </div>
            <div class="card-body">
              <form [formGroup]="passwordForm" (ngSubmit)="changePassword()">
                <div class="row g-3">
                  <div class="col-md-4">
                    <label class="form-label">{{ 'user.currentPassword' | translate }}</label>
                    <input type="password" class="form-control" formControlName="currentPassword">
                  </div>
                  <div class="col-md-4">
                    <label class="form-label">{{ 'user.newPassword' | translate }}</label>
                    <input type="password" class="form-control" formControlName="newPassword">
                  </div>
                  <div class="col-md-4">
                    <label class="form-label">{{ 'user.confirmNewPassword' | translate }}</label>
                    <input type="password" class="form-control" formControlName="confirmPassword">
                  </div>
                </div>

                <div class="mt-4">
                  <button type="submit" class="btn btn-outline-primary" [disabled]="passwordForm.invalid || changingPassword">
                    @if (changingPassword) {
                      <span class="spinner-border spinner-border-sm me-2"></span>
                    }
                    {{ 'user.updatePassword' | translate }}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .avatar img {
      width: 100px;
      height: 100px;
      object-fit: cover;
    }

    .list-group-item.active {
      background-color: var(--primary-color);
      border-color: var(--primary-color);
    }
  `]
})
export class ProfileComponent implements OnInit {
  private fb = inject(FormBuilder);
  private authService = inject(AuthService);

  user: User | null = null;
  profileForm: FormGroup;
  passwordForm: FormGroup;

  saving = false;
  changingPassword = false;
  successMessage = '';
  errorMessage = '';

  constructor() {
    this.profileForm = this.fb.group({
      firstName: ['', Validators.required],
      lastName: ['', Validators.required],
      email: ['', [Validators.required, Validators.email]],
      phone: ['']
    });

    this.passwordForm = this.fb.group({
      currentPassword: ['', Validators.required],
      newPassword: ['', [Validators.required, Validators.minLength(6)]],
      confirmPassword: ['', Validators.required]
    });
  }

  ngOnInit(): void {
    this.user = this.authService.currentUser();
    if (this.user) {
      this.profileForm.patchValue({
        firstName: this.user.firstName,
        lastName: this.user.lastName,
        email: this.user.email,
        phone: this.user.phone
      });
    }
  }

  updateProfile(): void {
    if (this.profileForm.invalid) return;

    this.saving = true;
    this.successMessage = '';
    this.errorMessage = '';

    this.authService.updateProfile(this.profileForm.value).subscribe({
      next: (user) => {
        this.user = user;
        this.successMessage = 'Profile updated successfully';
        this.saving = false;
      },
      error: (err) => {
        this.errorMessage = err.error?.message || 'Failed to update profile';
        this.saving = false;
      }
    });
  }

  changePassword(): void {
    if (this.passwordForm.invalid) return;

    const { newPassword, confirmPassword } = this.passwordForm.value;
    if (newPassword !== confirmPassword) {
      this.errorMessage = 'Passwords do not match';
      return;
    }

    this.changingPassword = true;
    this.successMessage = '';
    this.errorMessage = '';

    this.authService.changePassword(this.passwordForm.value).subscribe({
      next: () => {
        this.successMessage = 'Password changed successfully';
        this.passwordForm.reset();
        this.changingPassword = false;
      },
      error: (err) => {
        this.errorMessage = err.error?.message || 'Failed to change password';
        this.changingPassword = false;
      }
    });
  }

  logout(): void {
    this.authService.logout();
  }
}
