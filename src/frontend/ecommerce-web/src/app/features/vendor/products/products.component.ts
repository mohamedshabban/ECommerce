import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { TranslateModule } from '@ngx-translate/core';
import { ProductService, CategoryService } from '../../../core/services';
import { Product, Category, PaginatedResponse } from '../../../core/models';

@Component({
  selector: 'app-vendor-products',
  standalone: true,
  imports: [CommonModule, FormsModule, ReactiveFormsModule, TranslateModule],
  template: `
    <div class="container-fluid py-4">
      <div class="d-flex justify-content-between align-items-center mb-4">
        <h2>{{ 'vendor.products.title' | translate }}</h2>
        <button class="btn btn-primary" (click)="showProductModal()">
          <i class="fas fa-plus me-2"></i>
          {{ 'vendor.products.addNew' | translate }}
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
                placeholder="{{ 'vendor.products.searchPlaceholder' | translate }}"
                [(ngModel)]="searchQuery"
                (input)="search()">
            </div>
            <div class="col-md-3">
              <select class="form-select" [(ngModel)]="filterCategory" (change)="loadProducts()">
                <option value="">{{ 'vendor.products.allCategories' | translate }}</option>
                @for (category of categories; track category.id) {
                  <option [value]="category.id">{{ category.nameEn }}</option>
                }
              </select>
            </div>
            <div class="col-md-2">
              <select class="form-select" [(ngModel)]="filterStatus" (change)="loadProducts()">
                <option value="">{{ 'vendor.products.allStatus' | translate }}</option>
                <option value="active">{{ 'product.active' | translate }}</option>
                <option value="inactive">{{ 'product.inactive' | translate }}</option>
              </select>
            </div>
          </div>
        </div>
      </div>

      <!-- Products Grid -->
      <div class="card">
        <div class="card-body">
          @if (loading) {
            <div class="loading-spinner">
              <div class="spinner-border text-primary" role="status">
                <span class="visually-hidden">Loading...</span>
              </div>
            </div>
          } @else if (products.length === 0) {
            <div class="text-center py-5">
              <i class="fas fa-box-open fa-4x text-muted mb-3"></i>
              <h4>{{ 'vendor.products.noProducts' | translate }}</h4>
              <p class="text-muted">{{ 'vendor.products.noProductsDesc' | translate }}</p>
              <button class="btn btn-primary" (click)="showProductModal()">
                {{ 'vendor.products.addFirst' | translate }}
              </button>
            </div>
          } @else {
            <div class="row g-4">
              @for (product of products; track product.id) {
                <div class="col-md-6 col-lg-4 col-xl-3">
                  <div class="card product-card h-100">
                    <div class="position-relative">
                      <img
                        [src]="product.imageUrl || 'assets/images/placeholder.png'"
                        [alt]="product.nameEn"
                        class="card-img-top"
                        style="height: 180px; object-fit: cover;">
                      <span [class]="'position-absolute top-0 end-0 m-2 badge ' + (product.isActive ? 'bg-success' : 'bg-secondary')">
                        {{ product.isActive ? 'Active' : 'Inactive' }}
                      </span>
                    </div>
                    <div class="card-body">
                      <h6 class="card-title mb-1">{{ product.nameEn }}</h6>
                      <small class="text-muted d-block mb-2">{{ product.categoryName }}</small>
                      <div class="d-flex justify-content-between align-items-center mb-2">
                        <span class="fw-bold text-primary">{{ product.price | currency }}</span>
                        <span [class]="'badge ' + getStockBadge(product.stockQuantity)">
                          {{ product.stockQuantity }} in stock
                        </span>
                      </div>
                      <div class="d-flex gap-2">
                        <button class="btn btn-outline-primary btn-sm flex-grow-1" (click)="editProduct(product)">
                          <i class="fas fa-edit me-1"></i> {{ 'common.edit' | translate }}
                        </button>
                        <button class="btn btn-outline-danger btn-sm" (click)="deleteProduct(product)">
                          <i class="fas fa-trash"></i>
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              }
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
          <div class="modal-dialog modal-lg modal-dialog-scrollable">
            <div class="modal-content">
              <div class="modal-header">
                <h5 class="modal-title">
                  {{ editingProduct ? ('vendor.products.edit' | translate) : ('vendor.products.addNew' | translate) }}
                </h5>
                <button type="button" class="btn-close" (click)="closeModal()"></button>
              </div>
              <div class="modal-body">
                <form [formGroup]="productForm">
                  <div class="row g-3">
                    <div class="col-md-6">
                      <label class="form-label">{{ 'product.nameEn' | translate }} *</label>
                      <input type="text" class="form-control" formControlName="nameEn"
                        [class.is-invalid]="productForm.get('nameEn')?.invalid && productForm.get('nameEn')?.touched">
                    </div>
                    <div class="col-md-6">
                      <label class="form-label">{{ 'product.nameAr' | translate }}</label>
                      <input type="text" class="form-control" formControlName="nameAr" dir="rtl">
                    </div>
                    <div class="col-12">
                      <label class="form-label">{{ 'product.shortDescription' | translate }}</label>
                      <input type="text" class="form-control" formControlName="shortDescription">
                    </div>
                    <div class="col-12">
                      <label class="form-label">{{ 'product.descriptionEn' | translate }}</label>
                      <textarea class="form-control" rows="4" formControlName="descriptionEn"></textarea>
                    </div>
                    <div class="col-12">
                      <label class="form-label">{{ 'product.descriptionAr' | translate }}</label>
                      <textarea class="form-control" rows="4" formControlName="descriptionAr" dir="rtl"></textarea>
                    </div>
                    <div class="col-md-4">
                      <label class="form-label">{{ 'product.price' | translate }} *</label>
                      <div class="input-group">
                        <span class="input-group-text">$</span>
                        <input type="number" class="form-control" formControlName="price" step="0.01"
                          [class.is-invalid]="productForm.get('price')?.invalid && productForm.get('price')?.touched">
                      </div>
                    </div>
                    <div class="col-md-4">
                      <label class="form-label">{{ 'product.originalPrice' | translate }}</label>
                      <div class="input-group">
                        <span class="input-group-text">$</span>
                        <input type="number" class="form-control" formControlName="originalPrice" step="0.01">
                      </div>
                    </div>
                    <div class="col-md-4">
                      <label class="form-label">{{ 'product.stock' | translate }} *</label>
                      <input type="number" class="form-control" formControlName="stockQuantity"
                        [class.is-invalid]="productForm.get('stockQuantity')?.invalid && productForm.get('stockQuantity')?.touched">
                    </div>
                    <div class="col-md-6">
                      <label class="form-label">{{ 'product.category' | translate }} *</label>
                      <select class="form-select" formControlName="categoryId"
                        [class.is-invalid]="productForm.get('categoryId')?.invalid && productForm.get('categoryId')?.touched">
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
                      <small class="text-muted">{{ 'product.imagesHelp' | translate }}</small>
                    </div>
                    @if (imagePreview.length > 0) {
                      <div class="col-12">
                        <div class="d-flex gap-2 flex-wrap">
                          @for (preview of imagePreview; track $index) {
                            <div class="position-relative">
                              <img [src]="preview" class="rounded" style="width: 80px; height: 80px; object-fit: cover;">
                              <button
                                type="button"
                                class="btn btn-sm btn-danger position-absolute top-0 end-0"
                                style="padding: 0 4px; font-size: 10px;"
                                (click)="removeImage($index)">
                                <i class="fas fa-times"></i>
                              </button>
                            </div>
                          }
                        </div>
                      </div>
                    }
                    <div class="col-12">
                      <div class="form-check form-switch">
                        <input type="checkbox" class="form-check-input" formControlName="isActive" id="prodIsActive">
                        <label class="form-check-label" for="prodIsActive">{{ 'product.active' | translate }}</label>
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
export class VendorProductsComponent implements OnInit {
  private fb = inject(FormBuilder);
  private productService = inject(ProductService);
  private categoryService = inject(CategoryService);

  products: Product[] = [];
  categories: Category[] = [];
  loading = true;

  searchQuery = '';
  filterCategory = '';
  filterStatus = '';

  currentPage = 1;
  pageSize = 12;
  totalItems = 0;
  totalPages = 0;

  showModal = false;
  editingProduct: Product | null = null;
  saving = false;
  productForm: FormGroup;
  selectedFiles: File[] = [];
  imagePreview: string[] = [];

  constructor() {
    this.productForm = this.fb.group({
      nameEn: ['', Validators.required],
      nameAr: [''],
      shortDescription: [''],
      descriptionEn: [''],
      descriptionAr: [''],
      price: [0, [Validators.required, Validators.min(0.01)]],
      originalPrice: [null],
      stockQuantity: [0, [Validators.required, Validators.min(0)]],
      categoryId: ['', Validators.required],
      sku: [''],
      isActive: [true]
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
      pageSize: this.pageSize,
      vendorOnly: true
    };

    if (this.searchQuery) params.search = this.searchQuery;
    if (this.filterCategory) params.categoryId = this.filterCategory;
    if (this.filterStatus) params.isActive = this.filterStatus === 'active';

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
    this.productForm.reset({ isActive: true, price: 0, stockQuantity: 0 });
    this.selectedFiles = [];
    this.imagePreview = [];
    this.showModal = true;
  }

  editProduct(product: Product): void {
    this.editingProduct = product;
    this.productForm.patchValue(product);
    this.selectedFiles = [];
    this.imagePreview = product.images?.map(i => i.imageUrl) || [];
    this.showModal = true;
  }

  closeModal(): void {
    this.showModal = false;
    this.editingProduct = null;
    this.selectedFiles = [];
    this.imagePreview = [];
  }

  onFileSelect(event: Event): void {
    const input = event.target as HTMLInputElement;
    if (input.files) {
      const newFiles = Array.from(input.files);
      this.selectedFiles.push(...newFiles);

      newFiles.forEach(file => {
        const reader = new FileReader();
        reader.onload = () => {
          this.imagePreview.push(reader.result as string);
        };
        reader.readAsDataURL(file);
      });
    }
  }

  removeImage(index: number): void {
    this.imagePreview.splice(index, 1);
    if (index < this.selectedFiles.length) {
      this.selectedFiles.splice(index, 1);
    }
  }

  saveProduct(): void {
    if (this.productForm.invalid) return;

    this.saving = true;
    const formData = new FormData();
    const productData = this.productForm.value;

    Object.keys(productData).forEach(key => {
      if (productData[key] !== null && productData[key] !== undefined) {
        formData.append(key, productData[key]);
      }
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
