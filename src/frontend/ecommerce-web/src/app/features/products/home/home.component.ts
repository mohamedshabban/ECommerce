import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { TranslateModule } from '@ngx-translate/core';
import { ProductService, CategoryService, CartService } from '../../../core/services';
import { Product, Category } from '../../../core/models';
import { ProductCardComponent } from '../../../shared/components/product-card/product-card.component';
import { LoadingSpinnerComponent } from '../../../shared/components/loading-spinner/loading-spinner.component';

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [CommonModule, RouterModule, TranslateModule, ProductCardComponent, LoadingSpinnerComponent],
  template: `
    <div class="container py-4">
      <!-- Hero Section -->
      <section class="hero-section mb-5">
        <div class="row align-items-center">
          <div class="col-lg-6">
            <h1 class="display-4 fw-bold mb-3">{{ 'home.hero.title' | translate }}</h1>
            <p class="lead text-secondary mb-4">{{ 'home.hero.subtitle' | translate }}</p>
            <a routerLink="/products" class="btn btn-primary btn-lg">
              {{ 'home.hero.shopNow' | translate }}
              <i class="fas fa-arrow-right ms-2"></i>
            </a>
          </div>
          <div class="col-lg-6">
            <img src="assets/images/hero-banner.svg" alt="Shopping" class="img-fluid">
          </div>
        </div>
      </section>

      <!-- Categories Section -->
      <section class="categories-section mb-5">
        <h2 class="section-title mb-4">{{ 'home.categories.title' | translate }}</h2>
        <div class="row g-3">
          @for (category of categories; track category.id) {
            <div class="col-6 col-md-4 col-lg-2">
              <a [routerLink]="['/products/category', category.slug]" class="category-card text-decoration-none">
                <div class="card text-center p-3">
                  <i [class]="'fas fa-' + (category.icon || 'box') + ' fa-2x mb-2 text-primary'"></i>
                  <span class="category-name">{{ category.nameEn }}</span>
                </div>
              </a>
            </div>
          }
        </div>
      </section>

      <!-- Featured Products -->
      <section class="featured-products mb-5">
        <div class="d-flex justify-content-between align-items-center mb-4">
          <h2 class="section-title mb-0">{{ 'home.featured.title' | translate }}</h2>
          <a routerLink="/products" class="btn btn-outline-primary btn-sm">
            {{ 'common.viewAll' | translate }}
          </a>
        </div>

        @if (loading) {
          <app-loading-spinner />
        } @else {
          <div class="row g-4">
            @for (product of featuredProducts; track product.id) {
              <div class="col-6 col-md-4 col-lg-3">
                <app-product-card
                  [product]="product"
                  [badgeType]="'discount'"
                  (addToCart)="addToCart($event)" />
              </div>
            }
          </div>
        }
      </section>

      <!-- New Arrivals -->
      <section class="new-arrivals mb-5">
        <div class="d-flex justify-content-between align-items-center mb-4">
          <h2 class="section-title mb-0">{{ 'home.newArrivals.title' | translate }}</h2>
          <a routerLink="/products" class="btn btn-outline-primary btn-sm">
            {{ 'common.viewAll' | translate }}
          </a>
        </div>

        <div class="row g-4">
          @for (product of newArrivals; track product.id) {
            <div class="col-6 col-md-4 col-lg-3">
              <app-product-card
                [product]="product"
                [badgeType]="'new'"
                (addToCart)="addToCart($event)" />
            </div>
          }
        </div>
      </section>

      <!-- Features Section -->
      <section class="features-section">
        <div class="row g-4">
          <div class="col-md-3">
            <div class="feature-item text-center p-3">
              <i class="fas fa-shipping-fast fa-2x text-primary mb-3"></i>
              <h6>{{ 'home.features.freeShipping.title' | translate }}</h6>
              <small class="text-muted">{{ 'home.features.freeShipping.desc' | translate }}</small>
            </div>
          </div>
          <div class="col-md-3">
            <div class="feature-item text-center p-3">
              <i class="fas fa-undo fa-2x text-primary mb-3"></i>
              <h6>{{ 'home.features.easyReturns.title' | translate }}</h6>
              <small class="text-muted">{{ 'home.features.easyReturns.desc' | translate }}</small>
            </div>
          </div>
          <div class="col-md-3">
            <div class="feature-item text-center p-3">
              <i class="fas fa-lock fa-2x text-primary mb-3"></i>
              <h6>{{ 'home.features.securePayment.title' | translate }}</h6>
              <small class="text-muted">{{ 'home.features.securePayment.desc' | translate }}</small>
            </div>
          </div>
          <div class="col-md-3">
            <div class="feature-item text-center p-3">
              <i class="fas fa-headset fa-2x text-primary mb-3"></i>
              <h6>{{ 'home.features.support.title' | translate }}</h6>
              <small class="text-muted">{{ 'home.features.support.desc' | translate }}</small>
            </div>
          </div>
        </div>
      </section>
    </div>
  `,
  styles: [`
    .hero-section {
      padding: 2rem 0;
    }

    .section-title {
      font-weight: 600;
      position: relative;
    }

    .category-card .card {
      transition: all 0.3s ease;
    }

    .category-card:hover .card {
      border-color: var(--primary-color);
      transform: translateY(-5px);
    }

    .category-name {
      font-size: 0.875rem;
      color: var(--text-primary);
    }

    .feature-item {
      background: var(--bg-primary);
      border-radius: 8px;
      border: 1px solid var(--border-color);
    }

    .product-card .product-image {
      cursor: pointer;
      transition: transform 0.3s ease;
    }

    .product-card:hover .product-image {
      transform: scale(1.05);
    }

    .card-title {
      color: var(--text-primary);
    }

    .card-title:hover {
      color: var(--primary-color);
    }
  `]
})
export class HomeComponent implements OnInit {
  private productService = inject(ProductService);
  private categoryService = inject(CategoryService);
  private cartService = inject(CartService);

  categories: Category[] = [];
  featuredProducts: Product[] = [];
  newArrivals: Product[] = [];
  loading = true;

  ngOnInit(): void {
    this.loadData();
  }

  addToCart(product: Product): void {
    this.cartService.addToCart(product.id, 1).subscribe({
      next: () => {
        // TODO: Show success notification
        console.log('Added to cart:', product.nameEn);
      },
      error: (err) => console.error('Error adding to cart:', err)
    });
  }

  private loadData(): void {
    this.categoryService.getCategories().subscribe({
      next: (categories) => this.categories = categories.slice(0, 6),
      error: (err) => console.error('Error loading categories:', err)
    });

    this.productService.getFeaturedProducts(8).subscribe({
      next: (products) => {
        this.featuredProducts = products;
        this.loading = false;
      },
      error: (err) => {
        console.error('Error loading featured products:', err);
        this.loading = false;
      }
    });

    this.productService.getNewArrivals(4).subscribe({
      next: (products) => this.newArrivals = products,
      error: (err) => console.error('Error loading new arrivals:', err)
    });
  }
}
