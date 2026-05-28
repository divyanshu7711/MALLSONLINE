import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { User, ShoppingBag, Package, Clock } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { getOrders } from '../../services/orderService';
import { getCustomRequests } from '../../services/customRequestService';
import Card from '../../components/ui/Card';
import Badge from '../../components/ui/Badge';
import { PageLoader } from '../../components/ui/LoadingSpinner';
import EmptyState from '../../components/ui/EmptyState';
import type { Order, CustomRequest } from '../../types';

const orderStatusVariant = (s: string) => {
  if (s === 'delivered') return 'success';
  if (s === 'cancelled') return 'error';
  if (s === 'confirmed') return 'info';
  return 'warning';
};

const requestStatusVariant = (s: string) => {
  if (s === 'completed') return 'success';
  if (s === 'rejected') return 'error';
  if (s === 'reviewed') return 'info';
  return 'warning';
};

export default function ProfilePage() {
  const { user, profile } = useAuth();
  const [orders, setOrders] = useState<Order[]>([]);
  const [requests, setRequests] = useState<CustomRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [tab, setTab] = useState<'orders' | 'requests'>('orders');

  useEffect(() => {
    if (!user) return;
    Promise.all([
      getOrders(user.id),
      getCustomRequests({ userId: user.id }),
    ]).then(([o, r]) => {
      setOrders(o);
      setRequests(r);
      setLoading(false);
    });
  }, [user]);

  if (loading) return <PageLoader />;

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <Card className="p-6 mb-8 animate-fade-in">
        <div className="flex items-center gap-4">
          <div className="w-16 h-16 rounded-full bg-primary-100 dark:bg-primary-900 flex items-center justify-center">
            <User className="w-8 h-8 text-primary-600 dark:text-primary-400" />
          </div>
          <div>
            <h1 className="text-2xl font-bold">{profile?.full_name || 'User'}</h1>
            <p className="text-gray-500 dark:text-gray-400">{profile?.email}</p>
          </div>
        </div>
      </Card>

      <div className="flex gap-2 mb-6">
        <button
          onClick={() => setTab('orders')}
          className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${tab === 'orders' ? 'bg-primary-600 text-white' : 'bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400'}`}
        >
          <ShoppingBag className="w-4 h-4 inline mr-1" /> Orders ({orders.length})
        </button>
        <button
          onClick={() => setTab('requests')}
          className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${tab === 'requests' ? 'bg-primary-600 text-white' : 'bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400'}`}
        >
          <Package className="w-4 h-4 inline mr-1" /> Custom Requests ({requests.length})
        </button>
      </div>

      {tab === 'orders' ? (
        orders.length === 0 ? (
          <EmptyState icon={<ShoppingBag className="w-12 h-12" />} title="No orders yet" description="Your order history will appear here." action={<Link to="/marketplace" className="btn-primary">Browse Stores</Link>} />
        ) : (
          <div className="space-y-4">
            {orders.map(order => (
              <Card key={order.id} className="p-5">
                <div className="flex items-center justify-between mb-3">
                  <div>
                    <span className="text-sm font-semibold">Order #{order.id.slice(0, 8)}</span>
                    <p className="text-xs text-gray-400 flex items-center gap-1"><Clock className="w-3 h-3" />{new Date(order.created_at).toLocaleDateString()}</p>
                  </div>
                  <div className="text-right">
                    <span className="font-bold text-primary-600 dark:text-primary-400">${Number(order.total_amount).toFixed(2)}</span>
                    <div className="mt-1"><Badge variant={orderStatusVariant(order.status)}>{order.status}</Badge></div>
                  </div>
                </div>
                {order.order_items && (
                  <div className="text-xs text-gray-500 dark:text-gray-400 border-t border-gray-100 dark:border-gray-800 pt-2">
                    {order.order_items.map((item, i) => (
                      <div key={i} className="flex justify-between py-1">
                        <span>{(item as any).product?.name || 'Product'} x{item.quantity}</span>
                        <span>${Number(item.price * item.quantity).toFixed(2)}</span>
                      </div>
                    ))}
                  </div>
                )}
              </Card>
            ))}
          </div>
        )
      ) : (
        requests.length === 0 ? (
          <EmptyState icon={<Package className="w-12 h-12" />} title="No custom requests" description="Submit a custom product request and track it here." action={<Link to="/custom-request" className="btn-primary">Request Custom Product</Link>} />
        ) : (
          <div className="space-y-4">
            {requests.map(req => (
              <Card key={req.id} className="p-5">
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1 min-w-0">
                    <p className="text-sm mb-1">{req.description}</p>
                    <p className="text-xs text-gray-400">{new Date(req.created_at).toLocaleDateString()}</p>
                    {req.admin_notes && <p className="text-xs text-accent-600 dark:text-accent-400 mt-1">Admin: {req.admin_notes}</p>}
                  </div>
                  <Badge variant={requestStatusVariant(req.status) as any}>{req.status}</Badge>
                </div>
              </Card>
            ))}
          </div>
        )
      )}
    </div>
  );
}
