import { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { ArrowLeft, ShoppingBag, Plus, Minus, Sparkles, ShoppingCart } from 'lucide-react';
import { getProductById } from '../../services/productService';
import { useCart } from '../../context/CartContext';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../context/ToastContext';
import Button from '../../components/ui/Button';
import Badge from '../../components/ui/Badge';
import Modal from '../../components/ui/Modal';
import { PageLoader } from '../../components/ui/LoadingSpinner';
import { createCustomRequest } from '../../services/customRequestService';
import { uploadFile } from '../../services/storageService';
import type { Product } from '../../types';

export default function ProductPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { addItem } = useCart();
  const { user, profile } = useAuth();
  const { addToast } = useToast();
  const [product, setProduct] = useState<Product & { store?: { name: string; slug: string } } | null>(null);
  const [loading, setLoading] = useState(true);
  const [quantity, setQuantity] = useState(1);
  const [showCustomModal, setShowCustomModal] = useState(false);
  const [customDesc, setCustomDesc] = useState('');
  const [customImage, setCustomImage] = useState<File | null>(null);
  const [customLoading, setCustomLoading] = useState(false);

  useEffect(() => {
    if (!id) return;
    getProductById(id).then(data => {
      if (!data) {
        navigate('/marketplace', { replace: true });
        return;
      }
      setProduct(data);
      setLoading(false);
    });
  }, [id, navigate]);

  const handleAddToCart = async () => {
    if (!user) {
      addToast('Please sign in to add items to cart', 'warning');
      navigate('/login');
      return;
    }
    if (!product) return;
    for (let i = 0; i < quantity; i++) {
      await addItem(product.id, product.store_id);
    }
    addToast(`${quantity}x ${product.name} added to cart`, 'success');
  };

  const handleCustomRequest = async () => {
    if (!user || !product) return;
    if (!customDesc.trim()) {
      addToast('Please describe your idea', 'warning');
      return;
    }
    setCustomLoading(true);
    try {
      let imageUrl: string | null = null;
      if (customImage) {
        const path = `custom-requests/${user.id}/${Date.now()}-${customImage.name}`;
        imageUrl = await uploadFile('custom-request-images', path, customImage);
      }
      await createCustomRequest({
        user_id: user.id,
        store_id: product.store_id,
        product_id: product.id,
        description: customDesc.trim(),
        image_url: imageUrl,
      }, {
        userName: profile?.full_name || user.email || '',
        userEmail: user.email || '',
        storeName: product.store?.name || '',
        productName: product.name,
      });
      addToast('Custom request submitted successfully!', 'success');
      setShowCustomModal(false);
      setCustomDesc('');
      setCustomImage(null);
    } catch {
      addToast('Failed to submit custom request', 'error');
    }
    setCustomLoading(false);
  };

  if (loading) return <PageLoader />;
  if (!product) return null;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <button
        onClick={() => navigate(-1)}
        className="inline-flex items-center gap-1 text-sm text-gray-500 hover:text-primary-600 dark:hover:text-primary-400 mb-6 transition-colors"
      >
        <ArrowLeft className="w-4 h-4" /> Go Back
      </button>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 animate-fade-in">
        <div className="aspect-square bg-gray-100 dark:bg-gray-800 rounded-2xl overflow-hidden flex items-center justify-center">
          {product.image_url ? (
            <img src={product.image_url} alt={product.name} className="w-full h-full object-cover" />
          ) : (
            <ShoppingBag className="w-24 h-24 text-gray-300 dark:text-gray-600" />
          )}
        </div>

        <div>
          {product.store && (
            <Link to={`/store/${product.store.slug}`} className="text-sm text-primary-600 dark:text-primary-400 hover:underline">
              {product.store.name}
            </Link>
          )}
          <h1 className="text-3xl font-bold mt-1 mb-3">{product.name}</h1>
          <div className="flex items-center gap-3 mb-4">
            <span className="text-3xl font-bold text-primary-600 dark:text-primary-400">
              ${Number(product.price).toFixed(2)}
            </span>
            {product.customizable && <Badge variant="info">Customizable</Badge>}
          </div>
          {product.description && (
            <p className="text-gray-600 dark:text-gray-400 mb-6 leading-relaxed">{product.description}</p>
          )}

          <div className="flex items-center gap-4 mb-6">
            <div className="flex items-center border border-gray-300 dark:border-gray-600 rounded-lg">
              <button
                onClick={() => setQuantity(Math.max(1, quantity - 1))}
                className="p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-l-lg transition-colors"
              >
                <Minus className="w-4 h-4" />
              </button>
              <span className="px-4 py-2 font-medium min-w-[48px] text-center">{quantity}</span>
              <button
                onClick={() => setQuantity(quantity + 1)}
                className="p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-r-lg transition-colors"
              >
                <Plus className="w-4 h-4" />
              </button>
            </div>
            <Button onClick={handleAddToCart} icon={<ShoppingCart className="w-4 h-4" />} className="flex-1">
              Add to Cart
            </Button>
          </div>

          {product.customizable && (
            <Button
              variant="outline"
              onClick={() => {
                if (!user) { addToast('Please sign in first', 'warning'); navigate('/login'); return; }
                setShowCustomModal(true);
              }}
              icon={<Sparkles className="w-4 h-4" />}
              className="w-full"
            >
              Request Customization
            </Button>
          )}
        </div>
      </div>

      <Modal open={showCustomModal} onClose={() => setShowCustomModal(false)} title="Request Customization">
        <div className="space-y-4">
          <p className="text-sm text-gray-500 dark:text-gray-400">
            Describe your custom idea for <span className="font-medium text-gray-700 dark:text-gray-300">{product.name}</span>
          </p>
          <textarea
            value={customDesc}
            onChange={e => setCustomDesc(e.target.value)}
            placeholder="Describe your idea in detail..."
            rows={4}
            className="input-field resize-none"
          />
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">
              Upload Reference Image (optional)
            </label>
            <input
              type="file"
              accept="image/*"
              onChange={e => setCustomImage(e.target.files?.[0] ?? null)}
              className="input-field text-sm"
            />
          </div>
          <Button onClick={handleCustomRequest} loading={customLoading} className="w-full" icon={<Sparkles className="w-4 h-4" />}>
            Submit Custom Request
          </Button>
        </div>
      </Modal>
    </div>
  );
}
