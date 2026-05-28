import { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { Store, ArrowLeft, ShoppingBag, SortAsc, Package } from 'lucide-react';
import { getStoreBySlug } from '../../services/storeService';
import { getProducts } from '../../services/productService';
import { useCart } from '../../context/CartContext';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../context/ToastContext';
import Card from '../../components/ui/Card';
import Badge from '../../components/ui/Badge';
import Button from '../../components/ui/Button';
import EmptyState from '../../components/ui/EmptyState';
import { PageLoader } from '../../components/ui/LoadingSpinner';
import type { Store as StoreType, Product } from '../../types';

export default function StorePage() {
  const { slug } = useParams<{ slug: string }>();
  const navigate = useNavigate();
  const { addItem } = useCart();
  const { user } = useAuth();
  const { addToast } = useToast();
  const [store, setStore] = useState<StoreType | null>(null);
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [sort, setSort] = useState<'newest' | 'price-low' | 'price-high'>('newest');

  useEffect(() => {
    if (!slug) return;
    setLoading(true);
    getStoreBySlug(slug).then(async (storeData) => {
      if (!storeData) {
        navigate('/marketplace', { replace: true });
        return;
      }
      setStore(storeData);
      const prods = await getProducts({ storeId: storeData.id });
      setProducts(prods);
      setLoading(false);
    });
  }, [slug, navigate]);

  const sortedProducts = [...products].sort((a, b) => {
    if (sort === 'price-low') return a.price - b.price;
    if (sort === 'price-high') return b.price - a.price;
    return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
  });

  const handleAddToCart = async (product: Product) => {
    if (!user) {
      addToast('Please sign in to add items to cart', 'warning');
      navigate('/login');
      return;
    }
    await addItem(product.id, product.store_id);
    addToast(`${product.name} added to cart`, 'success');
  };

  if (loading) return <PageLoader />;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <Link to="/marketplace" className="inline-flex items-center gap-1 text-sm text-gray-500 hover:text-primary-600 dark:hover:text-primary-400 mb-6 transition-colors">
        <ArrowLeft className="w-4 h-4" /> Back to Marketplace
      </Link>

      {store && (
        <div className="card p-6 mb-8 animate-fade-in">
          <div className="flex items-center gap-6">
            <div className="w-24 h-24 rounded-2xl bg-gray-100 dark:bg-gray-800 flex items-center justify-center overflow-hidden flex-shrink-0">
              {store.logo_url ? (
                <img src={store.logo_url} alt={store.name} className="w-full h-full object-cover" />
              ) : (
                <Store className="w-12 h-12 text-gray-400" />
              )}
            </div>
            <div className="flex-1 min-w-0">
              <h1 className="text-2xl md:text-3xl font-bold mb-1">{store.name}</h1>
              <Badge>{store.category}</Badge>
              {store.description && <p className="text-gray-500 dark:text-gray-400 mt-2 text-sm">{store.description}</p>}
            </div>
          </div>
        </div>
      )}

      <div className="flex items-center justify-between mb-6">
        <h2 className="text-xl font-semibold flex items-center gap-2">
          <Package className="w-5 h-5" /> Products ({products.length})
        </h2>
        <div className="flex items-center gap-2">
          <SortAsc className="w-4 h-4 text-gray-400" />
          <select
            value={sort}
            onChange={e => setSort(e.target.value as typeof sort)}
            className="text-sm bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-lg px-3 py-1.5 outline-none focus:ring-2 focus:ring-primary-500"
          >
            <option value="newest">Newest</option>
            <option value="price-low">Price: Low to High</option>
            <option value="price-high">Price: High to Low</option>
          </select>
        </div>
      </div>

      {sortedProducts.length === 0 ? (
        <EmptyState
          icon={<Package className="w-16 h-16" />}
          title="No products yet"
          description="This store hasn't added any products yet."
        />
      ) : (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
          {sortedProducts.map((product, i) => (
            <Card key={product.id} className={`animate-slide-up stagger-${(i % 4) + 1}`}>
              <div className="aspect-square bg-gray-100 dark:bg-gray-800 rounded-t-xl overflow-hidden relative">
                {product.image_url ? (
                  <img src={product.image_url} alt={product.name} className="w-full h-full object-cover" />
                ) : (
                  <div className="w-full h-full flex items-center justify-center">
                    <ShoppingBag className="w-12 h-12 text-gray-300 dark:text-gray-600" />
                  </div>
                )}
                {product.customizable && (
                  <Badge variant="info" size="sm" className="absolute top-2 right-2">Custom</Badge>
                )}
              </div>
              <div className="p-4">
                <h3 className="font-semibold text-sm mb-1 truncate">{product.name}</h3>
                {product.description && (
                  <p className="text-xs text-gray-500 dark:text-gray-400 line-clamp-2 mb-2">{product.description}</p>
                )}
                <div className="flex items-center justify-between mt-2">
                  <span className="text-lg font-bold text-primary-600 dark:text-primary-400">
                    ${Number(product.price).toFixed(2)}
                  </span>
                  <Button size="sm" onClick={() => handleAddToCart(product)}>
                    Add
                  </Button>
                </div>
                {product.customizable && (
                  <button
                    onClick={() => navigate(`/product/${product.id}`)}
                    className="w-full mt-2 text-xs text-accent-600 dark:text-accent-400 font-medium hover:underline"
                  >
                    Request Customization
                  </button>
                )}
              </div>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
