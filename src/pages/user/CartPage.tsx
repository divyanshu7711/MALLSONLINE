import { useNavigate, Link } from 'react-router-dom';
import { ShoppingCart, Plus, Minus, Trash2, ShoppingBag, ArrowRight } from 'lucide-react';
import { useCart } from '../../context/CartContext';
import { PageLoader } from '../../components/ui/LoadingSpinner';
import EmptyState from '../../components/ui/EmptyState';
import Button from '../../components/ui/Button';
import Card from '../../components/ui/Card';
import type { Product, Store } from '../../types';

export default function CartPage() {
  const { items, loading, total, itemCount, updateQuantity, removeItem } = useCart();
  const navigate = useNavigate();

  if (loading) return <PageLoader />;

  const grouped = items.reduce((acc, item) => {
    const storeId = item.store_id;
    if (!acc[storeId]) acc[storeId] = { store: item.store as Store | undefined, items: [] };
    acc[storeId].items.push(item);
    return acc;
  }, {} as Record<string, { store: Store | undefined; items: typeof items }>);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <h1 className="text-3xl font-bold mb-8">Shopping Cart</h1>

      {items.length === 0 ? (
        <EmptyState
          icon={<ShoppingCart className="w-16 h-16" />}
          title="Your cart is empty"
          description="Browse our marketplace and add some amazing products to your cart."
          action={<Link to="/marketplace" className="btn-primary">Browse Stores</Link>}
        />
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 space-y-6">
            {Object.entries(grouped).map(([, group]) => (
              <Card key={group.store?.id} className="overflow-hidden">
                <div className="bg-gray-50 dark:bg-gray-800 px-5 py-3 border-b border-gray-200 dark:border-gray-700">
                  <h3 className="font-semibold text-sm flex items-center gap-2">
                    <ShoppingBag className="w-4 h-4 text-primary-600" />
                    {group.store?.name || 'Store'}
                  </h3>
                </div>
                <div className="divide-y divide-gray-100 dark:divide-gray-800">
                  {group.items.map(item => {
                    const product = item.product as Product | undefined;
                    return (
                      <div key={item.id} className="flex items-center gap-4 p-5">
                        <div
                          className="w-16 h-16 rounded-lg bg-gray-100 dark:bg-gray-800 flex items-center justify-center overflow-hidden flex-shrink-0 cursor-pointer"
                          onClick={() => product && navigate(`/product/${product.id}`)}
                        >
                          {product?.image_url ? (
                            <img src={product.image_url} alt={product.name} className="w-full h-full object-cover" />
                          ) : (
                            <ShoppingBag className="w-6 h-6 text-gray-400" />
                          )}
                        </div>
                        <div className="flex-1 min-w-0">
                          <h4 className="font-medium text-sm truncate">{product?.name || 'Product'}</h4>
                          <p className="text-xs text-gray-500 dark:text-gray-400">${Number(product?.price ?? 0).toFixed(2)} each</p>
                        </div>
                        <div className="flex items-center border border-gray-300 dark:border-gray-600 rounded-lg">
                          <button
                            onClick={() => updateQuantity(item.id, item.quantity - 1)}
                            className="p-1.5 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-l-lg transition-colors"
                          >
                            <Minus className="w-3 h-3" />
                          </button>
                          <span className="px-3 text-sm font-medium">{item.quantity}</span>
                          <button
                            onClick={() => updateQuantity(item.id, item.quantity + 1)}
                            className="p-1.5 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-r-lg transition-colors"
                          >
                            <Plus className="w-3 h-3" />
                          </button>
                        </div>
                        <span className="font-semibold text-sm min-w-[60px] text-right">
                          ${(Number(product?.price ?? 0) * item.quantity).toFixed(2)}
                        </span>
                        <button
                          onClick={() => removeItem(item.id)}
                          className="p-1.5 text-gray-400 hover:text-error-600 transition-colors"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    );
                  })}
                </div>
              </Card>
            ))}
          </div>

          <div className="lg:col-span-1">
            <Card className="sticky top-24 p-6">
              <h3 className="font-semibold text-lg mb-4">Order Summary</h3>
              <div className="space-y-3 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-500 dark:text-gray-400">Items ({itemCount})</span>
                  <span>${total.toFixed(2)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-500 dark:text-gray-400">Shipping</span>
                  <span className="text-success-600">Free</span>
                </div>
                <hr className="border-gray-200 dark:border-gray-700" />
                <div className="flex justify-between text-base font-bold">
                  <span>Total</span>
                  <span className="text-primary-600 dark:text-primary-400">${total.toFixed(2)}</span>
                </div>
              </div>
              <Button onClick={() => navigate('/checkout')} className="w-full mt-6" icon={<ArrowRight className="w-4 h-4" />}>
                Proceed to Checkout
              </Button>
            </Card>
          </div>
        </div>
      )}
    </div>
  );
}
