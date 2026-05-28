import { supabase } from './supabaseClient';
import type { CustomRequest, CustomRequestStatus } from '../types';

type CustomRequestWithDetails = CustomRequest & {
  user?: { full_name: string; email: string };
  store?: { name: string };
  product?: { name: string };
};

export async function createCustomRequest(
  request: Omit<CustomRequest, 'id' | 'created_at' | 'status' | 'admin_notes' | 'user' | 'store' | 'product'>,
  meta?: { userName?: string; userEmail?: string; storeName?: string; productName?: string }
) {
  const { data, error } = await supabase
    .from('custom_requests')
    .insert(request)
    .select()
    .maybeSingle();
  if (error) throw new Error(error.message);

  // Send email notification via edge function
  if (meta) {
    try {
      const apiUrl = `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/send-custom-request-email`;
      await fetch(apiUrl, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${import.meta.env.VITE_SUPABASE_ANON_KEY}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          userName: meta.userName || 'Customer',
          userEmail: meta.userEmail || '',
          storeName: meta.storeName || 'Store',
          productName: meta.productName,
          description: request.description,
          imageUrl: request.image_url,
        }),
      });
    } catch {
      // Email notification failure is non-critical
    }
  }

  return data as CustomRequest;
}

export async function getCustomRequests(filters?: { status?: CustomRequestStatus; userId?: string }) {
  let query = supabase
    .from('custom_requests')
    .select('*, user:profiles(full_name, email), store:stores(name), product:products(name)')
    .order('created_at', { ascending: false });

  if (filters?.status) query = query.eq('status', filters.status);
  if (filters?.userId) query = query.eq('user_id', filters.userId);

  const { data, error } = await query;
  if (error) return [];
  return data as CustomRequestWithDetails[];
}

export async function updateCustomRequest(
  id: string,
  updates: { status?: CustomRequestStatus; admin_notes?: string | null }
) {
  const { data, error } = await supabase
    .from('custom_requests')
    .update(updates)
    .eq('id', id)
    .select()
    .maybeSingle();
  if (error) throw new Error(error.message);
  return data as CustomRequest;
}
