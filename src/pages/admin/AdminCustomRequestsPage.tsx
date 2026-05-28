import { useState, useEffect } from 'react';
import { MessageSquare, Eye } from 'lucide-react';
import { getCustomRequests, updateCustomRequest } from '../../services/customRequestService';
import { useToast } from '../../context/ToastContext';
import Card from '../../components/ui/Card';
import Badge from '../../components/ui/Badge';
import Modal from '../../components/ui/Modal';
import Button from '../../components/ui/Button';
import { PageLoader } from '../../components/ui/LoadingSpinner';
import type { CustomRequestStatus } from '../../types';

const statusVariant = (s: CustomRequestStatus) => {
  if (s === 'completed') return 'success';
  if (s === 'rejected') return 'error';
  if (s === 'reviewed') return 'info';
  return 'warning';
};

export default function AdminCustomRequestsPage() {
  const [requests, setRequests] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState<CustomRequestStatus | ''>('');
  const [viewing, setViewing] = useState<any>(null);
  const [notes, setNotes] = useState('');
  const [saving, setSaving] = useState(false);
  const { addToast } = useToast();

  const fetchRequests = () => {
    getCustomRequests(statusFilter ? { status: statusFilter } : undefined).then(data => {
      setRequests(data);
      setLoading(false);
    });
  };

  useEffect(() => { fetchRequests(); }, [statusFilter]);

  const openView = (req: any) => {
    setViewing(req);
    setNotes(req.admin_notes || '');
  };

  const handleUpdate = async (id: string, status: CustomRequestStatus) => {
    setSaving(true);
    try {
      await updateCustomRequest(id, { status, admin_notes: notes || null });
      addToast('Request updated', 'success');
      setViewing(null);
      fetchRequests();
    } catch {
      addToast('Failed to update', 'error');
    }
    setSaving(false);
  };

  if (loading) return <PageLoader />;

  return (
    <div className="animate-fade-in">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold">Custom Requests</h1>
        <select
          value={statusFilter}
          onChange={e => setStatusFilter(e.target.value as CustomRequestStatus | '')}
          className="input-field text-sm max-w-xs"
        >
          <option value="">All Status</option>
          <option value="pending">Pending</option>
          <option value="reviewed">Reviewed</option>
          <option value="completed">Completed</option>
          <option value="rejected">Rejected</option>
        </select>
      </div>

      {requests.length === 0 ? (
        <Card className="p-8 text-center">
          <MessageSquare className="w-12 h-12 text-gray-300 mx-auto mb-3" />
          <p className="text-gray-500">No custom requests found.</p>
        </Card>
      ) : (
        <Card className="overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-gray-50 dark:bg-gray-800 text-gray-500 dark:text-gray-400">
                <tr>
                  <th className="px-4 py-3 text-left font-medium">User</th>
                  <th className="px-4 py-3 text-left font-medium">Store</th>
                  <th className="px-4 py-3 text-left font-medium">Description</th>
                  <th className="px-4 py-3 text-left font-medium">Status</th>
                  <th className="px-4 py-3 text-left font-medium">Date</th>
                  <th className="px-4 py-3 text-right font-medium">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 dark:divide-gray-800">
                {requests.map(req => (
                  <tr key={req.id} className="hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors">
                    <td className="px-4 py-3">
                      <div className="font-medium">{req.user?.full_name || 'User'}</div>
                      <div className="text-xs text-gray-400">{req.user?.email}</div>
                    </td>
                    <td className="px-4 py-3">{req.store?.name}</td>
                    <td className="px-4 py-3 max-w-[200px] truncate">{req.description}</td>
                    <td className="px-4 py-3"><Badge variant={statusVariant(req.status)}>{req.status}</Badge></td>
                    <td className="px-4 py-3 text-gray-400">{new Date(req.created_at).toLocaleDateString()}</td>
                    <td className="px-4 py-3 text-right">
                      <button onClick={() => openView(req)} className="p-1.5 rounded hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-500 hover:text-primary-600">
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

      <Modal open={!!viewing} onClose={() => setViewing(null)} title="Custom Request Details" maxWidth="max-w-2xl">
        {viewing && (
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <span className="text-gray-500">User:</span>
                <p className="font-medium">{viewing.user?.full_name} ({viewing.user?.email})</p>
              </div>
              <div>
                <span className="text-gray-500">Store:</span>
                <p className="font-medium">{viewing.store?.name}</p>
              </div>
            </div>
            <div>
              <span className="text-sm text-gray-500">Description:</span>
              <p className="text-sm mt-1 bg-gray-50 dark:bg-gray-800 p-3 rounded-lg">{viewing.description}</p>
            </div>
            {viewing.image_url && (
              <div>
                <span className="text-sm text-gray-500">Reference Image:</span>
                <img src={viewing.image_url} alt="Reference" className="mt-1 max-h-48 rounded-lg" />
              </div>
            )}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">Admin Notes</label>
              <textarea value={notes} onChange={e => setNotes(e.target.value)} rows={3} className="input-field resize-none" placeholder="Add notes about this request..." />
            </div>
            <div className="flex flex-wrap gap-2 pt-2">
              <Button onClick={() => handleUpdate(viewing.id, 'reviewed')} variant="secondary" size="sm" loading={saving}>Mark Reviewed</Button>
              <Button onClick={() => handleUpdate(viewing.id, 'completed')} variant="primary" size="sm" loading={saving}>Mark Completed</Button>
              <Button onClick={() => handleUpdate(viewing.id, 'rejected')} variant="danger" size="sm" loading={saving}>Reject</Button>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
}
