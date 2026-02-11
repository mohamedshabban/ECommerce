import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Router } from '@angular/router';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule, AbstractControl } from '@angular/forms';
import { TranslateModule } from '@ngx-translate/core';
import { AuthService } from '../../../core/services';
import { UserRole } from '../../../core/models';

@Component({
  selector: 'app-register',
  standalone: true,
  imports: [CommonModule, RouterModule, ReactiveFormsModule, TranslateModule],
  template: `
    <div class="auth-container">
      <div class="auth-card">
        <div class="text-center mb-4">
          <h2 class="fw-bold">{{ 'auth.register.title' | translate }}</h2>
          <p class="text-muted">{{ 'auth.register.subtitle' | translate }}</p>
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

        <form [formGroup]="registerForm" (ngSubmit)="onSubmit()">
          <div class="row">
            <div class="col-md-6 mb-3">
              <label for="firstName" class="form-label">{{ 'auth.firstName' | translate }}</label>
              <input
                type="text"
                class="form-control"
                id="firstName"
                formControlName="firstName"
                [class.is-invalid]="registerForm.get('firstName')?.invalid && registerForm.get('firstName')?.touched">
              @if (registerForm.get('firstName')?.invalid && registerForm.get('firstName')?.touched) {
                <div class="invalid-feedback">
                  {{ 'auth.validation.firstNameRequired' | translate }}
                </div>
              }
            </div>

            <div class="col-md-6 mb-3">
              <label for="lastName" class="form-label">{{ 'auth.lastName' | translate }}</label>
              <input
                type="text"
                class="form-control"
                id="lastName"
                formControlName="lastName"
                [class.is-invalid]="registerForm.get('lastName')?.invalid && registerForm.get('lastName')?.touched">
              @if (registerForm.get('lastName')?.invalid && registerForm.get('lastName')?.touched) {
                <div class="invalid-feedback">
                  {{ 'auth.validation.lastNameRequired' | translate }}
                </div>
              }
            </div>
          </div>

          <div class="mb-3">
            <label for="email" class="form-label">{{ 'auth.email' | translate }}</label>
            <input
              type="email"
              class="form-control"
              id="email"
              formControlName="email"
              [class.is-invalid]="registerForm.get('email')?.invalid && registerForm.get('email')?.touched">
            @if (registerForm.get('email')?.invalid && registerForm.get('email')?.touched) {
              <div class="invalid-feedback">
                {{ 'auth.validation.emailInvalid' | translate }}
              </div>
            }
          </div>

          <div class="mb-3">
            <label for="phone" class="form-label">{{ 'auth.phone' | translate }}</label>
            <input
              type="tel"
              class="form-control"
              id="phone"
              formControlName="phone">
          </div>

          <div class="mb-3">
            <label for="password" class="form-label">{{ 'auth.password' | translate }}</label>
            <div class="input-group">
              <input
                [type]="showPassword ? 'text' : 'password'"
                class="form-control"
                id="password"
                formControlName="password"
                [class.is-invalid]="registerForm.get('password')?.invalid && registerForm.get('password')?.touched">
              <button
                type="button"
                class="btn btn-outline-secondary"
                (click)="showPassword = !showPassword">
                <i [class]="showPassword ? 'fas fa-eye-slash' : 'fas fa-eye'"></i>
              </button>
            </div>
            @if (registerForm.get('password')?.invalid && registerForm.get('password')?.touched) {
              <div class="text-danger small mt-1">
                {{ 'auth.validation.passwordMin' | translate }}
              </div>
            }
          </div>

          <div class="mb-3">
            <label for="confirmPassword" class="form-label">{{ 'auth.confirmPassword' | translate }}</label>
            <input
              [type]="showPassword ? 'text' : 'password'"
              class="form-control"
              id="confirmPassword"
              formControlName="confirmPassword"
              [class.is-invalid]="registerForm.get('confirmPassword')?.touched && registerForm.hasError('passwordMismatch')">
            @if (registerForm.get('confirmPassword')?.touched && registerForm.hasError('passwordMismatch')) {
              <div class="invalid-feedback">
                {{ 'auth.validation.passwordMismatch' | translate }}
              </div>
            }
          </div>

          <div class="mb-3">
            <label class="form-label">{{ 'auth.accountType' | translate }}</label>
            <div class="d-flex gap-3">
              <div class="form-check">
                <input
                  class="form-check-input"
                  type="radio"
                  name="role"
                  id="roleCustomer"
                  formControlName="role"
                  [value]="UserRole.Customer">
                <label class="form-check-label" for="roleCustomer">
                  {{ 'auth.roles.customer' | translate }}
                </label>
              </div>
              <div class="form-check">
                <input
                  class="form-check-input"
                  type="radio"
                  name="role"
                  id="roleVendor"
                  formControlName="role"
                  [value]="UserRole.Vendor">
                <label class="form-check-label" for="roleVendor">
                  {{ 'auth.roles.vendor' | translate }}
                </label>
              </div>
            </div>
          </div>

          <div class="mb-4">
            <div class="form-check">
              <input
                type="checkbox"
                class="form-check-input"
                id="agreeTerms"
                formControlName="agreeTerms"
                [class.is-invalid]="registerForm.get('agreeTerms')?.invalid && registerForm.get('agreeTerms')?.touched">
              <label class="form-check-label" for="agreeTerms">
                {{ 'auth.register.agreeTerms' | translate }}
                <a href="#" class="text-decoration-none">{{ 'auth.register.termsLink' | translate }}</a>
              </label>
            </div>
          </div>

          <button
            type="submit"
            class="btn btn-primary w-100 mb-3"
            [disabled]="registerForm.invalid || loading">
            @if (loading) {
              <span class="spinner-border spinner-border-sm me-2" role="status"></span>
            }
            {{ 'auth.register.submit' | translate }}
          </button>
        </form>

        <div class="divider my-4">
          <span class="divider-text">{{ 'auth.orContinueWith' | translate }}</span>
        </div>

        <div class="social-buttons d-flex gap-2">
          <button type="button" class="btn btn-outline-secondary flex-fill" (click)="registerWithGoogle()">
            <i class="fab fa-google me-2"></i> Google
          </button>
          <button type="button" class="btn btn-outline-secondary flex-fill" (click)="registerWithFacebook()">
            <i class="fab fa-facebook me-2"></i> Facebook
          </button>
        </div>

        <p class="text-center mt-4 mb-0">
          {{ 'auth.register.haveAccount' | translate }}
          <a routerLink="/auth/login" class="text-decoration-none">
            {{ 'auth.register.signIn' | translate }}
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
      max-width: 500px;
      box-shadow: 0 4px 20px rgba(0, 0, 0, 0.08);
    }

    .divider {
      display: flex;
      align-items: center;
      text-align: center;
    }

    .divider::before,
    .divider::after {
      content: '';
      flex: 1;
      border-bottom: 1px solid var(--border-color);
    }

    .divider-text {
      padding: 0 1rem;
      color: var(--text-secondary);
      font-size: 0.875rem;
    }
  `]
})
export class RegisterComponent {
  private fb = inject(FormBuilder);
  private authService = inject(AuthService);
  private router = inject(Router);

  UserRole = UserRole;
  registerForm: FormGroup;
  showPassword = false;
  loading = false;
  errorMessage = '';
  successMessage = '';

  constructor() {
    this.registerForm = this.fb.group({
      firstName: ['', Validators.required],
      lastName: ['', Validators.required],
      email: ['', [Validators.required, Validators.email]],
      phone: [''],
      password: ['', [Validators.required, Validators.minLength(6)]],
      confirmPassword: ['', Validators.required],
      role: [UserRole.Customer],
      agreeTerms: [false, Validators.requiredTrue]
    }, { validators: this.passwordMatchValidator });
  }

  passwordMatchValidator(control: AbstractControl): { [key: string]: boolean } | null {
    const password = control.get('password');
    const confirmPassword = control.get('confirmPassword');

    if (password && confirmPassword && password.value !== confirmPassword.value) {
      return { passwordMismatch: true };
    }
    return null;
  }

  onSubmit(): void {
    if (this.registerForm.invalid) return;

    this.loading = true;
    this.errorMessage = '';
    this.successMessage = '';

    const formValue = this.registerForm.value;
    const registerData = {
      firstName: formValue.firstName,
      lastName: formValue.lastName,
      email: formValue.email,
      phone: formValue.phone,
      password: formValue.password,
      role: formValue.role
    };

    this.authService.register(registerData).subscribe({
      next: () => {
        this.successMessage = 'Registration successful! Redirecting to login...';
        setTimeout(() => {
          this.router.navigate(['/auth/login']);
        }, 2000);
      },
      error: (err) => {
        this.loading = false;
        this.errorMessage = err.error?.message || 'Registration failed. Please try again.';
      }
    });
  }

  registerWithGoogle(): void {
    this.authService.loginWithGoogle();
  }

  registerWithFacebook(): void {
    this.authService.loginWithFacebook();
  }
}
