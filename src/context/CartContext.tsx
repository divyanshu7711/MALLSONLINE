import { createContext, useContext, useEffect, useState, useCallback, type ReactNode } from 'react';
import { supabase } from '../services/supabaseClient';
import type { CartItem, Product, Store } from '../types';
import { useAuth } from './AuthContext';

interface CartContextType {
  items: CartItem[];
  loading: boolean;
  itemCount: number;
  total: number;
  addItem: (productId: string, storeId: string) => Promise<void>;
  removeItem: (itemId: string) => Promise<void>;
  updateQuantity: (itemId: string, quantity: number) => Promise<void>;
  clearCart: () => Promise<void>;
  refreshCart: () => Promise<void>;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

export function CartProvider({ children }: { children: ReactNode }) {
  const { user } = useAuth();
  const [items, setItems] = useState<CartItem[]>([]);
  const [loading, setLoading] = useState(false);

  const fetchCart = useCallback(async () => {
    if (!user) {
      setItems([]);
      return;
    }
    setLoading(true);
    const { data } = await supabase
      .from('cart_items')
      .select(`*, product:products(*, store:stores(*)), store:stores(*)`)
      .eq('user_id', user.id)
      .order('created_at', { ascending: false });
    setItems((data as (CartItem & { product: Product & { store: Store }; store: Store })[]) ?? []);
    setLoading(false);
  }, [user]);

  useEffect(() => {
    fetchCart();
  }, [fetchCart]);

  const addItem = async (productId: string, storeId: string) => {
    if (!user) return;
    const existing = items.find(i => i.product_id === productId);
    if (existing) {
      await updateQuantity(existing.id, existing.quantity + 1);
      return;
    }
    const { data, error } = await supabase
      .from('cart_items')
      .insert({ user_id: user.id, product_id: productId, store_id: storeId, quantity: 1 })
      .select(`*, product:products(*, store:stores(*)), store:stores(*)`)
      .maybeSingle();
    if (!error && data) {
      setItems(prev => [data as CartItem & { product: Product & { store: Store }; store: Store }, ...prev]);
    }
  };

  const removeItem = async (itemId: string) => {
    const { error } = await supabase.from('cart_items').delete().eq('id', itemId);
    if (!error) setItems(prev => prev.filter(i => i.id !== itemId));
  };

  const updateQuantity = async (itemId: string, quantity: number) => {
    if (quantity < 1) {
      await removeItem(itemId);
      return;
    }
    const { error } = await supabase.from('cart_items').update({ quantity }).eq('id', itemId);
    if (!error) {
      setItems(prev =>
        prev.map(i => (i.id === itemId ? { ...i, quantity } : i))
      );
    }
  };

  const clearCart = async () => {
    if (!user) return;
    const { error } = await supabase.from('cart_items').delete().eq('user_id', user.id);
    if (!error) setItems([]);
  };

  const itemCount = items.reduce((sum, i) => sum + i.quantity, 0);
  const total = items.reduce((sum, i) => {
    const price = (i.product as Product | undefined)?.price ?? 0;
    return sum + price * i.quantity;
  }, 0);

  return (
    <CartContext.Provider value={{ items, loading, itemCount, total, addItem, removeItem, updateQuantity, clearCart, refreshCart: fetchCart }}>
      {children}
    </CartContext.Provider>
  );
}

export function useCart() {
  const context = useContext(CartContext);
  if (!context) throw new Error('useCart must be used within CartProvider');
  return context;
}
