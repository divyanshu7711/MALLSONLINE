import { Store } from 'lucide-react';
import { Link } from 'react-router-dom';

export default function Footer() {
  return (
    <footer className="bg-gray-900 dark:bg-gray-950 text-gray-400 border-t border-gray-800">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          <div>
            <div className="flex items-center gap-2 font-bold text-lg text-white mb-3">
              <Store className="w-6 h-6 text-primary-400" />
              MarketHub
            </div>
            <p className="text-sm">Discover unique stores and shop amazing products. Your one-stop marketplace for everything custom.</p>
          </div>
          <div>
            <h3 className="font-semibold text-white mb-3">Marketplace</h3>
            <ul className="space-y-2 text-sm">
              <li><Link to="/marketplace" className="hover:text-primary-400 transition-colors">Browse Stores</Link></li>
              <li><Link to="/custom-request" className="hover:text-primary-400 transition-colors">Custom Products</Link></li>
            </ul>
          </div>
          <div>
            <h3 className="font-semibold text-white mb-3">Account</h3>
            <ul className="space-y-2 text-sm">
              <li><Link to="/cart" className="hover:text-primary-400 transition-colors">Shopping Cart</Link></li>
              <li><Link to="/profile" className="hover:text-primary-400 transition-colors">My Profile</Link></li>
            </ul>
          </div>
          <div>
            <h3 className="font-semibold text-white mb-3">Contact</h3>
            <p className="text-sm">Have questions? Reach out to us for support and inquiries.</p>
          </div>
        </div>
        <div className="mt-10 pt-8 border-t border-gray-800 text-center text-sm">
          <p>&copy; {new Date().getFullYear()} MarketHub. All rights reserved.</p>
        </div>
      </div>
    </footer>
  );
}
