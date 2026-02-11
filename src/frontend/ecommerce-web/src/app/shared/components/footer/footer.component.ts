import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { TranslateModule } from '@ngx-translate/core';
import { LanguageService } from '../../../core/services';

@Component({
  selector: 'app-footer',
  standalone: true,
  imports: [CommonModule, RouterModule, TranslateModule],
  template: `
    <footer class="footer">
      <div class="container">
        <div class="row g-4">
          <div class="col-lg-4">
            <h5 class="mb-3">
              <i class="fas fa-shopping-bag text-primary me-2"></i>
              E-Shop
            </h5>
            <p class="text-muted">
              {{ 'footer.about' | translate }}
            </p>
            <div class="social-links">
              <a href="#" class="me-3"><i class="fab fa-facebook-f"></i></a>
              <a href="#" class="me-3"><i class="fab fa-twitter"></i></a>
              <a href="#" class="me-3"><i class="fab fa-instagram"></i></a>
              <a href="#"><i class="fab fa-linkedin-in"></i></a>
            </div>
          </div>

          <div class="col-lg-2 col-md-4">
            <h6 class="mb-3">{{ 'footer.shop' | translate }}</h6>
            <ul class="list-unstyled">
              <li class="mb-2">
                <a routerLink="/products" class="text-muted text-decoration-none">
                  {{ 'footer.allProducts' | translate }}
                </a>
              </li>
              <li class="mb-2">
                <a routerLink="/products" [queryParams]="{featured: true}" class="text-muted text-decoration-none">
                  {{ 'footer.featured' | translate }}
                </a>
              </li>
              <li class="mb-2">
                <a routerLink="/products" [queryParams]="{new: true}" class="text-muted text-decoration-none">
                  {{ 'footer.newArrivals' | translate }}
                </a>
              </li>
              <li class="mb-2">
                <a routerLink="/products" [queryParams]="{sale: true}" class="text-muted text-decoration-none">
                  {{ 'footer.sale' | translate }}
                </a>
              </li>
            </ul>
          </div>

          <div class="col-lg-2 col-md-4">
            <h6 class="mb-3">{{ 'footer.account' | translate }}</h6>
            <ul class="list-unstyled">
              <li class="mb-2">
                <a routerLink="/user/profile" class="text-muted text-decoration-none">
                  {{ 'footer.myAccount' | translate }}
                </a>
              </li>
              <li class="mb-2">
                <a routerLink="/user/orders" class="text-muted text-decoration-none">
                  {{ 'footer.orders' | translate }}
                </a>
              </li>
              <li class="mb-2">
                <a routerLink="/cart" class="text-muted text-decoration-none">
                  {{ 'footer.cart' | translate }}
                </a>
              </li>
              <li class="mb-2">
                <a routerLink="/user/addresses" class="text-muted text-decoration-none">
                  {{ 'footer.addresses' | translate }}
                </a>
              </li>
            </ul>
          </div>

          <div class="col-lg-2 col-md-4">
            <h6 class="mb-3">{{ 'footer.support' | translate }}</h6>
            <ul class="list-unstyled">
              <li class="mb-2">
                <a href="#" class="text-muted text-decoration-none">
                  {{ 'footer.contact' | translate }}
                </a>
              </li>
              <li class="mb-2">
                <a href="#" class="text-muted text-decoration-none">
                  {{ 'footer.faq' | translate }}
                </a>
              </li>
              <li class="mb-2">
                <a href="#" class="text-muted text-decoration-none">
                  {{ 'footer.shipping' | translate }}
                </a>
              </li>
              <li class="mb-2">
                <a href="#" class="text-muted text-decoration-none">
                  {{ 'footer.returns' | translate }}
                </a>
              </li>
            </ul>
          </div>

          <div class="col-lg-2">
            <h6 class="mb-3">{{ 'footer.contact' | translate }}</h6>
            <ul class="list-unstyled text-muted">
              <li class="mb-2">
                <i class="fas fa-map-marker-alt me-2"></i>
                123 Street, City
              </li>
              <li class="mb-2">
                <i class="fas fa-phone me-2"></i>
                +1 234 567 890
              </li>
              <li class="mb-2">
                <i class="fas fa-envelope me-2"></i>
                info&#64;eshop.com
              </li>
            </ul>
          </div>
        </div>

        <hr class="my-4">

        <div class="row align-items-center">
          <div class="col-md-6">
            <p class="text-muted mb-0">
              &copy; {{ currentYear }} E-Shop. {{ 'footer.rights' | translate }}
            </p>
          </div>
          <div class="col-md-6 text-md-end">
            <div class="payment-methods">
              <i class="fab fa-cc-visa fa-2x text-muted me-2"></i>
              <i class="fab fa-cc-mastercard fa-2x text-muted me-2"></i>
              <i class="fab fa-cc-paypal fa-2x text-muted me-2"></i>
              <i class="fab fa-cc-amex fa-2x text-muted"></i>
            </div>
          </div>
        </div>
      </div>
    </footer>
  `,
  styles: [`
    .footer {
      margin-top: 3rem;
    }

    .social-links a {
      color: var(--text-secondary);
      font-size: 1.25rem;
      transition: color 0.2s ease;
    }

    .social-links a:hover {
      color: var(--primary-color);
    }

    .payment-methods i {
      opacity: 0.6;
    }
  `]
})
export class FooterComponent {
  languageService = inject(LanguageService);
  currentYear = new Date().getFullYear();
}
