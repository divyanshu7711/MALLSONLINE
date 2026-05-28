import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Sparkles, Upload } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../context/ToastContext';
import { getStores } from '../../services/storeService';
import { createCustomRequest } from '../../services/customRequestService';
import { uploadFile } from '../../services/storageService';
import { getCustomRequests } from '../../services/customRequestService';
import Button from '../../components/ui/Button';
import Card from '../../components/ui/Card';
import Badge from '../../components/ui/Badge';
import { PageLoader } from '../../components/ui/LoadingSpinner';
import EmptyState from '../../components/ui/EmptyState';
import type { Store as StoreType, CustomRequest } from '../../types';

export default function CustomRequestPage() {
  const { user, profile } = useAuth();
  const { addToast } = useToast();
  const navigate = useNavigate();
  const [stores, setStores] = useState<StoreType[]>([]);
  const [requests, setRequests] = useState<CustomRequest[]>([]);
  const [storeId, setStoreId] = useState('');
  const [description, setDescription] = useState('');
  const [image, setImage] = useState<File | null>(null);
  const [loading, setLoading] = useState(false);
  const [fetching, setFetching] = useState(true);

  useEffect(() => {
    if (!user) { navigate('/login'); return; }
    Promise.all([
      getStores().then(setStores),
      getCustomRequests({ userId: user.id }).then(setRequests),
    ]).then(() => setFetching(false));
  }, [user, navigate]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user || !storeId || !description.trim()) {
      addToast('Please fill all required fields', 'warning');
      return;
    }
    setLoading(true);
    try {
      let imageUrl: string | null = null;
      if (image) {
        const path = `custom-requests/${user.id}/${Date.now()}-${image.name}`;
        imageUrl = await uploadFile('custom-request-images', path, image);
      }
      const storeName = stores.find(s => s.id === storeId)?.name || '';
      await createCustomRequest({
        user_id: user.id,
        store_id: storeId,
        product_id: null,
        description: description.trim(),
        image_url: imageUrl,
      }, {
        userName: profile?.full_name || user.email || '',
        userEmail: user.email || '',
        storeName,
      });
      addToast('Custom request submitted!', 'success');
      setDescription('');
      setImage(null);
      setStoreId('');
      getCustomRequests({ userId: user.id }).then(setRequests);
    } catch {
      addToast('Failed to submit request', 'error');
    }
    setLoading(false);
  };

  const statusVariant = (status: string) => {
    if (status === 'completed') return 'success';
    if (status === 'rejected') return 'error';
    if (status === 'reviewed') return 'info';
    return 'warning';
  };

  if (fetching) return <PageLoader />;

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <h1 className="text-3xl font-bold mb-2">Demand Your Customized Product</h1>
      <p className="text-gray-500 dark:text-gray-400 mb-8">Describe your vision and we'll make it happen.</p>

      <Card className="p-6 mb-8 animate-fade-in">
        <form onSubmit={handleSubmit} className="space-y-5">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">Select Store *</label>
            <select
              value={storeId}
              onChange={e => setStoreId(e.target.value)}
              className="input-field"
              required
            >
              <option value="">Choose a store...</option>
              {stores.map(s => (
                <option key={s.id} value={s.id}>{s.name} ({s.category})</option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">Describe Your Idea *</label>
            <textarea
              value={description}
              onChange={e => setDescription(e.target.value)}
              placeholder="Describe your custom product idea in detail..."
              rows={5}
              className="input-field resize-none"
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">
              <Upload className="w-4 h-4 inline mr-1" /> Reference Image (optional)
            </label>
            <input
              type="file"
              accept="image/*"
              onChange={e => setImage(e.target.files?.[0] ?? null)}
              className="input-field text-sm"
            />
          </div>
          <Button type="submit" loading={loading} icon={<Sparkles className="w-4 h-4" />} className="w-full">
            Submit Custom Request
          </Button>
        </form>
      </Card>

      <h2 className="text-xl font-semibold mb-4">Your Custom Requests</h2>
      {requests.length === 0 ? (
        <EmptyState
          icon={<Sparkles className="w-12 h-12" />}
          title="No custom requests yet"
          description="Submit your first custom product request above."
        />
      ) : (
        <div className="space-y-4">
          {requests.map(req => (
            <Card key={req.id} className="p-5">
              <div className="flex items-start justify-between gap-4">
                <div className="flex-1 min-w-0">
                  <p className="text-sm text-gray-700 dark:text-gray-300 mb-1">{req.description}</p>
                  <p className="text-xs text-gray-400">{new Date(req.created_at).toLocaleDateString()}</p>
                  {req.admin_notes && (
                    <p className="text-xs text-accent-600 dark:text-accent-400 mt-1">Admin: {req.admin_notes}</p>
                  )}
                </div>
                <Badge variant={statusVariant(req.status) as 'default' | 'success' | 'warning' | 'error' | 'info'}>
                  {req.status}
                </Badge>
              </div>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
