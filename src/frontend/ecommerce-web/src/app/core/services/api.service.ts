import { Injectable } from '@angular/core';
import { HttpClient, HttpParams, HttpHeaders } from '@angular/common/http';
import { Observable, map } from 'rxjs';
import { environment } from '../../../environments/environment';
import { ApiResponse } from '../models';

@Injectable({
  providedIn: 'root'
})
export class ApiService {
  private baseUrl = environment.apiUrl;

  constructor(private http: HttpClient) {}

  private extractData<T>(response: any): T {
    // If response has 'data' property (ApiResponse wrapper), extract it
    if (response && typeof response === 'object' && 'data' in response) {
      return response.data as T;
    }
    // Otherwise return as-is
    return response as T;
  }

  get<T>(path: string, options?: { params?: any }): Observable<T> {
    let httpParams = new HttpParams();
    if (options?.params) {
      Object.keys(options.params).forEach(key => {
        if (options.params[key] !== null && options.params[key] !== undefined) {
          httpParams = httpParams.set(key, options.params[key].toString());
        }
      });
    }
    return this.http.get<ApiResponse<T> | T>(`${this.baseUrl}${path}`, { params: httpParams }).pipe(
      map(response => this.extractData<T>(response))
    );
  }

  post<T>(path: string, body: any = {}): Observable<T> {
    return this.http.post<ApiResponse<T> | T>(`${this.baseUrl}${path}`, body).pipe(
      map(response => this.extractData<T>(response))
    );
  }

  put<T>(path: string, body: any = {}): Observable<T> {
    return this.http.put<ApiResponse<T> | T>(`${this.baseUrl}${path}`, body).pipe(
      map(response => this.extractData<T>(response))
    );
  }

  patch<T>(path: string, body: any = {}): Observable<T> {
    return this.http.patch<ApiResponse<T> | T>(`${this.baseUrl}${path}`, body).pipe(
      map(response => this.extractData<T>(response))
    );
  }

  delete<T>(path: string): Observable<T> {
    return this.http.delete<ApiResponse<T> | T>(`${this.baseUrl}${path}`).pipe(
      map(response => this.extractData<T>(response))
    );
  }

  postForm<T>(path: string, formData: FormData): Observable<T> {
    return this.http.post<ApiResponse<T> | T>(`${this.baseUrl}${path}`, formData).pipe(
      map(response => this.extractData<T>(response))
    );
  }

  putForm<T>(path: string, formData: FormData): Observable<T> {
    return this.http.put<ApiResponse<T> | T>(`${this.baseUrl}${path}`, formData).pipe(
      map(response => this.extractData<T>(response))
    );
  }

  getBlob(path: string): Observable<Blob> {
    return this.http.get(`${this.baseUrl}${path}`, { responseType: 'blob' });
  }
}
