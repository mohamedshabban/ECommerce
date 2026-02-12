import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { TranslateModule } from '@ngx-translate/core';
import { ProductService, CategoryService, CartService } from '../../../core/services';
import { Product, Category } from '../../../core/models';

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [CommonModule, RouterModule, TranslateModule],
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
          <div class="loading-spinner">
            <div class="spinner-border text-primary" role="status">
              <span class="visually-hidden">Loading...</span>
            </div>
          </div>
        } @else {
          <div class="row g-4">
            @for (product of featuredProducts; track product.id) {
              <div class="col-6 col-md-4 col-lg-3">
                <div class="card product-card h-100">
                  <a [routerLink]="['/products', product.id]" class="position-relative overflow-hidden d-block">
                    @if (product.discountPercentage && product.discountPercentage > 0) {
                      <span class="discount-badge">-{{ product.discountPercentage }}%</span>
                    }
                    <img
                      [src]="product.primaryImageUrl || product.imageUrl || 'assets/images/placeholder.svg'"
                      [alt]="product.nameEn"
                      class="card-img-top product-image">
                  </a>
                  <div class="card-body d-flex flex-column">
                    <a [routerLink]="['/products', product.id]" class="text-decoration-none">
                      <h6 class="card-title mb-2">{{ product.nameEn }}</h6>
                    </a>
                    <div class="rating mb-2">
                      @for (star of [1,2,3,4,5]; track star) {
                        <i [class]="star <= (product.averageRating || 0) ? 'fas fa-star' : 'far fa-star'"></i>
                      }
                      <small class="text-muted ms-1">({{ product.reviewCount || 0 }})</small>
                    </div>
                    <div class="mt-auto">
                      <div class="d-flex align-items-center gap-2">
                        <span class="current-price">{{ product.price | currency }}</span>
                        @if (product.originalPrice && product.originalPrice > product.price) {
                          <span class="text-muted text-decoration-line-through small">
                            {{ product.originalPrice | currency }}
                          </span>
                        }
                      </div>
                    </div>
                  </div>
                  <div class="card-footer bg-transparent border-0 pt-0">
                    <button (click)="addToCart(product)" class="btn btn-primary btn-sm w-100">
                      <i class="fas fa-shopping-cart me-1"></i>
                      {{ 'product.addToCart' | translate }}
                    </button>
                  </div>
                </div>
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
              <div class="card product-card h-100">
                <a [routerLink]="['/products', product.id]" class="position-relative overflow-hidden d-block">
                  <span class="badge bg-success position-absolute top-0 start-0 m-2">
                    {{ 'product.new' | translate }}
                  </span>
                  <img
                    [src]="product.primaryImageUrl || product.imageUrl || 'assets/images/placeholder.svg'"
                    [alt]="product.nameEn"
                    class="card-img-top product-image">
                </a>
                <div class="card-body d-flex flex-column">
                  <a [routerLink]="['/products', product.id]" class="text-decoration-none">
                    <h6 class="card-title mb-2">{{ product.nameEn }}</h6>
                  </a>
                  <div class="rating mb-2">
                    @for (star of [1,2,3,4,5]; track star) {
                      <i [class]="star <= (product.averageRating || 0) ? 'fas fa-star' : 'far fa-star'"></i>
                    }
                    <small class="text-muted ms-1">({{ product.reviewCount || 0 }})</small>
                  </div>
                  <div class="mt-auto">
                    <span class="current-price">{{ product.price | currency }}</span>
                  </div>
                </div>
                <div class="card-footer bg-transparent border-0 pt-0">
                  <button (click)="addToCart(product)" class="btn btn-primary btn-sm w-100">
                    <i class="fas fa-shopping-cart me-1"></i>
                    {{ 'product.addToCart' | translate }}
                  </button>
                </div>
              </div>
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
