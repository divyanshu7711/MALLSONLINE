import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { CheckCircle, ArrowLeft } from 'lucide-react';
import { useCart } from '../../context/CartContext';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../context/ToastContext';
import { createOrder } from '../../services/orderService';
import Button from '../../components/ui/Button';
import Card from '../../components/ui/Card';
import EmptyState from '../../components/ui/EmptyState';
import type { Product } from '../../types';

export default function CheckoutPage() {
  const { items, total, itemCount, clearCart } = useCart();
  const { user } = useAuth();
  const { addToast } = useToast();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [orderId, setOrderId] = useState<string | null>(null);

  if (items.length === 0 && !orderId) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <EmptyState
          icon={<CheckCircle className="w-16 h-16" />}
          title="Nothing to checkout"
          description="Add items to your cart first."
          action={<Link to="/marketplace" className="btn-primary">Browse Stores</Link>}
        />
      </div>
    );
  }

  const handlePlaceOrder = async () => {
    if (!user) return;
    setLoading(true);
    try {
      const orderItems = items.map(item => ({
        productId: item.product_id,
        storeId: item.store_id,
        quantity: item.quantity,
        price: Number((item.product as Product | undefined)?.price ?? 0),
      }));
      const order = await createOrder(user.id, orderItems);
      await clearCart();
      setOrderId(order.id);
      addToast('Order placed successfully!', 'success');
    } catch {
      addToast('Failed to place order. Please try again.', 'error');
    }
    setLoading(false);
  };

  if (orderId) {
    return (
      <div className="max-w-2xl mx-auto px-4 py-16 text-center animate-fade-in">
        <div className="w-20 h-20 rounded-full bg-success-100 dark:bg-success-50/20 flex items-center justify-center mx-auto mb-6">
          <CheckCircle className="w-10 h-10 text-success-600" />
        </div>
        <h1 className="text-3xl font-bold mb-2">Order Confirmed!</h1>
        <p className="text-gray-500 dark:text-gray-400 mb-2">Your order has been placed successfully.</p>
        <p className="text-sm text-gray-400 dark:text-gray-500 mb-8">Order ID: {orderId}</p>
        <div className="flex gap-4 justify-center">
          <Link to="/marketplace" className="btn-primary">Continue Shopping</Link>
          <Link to="/profile" className="btn-secondary">View Orders</Link>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <button
        onClick={() => navigate('/cart')}
        className="inline-flex items-center gap-1 text-sm text-gray-500 hover:text-primary-600 dark:hover:text-primary-400 mb-6 transition-colors"
      >
        <ArrowLeft className="w-4 h-4" /> Back to Cart
      </button>

      <h1 className="text-3xl font-bold mb-8">Checkout</h1>

      <div className="grid grid-cols-1 lg:grid-cols-5 gap-8">
        <div className="lg:col-span-3">
          <Card className="p-6">
            <h2 className="font-semibold text-lg mb-4">Order Items ({itemCount})</h2>
            <div className="divide-y divide-gray-100 dark:divide-gray-800">
              {items.map(item => {
                const product = item.product as Product | undefined;
                return (
                  <div key={item.id} className="flex items-center gap-3 py-3">
                    <div className="w-12 h-12 rounded-lg bg-gray-100 dark:bg-gray-800 flex items-center justify-center overflow-hidden flex-shrink-0">
                      {product?.image_url ? (
                        <img src={product.image_url} alt={product.name} className="w-full h-full object-cover" />
                      ) : (
                        <div className="w-4 h-4 bg-gray-300 dark:bg-gray-600 rounded" />
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium truncate">{product?.name || 'Product'}</p>
                      <p className="text-xs text-gray-400">Qty: {item.quantity}</p>
                    </div>
                    <span className="text-sm font-semibold">${(Number(product?.price ?? 0) * item.quantity).toFixed(2)}</span>
                  </div>
                );
              })}
            </div>
          </Card>
        </div>

        <div className="lg:col-span-2">
          <Card className="sticky top-24 p-6">
            <h2 className="font-semibold text-lg mb-4">Summary</h2>
            <div className="space-y-3 text-sm">
              <div className="flex justify-between">
                <span className="text-gray-500">Subtotal ({itemCount} items)</span>
                <span>${total.toFixed(2)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-500">Shipping</span>
                <span className="text-success-600">Free</span>
              </div>
              <hr className="border-gray-200 dark:border-gray-700" />
              <div className="flex justify-between text-base font-bold">
                <span>Total</span>
                <span className="text-primary-600 dark:text-primary-400">${total.toFixed(2)}</span>
              </div>
            </div>
            <Button onClick={handlePlaceOrder} loading={loading} className="w-full mt-6">
              Place Order
            </Button>
          </Card>
        </div>
      </div>
    </div>
  );
}
