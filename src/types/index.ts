export type UserRole = 'user' | 'admin';

export interface Profile {
  id: string;
  full_name: string;
  email: string;
  role: UserRole;
  avatar_url: string | null;
  phone: string | null;
  created_at: string;
}

export interface Store {
  id: string;
  name: string;
  slug: string;
  logo_url: string | null;
  category: string;
  description: string | null;
  is_active: boolean;
  created_at: string;
  product_count?: number;
}

export interface Product {
  id: string;
  store_id: string;
  name: string;
  description: string | null;
  price: number;
  image_url: string | null;
  customizable: boolean;
  is_active: boolean;
  created_at: string;
  store?: Store;
}

export interface CartItem {
  id: string;
  user_id: string;
  product_id: string;
  store_id: string;
  quantity: number;
  created_at: string;
  product?: Product;
  store?: Store;
}

export type OrderStatus = 'pending' | 'confirmed' | 'delivered' | 'cancelled';

export interface Order {
  id: string;
  user_id: string;
  total_amount: number;
  status: OrderStatus;
  created_at: string;
  order_items?: OrderItem[];
}

export interface OrderItem {
  id: string;
  order_id: string;
  product_id: string;
  store_id: string;
  quantity: number;
  price: number;
  created_at: string;
  product?: Product;
  store?: Store;
}

export type CustomRequestStatus = 'pending' | 'reviewed' | 'completed' | 'rejected';

export interface CustomRequest {
  id: string;
  user_id: string;
  store_id: string;
  product_id: string | null;
  description: string;
  image_url: string | null;
  status: CustomRequestStatus;
  admin_notes: string | null;
  created_at: string;
  user?: Profile;
  store?: Store;
  product?: Product;
}

export interface DashboardStats {
  totalUsers: number;
  totalStores: number;
  totalProducts: number;
  totalOrders: number;
  pendingCustomRequests: number;
  totalRevenue: number;
}
