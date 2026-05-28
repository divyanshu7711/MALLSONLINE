import { supabase } from './supabaseClient';
import type { Order, OrderItem, OrderStatus } from '../types';

type OrderWithItems = Order & { order_items: (OrderItem & { product?: { name: string; image_url: string | null }; store?: { name: string } })[] };

export async function createOrder(
  userId: string,
  items: { productId: string; storeId: string; quantity: number; price: number }[]
) {
  const totalAmount = items.reduce((sum, i) => sum + i.price * i.quantity, 0);

  const { data: order, error: orderError } = await supabase
    .from('orders')
    .insert({ user_id: userId, total_amount: totalAmount, status: 'pending' })
    .select()
    .maybeSingle();

  if (orderError) throw new Error(orderError.message);
  if (!order) throw new Error('Failed to create order');

  const orderItems = items.map(i => ({
    order_id: order.id,
    product_id: i.productId,
    store_id: i.storeId,
    quantity: i.quantity,
    price: i.price,
  }));

  const { error: itemsError } = await supabase.from('order_items').insert(orderItems);
  if (itemsError) throw new Error(itemsError.message);

  return order as Order;
}

export async function getOrders(userId?: string) {
  let query = supabase
    .from('orders')
    .select('*, order_items(*, product:products(name, image_url), store:stores(name))')
    .order('created_at', { ascending: false });

  if (userId) query = query.eq('user_id', userId);

  const { data, error } = await query;
  if (error) return [];
  return data as OrderWithItems[];
}

export async function updateOrderStatus(id: string, status: OrderStatus) {
  const { data, error } = await supabase.from('orders').update({ status }).eq('id', id).select().maybeSingle();
  if (error) throw new Error(error.message);
  return data as Order;
}
