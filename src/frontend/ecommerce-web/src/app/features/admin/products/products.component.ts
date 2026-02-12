import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { TranslateModule } from '@ngx-translate/core';
import { ProductService, CategoryService } from '../../../core/services';
import { Product, Category, PaginatedResponse } from '../../../core/models';

@Component({
  selector: 'app-admin-products',
  standalone: true,
  imports: [CommonModule, FormsModule, ReactiveFormsModule, TranslateModule],
  template: `
    <div class="container-fluid py-4">
      <div class="d-flex justify-content-between align-items-center mb-4">
        <h2>{{ 'admin.products.title' | translate }}</h2>
        <button class="btn btn-primary" (click)="showProductModal()">
          <i class="fas fa-plus me-2"></i>
          {{ 'admin.products.addNew' | translate }}
        </button>
      </div>

      <!-- Filters -->
      <div class="card mb-4">
        <div class="card-body">
          <div class="row g-3">
            <div class="col-md-4">
              <input
                type="text"
                class="form-control"
                placeholder="{{ 'admin.products.searchPlaceholder' | translate }}"
                [(ngModel)]="searchQuery"
                (input)="search()">
            </div>
            <div class="col-md-3">
              <select class="form-select" [(ngModel)]="filterCategory" (change)="loadProducts()">
                <option value="">{{ 'admin.products.allCategories' | translate }}</option>
                @for (category of categories; track category.id) {
                  <option [value]="category.id">{{ category.nameEn }}</option>
                }
              </select>
            </div>
            <div class="col-md-2">
              <select class="form-select" [(ngModel)]="filterStock" (change)="loadProducts()">
                <option value="">{{ 'admin.products.allStock' | translate }}</option>
                <option value="inStock">{{ 'product.inStock' | translate }}</option>
                <option value="lowStock">{{ 'admin.products.lowStock' | translate }}</option>
                <option value="outOfStock">{{ 'product.outOfStock' | translate }}</option>
              </select>
            </div>
          </div>
        </div>
      </div>

      <!-- Products Table -->
      <div class="card">
        <div class="card-body">
          @if (loading) {
            <div class="loading-spinner">
              <div class="spinner-border text-primary" role="status">
                <span class="visually-hidden">Loading...</span>
              </div>
            </div>
          } @else {
            <div class="table-responsive">
              <table class="table table-hover">
                <thead>
                  <tr>
                    <th>{{ 'product.product' | translate }}</th>
                    <th>{{ 'product.category' | translate }}</th>
                    <th>{{ 'product.price' | translate }}</th>
                    <th>{{ 'product.stock' | translate }}</th>
                    <th>{{ 'product.status' | translate }}</th>
                    <th>{{ 'common.actions' | translate }}</th>
                  </tr>
                </thead>
                <tbody>
                  @for (product of products; track product.id) {
                    <tr>
                      <td>
                        <div class="d-flex align-items-center">
                          <img
                            [src]="product.imageUrl || 'assets/images/placeholder.svg'"
                            [alt]="product.nameEn"
                            class="rounded me-2"
                            style="width: 50px; height: 50px; object-fit: cover;">
                          <div>
                            <div class="fw-semibold">{{ product.nameEn }}</div>
                            <small class="text-muted">SKU: {{ product.sku }}</small>
                          </div>
                        </div>
                      </td>
                      <td>{{ product.categoryName }}</td>
                      <td>
                        <div>{{ product.price | currency }}</div>
                        @if (product.originalPrice && product.originalPrice > product.price) {
                          <small class="text-muted text-decoration-line-through">
                            {{ product.originalPrice | currency }}
                          </small>
                        }
                      </td>
                      <td>
                        <span [class]="'badge ' + getStockBadge(product.stockQuantity)">
                          {{ product.stockQuantity }}
                        </span>
                      </td>
                      <td>
                        <span [class]="'badge ' + (product.isActive ? 'bg-success' : 'bg-secondary')">
                          {{ product.isActive ? 'Active' : 'Inactive' }}
                        </span>
                      </td>
                      <td>
                        <button class="btn btn-link btn-sm" (click)="editProduct(product)">
                          <i class="fas fa-edit"></i>
                        </button>
                        <button class="btn btn-link btn-sm text-danger" (click)="deleteProduct(product)">
                          <i class="fas fa-trash"></i>
                        </button>
                      </td>
                    </tr>
                  }
                </tbody>
              </table>
            </div>

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

      <!-- Product Modal -->
      @if (showModal) {
        <div class="modal show d-block" tabindex="-1" style="background: rgba(0,0,0,0.5);">
          <div class="modal-dialog modal-lg">
            <div class="modal-content">
              <div class="modal-header">
                <h5 class="modal-title">
                  {{ editingProduct ? ('admin.products.edit' | translate) : ('admin.products.addNew' | translate) }}
                </h5>
                <button type="button" class="btn-close" (click)="closeModal()"></button>
              </div>
              <div class="modal-body">
                <form [formGroup]="productForm">
                  <div class="row g-3">
                    <div class="col-md-6">
                      <label class="form-label">{{ 'product.nameEn' | translate }}</label>
                      <input type="text" class="form-control" formControlName="nameEn">
                    </div>
                    <div class="col-md-6">
                      <label class="form-label">{{ 'product.nameAr' | translate }}</label>
                      <input type="text" class="form-control" formControlName="nameAr" dir="rtl">
                    </div>
                    <div class="col-12">
                      <label class="form-label">{{ 'product.descriptionEn' | translate }}</label>
                      <textarea class="form-control" rows="3" formControlName="descriptionEn"></textarea>
                    </div>
                    <div class="col-12">
                      <label class="form-label">{{ 'product.descriptionAr' | translate }}</label>
                      <textarea class="form-control" rows="3" formControlName="descriptionAr" dir="rtl"></textarea>
                    </div>
                    <div class="col-md-4">
                      <label class="form-label">{{ 'product.price' | translate }}</label>
                      <input type="number" class="form-control" formControlName="price" step="0.01">
                    </div>
                    <div class="col-md-4">
                      <label class="form-label">{{ 'product.originalPrice' | translate }}</label>
                      <input type="number" class="form-control" formControlName="originalPrice" step="0.01">
                    </div>
                    <div class="col-md-4">
                      <label class="form-label">{{ 'product.stock' | translate }}</label>
                      <input type="number" class="form-control" formControlName="stockQuantity">
                    </div>
                    <div class="col-md-6">
                      <label class="form-label">{{ 'product.category' | translate }}</label>
                      <select class="form-select" formControlName="categoryId">
                        <option value="">{{ 'common.select' | translate }}</option>
                        @for (category of categories; track category.id) {
                          <option [value]="category.id">{{ category.nameEn }}</option>
                        }
                      </select>
                    </div>
                    <div class="col-md-6">
                      <label class="form-label">{{ 'product.sku' | translate }}</label>
                      <input type="text" class="form-control" formControlName="sku">
                    </div>
                    <div class="col-12">
                      <label class="form-label">{{ 'product.images' | translate }}</label>
                      <input type="file" class="form-control" multiple accept="image/*" (change)="onFileSelect($event)">
                    </div>
                    <div class="col-12">
                      <div class="form-check">
                        <input type="checkbox" class="form-check-input" formControlName="isActive" id="isActive">
                        <label class="form-check-label" for="isActive">{{ 'product.active' | translate }}</label>
                      </div>
                      <div class="form-check">
                        <input type="checkbox" class="form-check-input" formControlName="isFeatured" id="isFeatured">
                        <label class="form-check-label" for="isFeatured">{{ 'product.featured' | translate }}</label>
                      </div>
                    </div>
                  </div>
                </form>
              </div>
              <div class="modal-footer">
                <button type="button" class="btn btn-secondary" (click)="closeModal()">
                  {{ 'common.cancel' | translate }}
                </button>
                <button
                  type="button"
                  class="btn btn-primary"
                  [disabled]="productForm.invalid || saving"
                  (click)="saveProduct()">
                  @if (saving) {
                    <span class="spinner-border spinner-border-sm me-2"></span>
                  }
                  {{ 'common.save' | translate }}
                </button>
              </div>
            </div>
          </div>
        </div>
      }
    </div>
  `,
  styles: [`
    .loading-spinner {
      min-height: 300px;
    }
  `]
})
export class AdminProductsComponent implements OnInit {
  private fb = inject(FormBuilder);
  private productService = inject(ProductService);
  private categoryService = inject(CategoryService);

  products: Product[] = [];
  categories: Category[] = [];
  loading = true;

  searchQuery = '';
  filterCategory = '';
  filterStock = '';

  currentPage = 1;
  pageSize = 10;
  totalItems = 0;
  totalPages = 0;

  showModal = false;
  editingProduct: Product | null = null;
  saving = false;
  productForm: FormGroup;
  selectedFiles: File[] = [];

  constructor() {
    this.productForm = this.fb.group({
      nameEn: ['', Validators.required],
      nameAr: [''],
      descriptionEn: [''],
      descriptionAr: [''],
      price: [0, [Validators.required, Validators.min(0)]],
      originalPrice: [0],
      stockQuantity: [0, [Validators.required, Validators.min(0)]],
      categoryId: ['', Validators.required],
      sku: [''],
      isActive: [true],
      isFeatured: [false]
    });
  }

  ngOnInit(): void {
    this.loadCategories();
    this.loadProducts();
  }

  private loadCategories(): void {
    this.categoryService.getCategories().subscribe({
      next: (categories) => this.categories = categories,
      error: (err) => console.error('Error loading categories:', err)
    });
  }

  loadProducts(): void {
    this.loading = true;
    const params: any = {
      page: this.currentPage,
      pageSize: this.pageSize
    };

    if (this.searchQuery) params.search = this.searchQuery;
    if (this.filterCategory) params.categoryId = this.filterCategory;

    this.productService.getProducts(params).subscribe({
      next: (response: PaginatedResponse<Product>) => {
        this.products = response.items;
        this.totalItems = response.totalCount;
        this.totalPages = response.totalPages;
        this.loading = false;
      },
      error: (err) => {
        console.error('Error loading products:', err);
        this.loading = false;
      }
    });
  }

  search(): void {
    this.currentPage = 1;
    this.loadProducts();
  }

  getStockBadge(stock: number): string {
    if (stock === 0) return 'bg-danger';
    if (stock <= 10) return 'bg-warning';
    return 'bg-success';
  }

  showProductModal(): void {
    this.editingProduct = null;
    this.productForm.reset({ isActive: true, isFeatured: false, price: 0, stockQuantity: 0 });
    this.showModal = true;
  }

  editProduct(product: Product): void {
    this.editingProduct = product;
    this.productForm.patchValue(product);
    this.showModal = true;
  }

  closeModal(): void {
    this.showModal = false;
    this.editingProduct = null;
    this.selectedFiles = [];
  }

  onFileSelect(event: Event): void {
    const input = event.target as HTMLInputElement;
    if (input.files) {
      this.selectedFiles = Array.from(input.files);
    }
  }

  saveProduct(): void {
    if (this.productForm.invalid) return;

    this.saving = true;
    const formData = new FormData();
    const productData = this.productForm.value;

    Object.keys(productData).forEach(key => {
      formData.append(key, productData[key]);
    });

    this.selectedFiles.forEach(file => {
      formData.append('images', file);
    });

    const request = this.editingProduct
      ? this.productService.updateProduct(this.editingProduct.id, formData)
      : this.productService.createProduct(formData);

    request.subscribe({
      next: () => {
        this.loadProducts();
        this.closeModal();
        this.saving = false;
      },
      error: (err) => {
        console.error('Error saving product:', err);
        this.saving = false;
      }
    });
  }

  deleteProduct(product: Product): void {
    if (!confirm('Are you sure you want to delete this product?')) return;

    this.productService.deleteProduct(product.id).subscribe({
      next: () => this.loadProducts(),
      error: (err) => console.error('Error deleting product:', err)
    });
  }

  goToPage(page: number): void {
    if (page >= 1 && page <= this.totalPages) {
      this.currentPage = page;
      this.loadProducts();
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
}
