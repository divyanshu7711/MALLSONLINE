import { useState, useEffect } from 'react';
import { BarChart3, TrendingUp, Users, Store, Package, ShoppingCart } from 'lucide-react';
import { getDashboardStats } from '../../services/adminService';
import Card from '../../components/ui/Card';
import { PageLoader } from '../../components/ui/LoadingSpinner';
import type { DashboardStats } from '../../types';

export default function AdminAnalyticsPage() {
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getDashboardStats().then(data => {
      setStats(data);
      setLoading(false);
    });
  }, []);

  if (loading) return <PageLoader />;

  const metrics = [
    { label: 'Total Users', value: stats?.totalUsers ?? 0, icon: Users, color: 'from-accent-500 to-accent-600' },
    { label: 'Total Stores', value: stats?.totalStores ?? 0, icon: Store, color: 'from-primary-500 to-primary-600' },
    { label: 'Total Products', value: stats?.totalProducts ?? 0, icon: Package, color: 'from-warning-500 to-warning-600' },
    { label: 'Total Orders', value: stats?.totalOrders ?? 0, icon: ShoppingCart, color: 'from-success-500 to-success-600' },
  ];

  return (
    <div className="animate-fade-in">
      <div className="flex items-center gap-3 mb-6">
        <BarChart3 className="w-7 h-7 text-primary-600" />
        <h1 className="text-2xl font-bold">Analytics</h1>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
        {metrics.map((m, i) => (
          <Card key={i} className={`p-5 overflow-hidden relative animate-slide-up stagger-${i + 1}`}>
            <div className={`absolute top-0 left-0 w-full h-1 bg-gradient-to-r ${m.color}`} />
            <div className="flex items-center gap-2 mb-2">
              <m.icon className="w-5 h-5 text-gray-400" />
              <span className="text-xs text-gray-500 dark:text-gray-400">{m.label}</span>
            </div>
            <p className="text-3xl font-bold">{m.value}</p>
          </Card>
        ))}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card className="p-6">
          <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
            <TrendingUp className="w-5 h-5 text-primary-600" /> Revenue
          </h3>
          <div className="text-center py-8">
            <p className="text-5xl font-bold text-primary-600 dark:text-primary-400 mb-2">
              ${(stats?.totalRevenue ?? 0).toFixed(2)}
            </p>
            <p className="text-sm text-gray-500">Total Revenue from Orders</p>
          </div>
        </Card>

        <Card className="p-6">
          <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
            <ShoppingCart className="w-5 h-5 text-warning-600" /> Pending Items
          </h3>
          <div className="space-y-4">
            <div className="flex items-center justify-between p-3 bg-warning-50 dark:bg-warning-50/10 rounded-lg">
              <span className="text-sm">Pending Custom Requests</span>
              <span className="font-bold text-warning-600">{stats?.pendingCustomRequests ?? 0}</span>
            </div>
            <div className="flex items-center justify-between p-3 bg-accent-50 dark:bg-accent-50/10 rounded-lg">
              <span className="text-sm">Total Users</span>
              <span className="font-bold text-accent-600">{stats?.totalUsers ?? 0}</span>
            </div>
            <div className="flex items-center justify-between p-3 bg-primary-50 dark:bg-primary-50/10 rounded-lg">
              <span className="text-sm">Active Stores</span>
              <span className="font-bold text-primary-600">{stats?.totalStores ?? 0}</span>
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
}
