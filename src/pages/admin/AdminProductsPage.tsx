import { useState, useEffect } from 'react';
import { Plus, Package, Edit, Trash2 } from 'lucide-react';
import { getAllProducts, createProduct, updateProduct, deleteProduct } from '../../services/productService';
import { getAllStores } from '../../services/storeService';
import { uploadFile } from '../../services/storageService';
import { useToast } from '../../context/ToastContext';
import Card from '../../components/ui/Card';
import Button from '../../components/ui/Button';
import Input from '../../components/ui/Input';
import Modal from '../../components/ui/Modal';
import Badge from '../../components/ui/Badge';
import { PageLoader } from '../../components/ui/LoadingSpinner';
import type { Product, Store } from '../../types';

const emptyForm = { store_id: '', name: '', description: '', price: '', image_url: '', customizable: false, is_active: true };

export default function AdminProductsPage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [stores, setStores] = useState<Store[]>([]);
  const [loading, setLoading] = useState(true);
  const [storeFilter, setStoreFilter] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [editing, setEditing] = useState<Product | null>(null);
  const [form, setForm] = useState(emptyForm);
  const [saving, setSaving] = useState(false);
  const [imageFile, setImageFile] = useState<File | null>(null);
  const { addToast } = useToast();

  const fetchData = async () => {
    const [prods, sts] = await Promise.all([getAllProducts(storeFilter || undefined), getAllStores()]);
    setProducts(prods);
    setStores(sts);
    setLoading(false);
  };

  useEffect(() => { fetchData(); }, [storeFilter]);

  const openCreate = () => {
    setEditing(null);
    setForm({ ...emptyForm, store_id: storeFilter });
    setImageFile(null);
    setShowModal(true);
  };

  const openEdit = (product: Product) => {
    setEditing(product);
    setForm({
      store_id: product.store_id,
      name: product.name,
      description: product.description || '',
      price: String(product.price),
      image_url: product.image_url || '',
      customizable: product.customizable,
      is_active: product.is_active,
    });
    setImageFile(null);
    setShowModal(true);
  };

  const handleSave = async () => {
    if (!form.store_id || !form.name.trim() || !form.price) {
      addToast('Store, name, and price are required', 'warning');
      return;
    }
    setSaving(true);
    try {
      let imageUrl = form.image_url;
      if (imageFile) {
        const path = `products/${Date.now()}-${imageFile.name}`;
        imageUrl = await uploadFile('product-images', path, imageFile);
      }
      const payload = {
        store_id: form.store_id,
        name: form.name.trim(),
        description: form.description || null,
        price: parseFloat(form.price),
        image_url: imageUrl || null,
        customizable: form.customizable,
        is_active: form.is_active,
      };

      if (editing) {
        await updateProduct(editing.id, payload);
        addToast('Product updated!', 'success');
      } else {
        await createProduct(payload);
        addToast('Product created!', 'success');
      }
      setShowModal(false);
      fetchData();
    } catch (err: any) {
      addToast(err.message || 'Failed to save product', 'error');
    }
    setSaving(false);
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Delete this product?')) return;
    try {
      await deleteProduct(id);
      addToast('Product deleted', 'success');
      fetchData();
    } catch {
      addToast('Failed to delete', 'error');
    }
  };

  const getStoreName = (storeId: string) => stores.find(s => s.id === storeId)?.name || 'Unknown';

  if (loading) return <PageLoader />;

  return (
    <div className="animate-fade-in">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold">Manage Products</h1>
        <Button onClick={openCreate} icon={<Plus className="w-4 h-4" />}>Add Product</Button>
      </div>

      <div className="mb-4">
        <select value={storeFilter} onChange={e => setStoreFilter(e.target.value)} className="input-field text-sm max-w-xs">
          <option value="">All Stores</option>
          {stores.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
        </select>
      </div>

      <Card className="overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-gray-50 dark:bg-gray-800 text-gray-500 dark:text-gray-400">
              <tr>
                <th className="px-4 py-3 text-left font-medium">Image</th>
                <th className="px-4 py-3 text-left font-medium">Name</th>
                <th className="px-4 py-3 text-left font-medium">Store</th>
                <th className="px-4 py-3 text-left font-medium">Price</th>
                <th className="px-4 py-3 text-left font-medium">Custom</th>
                <th className="px-4 py-3 text-left font-medium">Status</th>
                <th className="px-4 py-3 text-right font-medium">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 dark:divide-gray-800">
              {products.map(product => (
                <tr key={product.id} className="hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors">
                  <td className="px-4 py-3">
                    <div className="w-10 h-10 rounded-lg bg-gray-100 dark:bg-gray-700 flex items-center justify-center overflow-hidden">
                      {product.image_url ? <img src={product.image_url} alt="" className="w-full h-full object-cover" /> : <Package className="w-5 h-5 text-gray-400" />}
                    </div>
                  </td>
                  <td className="px-4 py-3 font-medium">{product.name}</td>
                  <td className="px-4 py-3 text-gray-500">{getStoreName(product.store_id)}</td>
                  <td className="px-4 py-3">${Number(product.price).toFixed(2)}</td>
                  <td className="px-4 py-3">{product.customizable && <Badge variant="info">Custom</Badge>}</td>
                  <td className="px-4 py-3"><Badge variant={product.is_active ? 'success' : 'error'}>{product.is_active ? 'Active' : 'Inactive'}</Badge></td>
                  <td className="px-4 py-3 text-right">
                    <div className="flex items-center justify-end gap-2">
                      <button onClick={() => openEdit(product)} className="p-1.5 rounded hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-500 hover:text-primary-600"><Edit className="w-4 h-4" /></button>
                      <button onClick={() => handleDelete(product.id)} className="p-1.5 rounded hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-500 hover:text-error-600"><Trash2 className="w-4 h-4" /></button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>

      <Modal open={showModal} onClose={() => setShowModal(false)} title={editing ? 'Edit Product' : 'Add Product'} maxWidth="max-w-xl">
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">Store *</label>
            <select value={form.store_id} onChange={e => setForm({ ...form, store_id: e.target.value })} className="input-field" required>
              <option value="">Select store...</option>
              {stores.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
            </select>
          </div>
          <Input label="Product Name" value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} required />
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">Description</label>
            <textarea value={form.description} onChange={e => setForm({ ...form, description: e.target.value })} rows={3} className="input-field resize-none" />
          </div>
          <Input label="Price" type="number" step="0.01" min="0" value={form.price} onChange={e => setForm({ ...form, price: e.target.value })} required />
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">Product Image</label>
            <input type="file" accept="image/*" onChange={e => setImageFile(e.target.files?.[0] ?? null)} className="input-field text-sm" />
          </div>
          <div className="flex gap-6">
            <label className="flex items-center gap-2 text-sm">
              <input type="checkbox" checked={form.customizable} onChange={e => setForm({ ...form, customizable: e.target.checked })} className="rounded" />
              Customizable
            </label>
            <label className="flex items-center gap-2 text-sm">
              <input type="checkbox" checked={form.is_active} onChange={e => setForm({ ...form, is_active: e.target.checked })} className="rounded" />
              Active
            </label>
          </div>
          <div className="flex gap-3 pt-2">
            <Button onClick={handleSave} loading={saving} className="flex-1">{editing ? 'Update Product' : 'Create Product'}</Button>
            <Button variant="secondary" onClick={() => setShowModal(false)}>Cancel</Button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
