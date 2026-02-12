import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { TranslateModule, TranslateService } from '@ngx-translate/core';
import { NgbDropdownModule } from '@ng-bootstrap/ng-bootstrap';
import { AuthService, ThemeService, LanguageService, CartService } from '../../../core/services';
import { Language } from '../../../core/services/language.service';

@Component({
  selector: 'app-navbar',
  standalone: true,
  imports: [CommonModule, RouterModule, FormsModule, TranslateModule, NgbDropdownModule],
  template: `
    <nav class="navbar navbar-expand-lg sticky-top">
      <div class="container">
        <a class="navbar-brand fw-bold" routerLink="/">
          <i class="fas fa-shopping-bag text-primary me-2"></i>
          E-Shop
        </a>

        <button class="navbar-toggler" type="button" data-bs-toggle="collapse" data-bs-target="#navbarNav">
          <span class="navbar-toggler-icon"></span>
        </button>

        <div class="collapse navbar-collapse" id="navbarNav">
          <!-- Search Bar -->
          <form class="d-flex mx-auto" style="max-width: 400px; flex: 1;" (submit)="search($event)">
            <div class="input-group">
              <input
                type="text"
                class="form-control"
                placeholder="{{ 'nav.search' | translate }}"
                [(ngModel)]="searchQuery"
                name="search">
              <button class="btn btn-primary" type="submit">
                <i class="fas fa-search"></i>
              </button>
            </div>
          </form>

          <!-- Nav Links -->
          <ul class="navbar-nav ms-auto align-items-center">
            <li class="nav-item">
              <a class="nav-link" routerLink="/products">
                {{ 'nav.products' | translate }}
              </a>
            </li>

            <!-- Theme Toggle -->
            <li class="nav-item">
              <button class="nav-link btn btn-link" (click)="toggleTheme()">
                <i [class]="themeService.isDarkMode() ? 'fas fa-sun' : 'fas fa-moon'"></i>
              </button>
            </li>

            <!-- Language Toggle -->
            <li class="nav-item" ngbDropdown>
              <button class="nav-link dropdown-toggle btn btn-link" ngbDropdownToggle>
                <i class="fas fa-globe me-1"></i>
                {{ languageService.currentLang() === 'ar' ? 'عربي' : 'EN' }}
              </button>
              <div ngbDropdownMenu class="dropdown-menu-end">
                <button ngbDropdownItem (click)="setLanguage('en')">
                  English
                </button>
                <button ngbDropdownItem (click)="setLanguage('ar')">
                  العربية
                </button>
              </div>
            </li>

            <!-- Cart -->
            <li class="nav-item">
              <a class="nav-link position-relative" routerLink="/cart">
                <i class="fas fa-shopping-cart"></i>
                @if (cartService.itemCount() > 0) {
                  <span class="position-absolute top-0 start-100 translate-middle badge rounded-pill bg-danger">
                    {{ cartService.itemCount() }}
                  </span>
                }
              </a>
            </li>

            <!-- User Menu -->
            @if (authService.isAuthenticated()) {
              <li class="nav-item" ngbDropdown>
                <button class="nav-link dropdown-toggle btn btn-link d-flex align-items-center" ngbDropdownToggle>
                  <img
                    [src]="authService.currentUser()?.avatarUrl || 'assets/images/avatar-placeholder.svg'"
                    alt="Avatar"
                    class="rounded-circle me-2"
                    style="width: 32px; height: 32px; object-fit: cover;">
                  {{ authService.currentUser()?.firstName }}
                </button>
                <div ngbDropdownMenu class="dropdown-menu-end">
                  <a ngbDropdownItem routerLink="/user/profile">
                    <i class="fas fa-user me-2"></i> {{ 'nav.profile' | translate }}
                  </a>
                  <a ngbDropdownItem routerLink="/user/orders">
                    <i class="fas fa-shopping-bag me-2"></i> {{ 'nav.orders' | translate }}
                  </a>
                  @if (authService.isAdmin()) {
                    <div class="dropdown-divider"></div>
                    <a ngbDropdownItem routerLink="/admin">
                      <i class="fas fa-tachometer-alt me-2"></i> {{ 'nav.adminDashboard' | translate }}
                    </a>
                  }
                  @if (authService.isVendor()) {
                    <div class="dropdown-divider"></div>
                    <a ngbDropdownItem routerLink="/vendor">
                      <i class="fas fa-store me-2"></i> {{ 'nav.vendorDashboard' | translate }}
                    </a>
                  }
                  <div class="dropdown-divider"></div>
                  <button ngbDropdownItem class="text-danger" (click)="logout()">
                    <i class="fas fa-sign-out-alt me-2"></i> {{ 'nav.logout' | translate }}
                  </button>
                </div>
              </li>
            } @else {
              <li class="nav-item">
                <a class="nav-link" routerLink="/auth/login">
                  {{ 'nav.login' | translate }}
                </a>
              </li>
              <li class="nav-item">
                <a class="btn btn-primary btn-sm ms-2" routerLink="/auth/register">
                  {{ 'nav.register' | translate }}
                </a>
              </li>
            }
          </ul>
        </div>
      </div>
    </nav>
  `,
  styles: [`
    .navbar {
      padding: 0.75rem 0;
    }

    .navbar-brand {
      font-size: 1.5rem;
    }

    .nav-link {
      padding: 0.5rem 1rem;
    }

    .dropdown-menu {
      border: 1px solid var(--border-color);
      box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
    }
  `]
})
export class NavbarComponent {
  authService = inject(AuthService);
  themeService = inject(ThemeService);
  languageService = inject(LanguageService);
  cartService = inject(CartService);
  private translateService = inject(TranslateService);

  searchQuery = '';

  search(event: Event): void {
    event.preventDefault();
    if (this.searchQuery.trim()) {
      window.location.href = `/products/search?q=${encodeURIComponent(this.searchQuery)}`;
    }
  }

  toggleTheme(): void {
    this.themeService.toggleTheme();
  }

  setLanguage(lang: Language): void {
    this.languageService.setLanguage(lang);
  }

  logout(): void {
    this.authService.logout();
  }
}
