import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { TranslateModule } from '@ngx-translate/core';
import { AuthService } from '../../../core/services';

@Component({
  selector: 'app-forgot-password',
  standalone: true,
  imports: [CommonModule, RouterModule, ReactiveFormsModule, TranslateModule],
  template: `
    <div class="auth-container">
      <div class="auth-card">
        <div class="text-center mb-4">
          <div class="icon-circle mb-3">
            <i class="fas fa-lock fa-2x text-primary"></i>
          </div>
          <h2 class="fw-bold">{{ 'auth.forgotPassword.title' | translate }}</h2>
          <p class="text-muted">{{ 'auth.forgotPassword.subtitle' | translate }}</p>
        </div>

        @if (errorMessage) {
          <div class="alert alert-danger" role="alert">
            {{ errorMessage }}
          </div>
        }

        @if (successMessage) {
          <div class="alert alert-success" role="alert">
            {{ successMessage }}
          </div>
        }

        @if (!emailSent) {
          <form [formGroup]="forgotPasswordForm" (ngSubmit)="onSubmit()">
            <div class="mb-4">
              <label for="email" class="form-label">{{ 'auth.email' | translate }}</label>
              <input
                type="email"
                class="form-control"
                id="email"
                formControlName="email"
                placeholder="name@example.com"
                [class.is-invalid]="forgotPasswordForm.get('email')?.invalid && forgotPasswordForm.get('email')?.touched">
              @if (forgotPasswordForm.get('email')?.invalid && forgotPasswordForm.get('email')?.touched) {
                <div class="invalid-feedback">
                  {{ 'auth.validation.emailInvalid' | translate }}
                </div>
              }
            </div>

            <button
              type="submit"
              class="btn btn-primary w-100 mb-3"
              [disabled]="forgotPasswordForm.invalid || loading">
              @if (loading) {
                <span class="spinner-border spinner-border-sm me-2" role="status"></span>
              }
              {{ 'auth.forgotPassword.submit' | translate }}
            </button>
          </form>
        } @else {
          <div class="text-center">
            <i class="fas fa-envelope-open-text fa-3x text-success mb-3"></i>
            <p>{{ 'auth.forgotPassword.checkEmail' | translate }}</p>
            <button class="btn btn-outline-primary" (click)="resetForm()">
              {{ 'auth.forgotPassword.tryAgain' | translate }}
            </button>
          </div>
        }

        <p class="text-center mt-4 mb-0">
          <a routerLink="/auth/login" class="text-decoration-none">
            <i class="fas fa-arrow-left me-2"></i>
            {{ 'auth.forgotPassword.backToLogin' | translate }}
          </a>
        </p>
      </div>
    </div>
  `,
  styles: [`
    .auth-container {
      min-height: calc(100vh - 200px);
      display: flex;
      align-items: center;
      justify-content: center;
      padding: 2rem;
    }

    .auth-card {
      background: var(--bg-primary);
      border: 1px solid var(--border-color);
      border-radius: 12px;
      padding: 2rem;
      width: 100%;
      max-width: 420px;
      box-shadow: 0 4px 20px rgba(0, 0, 0, 0.08);
    }

    .icon-circle {
      width: 80px;
      height: 80px;
      border-radius: 50%;
      background: var(--bg-secondary);
      display: flex;
      align-items: center;
      justify-content: center;
      margin: 0 auto;
    }
  `]
})
export class ForgotPasswordComponent {
  private fb = inject(FormBuilder);
  private authService = inject(AuthService);

  forgotPasswordForm: FormGroup;
  loading = false;
  errorMessage = '';
  successMessage = '';
  emailSent = false;

  constructor() {
    this.forgotPasswordForm = this.fb.group({
      email: ['', [Validators.required, Validators.email]]
    });
  }

  onSubmit(): void {
    if (this.forgotPasswordForm.invalid) return;

    this.loading = true;
    this.errorMessage = '';

    this.authService.forgotPassword(this.forgotPasswordForm.value.email).subscribe({
      next: () => {
        this.loading = false;
        this.emailSent = true;
        this.successMessage = 'Password reset instructions have been sent to your email.';
      },
      error: (err) => {
        this.loading = false;
        this.errorMessage = err.error?.message || 'Failed to send reset email. Please try again.';
      }
    });
  }

  resetForm(): void {
    this.emailSent = false;
    this.successMessage = '';
    this.forgotPasswordForm.reset();
  }
}
