import { supabase } from './supabaseClient';
import type { Product, Store } from '../types';

type ProductWithStore = Product & { store: Store };

export async function getProducts(filters?: { storeId?: string; search?: string; customizable?: boolean }) {
  let query = supabase
    .from('products')
    .select('*, store:stores(*)')
    .eq('is_active', true)
    .order('created_at', { ascending: false });

  if (filters?.storeId) query = query.eq('store_id', filters.storeId);
  if (filters?.search) query = query.or(`name.ilike.%${filters.search}%,description.ilike.%${filters.search}%`);
  if (filters?.customizable !== undefined) query = query.eq('customizable', filters.customizable);

  const { data, error } = await query;
  if (error) return [];
  return data as ProductWithStore[];
}

export async function getProductById(id: string) {
  const { data, error } = await supabase
    .from('products')
    .select('*, store:stores(*)')
    .eq('id', id)
    .maybeSingle();
  if (error) return null;
  return data as ProductWithStore;
}

export async function getAllProducts(storeId?: string) {
  let query = supabase
    .from('products')
    .select('*, store:stores(*)')
    .order('created_at', { ascending: false });
  if (storeId) query = query.eq('store_id', storeId);
  const { data, error } = await query;
  if (error) return [];
  return data as ProductWithStore[];
}

export async function createProduct(product: Omit<Product, 'id' | 'created_at' | 'store'>) {
  const { data, error } = await supabase.from('products').insert(product).select('*, store:stores(*)').maybeSingle();
  if (error) throw new Error(error.message);
  return data as ProductWithStore;
}

export async function updateProduct(id: string, updates: Partial<Product>) {
  const { data, error } = await supabase.from('products').update(updates).eq('id', id).select('*, store:stores(*)').maybeSingle();
  if (error) throw new Error(error.message);
  return data as ProductWithStore;
}

export async function deleteProduct(id: string) {
  const { error } = await supabase.from('products').delete().eq('id', id);
  if (error) throw new Error(error.message);
}
