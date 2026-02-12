import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, ActivatedRoute, Router } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { TranslateModule } from '@ngx-translate/core';
import { ProductService, CategoryService, CartService } from '../../../core/services';
import { Product, Category, PaginatedResponse } from '../../../core/models';

@Component({
  selector: 'app-product-list',
  standalone: true,
  imports: [CommonModule, RouterModule, FormsModule, TranslateModule],
  template: `
    <div class="container py-4">
      <div class="row">
        <!-- Filters Sidebar -->
        <div class="col-lg-3 mb-4">
          <div class="filter-sidebar">
            <div class="card">
              <div class="card-header d-flex justify-content-between align-items-center">
                <h6 class="mb-0">{{ 'products.filters.title' | translate }}</h6>
                <button class="btn btn-link btn-sm text-decoration-none p-0" (click)="clearFilters()">
                  {{ 'products.filters.clear' | translate }}
                </button>
              </div>
              <div class="card-body">
                <!-- Categories -->
                <div class="filter-group mb-4">
                  <h6 class="filter-title">{{ 'products.filters.categories' | translate }}</h6>
                  @for (category of categories; track category.id) {
                    <div class="form-check">
                      <input
                        class="form-check-input"
                        type="checkbox"
                        [id]="'cat-' + category.id"
                        [checked]="selectedCategories.includes(category.id)"
                        (change)="toggleCategory(category.id)">
                      <label class="form-check-label" [for]="'cat-' + category.id">
                        {{ category.nameEn }}
                      </label>
                    </div>
                  }
                </div>

                <!-- Price Range -->
                <div class="filter-group mb-4">
                  <h6 class="filter-title">{{ 'products.filters.priceRange' | translate }}</h6>
                  <div class="row g-2">
                    <div class="col-6">
                      <input
                        type="number"
                        class="form-control form-control-sm"
                        placeholder="Min"
                        [(ngModel)]="minPrice"
                        (change)="applyFilters()">
                    </div>
                    <div class="col-6">
                      <input
                        type="number"
                        class="form-control form-control-sm"
                        placeholder="Max"
                        [(ngModel)]="maxPrice"
                        (change)="applyFilters()">
                    </div>
                  </div>
                </div>

                <!-- Rating -->
                <div class="filter-group">
                  <h6 class="filter-title">{{ 'products.filters.rating' | translate }}</h6>
                  @for (rating of [4, 3, 2, 1]; track rating) {
                    <div class="form-check">
                      <input
                        class="form-check-input"
                        type="radio"
                        name="rating"
                        [id]="'rating-' + rating"
                        [checked]="minRating === rating"
                        (change)="setRating(rating)">
                      <label class="form-check-label rating" [for]="'rating-' + rating">
                        @for (star of [1,2,3,4,5]; track star) {
                          <i [class]="star <= rating ? 'fas fa-star' : 'far fa-star'"></i>
                        }
                        <span class="ms-1">& Up</span>
                      </label>
                    </div>
                  }
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- Product Grid -->
        <div class="col-lg-9">
          <!-- Header -->
          <div class="d-flex flex-wrap justify-content-between align-items-center mb-4 gap-3">
            <div>
              <h4 class="mb-1">
                @if (categorySlug) {
                  {{ currentCategoryName }}
                } @else if (searchQuery) {
                  {{ 'products.searchResults' | translate }}: "{{ searchQuery }}"
                } @else {
                  {{ 'products.allProducts' | translate }}
                }
              </h4>
              <small class="text-muted">{{ totalItems }} {{ 'products.itemsFound' | translate }}</small>
            </div>

            <div class="d-flex gap-2 align-items-center">
              <!-- Search -->
              <div class="input-group" style="width: 250px;">
                <input
                  type="text"
                  class="form-control"
                  placeholder="{{ 'products.search' | translate }}"
                  [(ngModel)]="searchQuery"
                  (keyup.enter)="search()">
                <button class="btn btn-outline-secondary" (click)="search()">
                  <i class="fas fa-search"></i>
                </button>
              </div>

              <!-- Sort -->
              <select class="form-select" style="width: 180px;" [(ngModel)]="sortBy" (change)="applyFilters()">
                <option value="newest">{{ 'products.sort.newest' | translate }}</option>
                <option value="price_asc">{{ 'products.sort.priceLow' | translate }}</option>
                <option value="price_desc">{{ 'products.sort.priceHigh' | translate }}</option>
                <option value="rating">{{ 'products.sort.rating' | translate }}</option>
                <option value="popular">{{ 'products.sort.popular' | translate }}</option>
              </select>

              <!-- View Toggle -->
              <div class="btn-group">
                <button
                  class="btn btn-outline-secondary"
                  [class.active]="viewMode === 'grid'"
                  (click)="viewMode = 'grid'">
                  <i class="fas fa-th"></i>
                </button>
                <button
                  class="btn btn-outline-secondary"
                  [class.active]="viewMode === 'list'"
                  (click)="viewMode = 'list'">
                  <i class="fas fa-list"></i>
                </button>
              </div>
            </div>
          </div>

          <!-- Loading -->
          @if (loading) {
            <div class="loading-spinner">
              <div class="spinner-border text-primary" role="status">
                <span class="visually-hidden">Loading...</span>
              </div>
            </div>
          } @else if (products.length === 0) {
            <div class="text-center py-5">
              <i class="fas fa-box-open fa-4x text-muted mb-3"></i>
              <h5>{{ 'products.noProducts' | translate }}</h5>
              <p class="text-muted">{{ 'products.noProductsDesc' | translate }}</p>
              <button class="btn btn-primary" (click)="clearFilters()">
                {{ 'products.filters.clear' | translate }}
              </button>
            </div>
          } @else {
            <!-- Grid View -->
            @if (viewMode === 'grid') {
              <div class="row g-4">
                @for (product of products; track product.id) {
                  <div class="col-6 col-md-4">
                    <div class="card product-card h-100">
                      <div class="position-relative overflow-hidden">
                        @if (product.discountPercentage && product.discountPercentage > 0) {
                          <span class="discount-badge">-{{ product.discountPercentage }}%</span>
                        }
                        <img
                          [src]="product.imageUrl || 'assets/images/placeholder.svg'"
                          [alt]="product.nameEn"
                          class="card-img-top product-image"
                          [routerLink]="['/products', product.id]"
                          style="cursor: pointer;">
                        <div class="product-actions">
                          <button class="btn btn-sm btn-light" (click)="addToCart(product)" title="Add to Cart">
                            <i class="fas fa-shopping-cart"></i>
                          </button>
                          <button class="btn btn-sm btn-light" (click)="addToWishlist(product)" title="Add to Wishlist">
                            <i class="far fa-heart"></i>
                          </button>
                        </div>
                      </div>
                      <div class="card-body d-flex flex-column">
                        <small class="text-muted">{{ product.categoryName }}</small>
                        <h6 class="card-title mb-2">
                          <a [routerLink]="['/products', product.id]" class="text-decoration-none text-dark">
                            {{ product.nameEn }}
                          </a>
                        </h6>
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
                    </div>
                  </div>
                }
              </div>
            } @else {
              <!-- List View -->
              <div class="list-view">
                @for (product of products; track product.id) {
                  <div class="card mb-3">
                    <div class="row g-0">
                      <div class="col-md-3">
                        <img
                          [src]="product.imageUrl || 'assets/images/placeholder.svg'"
                          [alt]="product.nameEn"
                          class="img-fluid rounded-start h-100"
                          style="object-fit: cover;">
                      </div>
                      <div class="col-md-9">
                        <div class="card-body">
                          <div class="d-flex justify-content-between align-items-start">
                            <div>
                              <small class="text-muted">{{ product.categoryName }}</small>
                              <h5 class="card-title">
                                <a [routerLink]="['/products', product.id]" class="text-decoration-none text-dark">
                                  {{ product.nameEn }}
                                </a>
                              </h5>
                              <div class="rating mb-2">
                                @for (star of [1,2,3,4,5]; track star) {
                                  <i [class]="star <= (product.averageRating || 0) ? 'fas fa-star' : 'far fa-star'"></i>
                                }
                                <small class="text-muted ms-1">({{ product.reviewCount || 0 }} reviews)</small>
                              </div>
                              <p class="card-text text-muted">{{ product.shortDescription }}</p>
                            </div>
                            <div class="text-end">
                              <div class="current-price mb-2">{{ product.price | currency }}</div>
                              @if (product.originalPrice && product.originalPrice > product.price) {
                                <div class="text-muted text-decoration-line-through small">
                                  {{ product.originalPrice | currency }}
                                </div>
                              }
                            </div>
                          </div>
                          <div class="mt-3">
                            <button class="btn btn-primary btn-sm me-2" (click)="addToCart(product)">
                              <i class="fas fa-shopping-cart me-1"></i>
                              {{ 'product.addToCart' | translate }}
                            </button>
                            <button class="btn btn-outline-secondary btn-sm" (click)="addToWishlist(product)">
                              <i class="far fa-heart me-1"></i>
                              {{ 'product.addToWishlist' | translate }}
                            </button>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                }
              </div>
            }

            <!-- Pagination -->
            @if (totalPages > 1) {
              <nav class="mt-4">
                <ul class="pagination justify-content-center">
                  <li class="page-item" [class.disabled]="currentPage === 1">
                    <button class="page-link" (click)="goToPage(currentPage - 1)">
                      <i class="fas fa-chevron-left"></i>
                    </button>
                  </li>
                  @for (page of getPageNumbers(); track page) {
                    <li class="page-item" [class.active]="page === currentPage">
                      <button class="page-link" (click)="goToPage(page)">{{ page }}</button>
                    </li>
                  }
                  <li class="page-item" [class.disabled]="currentPage === totalPages">
                    <button class="page-link" (click)="goToPage(currentPage + 1)">
                      <i class="fas fa-chevron-right"></i>
                    </button>
                  </li>
                </ul>
              </nav>
            }
          }
        </div>
      </div>
    </div>
  `,
  styles: [`
    .filter-sidebar .card {
      position: sticky;
      top: 80px;
    }

    .filter-title {
      font-size: 0.875rem;
      font-weight: 600;
      margin-bottom: 0.75rem;
    }

    .rating {
      color: var(--warning-color);
      font-size: 0.75rem;
    }

    .product-actions {
      position: absolute;
      bottom: 10px;
      right: 10px;
      display: flex;
      gap: 5px;
      opacity: 0;
      transition: opacity 0.3s ease;
    }

    .product-card:hover .product-actions {
      opacity: 1;
    }

    .product-actions .btn {
      border-radius: 50%;
      width: 36px;
      height: 36px;
      padding: 0;
      display: flex;
      align-items: center;
      justify-content: center;
    }
  `]
})
export class ProductListComponent implements OnInit {
  private productService = inject(ProductService);
  private categoryService = inject(CategoryService);
  private cartService = inject(CartService);
  private route = inject(ActivatedRoute);
  private router = inject(Router);

  products: Product[] = [];
  categories: Category[] = [];
  loading = true;

  // Pagination
  currentPage = 1;
  pageSize = 6;
  totalItems = 0;
  totalPages = 0;

  // Filters
  searchQuery = '';
  categorySlug = '';
  currentCategoryName = '';
  selectedCategories: string[] = [];
  minPrice: number | null = null;
  maxPrice: number | null = null;
  minRating: number | null = null;
  sortBy = 'newest';
  viewMode: 'grid' | 'list' = 'grid';

  ngOnInit(): void {
    this.loadCategories();

    this.route.params.subscribe(params => {
      this.categorySlug = params['slug'] || '';
      this.loadProducts();
    });

    this.route.queryParams.subscribe(params => {
      this.searchQuery = params['q'] || '';
      this.currentPage = params['page'] ? parseInt(params['page']) : 1;
      this.loadProducts();
    });
  }

  private loadCategories(): void {
    this.categoryService.getCategories().subscribe({
      next: (categories) => this.categories = categories || [],
      error: (err) => {
        console.error('Error loading categories:', err);
        this.categories = [];
      }
    });
  }

  loadProducts(): void {
    this.loading = true;

    // Map frontend sort options to backend parameters
    let sortBy = 'CreatedAt';
    let sortDescending = true;
    switch (this.sortBy) {
      case 'newest':
        sortBy = 'CreatedAt';
        sortDescending = true;
        break;
      case 'price_asc':
        sortBy = 'Price';
        sortDescending = false;
        break;
      case 'price_desc':
        sortBy = 'Price';
        sortDescending = true;
        break;
      case 'rating':
        sortBy = 'AverageRating';
        sortDescending = true;
        break;
      case 'popular':
        sortBy = 'ReviewCount';
        sortDescending = true;
        break;
    }

    const params: any = {
      pageNumber: this.currentPage,
      pageSize: this.pageSize,
      sortBy,
      sortDescending
    };

    if (this.categorySlug) {
      // Find category ID from slug
      const category = this.categories.find(c => c.slug === this.categorySlug);
      if (category) {
        params.categoryId = category.id;
      }
    }

    if (this.selectedCategories.length > 0) {
      params.categoryId = this.selectedCategories[0]; // Use first selected category
    }

    if (this.minPrice) {
      params.minPrice = this.minPrice;
    }

    if (this.maxPrice) {
      params.maxPrice = this.maxPrice;
    }

    if (this.minRating) {
      params.minRating = this.minRating;
    }

    this.productService.getProducts(params).subscribe({
      next: (response: PaginatedResponse<Product>) => {
        this.products = response?.items || [];
        this.totalItems = response?.totalCount || 0;
        this.totalPages = response?.totalPages || 0;
        this.loading = false;

        if (this.categorySlug) {
          const category = this.categories.find(c => c.slug === this.categorySlug);
          this.currentCategoryName = category?.nameEn || '';
        }
      },
      error: (err) => {
        console.error('Error loading products:', err);
        this.products = [];
        this.loading = false;
      }
    });
  }

  search(): void {
    this.currentPage = 1;
    this.router.navigate(['/products/search'], {
      queryParams: { q: this.searchQuery }
    });
  }

  toggleCategory(categoryId: string): void {
    const index = this.selectedCategories.indexOf(categoryId);
    if (index > -1) {
      this.selectedCategories.splice(index, 1);
    } else {
      this.selectedCategories.push(categoryId);
    }
    this.applyFilters();
  }

  setRating(rating: number): void {
    this.minRating = rating;
    this.applyFilters();
  }

  applyFilters(): void {
    this.currentPage = 1;
    this.loadProducts();
  }

  clearFilters(): void {
    this.selectedCategories = [];
    this.minPrice = null;
    this.maxPrice = null;
    this.minRating = null;
    this.searchQuery = '';
    this.sortBy = 'newest';
    this.currentPage = 1;
    this.router.navigate(['/products']);
    this.loadProducts();
  }

  goToPage(page: number): void {
    if (page >= 1 && page <= this.totalPages) {
      this.currentPage = page;
      this.loadProducts();
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  }

  getPageNumbers(): number[] {
    const pages: number[] = [];
    const maxPages = 5;
    let start = Math.max(1, this.currentPage - Math.floor(maxPages / 2));
    let end = Math.min(this.totalPages, start + maxPages - 1);

    if (end - start + 1 < maxPages) {
      start = Math.max(1, end - maxPages + 1);
    }

    for (let i = start; i <= end; i++) {
      pages.push(i);
    }
    return pages;
  }

  addToCart(product: Product): void {
    this.cartService.addToCart(product.id, 1).subscribe({
      next: () => {
        // Show success notification
      },
      error: (err) => console.error('Error adding to cart:', err)
    });
  }

  addToWishlist(product: Product): void {
    // Implement wishlist functionality
    console.log('Add to wishlist:', product.id);
  }
}
