import { useState, useEffect } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { Search, Store as StoreIcon, ShoppingBag, SlidersHorizontal, X } from 'lucide-react';
import { getStores, getStoreCategories } from '../../services/storeService';
import Card from '../../components/ui/Card';
import { SkeletonCard } from '../../components/ui/LoadingSpinner';
import EmptyState from '../../components/ui/EmptyState';
import type { Store } from '../../types';

export default function MarketplacePage() {
  const [searchParams, setSearchParams] = useSearchParams();
  const navigate = useNavigate();
  const [stores, setStores] = useState<Store[]>([]);
  const [categories, setCategories] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState(searchParams.get('search') || '');
  const [selectedCategory, setSelectedCategory] = useState(searchParams.get('category') || '');
  const [showFilters, setShowFilters] = useState(false);

  useEffect(() => {
    getStoreCategories().then(setCategories);
  }, []);

  useEffect(() => {
    setLoading(true);
    const filters: { search?: string; category?: string } = {};
    if (search.trim()) filters.search = search.trim();
    if (selectedCategory) filters.category = selectedCategory;
    getStores(filters).then(data => {
      setStores(data);
      setLoading(false);
    });
  }, [search, selectedCategory]);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    const params = new URLSearchParams();
    if (search.trim()) params.set('search', search.trim());
    if (selectedCategory) params.set('category', selectedCategory);
    setSearchParams(params);
  };

  const clearFilters = () => {
    setSearch('');
    setSelectedCategory('');
    setSearchParams({});
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-8">
        <div>
          <h1 className="text-3xl font-bold">Marketplace</h1>
          <p className="text-gray-500 dark:text-gray-400 mt-1">Browse our curated collection of stores</p>
        </div>
        <div className="flex items-center gap-3">
          <form onSubmit={handleSearch} className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input
              type="text"
              placeholder="Search stores..."
              value={search}
              onChange={e => setSearch(e.target.value)}
              className="input-field pl-10 py-2 text-sm w-56"
            />
          </form>
          <button
            onClick={() => setShowFilters(!showFilters)}
            className={`p-2 rounded-lg border transition-colors ${showFilters ? 'border-primary-500 bg-primary-50 dark:bg-primary-950' : 'border-gray-300 dark:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-800'}`}
          >
            <SlidersHorizontal className="w-4 h-4" />
          </button>
          {(search || selectedCategory) && (
            <button onClick={clearFilters} className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800">
              <X className="w-4 h-4" />
            </button>
          )}
        </div>
      </div>

      {showFilters && categories.length > 0 && (
        <div className="mb-6 flex flex-wrap gap-2 animate-slide-down">
          <button
            onClick={() => setSelectedCategory('')}
            className={`px-3 py-1.5 rounded-full text-sm font-medium transition-colors ${!selectedCategory ? 'bg-primary-600 text-white' : 'bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-gray-700'}`}
          >
            All
          </button>
          {categories.map(cat => (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              className={`px-3 py-1.5 rounded-full text-sm font-medium transition-colors ${selectedCategory === cat ? 'bg-primary-600 text-white' : 'bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-gray-700'}`}
            >
              {cat}
            </button>
          ))}
        </div>
      )}

      {loading ? (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
          {Array.from({ length: 8 }).map((_, i) => <SkeletonCard key={i} />)}
        </div>
      ) : stores.length === 0 ? (
        <EmptyState
          icon={<StoreIcon className="w-16 h-16" />}
          title="No stores found"
          description={search || selectedCategory ? "Try adjusting your search or filters" : "Check back later for new stores"}
          action={!search && !selectedCategory ? undefined : (
            <button onClick={clearFilters} className="btn-primary">Clear Filters</button>
          )}
        />
      ) : (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
          {stores.map((store, i) => (
            <Card
              key={store.id}
              hover
              onClick={() => navigate(`/store/${store.slug}`)}
              className={`animate-slide-up stagger-${(i % 4) + 1}`}
            >
              <div className="p-5 text-center">
                <div className="w-20 h-20 rounded-2xl bg-gray-100 dark:bg-gray-800 mx-auto mb-4 flex items-center justify-center overflow-hidden">
                  {store.logo_url ? (
                    <img src={store.logo_url} alt={store.name} className="w-full h-full object-cover" />
                  ) : (
                    <StoreIcon className="w-10 h-10 text-gray-400" />
                  )}
                </div>
                <h3 className="font-semibold text-base mb-1 truncate">{store.name}</h3>
                <p className="text-xs text-gray-500 dark:text-gray-400 mb-2">{store.category}</p>
                {store.description && (
                  <p className="text-xs text-gray-400 dark:text-gray-500 line-clamp-2 mb-3">{store.description}</p>
                )}
                <div className="flex items-center justify-center gap-1 text-xs text-gray-400">
                  <ShoppingBag className="w-3 h-3" />
                  <span>{store.product_count ?? 0} products</span>
                </div>
              </div>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
