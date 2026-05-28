import { supabase } from './supabaseClient';
import type { DashboardStats } from '../types';

export async function getDashboardStats(): Promise<DashboardStats> {
  const [users, stores, products, orders, customRequests, revenue] = await Promise.all([
    supabase.from('profiles').select('id', { count: 'exact', head: true }),
    supabase.from('stores').select('id', { count: 'exact', head: true }),
    supabase.from('products').select('id', { count: 'exact', head: true }),
    supabase.from('orders').select('id', { count: 'exact', head: true }),
    supabase.from('custom_requests').select('id', { count: 'exact', head: true }).eq('status', 'pending'),
    supabase.from('orders').select('total_amount'),
  ]);

  const totalRevenue = (revenue.data ?? []).reduce((sum, o) => sum + Number(o.total_amount), 0);

  return {
    totalUsers: users.count ?? 0,
    totalStores: stores.count ?? 0,
    totalProducts: products.count ?? 0,
    totalOrders: orders.count ?? 0,
    pendingCustomRequests: customRequests.count ?? 0,
    totalRevenue,
  };
}
