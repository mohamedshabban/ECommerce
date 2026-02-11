import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { TranslateModule } from '@ngx-translate/core';
import { CategoryService } from '../../../core/services';
import { Category } from '../../../core/models';

@Component({
  selector: 'app-categories',
  standalone: true,
  imports: [CommonModule, FormsModule, ReactiveFormsModule, TranslateModule],
  template: `
    <div class="container-fluid py-4">
      <div class="d-flex justify-content-between align-items-center mb-4">
        <h2>{{ 'admin.categories.title' | translate }}</h2>
        <button class="btn btn-primary" (click)="showCategoryModal()">
          <i class="fas fa-plus me-2"></i>
          {{ 'admin.categories.addNew' | translate }}
        </button>
      </div>

      <!-- Categories Table -->
      <div class="card">
        <div class="card-body">
          @if (loading) {
            <div class="loading-spinner">
              <div class="spinner-border text-primary" role="status">
                <span class="visually-hidden">Loading...</span>
              </div>
            </div>
          } @else if (categories.length === 0) {
            <div class="text-center py-5">
              <i class="fas fa-folder-open fa-4x text-muted mb-3"></i>
              <h4>{{ 'admin.categories.noCategories' | translate }}</h4>
            </div>
          } @else {
            <div class="table-responsive">
              <table class="table table-hover">
                <thead>
                  <tr>
                    <th>{{ 'admin.categories.category' | translate }}</th>
                    <th>{{ 'admin.categories.slug' | translate }}</th>
                    <th>{{ 'admin.categories.products' | translate }}</th>
                    <th>{{ 'admin.categories.status' | translate }}</th>
                    <th>{{ 'common.actions' | translate }}</th>
                  </tr>
                </thead>
                <tbody>
                  @for (category of categories; track category.id) {
                    <tr>
                      <td>
                        <div class="d-flex align-items-center">
                          @if (category.imageUrl) {
                            <img
                              [src]="category.imageUrl"
                              [alt]="category.nameEn"
                              class="rounded me-2"
                              style="width: 40px; height: 40px; object-fit: cover;">
                          } @else {
                            <div class="category-icon me-2">
                              <i [class]="'fas fa-' + (category.icon || 'folder')"></i>
                            </div>
                          }
                          <div>
                            <div class="fw-semibold">{{ category.nameEn }}</div>
                            <small class="text-muted">{{ category.nameAr }}</small>
                          </div>
                        </div>
                      </td>
                      <td><code>{{ category.slug }}</code></td>
                      <td>{{ category.productCount || 0 }}</td>
                      <td>
                        <span [class]="'badge ' + (category.isActive ? 'bg-success' : 'bg-secondary')">
                          {{ category.isActive ? 'Active' : 'Inactive' }}
                        </span>
                      </td>
                      <td>
                        <button class="btn btn-link btn-sm" (click)="editCategory(category)">
                          <i class="fas fa-edit"></i>
                        </button>
                        <button
                          class="btn btn-link btn-sm text-danger"
                          [disabled]="category.productCount && category.productCount > 0"
                          (click)="deleteCategory(category)">
                          <i class="fas fa-trash"></i>
                        </button>
                      </td>
                    </tr>
                  }
                </tbody>
              </table>
            </div>
          }
        </div>
      </div>

      <!-- Category Modal -->
      @if (showModal) {
        <div class="modal show d-block" tabindex="-1" style="background: rgba(0,0,0,0.5);">
          <div class="modal-dialog">
            <div class="modal-content">
              <div class="modal-header">
                <h5 class="modal-title">
                  {{ editingCategory ? ('admin.categories.edit' | translate) : ('admin.categories.addNew' | translate) }}
                </h5>
                <button type="button" class="btn-close" (click)="closeModal()"></button>
              </div>
              <div class="modal-body">
                <form [formGroup]="categoryForm">
                  <div class="mb-3">
                    <label class="form-label">{{ 'admin.categories.nameEn' | translate }}</label>
                    <input type="text" class="form-control" formControlName="nameEn"
                      [class.is-invalid]="categoryForm.get('nameEn')?.invalid && categoryForm.get('nameEn')?.touched">
                  </div>
                  <div class="mb-3">
                    <label class="form-label">{{ 'admin.categories.nameAr' | translate }}</label>
                    <input type="text" class="form-control" formControlName="nameAr" dir="rtl">
                  </div>
                  <div class="mb-3">
                    <label class="form-label">{{ 'admin.categories.slug' | translate }}</label>
                    <input type="text" class="form-control" formControlName="slug">
                    <small class="text-muted">{{ 'admin.categories.slugHelp' | translate }}</small>
                  </div>
                  <div class="mb-3">
                    <label class="form-label">{{ 'admin.categories.description' | translate }}</label>
                    <textarea class="form-control" rows="3" formControlName="description"></textarea>
                  </div>
                  <div class="mb-3">
                    <label class="form-label">{{ 'admin.categories.icon' | translate }}</label>
                    <input type="text" class="form-control" formControlName="icon" placeholder="e.g., laptop, shirt, home">
                    <small class="text-muted">FontAwesome icon name</small>
                  </div>
                  <div class="mb-3">
                    <label class="form-label">{{ 'admin.categories.image' | translate }}</label>
                    <input type="file" class="form-control" accept="image/*" (change)="onFileSelect($event)">
                  </div>
                  <div class="mb-3">
                    <label class="form-label">{{ 'admin.categories.parent' | translate }}</label>
                    <select class="form-select" formControlName="parentId">
                      <option value="">{{ 'admin.categories.noParent' | translate }}</option>
                      @for (cat of categories; track cat.id) {
                        @if (cat.id !== editingCategory?.id) {
                          <option [value]="cat.id">{{ cat.nameEn }}</option>
                        }
                      }
                    </select>
                  </div>
                  <div class="form-check">
                    <input type="checkbox" class="form-check-input" formControlName="isActive" id="catIsActive">
                    <label class="form-check-label" for="catIsActive">{{ 'admin.categories.active' | translate }}</label>
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
                  [disabled]="categoryForm.invalid || saving"
                  (click)="saveCategory()">
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

    .category-icon {
      width: 40px;
      height: 40px;
      background: var(--bg-secondary);
      border-radius: 8px;
      display: flex;
      align-items: center;
      justify-content: center;
      color: var(--primary-color);
    }
  `]
})
export class CategoriesComponent implements OnInit {
  private fb = inject(FormBuilder);
  private categoryService = inject(CategoryService);

  categories: Category[] = [];
  loading = true;

  showModal = false;
  editingCategory: Category | null = null;
  saving = false;
  categoryForm: FormGroup;
  selectedFile: File | null = null;

  constructor() {
    this.categoryForm = this.fb.group({
      nameEn: ['', Validators.required],
      nameAr: [''],
      slug: [''],
      description: [''],
      icon: [''],
      parentId: [''],
      isActive: [true]
    });

    // Auto-generate slug from nameEn
    this.categoryForm.get('nameEn')?.valueChanges.subscribe(value => {
      if (!this.editingCategory) {
        const slug = value?.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
        this.categoryForm.patchValue({ slug }, { emitEvent: false });
      }
    });
  }

  ngOnInit(): void {
    this.loadCategories();
  }

  loadCategories(): void {
    this.loading = true;
    this.categoryService.getCategories().subscribe({
      next: (categories) => {
        this.categories = categories;
        this.loading = false;
      },
      error: (err) => {
        console.error('Error loading categories:', err);
        this.loading = false;
      }
    });
  }

  showCategoryModal(): void {
    this.editingCategory = null;
    this.categoryForm.reset({ isActive: true });
    this.showModal = true;
  }

  editCategory(category: Category): void {
    this.editingCategory = category;
    this.categoryForm.patchValue(category);
    this.showModal = true;
  }

  closeModal(): void {
    this.showModal = false;
    this.editingCategory = null;
    this.selectedFile = null;
  }

  onFileSelect(event: Event): void {
    const input = event.target as HTMLInputElement;
    if (input.files?.length) {
      this.selectedFile = input.files[0];
    }
  }

  saveCategory(): void {
    if (this.categoryForm.invalid) return;

    this.saving = true;
    const formData = new FormData();
    const categoryData = this.categoryForm.value;

    Object.keys(categoryData).forEach(key => {
      if (categoryData[key] !== null && categoryData[key] !== undefined) {
        formData.append(key, categoryData[key]);
      }
    });

    if (this.selectedFile) {
      formData.append('image', this.selectedFile);
    }

    const request = this.editingCategory
      ? this.categoryService.updateCategory(this.editingCategory.id, formData)
      : this.categoryService.createCategory(formData);

    request.subscribe({
      next: () => {
        this.loadCategories();
        this.closeModal();
        this.saving = false;
      },
      error: (err) => {
        console.error('Error saving category:', err);
        this.saving = false;
      }
    });
  }

  deleteCategory(category: Category): void {
    if (!confirm('Are you sure you want to delete this category?')) return;

    this.categoryService.deleteCategory(category.id).subscribe({
      next: () => this.loadCategories(),
      error: (err) => console.error('Error deleting category:', err)
    });
  }
}
