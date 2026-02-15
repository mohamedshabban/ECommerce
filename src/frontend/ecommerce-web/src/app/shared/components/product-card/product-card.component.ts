import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { TranslateModule } from '@ngx-translate/core';
import { Product } from '../../../core/models';

@Component({
  selector: 'app-product-card',
  standalone: true,
  imports: [CommonModule, RouterModule, TranslateModule],
  template: `
    <div class="card product-card h-100">
      <a [routerLink]="['/products', product.id]" class="position-relative overflow-hidden d-block">
        @if (badgeType === 'discount' && product.discountPercentage && product.discountPercentage > 0) {
          <span class="discount-badge">-{{ product.discountPercentage }}%</span>
        }
        @if (badgeType === 'new') {
          <span class="badge bg-success position-absolute top-0 start-0 m-2">
            {{ 'product.new' | translate }}
          </span>
        }
        <img
          [src]="product.primaryImageUrl || product.imageUrl || 'assets/images/placeholder.svg'"
          [alt]="product.nameEn"
          class="card-img-top product-image">
        @if (showHoverActions) {
          <div class="product-actions">
            <button class="btn btn-sm btn-light" (click)="onAddToCart($event)" title="Add to Cart">
              <i class="fas fa-shopping-cart"></i>
            </button>
            <button class="btn btn-sm btn-light" (click)="onAddToWishlist($event)" title="Add to Wishlist">
              <i class="far fa-heart"></i>
            </button>
          </div>
        }
      </a>
      <div class="card-body d-flex flex-column">
        @if (showCategory && product.categoryName) {
          <small class="text-muted">{{ product.categoryName }}</small>
        }
        <a [routerLink]="['/products', product.id]" class="text-decoration-none">
          <h6 class="card-title mb-2">{{ product.nameEn }}</h6>
        </a>
        <div class="rating mb-2">
          @for (star of stars; track star) {
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
      @if (!showHoverActions) {
        <div class="card-footer bg-transparent border-0 pt-0">
          <button (click)="onAddToCart($event)" class="btn btn-primary btn-sm w-100">
            <i class="fas fa-shopping-cart me-1"></i>
            {{ 'product.addToCart' | translate }}
          </button>
        </div>
      }
    </div>
  `,
  styles: [`
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
export class ProductCardComponent {
  @Input() product!: Product;
  @Input() showHoverActions = false;
  @Input() showCategory = false;
  @Input() badgeType: 'discount' | 'new' | 'none' = 'discount';
  @Output() addToCart = new EventEmitter<Product>();
  @Output() addToWishlist = new EventEmitter<Product>();

  readonly stars = [1, 2, 3, 4, 5];

  onAddToCart(event: Event): void {
    event.preventDefault();
    event.stopPropagation();
    this.addToCart.emit(this.product);
  }

  onAddToWishlist(event: Event): void {
    event.preventDefault();
    event.stopPropagation();
    this.addToWishlist.emit(this.product);
  }
}
