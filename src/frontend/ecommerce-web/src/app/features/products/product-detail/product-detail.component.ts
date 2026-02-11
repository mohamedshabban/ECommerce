import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, ActivatedRoute } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { TranslateModule } from '@ngx-translate/core';
import { ProductService, CartService, AuthService } from '../../../core/services';
import { Product, ProductReview } from '../../../core/models';

@Component({
  selector: 'app-product-detail',
  standalone: true,
  imports: [CommonModule, RouterModule, FormsModule, TranslateModule],
  template: `
    <div class="container py-4">
      @if (loading) {
        <div class="loading-spinner">
          <div class="spinner-border text-primary" role="status">
            <span class="visually-hidden">Loading...</span>
          </div>
        </div>
      } @else if (!product) {
        <div class="text-center py-5">
          <i class="fas fa-exclamation-circle fa-4x text-muted mb-3"></i>
          <h4>{{ 'product.notFound' | translate }}</h4>
          <a routerLink="/products" class="btn btn-primary mt-3">
            {{ 'product.backToProducts' | translate }}
          </a>
        </div>
      } @else {
        <!-- Breadcrumb -->
        <nav aria-label="breadcrumb" class="mb-4">
          <ol class="breadcrumb">
            <li class="breadcrumb-item"><a routerLink="/">{{ 'common.home' | translate }}</a></li>
            <li class="breadcrumb-item"><a routerLink="/products">{{ 'nav.products' | translate }}</a></li>
            @if (product.categoryName) {
              <li class="breadcrumb-item">
                <a [routerLink]="['/products/category', product.categorySlug]">{{ product.categoryName }}</a>
              </li>
            }
            <li class="breadcrumb-item active">{{ product.nameEn }}</li>
          </ol>
        </nav>

        <div class="row">
          <!-- Product Images -->
          <div class="col-lg-6 mb-4">
            <div class="product-gallery">
              <div class="main-image mb-3">
                <img
                  [src]="selectedImage || product.imageUrl || 'assets/images/placeholder.png'"
                  [alt]="product.nameEn"
                  class="img-fluid rounded">
                @if (product.discountPercentage && product.discountPercentage > 0) {
                  <span class="discount-badge">-{{ product.discountPercentage }}%</span>
                }
              </div>
              @if (product.images && product.images.length > 1) {
                <div class="thumbnail-gallery d-flex gap-2">
                  @for (image of product.images; track image.id) {
                    <div
                      class="thumbnail"
                      [class.active]="selectedImage === image.imageUrl"
                      (click)="selectedImage = image.imageUrl">
                      <img [src]="image.imageUrl" [alt]="product.nameEn" class="img-fluid">
                    </div>
                  }
                </div>
              }
            </div>
          </div>

          <!-- Product Info -->
          <div class="col-lg-6">
            <div class="product-info">
              <span class="badge bg-secondary mb-2">{{ product.categoryName }}</span>
              <h1 class="product-title mb-2">{{ product.nameEn }}</h1>

              <!-- Rating -->
              <div class="d-flex align-items-center gap-3 mb-3">
                <div class="rating">
                  @for (star of [1,2,3,4,5]; track star) {
                    <i [class]="star <= (product.averageRating || 0) ? 'fas fa-star' : 'far fa-star'"></i>
                  }
                </div>
                <span class="text-muted">({{ product.reviewCount || 0 }} {{ 'product.reviews' | translate }})</span>
                @if (product.stockQuantity > 0) {
                  <span class="badge bg-success">{{ 'product.inStock' | translate }}</span>
                } @else {
                  <span class="badge bg-danger">{{ 'product.outOfStock' | translate }}</span>
                }
              </div>

              <!-- Price -->
              <div class="price-section mb-4">
                <span class="current-price display-5 fw-bold text-primary">
                  {{ product.price | currency }}
                </span>
                @if (product.originalPrice && product.originalPrice > product.price) {
                  <span class="original-price text-muted text-decoration-line-through ms-2">
                    {{ product.originalPrice | currency }}
                  </span>
                  <span class="discount-text text-success ms-2">
                    {{ 'product.save' | translate }} {{ product.originalPrice - product.price | currency }}
                  </span>
                }
              </div>

              <!-- Short Description -->
              <p class="text-muted mb-4">{{ product.shortDescription }}</p>

              <!-- Quantity & Add to Cart -->
              <div class="purchase-section mb-4">
                <div class="d-flex align-items-center gap-3 mb-3">
                  <label class="fw-semibold">{{ 'product.quantity' | translate }}:</label>
                  <div class="quantity-selector">
                    <button class="btn btn-outline-secondary btn-sm" (click)="decreaseQuantity()">
                      <i class="fas fa-minus"></i>
                    </button>
                    <input
                      type="number"
                      class="form-control form-control-sm text-center"
                      [(ngModel)]="quantity"
                      [min]="1"
                      [max]="product.stockQuantity"
                      style="width: 60px;">
                    <button class="btn btn-outline-secondary btn-sm" (click)="increaseQuantity()">
                      <i class="fas fa-plus"></i>
                    </button>
                  </div>
                  <small class="text-muted">{{ product.stockQuantity }} {{ 'product.available' | translate }}</small>
                </div>

                <div class="d-flex gap-2">
                  <button
                    class="btn btn-primary btn-lg flex-grow-1"
                    [disabled]="product.stockQuantity === 0 || addingToCart"
                    (click)="addToCart()">
                    @if (addingToCart) {
                      <span class="spinner-border spinner-border-sm me-2"></span>
                    } @else {
                      <i class="fas fa-shopping-cart me-2"></i>
                    }
                    {{ 'product.addToCart' | translate }}
                  </button>
                  <button class="btn btn-outline-secondary btn-lg" (click)="addToWishlist()">
                    <i [class]="inWishlist ? 'fas fa-heart text-danger' : 'far fa-heart'"></i>
                  </button>
                </div>
              </div>

              <!-- Product Meta -->
              <div class="product-meta">
                <div class="row">
                  <div class="col-6 mb-2">
                    <small class="text-muted">{{ 'product.sku' | translate }}:</small>
                    <span class="ms-2">{{ product.sku }}</span>
                  </div>
                  <div class="col-6 mb-2">
                    <small class="text-muted">{{ 'product.vendor' | translate }}:</small>
                    <span class="ms-2">{{ product.vendorName || 'N/A' }}</span>
                  </div>
                </div>
              </div>

              <!-- Share -->
              <div class="share-section mt-4 pt-4 border-top">
                <span class="fw-semibold me-3">{{ 'product.share' | translate }}:</span>
                <button class="btn btn-outline-secondary btn-sm me-2">
                  <i class="fab fa-facebook-f"></i>
                </button>
                <button class="btn btn-outline-secondary btn-sm me-2">
                  <i class="fab fa-twitter"></i>
                </button>
                <button class="btn btn-outline-secondary btn-sm">
                  <i class="fab fa-pinterest"></i>
                </button>
              </div>
            </div>
          </div>
        </div>

        <!-- Tabs: Description, Reviews -->
        <div class="product-tabs mt-5">
          <ul class="nav nav-tabs" role="tablist">
            <li class="nav-item">
              <button
                class="nav-link"
                [class.active]="activeTab === 'description'"
                (click)="activeTab = 'description'">
                {{ 'product.description' | translate }}
              </button>
            </li>
            <li class="nav-item">
              <button
                class="nav-link"
                [class.active]="activeTab === 'reviews'"
                (click)="activeTab = 'reviews'">
                {{ 'product.reviews' | translate }} ({{ product.reviewCount || 0 }})
              </button>
            </li>
          </ul>

          <div class="tab-content p-4 border border-top-0 rounded-bottom bg-white">
            @if (activeTab === 'description') {
              <div class="description-content">
                <div [innerHTML]="product.descriptionEn"></div>
              </div>
            } @else {
              <div class="reviews-content">
                <!-- Review Summary -->
                <div class="row mb-4">
                  <div class="col-md-4 text-center border-end">
                    <div class="display-3 fw-bold text-primary">{{ product.averageRating?.toFixed(1) || '0.0' }}</div>
                    <div class="rating mb-2">
                      @for (star of [1,2,3,4,5]; track star) {
                        <i [class]="star <= (product.averageRating || 0) ? 'fas fa-star' : 'far fa-star'"></i>
                      }
                    </div>
                    <div class="text-muted">{{ product.reviewCount || 0 }} {{ 'product.reviews' | translate }}</div>
                  </div>
                  <div class="col-md-8">
                    @if (authService.isAuthenticated()) {
                      <button class="btn btn-outline-primary" (click)="showReviewForm = !showReviewForm">
                        <i class="fas fa-pen me-2"></i>
                        {{ 'product.writeReview' | translate }}
                      </button>

                      @if (showReviewForm) {
                        <div class="review-form mt-3 p-3 border rounded">
                          <div class="mb-3">
                            <label class="form-label">{{ 'product.yourRating' | translate }}</label>
                            <div class="rating-input">
                              @for (star of [1,2,3,4,5]; track star) {
                                <i
                                  [class]="star <= reviewRating ? 'fas fa-star' : 'far fa-star'"
                                  style="cursor: pointer; font-size: 1.5rem;"
                                  (click)="reviewRating = star"></i>
                              }
                            </div>
                          </div>
                          <div class="mb-3">
                            <label class="form-label">{{ 'product.yourReview' | translate }}</label>
                            <textarea
                              class="form-control"
                              rows="4"
                              [(ngModel)]="reviewComment"
                              placeholder="{{ 'product.reviewPlaceholder' | translate }}"></textarea>
                          </div>
                          <button
                            class="btn btn-primary"
                            [disabled]="!reviewRating || !reviewComment || submittingReview"
                            (click)="submitReview()">
                            @if (submittingReview) {
                              <span class="spinner-border spinner-border-sm me-2"></span>
                            }
                            {{ 'product.submitReview' | translate }}
                          </button>
                        </div>
                      }
                    } @else {
                      <p class="text-muted">
                        <a routerLink="/auth/login">{{ 'auth.login.title' | translate }}</a>
                        {{ 'product.toWriteReview' | translate }}
                      </p>
                    }
                  </div>
                </div>

                <!-- Reviews List -->
                @if (reviews.length === 0) {
                  <div class="text-center py-4">
                    <i class="far fa-comment-alt fa-3x text-muted mb-3"></i>
                    <p class="text-muted">{{ 'product.noReviews' | translate }}</p>
                  </div>
                } @else {
                  @for (review of reviews; track review.id) {
                    <div class="review-item border-bottom py-3">
                      <div class="d-flex justify-content-between">
                        <div>
                          <strong>{{ review.userName }}</strong>
                          <div class="rating small">
                            @for (star of [1,2,3,4,5]; track star) {
                              <i [class]="star <= review.rating ? 'fas fa-star' : 'far fa-star'"></i>
                            }
                          </div>
                        </div>
                        <small class="text-muted">{{ review.createdAt | date }}</small>
                      </div>
                      <p class="mt-2 mb-0">{{ review.comment }}</p>
                    </div>
                  }
                }
              </div>
            }
          </div>
        </div>

        <!-- Related Products -->
        @if (relatedProducts.length > 0) {
          <section class="related-products mt-5">
            <h4 class="mb-4">{{ 'product.relatedProducts' | translate }}</h4>
            <div class="row g-4">
              @for (relatedProduct of relatedProducts; track relatedProduct.id) {
                <div class="col-6 col-md-3">
                  <div class="card product-card h-100">
                    <img
                      [src]="relatedProduct.imageUrl || 'assets/images/placeholder.png'"
                      [alt]="relatedProduct.nameEn"
                      class="card-img-top product-image">
                    <div class="card-body">
                      <h6 class="card-title">{{ relatedProduct.nameEn }}</h6>
                      <div class="current-price">{{ relatedProduct.price | currency }}</div>
                    </div>
                    <div class="card-footer bg-transparent border-0">
                      <a [routerLink]="['/products', relatedProduct.id]" class="btn btn-outline-primary btn-sm w-100">
                        {{ 'product.viewDetails' | translate }}
                      </a>
                    </div>
                  </div>
                </div>
              }
            </div>
          </section>
        }
      }
    </div>
  `,
  styles: [`
    .main-image {
      position: relative;
    }

    .main-image img {
      width: 100%;
      max-height: 500px;
      object-fit: contain;
    }

    .discount-badge {
      position: absolute;
      top: 15px;
      left: 15px;
      background: var(--danger-color);
      color: white;
      padding: 6px 12px;
      border-radius: 4px;
      font-weight: bold;
    }

    .thumbnail-gallery {
      overflow-x: auto;
    }

    .thumbnail {
      width: 80px;
      height: 80px;
      border: 2px solid var(--border-color);
      border-radius: 8px;
      overflow: hidden;
      cursor: pointer;
      flex-shrink: 0;
    }

    .thumbnail.active {
      border-color: var(--primary-color);
    }

    .thumbnail img {
      width: 100%;
      height: 100%;
      object-fit: cover;
    }

    .quantity-selector {
      display: flex;
      align-items: center;
      gap: 0.5rem;
    }

    .quantity-selector input {
      -moz-appearance: textfield;
    }

    .quantity-selector input::-webkit-outer-spin-button,
    .quantity-selector input::-webkit-inner-spin-button {
      -webkit-appearance: none;
      margin: 0;
    }

    .rating {
      color: var(--warning-color);
    }

    .rating-input {
      color: var(--warning-color);
    }

    .nav-tabs .nav-link {
      color: var(--text-secondary);
      border: none;
      padding: 1rem 1.5rem;
    }

    .nav-tabs .nav-link.active {
      color: var(--primary-color);
      border-bottom: 2px solid var(--primary-color);
      background: transparent;
    }
  `]
})
export class ProductDetailComponent implements OnInit {
  private route = inject(ActivatedRoute);
  private productService = inject(ProductService);
  private cartService = inject(CartService);
  authService = inject(AuthService);

  product: Product | null = null;
  relatedProducts: Product[] = [];
  reviews: ProductReview[] = [];
  loading = true;

  selectedImage = '';
  quantity = 1;
  activeTab = 'description';
  inWishlist = false;
  addingToCart = false;

  // Review form
  showReviewForm = false;
  reviewRating = 0;
  reviewComment = '';
  submittingReview = false;

  ngOnInit(): void {
    this.route.params.subscribe(params => {
      const productId = params['id'];
      if (productId) {
        this.loadProduct(productId);
      }
    });
  }

  private loadProduct(id: string): void {
    this.loading = true;
    this.productService.getProduct(id).subscribe({
      next: (product) => {
        this.product = product;
        this.selectedImage = product.imageUrl || '';
        this.loading = false;
        this.loadRelatedProducts(product.categoryId);
        this.loadReviews(id);
      },
      error: (err) => {
        console.error('Error loading product:', err);
        this.loading = false;
      }
    });
  }

  private loadRelatedProducts(categoryId: string): void {
    this.productService.getProducts({ category: categoryId, pageSize: 4 }).subscribe({
      next: (response) => {
        this.relatedProducts = response.items.filter(p => p.id !== this.product?.id).slice(0, 4);
      },
      error: (err) => console.error('Error loading related products:', err)
    });
  }

  private loadReviews(productId: string): void {
    this.productService.getProductReviews(productId).subscribe({
      next: (reviews) => this.reviews = reviews,
      error: (err) => console.error('Error loading reviews:', err)
    });
  }

  decreaseQuantity(): void {
    if (this.quantity > 1) {
      this.quantity--;
    }
  }

  increaseQuantity(): void {
    if (this.product && this.quantity < this.product.stockQuantity) {
      this.quantity++;
    }
  }

  addToCart(): void {
    if (!this.product) return;

    this.addingToCart = true;
    this.cartService.addToCart(this.product.id, this.quantity).subscribe({
      next: () => {
        this.addingToCart = false;
        // Show success notification
      },
      error: (err) => {
        console.error('Error adding to cart:', err);
        this.addingToCart = false;
      }
    });
  }

  addToWishlist(): void {
    this.inWishlist = !this.inWishlist;
    // Implement wishlist API call
  }

  submitReview(): void {
    if (!this.product || !this.reviewRating || !this.reviewComment) return;

    this.submittingReview = true;
    this.productService.addProductReview(this.product.id, {
      rating: this.reviewRating,
      comment: this.reviewComment
    }).subscribe({
      next: (review) => {
        this.reviews.unshift(review);
        this.showReviewForm = false;
        this.reviewRating = 0;
        this.reviewComment = '';
        this.submittingReview = false;
        if (this.product) {
          this.product.reviewCount = (this.product.reviewCount || 0) + 1;
        }
      },
      error: (err) => {
        console.error('Error submitting review:', err);
        this.submittingReview = false;
      }
    });
  }
}
