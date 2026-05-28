import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Search, ArrowRight, Store as StoreIcon, Sparkles, ShoppingBag, Star } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { getStores } from '../../services/storeService';
import Card from '../../components/ui/Card';
import type { Store } from '../../types';

export default function LandingPage() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [search, setSearch] = useState('');
  const [stores, setStores] = useState<Store[]>([]);

  useEffect(() => {
    getStores().then(s => setStores(s.slice(0, 8)));
  }, []);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (search.trim()) navigate(`/marketplace?search=${encodeURIComponent(search.trim())}`);
  };

  return (
    <div className="min-h-screen">
      {/* Hero */}
      <section className="relative overflow-hidden bg-gradient-to-br from-primary-600 via-primary-700 to-accent-700 text-white">
        <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHZpZXdCb3g9IjAgMCA2MCA2MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZyBmaWxsPSJub25lIiBmaWxsLXJ1bGU9ImV2ZW5vZGQiPjxnIGZpbGw9IiNmZmYiIGZpbGwtb3BhY2l0eT0iMC4wNSI+PHBhdGggZD0iTTM2IDE0djItSDJ2LTJoMzR6bTAgMjR2Mkgydi0yaDM0ek0zNiA0djJIMnYtMmgzNHoiLz48L2c+PC9nPjwvc3ZnPg==')] opacity-30" />
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24 md:py-36">
          <div className="text-center max-w-3xl mx-auto animate-fade-in">
            <h1 className="text-4xl md:text-6xl font-bold mb-6 leading-tight">
              Discover Unique Stores,<br />
              <span className="text-primary-200">Shop Amazing Products</span>
            </h1>
            <p className="text-lg md:text-xl text-primary-100 mb-10 max-w-2xl mx-auto">
              Your one-stop marketplace for curated stores, handcrafted goods, and custom creations tailored just for you.
            </p>
            <form onSubmit={handleSearch} className="flex max-w-xl mx-auto mb-8">
              <div className="relative flex-1">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search stores and products..."
                  value={search}
                  onChange={e => setSearch(e.target.value)}
                  className="w-full pl-12 pr-4 py-4 rounded-l-xl text-gray-900 bg-white border-0 outline-none focus:ring-2 focus:ring-primary-300 text-base"
                />
              </div>
              <button type="submit" className="bg-accent-600 hover:bg-accent-700 text-white px-8 py-4 rounded-r-xl font-semibold transition-colors">
                Search
              </button>
            </form>
            {!user && (
              <div className="flex gap-4 justify-center">
                <Link to="/signup" className="bg-white text-primary-700 px-8 py-3 rounded-xl font-semibold hover:bg-primary-50 transition-colors">
                  Get Started
                </Link>
                <Link to="/login" className="border-2 border-white/50 text-white px-8 py-3 rounded-xl font-semibold hover:bg-white/10 transition-colors">
                  Sign In
                </Link>
              </div>
            )}
          </div>
        </div>
      </section>

      {/* How it Works */}
      <section className="py-20 bg-white dark:bg-gray-900">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl font-bold text-center mb-12">How It Works</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[
              { icon: StoreIcon, title: 'Browse Stores', desc: 'Explore curated stores across categories and find exactly what you need.' },
              { icon: ShoppingBag, title: 'Shop Products', desc: 'Add products to cart from multiple stores and checkout seamlessly.' },
              { icon: Sparkles, title: 'Get Customized', desc: 'Request custom-made products tailored to your unique vision.' },
            ].map((step, i) => (
              <div key={i} className={`text-center animate-slide-up stagger-${i + 1}`}>
                <div className="w-16 h-16 rounded-2xl bg-primary-100 dark:bg-primary-900 flex items-center justify-center mx-auto mb-4">
                  <step.icon className="w-8 h-8 text-primary-600 dark:text-primary-400" />
                </div>
                <h3 className="text-xl font-semibold mb-2">{step.title}</h3>
                <p className="text-gray-500 dark:text-gray-400">{step.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Featured Stores */}
      <section className="py-20 bg-gray-50 dark:bg-gray-950">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between mb-10">
            <h2 className="text-3xl font-bold">Featured Stores</h2>
            <Link to="/marketplace" className="flex items-center gap-1 text-primary-600 dark:text-primary-400 font-medium hover:gap-2 transition-all">
              View All <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
          {stores.length > 0 ? (
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
                    <h3 className="font-semibold text-base mb-1">{store.name}</h3>
                    <p className="text-sm text-gray-500 dark:text-gray-400 mb-2">{store.category}</p>
                    <div className="flex items-center justify-center gap-1 text-xs text-gray-400">
                      <ShoppingBag className="w-3 h-3" />
                      <span>{store.product_count ?? 0} products</span>
                    </div>
                  </div>
                </Card>
              ))}
            </div>
          ) : (
            <p className="text-center text-gray-400 py-12">No stores yet. Check back soon!</p>
          )}
        </div>
      </section>

      {/* Custom CTA */}
      <section className="py-20 bg-gradient-to-r from-accent-600 to-primary-600 text-white">
        <div className="max-w-4xl mx-auto px-4 text-center animate-fade-in">
          <Sparkles className="w-12 h-12 mx-auto mb-6 text-accent-200" />
          <h2 className="text-3xl md:text-4xl font-bold mb-4">Demand Your Customized Product</h2>
          <p className="text-lg text-accent-100 mb-8 max-w-2xl mx-auto">
            Can't find exactly what you want? Describe your vision and our stores will create it for you.
          </p>
          <Link
            to={user ? '/custom-request' : '/signup'}
            className="inline-flex items-center gap-2 bg-white text-primary-700 px-8 py-4 rounded-xl font-semibold hover:bg-primary-50 transition-colors text-lg"
          >
            <Star className="w-5 h-5" /> Request Custom Product
          </Link>
        </div>
      </section>
    </div>
  );
}
