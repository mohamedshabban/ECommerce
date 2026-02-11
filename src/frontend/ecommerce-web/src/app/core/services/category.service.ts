import { Injectable, signal } from '@angular/core';
import { Observable, tap } from 'rxjs';
import { ApiService } from './api.service';
import { Category } from '../models';

@Injectable({
  providedIn: 'root'
})
export class CategoryService {
  categories = signal<Category[]>([]);

  constructor(private api: ApiService) {}

  getCategories(includeInactive: boolean = false): Observable<Category[]> {
    return this.api.get<Category[]>('/categories', { params: { includeInactive } }).pipe(
      tap(categories => this.categories.set(categories))
    );
  }

  loadCategories(includeInactive: boolean = false, hierarchical: boolean = true): Observable<Category[]> {
    return this.getCategories(includeInactive);
  }

  getCategory(id: string): Observable<Category> {
    return this.api.get<Category>(`/categories/${id}`);
  }

  getCategoryBySlug(slug: string): Observable<Category> {
    return this.api.get<Category>(`/categories/slug/${slug}`);
  }

  createCategory(category: FormData): Observable<Category> {
    return this.api.postForm<Category>('/categories', category);
  }

  updateCategory(id: string, category: FormData): Observable<Category> {
    return this.api.putForm<Category>(`/categories/${id}`, category);
  }

  deleteCategory(id: string): Observable<void> {
    return this.api.delete<void>(`/categories/${id}`);
  }

  uploadImage(categoryId: string, file: File): Observable<Category> {
    const formData = new FormData();
    formData.append('file', file);
    return this.api.postForm<Category>(`/categories/${categoryId}/image`, formData);
  }
}
