import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Store, UserPlus } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import Button from '../../components/ui/Button';
import Input from '../../components/ui/Input';

export default function SignupPage() {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { signUp } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    if (password.length < 6) {
      setError('Password must be at least 6 characters');
      return;
    }
    if (!name.trim()) {
      setError('Please enter your name');
      return;
    }
    setLoading(true);
    const { error: err } = await signUp(email, password, name.trim());
    setLoading(false);
    if (err) {
      setError(err.includes('already registered') ? 'This email is already registered' : err);
    } else {
      navigate('/verify-otp', { state: { email } });
    }
  };

  const strength = password.length === 0 ? 0 : password.length < 6 ? 1 : password.length < 10 ? 2 : 3;
  const strengthColors = ['', 'bg-error-500', 'bg-warning-500', 'bg-success-500'];
  const strengthLabels = ['', 'Weak', 'Medium', 'Strong'];

  return (
    <div className="min-h-[80vh] flex items-center justify-center px-4 py-12">
      <div className="w-full max-w-md animate-fade-in">
        <div className="text-center mb-8">
          <Link to="/" className="inline-flex items-center gap-2 font-bold text-2xl text-primary-700 dark:text-primary-400 mb-2">
            <Store className="w-8 h-8" /> MarketHub
          </Link>
          <p className="text-gray-500 dark:text-gray-400">Create your account to get started.</p>
        </div>
        <div className="card p-8">
          <form onSubmit={handleSubmit} className="space-y-5">
            <Input
              label="Full Name"
              type="text"
              value={name}
              onChange={e => setName(e.target.value)}
              placeholder="John Doe"
              required
            />
            <Input
              label="Email Address"
              type="email"
              value={email}
              onChange={e => setEmail(e.target.value)}
              placeholder="you@example.com"
              required
            />
            <div>
              <Input
                label="Password"
                type="password"
                value={password}
                onChange={e => setPassword(e.target.value)}
                placeholder="At least 6 characters"
                required
              />
              {password.length > 0 && (
                <div className="mt-2">
                  <div className="flex gap-1 mb-1">
                    {[1, 2, 3].map(i => (
                      <div key={i} className={`h-1 flex-1 rounded-full ${i <= strength ? strengthColors[strength] : 'bg-gray-200 dark:bg-gray-700'}`} />
                    ))}
                  </div>
                  <p className="text-xs text-gray-500">{strengthLabels[strength]}</p>
                </div>
              )}
            </div>
            {error && (
              <div className="p-3 rounded-lg bg-error-50 dark:bg-error-50/10 text-error-600 dark:text-error-400 text-sm">
                {error}
              </div>
            )}
            <Button type="submit" loading={loading} className="w-full" icon={<UserPlus className="w-4 h-4" />}>
              Create Account
            </Button>
          </form>
          <p className="text-center text-sm text-gray-500 dark:text-gray-400 mt-6">
            Already have an account?{' '}
            <Link to="/login" className="text-primary-600 dark:text-primary-400 font-medium hover:underline">
              Sign In
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
