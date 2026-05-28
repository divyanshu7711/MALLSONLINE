import { supabase } from './supabaseClient';
import type { Store } from '../types';

export async function getStores(filters?: { search?: string; category?: string }) {
  let query = supabase
    .from('stores')
    .select('*, products(count)')
    .eq('is_active', true)
    .order('created_at', { ascending: false });

  if (filters?.search) {
    query = query.or(`name.ilike.%${filters.search}%,category.ilike.%${filters.search}%`);
  }
  if (filters?.category) {
    query = query.eq('category', filters.category);
  }

  const { data, error } = await query;
  if (error) return [];

  return (data as (Store & { products: { count: number }[] })[]).map(s => ({
    ...s,
    product_count: s.products?.[0]?.count ?? 0,
  }));
}

export async function getStoreBySlug(slug: string) {
  const { data, error } = await supabase
    .from('stores')
    .select('*')
    .eq('slug', slug)
    .eq('is_active', true)
    .maybeSingle();
  if (error) return null;
  return data as Store;
}

export async function getAllStores() {
  const { data, error } = await supabase
    .from('stores')
    .select('*, products(count)')
    .order('created_at', { ascending: false });
  if (error) return [];
  return (data as (Store & { products: { count: number }[] })[]).map(s => ({
    ...s,
    product_count: s.products?.[0]?.count ?? 0,
  }));
}

export async function createStore(store: Omit<Store, 'id' | 'created_at' | 'product_count'>) {
  const { data, error } = await supabase.from('stores').insert(store).select().maybeSingle();
  if (error) throw new Error(error.message);
  return data as Store;
}

export async function updateStore(id: string, updates: Partial<Store>) {
  const { data, error } = await supabase.from('stores').update(updates).eq('id', id).select().maybeSingle();
  if (error) throw new Error(error.message);
  return data as Store;
}

export async function deleteStore(id: string) {
  const { error } = await supabase.from('stores').delete().eq('id', id);
  if (error) throw new Error(error.message);
}

export async function getStoreCategories() {
  const { data, error } = await supabase.from('stores').select('category').eq('is_active', true);
  if (error) return [];
  const cats = [...new Set(data.map(s => s.category))];
  return cats.sort();
}
