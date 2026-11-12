import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { Product, CartItem, Order } from '../types';
import { INITIAL_PRODUCTS } from '../data/mockProducts';

export interface ReduxUser {
  uid: string;
  email: string | null;
  displayName: string | null;
}

export interface ToastItem {
  id: string;
  message: string;
  type: 'success' | 'error' | 'info';
}

interface AppState {
  user: ReduxUser | null;
  products: Product[];
  cart: CartItem[];
  orders: Order[];
  isLoading: boolean;
  loadingMessage: string;
  toasts: ToastItem[];
}

const loadFromLocalStorage = <T,>(key: string, fallback: T): T => {
  try {
    const raw = localStorage.getItem(key);
    return raw ? JSON.parse(raw) : fallback;
  } catch {
    return fallback;
  }
};

const loadFromSessionStorage = <T,>(key: string, fallback: T): T => {
  try {
    const raw = sessionStorage.getItem(key);
    return raw ? JSON.parse(raw) : fallback;
  } catch {
    return fallback;
  }
};

const initialState: AppState = {
  user: loadFromSessionStorage<ReduxUser | null>('eastgate_session_user', null),
  products: loadFromLocalStorage<Product[]>('eastgate_products_v1', INITIAL_PRODUCTS),
  cart: loadFromLocalStorage<CartItem[]>('eastgate_cart_v1', []),
  orders: loadFromLocalStorage<Order[]>('eastgate_orders_v1', []),
  isLoading: false,
  loadingMessage: '',
  toasts: [],
};

const appSlice = createSlice({
  name: 'app',
  initialState,
  reducers: {
    setUser(state, action: PayloadAction<ReduxUser | null>) {
      state.user = action.payload;
      try {
        if (action.payload) {
          sessionStorage.setItem('eastgate_session_user', JSON.stringify(action.payload));
        } else {
          sessionStorage.removeItem('eastgate_session_user');
        }
      } catch {
        // ignore storage errors
      }
    },
    setProducts(state, action: PayloadAction<Product[]>) {
      state.products = action.payload;
      try {
        localStorage.setItem('eastgate_products_v1', JSON.stringify(action.payload));
      } catch {
        // ignore storage errors
      }
    },
    setCart(state, action: PayloadAction<CartItem[]>) {
      state.cart = action.payload;
      try {
        localStorage.setItem('eastgate_cart_v1', JSON.stringify(action.payload));
      } catch {
        // ignore storage errors
      }
    },
    setOrders(state, action: PayloadAction<Order[]>) {
      state.orders = action.payload;
      try {
        localStorage.setItem('eastgate_orders_v1', JSON.stringify(action.payload));
      } catch {
        // ignore storage errors
      }
    },
    setLoading(state, action: PayloadAction<{ isLoading: boolean; message?: string }>) {
      state.isLoading = action.payload.isLoading;
      state.loadingMessage = action.payload.message || '';
    },
    addToast(state, action: PayloadAction<Omit<ToastItem, 'id'>>) {
      const id = `toast-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`;
      state.toasts.push({ id, ...action.payload });
    },
    removeToast(state, action: PayloadAction<string>) {
      state.toasts = state.toasts.filter((t) => t.id !== action.payload);
    },
  },
});

export const {
  setUser,
  setProducts,
  setCart,
  setOrders,
  setLoading,
  addToast,
  removeToast,
} = appSlice.actions;

export default appSlice.reducer;
