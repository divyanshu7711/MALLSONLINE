import { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { Store, ShoppingCart, Sun, Moon, Menu, X, User, LogOut, Package } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useTheme } from '../../context/ThemeContext';
import { useCart } from '../../context/CartContext';

export default function Navbar() {
  const { user, profile, signOut } = useAuth();
  const { dark, toggle } = useTheme();
  const { itemCount } = useCart();
  const navigate = useNavigate();
  const location = useLocation();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [search, setSearch] = useState('');

  useEffect(() => {
    const handler = () => setScrolled(window.scrollY > 10);
    window.addEventListener('scroll', handler);
    return () => window.removeEventListener('scroll', handler);
  }, []);

  useEffect(() => {
    setMobileOpen(false);
    setUserMenuOpen(false);
  }, [location]);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (search.trim()) navigate(`/marketplace?search=${encodeURIComponent(search.trim())}`);
  };

  if (location.pathname.startsWith('/admin')) return null;

  return (
    <nav className={`sticky top-0 z-40 transition-all duration-300 ${scrolled ? 'bg-white/80 dark:bg-gray-950/80 backdrop-blur-lg shadow-sm' : 'bg-white dark:bg-gray-950'}`}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          <Link to="/" className="flex items-center gap-2 font-bold text-xl text-primary-700 dark:text-primary-400">
            <Store className="w-7 h-7" />
            <span>MarketHub</span>
          </Link>

          <form onSubmit={handleSearch} className="hidden md:flex flex-1 max-w-md mx-8">
            <input
              type="text"
              placeholder="Search stores and products..."
              value={search}
              onChange={e => setSearch(e.target.value)}
              className="input-field text-sm py-2"
            />
          </form>

          <div className="hidden md:flex items-center gap-3">
            <Link to="/marketplace" className="text-sm font-medium text-gray-600 dark:text-gray-300 hover:text-primary-600 dark:hover:text-primary-400 transition-colors">
              Stores
            </Link>
            <button onClick={toggle} className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors">
              {dark ? <Sun className="w-5 h-5 text-yellow-400" /> : <Moon className="w-5 h-5 text-gray-600" />}
            </button>
            {user ? (
              <>
                <Link to="/cart" className="relative p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors">
                  <ShoppingCart className="w-5 h-5 text-gray-600 dark:text-gray-300" />
                  {itemCount > 0 && (
                    <span className="absolute -top-1 -right-1 bg-primary-600 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center font-bold">
                      {itemCount > 99 ? '99+' : itemCount}
                    </span>
                  )}
                </Link>
                <div className="relative">
                  <button
                    onClick={() => setUserMenuOpen(!userMenuOpen)}
                    className="flex items-center gap-2 p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
                  >
                    <div className="w-8 h-8 rounded-full bg-primary-100 dark:bg-primary-900 flex items-center justify-center">
                      <User className="w-4 h-4 text-primary-600 dark:text-primary-400" />
                    </div>
                    <span className="text-sm font-medium text-gray-700 dark:text-gray-300 max-w-24 truncate">
                      {profile?.full_name || 'User'}
                    </span>
                  </button>
                  {userMenuOpen && (
                    <div className="absolute right-0 mt-2 w-48 bg-white dark:bg-gray-900 rounded-xl shadow-lg border border-gray-200 dark:border-gray-800 py-2 animate-scale-in">
                      <Link to="/profile" className="flex items-center gap-2 px-4 py-2 text-sm hover:bg-gray-50 dark:hover:bg-gray-800">
                        <User className="w-4 h-4" /> Profile
                      </Link>
                      <Link to="/cart" className="flex items-center gap-2 px-4 py-2 text-sm hover:bg-gray-50 dark:hover:bg-gray-800">
                        <ShoppingCart className="w-4 h-4" /> My Cart
                      </Link>
                      <Link to="/custom-request" className="flex items-center gap-2 px-4 py-2 text-sm hover:bg-gray-50 dark:hover:bg-gray-800">
                        <Package className="w-4 h-4" /> Custom Requests
                      </Link>
                      <hr className="my-1 border-gray-200 dark:border-gray-800" />
                      <button
                        onClick={() => { signOut(); navigate('/'); }}
                        className="flex items-center gap-2 px-4 py-2 text-sm text-error-600 hover:bg-gray-50 dark:hover:bg-gray-800 w-full"
                      >
                        <LogOut className="w-4 h-4" /> Sign Out
                      </button>
                    </div>
                  )}
                </div>
              </>
            ) : (
              <div className="flex items-center gap-2">
                <Link to="/login" className="btn-secondary text-sm">Login</Link>
                <Link to="/signup" className="btn-primary text-sm">Sign Up</Link>
              </div>
            )}
          </div>

          <button onClick={() => setMobileOpen(!mobileOpen)} className="md:hidden p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800">
            {mobileOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>
      </div>

      {mobileOpen && (
        <div className="md:hidden border-t border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-950 animate-slide-down">
          <div className="px-4 py-3 space-y-3">
            <form onSubmit={handleSearch}>
              <input
                type="text"
                placeholder="Search..."
                value={search}
                onChange={e => setSearch(e.target.value)}
                className="input-field text-sm py-2"
              />
            </form>
            <Link to="/marketplace" className="block py-2 text-sm font-medium">Stores</Link>
            <button onClick={toggle} className="flex items-center gap-2 py-2 text-sm font-medium w-full">
              {dark ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />} {dark ? 'Light Mode' : 'Dark Mode'}
            </button>
            {user ? (
              <>
                <Link to="/cart" className="flex items-center gap-2 py-2 text-sm font-medium">
                  <ShoppingCart className="w-4 h-4" /> Cart ({itemCount})
                </Link>
                <Link to="/profile" className="block py-2 text-sm font-medium">Profile</Link>
                <button onClick={() => { signOut(); navigate('/'); }} className="flex items-center gap-2 py-2 text-sm font-medium text-error-600 w-full">
                  <LogOut className="w-4 h-4" /> Sign Out
                </button>
              </>
            ) : (
              <div className="flex gap-2 pt-2">
                <Link to="/login" className="btn-secondary text-sm flex-1 text-center">Login</Link>
                <Link to="/signup" className="btn-primary text-sm flex-1 text-center">Sign Up</Link>
              </div>
            )}
          </div>
        </div>
      )}
    </nav>
  );
}
