import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { ApiService } from './api.service';
import {
  PaginatedResponse,
  Product,
  ProductReview
} from '../models';

@Injectable({
  providedIn: 'root'
})
export class ProductService {
  constructor(private api: ApiService) {}

  getProducts(params: any = {}): Observable<PaginatedResponse<Product>> {
    return this.api.get<PaginatedResponse<Product>>('/products', { params });
  }

  getProduct(id: string): Observable<Product> {
    return this.api.get<Product>(`/products/${id}`);
  }

  getFeaturedProducts(count: number = 8): Observable<Product[]> {
    return this.api.get<Product[]>('/products/featured', { params: { count } });
  }

  getNewArrivals(count: number = 4): Observable<Product[]> {
    return this.api.get<Product[]>('/products/new-arrivals', { params: { count } });
  }

  searchProducts(query: string, params: any = {}): Observable<PaginatedResponse<Product>> {
    return this.api.get<PaginatedResponse<Product>>('/products/search', { params: { query, ...params } });
  }

  getAutocompleteSuggestions(query: string): Observable<string[]> {
    return this.api.get<string[]>('/products/autocomplete', { params: { query } });
  }

  getProductReviews(productId: string): Observable<ProductReview[]> {
    return this.api.get<ProductReview[]>(`/products/${productId}/reviews`);
  }

  addProductReview(productId: string, review: { rating: number; comment: string }): Observable<ProductReview> {
    return this.api.post<ProductReview>(`/products/${productId}/reviews`, review);
  }

  createProduct(product: FormData): Observable<Product> {
    return this.api.postForm<Product>('/products', product);
  }

  updateProduct(id: string, product: FormData): Observable<Product> {
    return this.api.putForm<Product>(`/products/${id}`, product);
  }

  deleteProduct(id: string): Observable<void> {
    return this.api.delete<void>(`/products/${id}`);
  }

  uploadImages(productId: string, files: File[], isPrimary: boolean = false): Observable<Product> {
    const formData = new FormData();
    files.forEach(file => formData.append('files', file));
    return this.api.postForm<Product>(`/products/${productId}/images?isPrimary=${isPrimary}`, formData);
  }

  deleteImage(productId: string, imageId: string): Observable<void> {
    return this.api.delete<void>(`/products/${productId}/images/${imageId}`);
  }
}
