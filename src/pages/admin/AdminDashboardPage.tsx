import { useState, useEffect } from 'react';
import { Users, Store, Package, ShoppingCart, MessageSquare, DollarSign } from 'lucide-react';
import { getDashboardStats } from '../../services/adminService';
import Card from '../../components/ui/Card';
import { PageLoader } from '../../components/ui/LoadingSpinner';
import type { DashboardStats } from '../../types';

export default function AdminDashboardPage() {
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getDashboardStats().then(data => {
      setStats(data);
      setLoading(false);
    });
  }, []);

  if (loading) return <PageLoader />;

  const cards = [
    { label: 'Total Users', value: stats?.totalUsers ?? 0, icon: Users, color: 'text-accent-600 bg-accent-50 dark:bg-accent-50/10' },
    { label: 'Total Stores', value: stats?.totalStores ?? 0, icon: Store, color: 'text-primary-600 bg-primary-50 dark:bg-primary-50/10' },
    { label: 'Total Products', value: stats?.totalProducts ?? 0, icon: Package, color: 'text-warning-600 bg-warning-50 dark:bg-warning-50/10' },
    { label: 'Total Orders', value: stats?.totalOrders ?? 0, icon: ShoppingCart, color: 'text-success-600 bg-success-50 dark:bg-success-50/10' },
    { label: 'Pending Requests', value: stats?.pendingCustomRequests ?? 0, icon: MessageSquare, color: 'text-error-600 bg-error-50 dark:bg-error-50/10' },
    { label: 'Total Revenue', value: `$${(stats?.totalRevenue ?? 0).toFixed(2)}`, icon: DollarSign, color: 'text-primary-600 bg-primary-50 dark:bg-primary-50/10' },
  ];

  return (
    <div className="animate-fade-in">
      <h1 className="text-2xl font-bold mb-6">Dashboard</h1>
      <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mb-8">
        {cards.map((card, i) => (
          <Card key={i} className={`p-5 animate-slide-up stagger-${i + 1}`}>
            <div className="flex items-center gap-3 mb-3">
              <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${card.color}`}>
                <card.icon className="w-5 h-5" />
              </div>
              <span className="text-sm text-gray-500 dark:text-gray-400">{card.label}</span>
            </div>
            <p className="text-2xl font-bold">{card.value}</p>
          </Card>
        ))}
      </div>

      <Card className="p-6">
        <h2 className="text-lg font-semibold mb-4">Quick Actions</h2>
        <div className="flex flex-wrap gap-3">
          <a href="/admin/stores" className="btn-primary text-sm">Add Store</a>
          <a href="/admin/products" className="btn-secondary text-sm">Add Product</a>
          <a href="/admin/custom-requests" className="btn-outline text-sm">View Requests</a>
          <a href="/admin/orders" className="btn-secondary text-sm">View Orders</a>
        </div>
      </Card>
    </div>
  );
}
