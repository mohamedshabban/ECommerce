import { Injectable, signal, computed } from '@angular/core';
import { Router } from '@angular/router';
import { Observable, tap, BehaviorSubject } from 'rxjs';
import { ApiService } from './api.service';
import { AuthResponse, LoginRequest, RegisterRequest, User, UserRole } from '../models';
import { environment } from '../../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private readonly TOKEN_KEY = 'access_token';
  private readonly REFRESH_TOKEN_KEY = 'refresh_token';
  private readonly USER_KEY = 'current_user';

  private currentUserSubject = new BehaviorSubject<User | null>(this.getStoredUser());
  currentUser$ = this.currentUserSubject.asObservable();

  isAuthenticated = signal(this.hasValidToken());
  currentUser = signal<User | null>(this.getStoredUser());

  isAdmin = computed(() => this.currentUser()?.role === UserRole.Admin);
  isVendor = computed(() =>
    this.currentUser()?.role === UserRole.Vendor ||
    this.currentUser()?.role === UserRole.Admin
  );

  constructor(
    private api: ApiService,
    private router: Router
  ) {}

  login(credentials: LoginRequest): Observable<AuthResponse> {
    return this.api.post<AuthResponse>('/auth/login', credentials).pipe(
      tap(response => this.handleAuthResponse(response))
    );
  }

  register(data: RegisterRequest): Observable<AuthResponse> {
    return this.api.post<AuthResponse>('/auth/register', data).pipe(
      tap(response => this.handleAuthResponse(response))
    );
  }

  loginWithGoogle(): void {
    const clientId = environment.oauth?.google?.clientId;
    if (!clientId) {
      console.error('Google client ID not configured');
      return;
    }
    const redirectUri = `${window.location.origin}/auth/google/callback`;
    const scope = 'email profile';
    const url = `https://accounts.google.com/o/oauth2/v2/auth?client_id=${clientId}&redirect_uri=${redirectUri}&scope=${scope}&response_type=code`;
    window.location.href = url;
  }

  loginWithFacebook(): void {
    const appId = environment.oauth?.facebook?.appId;
    if (!appId) {
      console.error('Facebook app ID not configured');
      return;
    }
    const redirectUri = `${window.location.origin}/auth/facebook/callback`;
    const scope = 'email,public_profile';
    const url = `https://www.facebook.com/v18.0/dialog/oauth?client_id=${appId}&redirect_uri=${redirectUri}&scope=${scope}`;
    window.location.href = url;
  }

  handleOAuthCallback(provider: string, code: string): Observable<AuthResponse> {
    return this.api.post<AuthResponse>(`/auth/${provider}`, { code }).pipe(
      tap(response => this.handleAuthResponse(response))
    );
  }

  logout(): void {
    this.api.post('/auth/logout').subscribe();
    this.clearAuth();
    this.router.navigate(['/auth/login']);
  }

  refreshToken(): Observable<AuthResponse> {
    const refreshToken = localStorage.getItem(this.REFRESH_TOKEN_KEY);
    return this.api.post<AuthResponse>('/auth/refresh-token', { refreshToken }).pipe(
      tap(response => this.handleAuthResponse(response))
    );
  }

  forgotPassword(email: string): Observable<void> {
    return this.api.post<void>('/auth/forgot-password', { email });
  }

  resetPassword(email: string, token: string, newPassword: string): Observable<void> {
    return this.api.post<void>('/auth/reset-password', { email, token, newPassword });
  }

  changePassword(data: { currentPassword: string; newPassword: string }): Observable<void> {
    return this.api.post<void>('/auth/change-password', data);
  }

  updateProfile(data: Partial<User>): Observable<User> {
    return this.api.put<User>('/users/profile', data).pipe(
      tap(user => {
        this.currentUser.set(user);
        this.currentUserSubject.next(user);
        localStorage.setItem(this.USER_KEY, JSON.stringify(user));
      })
    );
  }

  getToken(): string | null {
    return localStorage.getItem(this.TOKEN_KEY);
  }

  private handleAuthResponse(response: AuthResponse): void {
    localStorage.setItem(this.TOKEN_KEY, response.accessToken);
    localStorage.setItem(this.REFRESH_TOKEN_KEY, response.refreshToken);

    const user: User = {
      id: response.userId,
      email: response.email,
      firstName: response.firstName,
      lastName: response.lastName,
      role: response.role,
      isActive: true,
      emailConfirmed: true,
      createdAt: new Date()
    };

    localStorage.setItem(this.USER_KEY, JSON.stringify(user));
    this.currentUser.set(user);
    this.currentUserSubject.next(user);
    this.isAuthenticated.set(true);
  }

  private clearAuth(): void {
    localStorage.removeItem(this.TOKEN_KEY);
    localStorage.removeItem(this.REFRESH_TOKEN_KEY);
    localStorage.removeItem(this.USER_KEY);
    this.currentUser.set(null);
    this.currentUserSubject.next(null);
    this.isAuthenticated.set(false);
  }

  private hasValidToken(): boolean {
    const token = localStorage.getItem(this.TOKEN_KEY);
    return !!token;
  }

  private getStoredUser(): User | null {
    const userJson = localStorage.getItem(this.USER_KEY);
    return userJson ? JSON.parse(userJson) : null;
  }
}
