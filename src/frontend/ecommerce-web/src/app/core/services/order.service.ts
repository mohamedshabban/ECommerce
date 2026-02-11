import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { ApiService } from './api.service';
import { Order, OrderStatus, Address, PaginatedResponse } from '../models';

export interface OrderFilter {
  status?: string;
  paymentStatus?: string;
  fromDate?: string;
  toDate?: string;
}

@Injectable({
  providedIn: 'root'
})
export class OrderService {
  constructor(private api: ApiService) {}

  // User orders
  getUserOrders(): Observable<Order[]> {
    return this.api.get<Order[]>('/orders');
  }

  getOrder(id: string): Observable<Order> {
    return this.api.get<Order>(`/orders/${id}`);
  }

  createOrder(orderData: any): Observable<{ orderId: string; paypalApprovalUrl?: string }> {
    return this.api.post<{ orderId: string; paypalApprovalUrl?: string }>('/orders', orderData);
  }

  cancelOrder(orderId: string): Observable<void> {
    return this.api.put<void>(`/orders/${orderId}/cancel`, {});
  }

  downloadInvoice(orderId: string): Observable<Blob> {
    return this.api.getBlob(`/orders/${orderId}/invoice`);
  }

  // Admin orders
  getAllOrders(params: any = {}): Observable<PaginatedResponse<Order>> {
    return this.api.get<PaginatedResponse<Order>>('/admin/orders', { params });
  }

  updateOrderStatus(orderId: string, status: OrderStatus): Observable<Order> {
    return this.api.put<Order>(`/admin/orders/${orderId}/status`, { status });
  }

  // Addresses
  getUserAddresses(): Observable<Address[]> {
    return this.api.get<Address[]>('/users/addresses');
  }

  addAddress(address: Partial<Address>): Observable<Address> {
    return this.api.post<Address>('/users/addresses', address);
  }

  updateAddress(id: string, address: Partial<Address>): Observable<Address> {
    return this.api.put<Address>(`/users/addresses/${id}`, address);
  }

  deleteAddress(id: string): Observable<void> {
    return this.api.delete<void>(`/users/addresses/${id}`);
  }

  setDefaultAddress(id: string): Observable<void> {
    return this.api.put<void>(`/users/addresses/${id}/default`, {});
  }

  // PayPal
  createPayPalOrder(shippingAddressId: string, notes?: string): Observable<{ orderId: string; approvalUrl: string }> {
    return this.api.post<{ orderId: string; approvalUrl: string }>('/orders/checkout/paypal', {
      shippingAddressId,
      notes
    });
  }

  capturePayPalOrder(payPalOrderId: string): Observable<Order> {
    return this.api.post<Order>('/orders/checkout/paypal/capture', { payPalOrderId });
  }
}
