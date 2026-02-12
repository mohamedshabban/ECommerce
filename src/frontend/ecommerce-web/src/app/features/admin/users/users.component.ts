import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { TranslateModule } from '@ngx-translate/core';
import { ApiService } from '../../../core/services';
import { User, UserRole, PaginatedResponse } from '../../../core/models';

@Component({
  selector: 'app-users',
  standalone: true,
  imports: [CommonModule, FormsModule, TranslateModule],
  template: `
    <div class="container-fluid py-4">
      <div class="d-flex justify-content-between align-items-center mb-4">
        <h2>{{ 'admin.users.title' | translate }}</h2>
      </div>

      <!-- Filters -->
      <div class="card mb-4">
        <div class="card-body">
          <div class="row g-3">
            <div class="col-md-4">
              <input
                type="text"
                class="form-control"
                placeholder="{{ 'admin.users.searchPlaceholder' | translate }}"
                [(ngModel)]="searchQuery"
                (input)="search()">
            </div>
            <div class="col-md-3">
              <select class="form-select" [(ngModel)]="filterRole" (change)="loadUsers()">
                <option value="">{{ 'admin.users.allRoles' | translate }}</option>
                <option value="Customer">{{ 'auth.roles.customer' | translate }}</option>
                <option value="Vendor">{{ 'auth.roles.vendor' | translate }}</option>
                <option value="Admin">{{ 'auth.roles.admin' | translate }}</option>
              </select>
            </div>
            <div class="col-md-3">
              <select class="form-select" [(ngModel)]="filterStatus" (change)="loadUsers()">
                <option value="">{{ 'admin.users.allStatus' | translate }}</option>
                <option value="active">{{ 'admin.users.active' | translate }}</option>
                <option value="inactive">{{ 'admin.users.inactive' | translate }}</option>
              </select>
            </div>
          </div>
        </div>
      </div>

      <!-- Users Table -->
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
                    <th>{{ 'admin.users.user' | translate }}</th>
                    <th>{{ 'auth.email' | translate }}</th>
                    <th>{{ 'admin.users.role' | translate }}</th>
                    <th>{{ 'admin.users.status' | translate }}</th>
                    <th>{{ 'admin.users.joinedDate' | translate }}</th>
                    <th>{{ 'common.actions' | translate }}</th>
                  </tr>
                </thead>
                <tbody>
                  @for (user of users; track user.id) {
                    <tr>
                      <td>
                        <div class="d-flex align-items-center">
                          <img
                            [src]="user.avatarUrl || 'assets/images/avatar-placeholder.svg'"
                            [alt]="user.firstName"
                            class="rounded-circle me-2"
                            style="width: 40px; height: 40px; object-fit: cover;">
                          <div>
                            <div class="fw-semibold">{{ user.firstName }} {{ user.lastName }}</div>
                          </div>
                        </div>
                      </td>
                      <td>{{ user.email }}</td>
                      <td>
                        <span [class]="'badge ' + getRoleBadge(user.role)">
                          {{ user.role }}
                        </span>
                      </td>
                      <td>
                        <span [class]="'badge ' + (user.isActive ? 'bg-success' : 'bg-secondary')">
                          {{ user.isActive ? 'Active' : 'Inactive' }}
                        </span>
                      </td>
                      <td>{{ user.createdAt | date:'mediumDate' }}</td>
                      <td>
                        <div class="dropdown">
                          <button class="btn btn-link" data-bs-toggle="dropdown">
                            <i class="fas fa-ellipsis-v"></i>
                          </button>
                          <ul class="dropdown-menu">
                            <li>
                              <button class="dropdown-item" (click)="viewUser(user)">
                                <i class="fas fa-eye me-2"></i> {{ 'common.view' | translate }}
                              </button>
                            </li>
                            <li>
                              <button class="dropdown-item" (click)="editUser(user)">
                                <i class="fas fa-edit me-2"></i> {{ 'common.edit' | translate }}
                              </button>
                            </li>
                            <li><hr class="dropdown-divider"></li>
                            <li>
                              <button
                                class="dropdown-item"
                                [class.text-danger]="user.isActive"
                                [class.text-success]="!user.isActive"
                                (click)="toggleUserStatus(user)">
                                @if (user.isActive) {
                                  <i class="fas fa-ban me-2"></i> {{ 'admin.users.deactivate' | translate }}
                                } @else {
                                  <i class="fas fa-check me-2"></i> {{ 'admin.users.activate' | translate }}
                                }
                              </button>
                            </li>
                          </ul>
                        </div>
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
    </div>
  `,
  styles: [`
    .loading-spinner {
      min-height: 300px;
    }
  `]
})
export class UsersComponent implements OnInit {
  private apiService = inject(ApiService);

  users: User[] = [];
  loading = true;

  searchQuery = '';
  filterRole = '';
  filterStatus = '';

  currentPage = 1;
  pageSize = 10;
  totalItems = 0;
  totalPages = 0;

  ngOnInit(): void {
    this.loadUsers();
  }

  loadUsers(): void {
    this.loading = true;
    const params: any = {
      page: this.currentPage,
      pageSize: this.pageSize
    };

    if (this.searchQuery) params.search = this.searchQuery;
    if (this.filterRole) params.role = this.filterRole;
    if (this.filterStatus) params.isActive = this.filterStatus === 'active';

    this.apiService.get<PaginatedResponse<User>>('/admin/users', { params }).subscribe({
      next: (response) => {
        this.users = response.items;
        this.totalItems = response.totalCount;
        this.totalPages = response.totalPages;
        this.loading = false;
      },
      error: (err) => {
        console.error('Error loading users:', err);
        this.loading = false;
      }
    });
  }

  search(): void {
    this.currentPage = 1;
    this.loadUsers();
  }

  getRoleBadge(role: UserRole): string {
    const badges: Record<UserRole, string> = {
      'Customer': 'bg-primary',
      'Vendor': 'bg-info',
      'Admin': 'bg-danger'
    };
    return badges[role] || 'bg-secondary';
  }

  viewUser(user: User): void {
    console.log('View user:', user.id);
  }

  editUser(user: User): void {
    console.log('Edit user:', user.id);
  }

  toggleUserStatus(user: User): void {
    const action = user.isActive ? 'deactivate' : 'activate';
    if (!confirm(`Are you sure you want to ${action} this user?`)) return;

    this.apiService.patch(`/admin/users/${user.id}/status`, { isActive: !user.isActive }).subscribe({
      next: () => {
        user.isActive = !user.isActive;
      },
      error: (err) => console.error('Error updating user status:', err)
    });
  }

  goToPage(page: number): void {
    if (page >= 1 && page <= this.totalPages) {
      this.currentPage = page;
      this.loadUsers();
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
