import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Router } from '@angular/router';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { TranslateModule } from '@ngx-translate/core';
import { AuthService } from '../../../core/services';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, RouterModule, ReactiveFormsModule, TranslateModule],
  template: `
    <div class="auth-container">
      <div class="auth-card">
        <div class="text-center mb-4">
          <h2 class="fw-bold">{{ 'auth.login.title' | translate }}</h2>
          <p class="text-muted">{{ 'auth.login.subtitle' | translate }}</p>
        </div>

        @if (errorMessage) {
          <div class="alert alert-danger" role="alert">
            {{ errorMessage }}
          </div>
        }

        <form [formGroup]="loginForm" (ngSubmit)="onSubmit()">
          <div class="mb-3">
            <label for="email" class="form-label">{{ 'auth.email' | translate }}</label>
            <input
              type="email"
              class="form-control"
              id="email"
              formControlName="email"
              [class.is-invalid]="loginForm.get('email')?.invalid && loginForm.get('email')?.touched">
            @if (loginForm.get('email')?.invalid && loginForm.get('email')?.touched) {
              <div class="invalid-feedback">
                {{ 'auth.validation.emailRequired' | translate }}
              </div>
            }
          </div>

          <div class="mb-3">
            <label for="password" class="form-label">{{ 'auth.password' | translate }}</label>
            <div class="input-group">
              <input
                [type]="showPassword ? 'text' : 'password'"
                class="form-control"
                id="password"
                formControlName="password"
                [class.is-invalid]="loginForm.get('password')?.invalid && loginForm.get('password')?.touched">
              <button
                type="button"
                class="btn btn-outline-secondary"
                (click)="showPassword = !showPassword">
                <i [class]="showPassword ? 'fas fa-eye-slash' : 'fas fa-eye'"></i>
              </button>
            </div>
            @if (loginForm.get('password')?.invalid && loginForm.get('password')?.touched) {
              <div class="text-danger small mt-1">
                {{ 'auth.validation.passwordRequired' | translate }}
              </div>
            }
          </div>

          <div class="d-flex justify-content-between align-items-center mb-4">
            <div class="form-check">
              <input type="checkbox" class="form-check-input" id="rememberMe" formControlName="rememberMe">
              <label class="form-check-label" for="rememberMe">
                {{ 'auth.login.rememberMe' | translate }}
              </label>
            </div>
            <a routerLink="/auth/forgot-password" class="text-decoration-none">
              {{ 'auth.login.forgotPassword' | translate }}
            </a>
          </div>

          <button
            type="submit"
            class="btn btn-primary w-100 mb-3"
            [disabled]="loginForm.invalid || loading">
            @if (loading) {
              <span class="spinner-border spinner-border-sm me-2" role="status"></span>
            }
            {{ 'auth.login.submit' | translate }}
          </button>
        </form>

        <div class="divider my-4">
          <span class="divider-text">{{ 'auth.orContinueWith' | translate }}</span>
        </div>

        <div class="social-buttons d-flex gap-2">
          <button type="button" class="btn btn-outline-secondary flex-fill" (click)="loginWithGoogle()">
            <i class="fab fa-google me-2"></i> Google
          </button>
          <button type="button" class="btn btn-outline-secondary flex-fill" (click)="loginWithFacebook()">
            <i class="fab fa-facebook me-2"></i> Facebook
          </button>
        </div>

        <p class="text-center mt-4 mb-0">
          {{ 'auth.login.noAccount' | translate }}
          <a routerLink="/auth/register" class="text-decoration-none">
            {{ 'auth.login.signUp' | translate }}
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
export class LoginComponent {
  private fb = inject(FormBuilder);
  private authService = inject(AuthService);
  private router = inject(Router);

  loginForm: FormGroup;
  showPassword = false;
  loading = false;
  errorMessage = '';

  constructor() {
    this.loginForm = this.fb.group({
      email: ['', [Validators.required, Validators.email]],
      password: ['', [Validators.required, Validators.minLength(6)]],
      rememberMe: [false]
    });
  }

  onSubmit(): void {
    if (this.loginForm.invalid) return;

    this.loading = true;
    this.errorMessage = '';

    const { email, password } = this.loginForm.value;

    this.authService.login({ email, password }).subscribe({
      next: () => {
        this.router.navigate(['/']);
      },
      error: (err) => {
        this.loading = false;
        this.errorMessage = err.error?.message || 'Login failed. Please check your credentials.';
      }
    });
  }

  loginWithGoogle(): void {
    this.authService.loginWithGoogle();
  }

  loginWithFacebook(): void {
    this.authService.loginWithFacebook();
  }
}
