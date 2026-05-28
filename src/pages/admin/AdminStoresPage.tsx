import { useState, useEffect } from 'react';
import { Plus, Store as StoreIcon, Edit, Trash2 } from 'lucide-react';
import { getAllStores, createStore, updateStore, deleteStore } from '../../services/storeService';
import { uploadFile } from '../../services/storageService';
import { useToast } from '../../context/ToastContext';
import Card from '../../components/ui/Card';
import Button from '../../components/ui/Button';
import Input from '../../components/ui/Input';
import Modal from '../../components/ui/Modal';
import Badge from '../../components/ui/Badge';
import { PageLoader } from '../../components/ui/LoadingSpinner';
import type { Store } from '../../types';

const emptyForm = { name: '', slug: '', category: '', description: '', logo_url: '', is_active: true };

export default function AdminStoresPage() {
  const [stores, setStores] = useState<Store[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editing, setEditing] = useState<Store | null>(null);
  const [form, setForm] = useState(emptyForm);
  const [saving, setSaving] = useState(false);
  const [logoFile, setLogoFile] = useState<File | null>(null);
  const { addToast } = useToast();

  const fetchStores = () => {
    getAllStores().then(data => { setStores(data); setLoading(false); });
  };

  useEffect(() => { fetchStores(); }, []);

  const openCreate = () => {
    setEditing(null);
    setForm(emptyForm);
    setLogoFile(null);
    setShowModal(true);
  };

  const openEdit = (store: Store) => {
    setEditing(store);
    setForm({ name: store.name, slug: store.slug, category: store.category, description: store.description || '', logo_url: store.logo_url || '', is_active: store.is_active });
    setLogoFile(null);
    setShowModal(true);
  };

  const handleSave = async () => {
    if (!form.name.trim() || !form.category.trim()) {
      addToast('Name and category are required', 'warning');
      return;
    }
    setSaving(true);
    try {
      let logoUrl = form.logo_url;
      if (logoFile) {
        const path = `logos/${Date.now()}-${logoFile.name}`;
        logoUrl = await uploadFile('store-logos', path, logoFile);
      }
      const slug = form.slug || form.name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');

      if (editing) {
        await updateStore(editing.id, { ...form, slug, logo_url: logoUrl });
        addToast('Store updated!', 'success');
      } else {
        await createStore({ ...form, slug, logo_url: logoUrl });
        addToast('Store created!', 'success');
      }
      setShowModal(false);
      fetchStores();
    } catch (err: any) {
      addToast(err.message || 'Failed to save store', 'error');
    }
    setSaving(false);
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this store and all its products?')) return;
    try {
      await deleteStore(id);
      addToast('Store deleted', 'success');
      fetchStores();
    } catch {
      addToast('Failed to delete store', 'error');
    }
  };

  if (loading) return <PageLoader />;

  return (
    <div className="animate-fade-in">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold">Manage Stores</h1>
        <Button onClick={openCreate} icon={<Plus className="w-4 h-4" />}>Add Store</Button>
      </div>

      <Card className="overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-gray-50 dark:bg-gray-800 text-gray-500 dark:text-gray-400">
              <tr>
                <th className="px-4 py-3 text-left font-medium">Logo</th>
                <th className="px-4 py-3 text-left font-medium">Name</th>
                <th className="px-4 py-3 text-left font-medium">Category</th>
                <th className="px-4 py-3 text-left font-medium">Products</th>
                <th className="px-4 py-3 text-left font-medium">Status</th>
                <th className="px-4 py-3 text-right font-medium">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 dark:divide-gray-800">
              {stores.map(store => (
                <tr key={store.id} className="hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors">
                  <td className="px-4 py-3">
                    <div className="w-10 h-10 rounded-lg bg-gray-100 dark:bg-gray-700 flex items-center justify-center overflow-hidden">
                      {store.logo_url ? <img src={store.logo_url} alt="" className="w-full h-full object-cover" /> : <StoreIcon className="w-5 h-5 text-gray-400" />}
                    </div>
                  </td>
                  <td className="px-4 py-3 font-medium">{store.name}</td>
                  <td className="px-4 py-3"><Badge>{store.category}</Badge></td>
                  <td className="px-4 py-3">{store.product_count ?? 0}</td>
                  <td className="px-4 py-3"><Badge variant={store.is_active ? 'success' : 'error'}>{store.is_active ? 'Active' : 'Inactive'}</Badge></td>
                  <td className="px-4 py-3 text-right">
                    <div className="flex items-center justify-end gap-2">
                      <button onClick={() => openEdit(store)} className="p-1.5 rounded hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-500 hover:text-primary-600"><Edit className="w-4 h-4" /></button>
                      <button onClick={() => handleDelete(store.id)} className="p-1.5 rounded hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-500 hover:text-error-600"><Trash2 className="w-4 h-4" /></button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>

      <Modal open={showModal} onClose={() => setShowModal(false)} title={editing ? 'Edit Store' : 'Add Store'}>
        <div className="space-y-4">
          <Input label="Store Name" value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} placeholder="My Awesome Store" required />
          <Input label="Slug (auto-generated if empty)" value={form.slug} onChange={e => setForm({ ...form, slug: e.target.value })} placeholder="my-awesome-store" />
          <Input label="Category" value={form.category} onChange={e => setForm({ ...form, category: e.target.value })} placeholder="Art, Fashion, Food..." required />
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">Description</label>
            <textarea value={form.description} onChange={e => setForm({ ...form, description: e.target.value })} rows={3} className="input-field resize-none" />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">Store Logo</label>
            <input type="file" accept="image/*" onChange={e => setLogoFile(e.target.files?.[0] ?? null)} className="input-field text-sm" />
          </div>
          <label className="flex items-center gap-2 text-sm">
            <input type="checkbox" checked={form.is_active} onChange={e => setForm({ ...form, is_active: e.target.checked })} className="rounded" />
            Active
          </label>
          <div className="flex gap-3 pt-2">
            <Button onClick={handleSave} loading={saving} className="flex-1">{editing ? 'Update Store' : 'Create Store'}</Button>
            <Button variant="secondary" onClick={() => setShowModal(false)}>Cancel</Button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
