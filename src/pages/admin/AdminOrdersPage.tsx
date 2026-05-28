import { useState, useEffect } from 'react';
import { ShoppingCart, Eye } from 'lucide-react';
import { getOrders, updateOrderStatus } from '../../services/orderService';
import { useToast } from '../../context/ToastContext';
import Card from '../../components/ui/Card';
import Badge from '../../components/ui/Badge';
import Modal from '../../components/ui/Modal';
import Button from '../../components/ui/Button';
import { PageLoader } from '../../components/ui/LoadingSpinner';
import type { OrderStatus } from '../../types';

const statusVariant = (s: OrderStatus) => {
  if (s === 'delivered') return 'success';
  if (s === 'cancelled') return 'error';
  if (s === 'confirmed') return 'info';
  return 'warning';
};

export default function AdminOrdersPage() {
  const [orders, setOrders] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState<OrderStatus | ''>('');
  const [viewing, setViewing] = useState<any>(null);
  const [saving, setSaving] = useState(false);
  const { addToast } = useToast();

  const fetchOrders = () => {
    getOrders().then(data => {
      const filtered = statusFilter ? data.filter(o => o.status === statusFilter) : data;
      setOrders(filtered);
      setLoading(false);
    });
  };

  useEffect(() => { fetchOrders(); }, [statusFilter]);

  const handleStatusChange = async (id: string, status: OrderStatus) => {
    setSaving(true);
    try {
      await updateOrderStatus(id, status);
      addToast('Order status updated', 'success');
      setViewing(null);
      fetchOrders();
    } catch {
      addToast('Failed to update order', 'error');
    }
    setSaving(false);
  };

  if (loading) return <PageLoader />;

  return (
    <div className="animate-fade-in">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold">Orders</h1>
        <select value={statusFilter} onChange={e => setStatusFilter(e.target.value as OrderStatus | '')} className="input-field text-sm max-w-xs">
          <option value="">All Status</option>
          <option value="pending">Pending</option>
          <option value="confirmed">Confirmed</option>
          <option value="delivered">Delivered</option>
          <option value="cancelled">Cancelled</option>
        </select>
      </div>

      {orders.length === 0 ? (
        <Card className="p-8 text-center">
          <ShoppingCart className="w-12 h-12 text-gray-300 mx-auto mb-3" />
          <p className="text-gray-500">No orders found.</p>
        </Card>
      ) : (
        <Card className="overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-gray-50 dark:bg-gray-800 text-gray-500 dark:text-gray-400">
                <tr>
                  <th className="px-4 py-3 text-left font-medium">Order ID</th>
                  <th className="px-4 py-3 text-left font-medium">User</th>
                  <th className="px-4 py-3 text-left font-medium">Total</th>
                  <th className="px-4 py-3 text-left font-medium">Status</th>
                  <th className="px-4 py-3 text-left font-medium">Date</th>
                  <th className="px-4 py-3 text-right font-medium">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 dark:divide-gray-800">
                {orders.map(order => (
                  <tr key={order.id} className="hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors">
                    <td className="px-4 py-3 font-mono text-xs">#{order.id.slice(0, 8)}</td>
                    <td className="px-4 py-3">{order.user_id?.slice(0, 8)}...</td>
                    <td className="px-4 py-3 font-semibold">${Number(order.total_amount).toFixed(2)}</td>
                    <td className="px-4 py-3"><Badge variant={statusVariant(order.status)}>{order.status}</Badge></td>
                    <td className="px-4 py-3 text-gray-400">{new Date(order.created_at).toLocaleDateString()}</td>
                    <td className="px-4 py-3 text-right">
                      <button onClick={() => setViewing(order)} className="p-1.5 rounded hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-500 hover:text-primary-600">
                        <Eye className="w-4 h-4" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>
      )}

      <Modal open={!!viewing} onClose={() => setViewing(null)} title="Order Details" maxWidth="max-w-2xl">
        {viewing && (
          <div className="space-y-4">
            <div className="flex justify-between text-sm">
              <div>
                <span className="text-gray-500">Order ID:</span>
                <p className="font-mono">#{viewing.id.slice(0, 8)}</p>
              </div>
              <div className="text-right">
                <span className="text-gray-500">Total:</span>
                <p className="text-lg font-bold text-primary-600">${Number(viewing.total_amount).toFixed(2)}</p>
              </div>
            </div>
            <div>
              <span className="text-sm text-gray-500">Items:</span>
              <div className="mt-2 divide-y divide-gray-100 dark:divide-gray-800">
                {viewing.order_items?.map((item: any, i: number) => (
                  <div key={i} className="flex justify-between py-2 text-sm">
                    <span>{item.product?.name || 'Product'} x{item.quantity}</span>
                    <span>${Number(item.price * item.quantity).toFixed(2)}</span>
                  </div>
                ))}
              </div>
            </div>
            <div className="flex flex-wrap gap-2 pt-2">
              <Button onClick={() => handleStatusChange(viewing.id, 'confirmed')} size="sm" loading={saving}>Confirm</Button>
              <Button onClick={() => handleStatusChange(viewing.id, 'delivered')} variant="secondary" size="sm" loading={saving}>Mark Delivered</Button>
              <Button onClick={() => handleStatusChange(viewing.id, 'cancelled')} variant="danger" size="sm" loading={saving}>Cancel</Button>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
}
