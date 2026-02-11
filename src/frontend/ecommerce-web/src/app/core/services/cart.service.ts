import { Injectable, signal, computed } from '@angular/core';
import { Observable, tap, map } from 'rxjs';
import { ApiService } from './api.service';
import { Cart, CartItem } from '../models';

@Injectable({
  providedIn: 'root'
})
export class CartService {
  cart = signal<Cart | null>(null);

  cartItems = computed(() => this.cart()?.items ?? []);
  cartTotal = computed(() => this.cart()?.subTotal ?? 0);
  cartItemCount = computed(() => this.cart()?.totalItems ?? 0);
  itemCount = computed(() => this.cart()?.totalItems ?? 0);
  isEmpty = computed(() => this.cartItemCount() === 0);

  constructor(private api: ApiService) {}

  getCart(): Observable<Cart> {
    return this.api.get<Cart>('/cart').pipe(
      tap(cart => this.cart.set(cart))
    );
  }

  loadCart(): Observable<Cart> {
    return this.getCart();
  }

  addToCart(productId: string, quantity: number = 1): Observable<Cart> {
    return this.api.post<Cart>('/cart/items', { productId, quantity }).pipe(
      tap(cart => this.cart.set(cart))
    );
  }

  updateCartItem(itemId: string, quantity: number): Observable<Cart> {
    return this.api.put<Cart>(`/cart/items/${itemId}`, { quantity }).pipe(
      tap(cart => this.cart.set(cart))
    );
  }

  updateQuantity(itemId: string, quantity: number): Observable<Cart> {
    return this.updateCartItem(itemId, quantity);
  }

  removeFromCart(itemId: string): Observable<Cart> {
    return this.api.delete<Cart>(`/cart/items/${itemId}`).pipe(
      tap(cart => this.cart.set(cart))
    );
  }

  removeItem(itemId: string): Observable<Cart> {
    return this.removeFromCart(itemId);
  }

  clearCart(): Observable<void> {
    return this.api.delete<void>('/cart').pipe(
      tap(() => this.cart.set(null))
    );
  }

  applyCoupon(code: string): Observable<Cart> {
    return this.api.post<Cart>('/cart/coupon', { code }).pipe(
      tap(cart => this.cart.set(cart))
    );
  }

  incrementQuantity(item: CartItem): void {
    if (item.availableStock && item.quantity < item.availableStock) {
      this.updateQuantity(item.id, item.quantity + 1).subscribe();
    }
  }

  decrementQuantity(item: CartItem): void {
    if (item.quantity > 1) {
      this.updateQuantity(item.id, item.quantity - 1).subscribe();
    }
  }
}
