import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Shield, LogIn, AlertTriangle } from 'lucide-react';
import { useAuth, ADMIN_EMAIL } from '../../context/AuthContext';
import Button from '../../components/ui/Button';
import Input from '../../components/ui/Input';

export default function AdminLoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [attempts, setAttempts] = useState(0);
  const [locked, setLocked] = useState(false);
  const { signIn, signInWithOtp } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (locked) {
      setError('Too many failed attempts. Please wait 15 minutes.');
      return;
    }

    if (email.trim().toLowerCase() !== ADMIN_EMAIL) {
      setError('Access denied. Invalid admin credentials.');
      return;
    }

    setLoading(true);
    const { error: signInError } = await signIn(email, password);

    if (signInError) {
      const newAttempts = attempts + 1;
      setAttempts(newAttempts);
      if (newAttempts >= 5) {
        setLocked(true);
        setError('Too many failed attempts. Account locked for 15 minutes.');
        setTimeout(() => {
          setLocked(false);
          setAttempts(0);
        }, 15 * 60 * 1000);
      } else {
        setError('Invalid credentials.');
      }
      setLoading(false);
      return;
    }

    // After successful login, send OTP for 2FA
    const { error: otpError } = await signInWithOtp(email);
    if (otpError) {
      setError('Failed to send verification code. Please try again.');
      setLoading(false);
      return;
    }

    navigate('/admin/verify-otp', { state: { email, type: 'email' } });
    setLoading(false);
  };

  return (
    <div className="min-h-screen bg-gray-950 flex items-center justify-center px-4">
      <div className="w-full max-w-md animate-fade-in">
        <div className="text-center mb-8">
          <div className="w-20 h-20 rounded-2xl bg-primary-900/30 border border-primary-800 flex items-center justify-center mx-auto mb-4">
            <Shield className="w-10 h-10 text-primary-400" />
          </div>
          <h1 className="text-3xl font-bold text-white mb-2">Admin Portal</h1>
          <p className="text-gray-400">Sign in with your admin credentials</p>
        </div>

        <div className="bg-gray-900 border border-gray-800 rounded-2xl p-8">
          {locked && (
            <div className="flex items-center gap-2 p-3 rounded-lg bg-warning-50/10 text-warning-400 text-sm mb-4">
              <AlertTriangle className="w-4 h-4 flex-shrink-0" />
              Account locked. Try again in 15 minutes.
            </div>
          )}
          <form onSubmit={handleSubmit} className="space-y-5">
            <Input
              label="Admin Email"
              type="email"
              value={email}
              onChange={e => setEmail(e.target.value)}
              placeholder="admin@example.com"
              required
              className="!bg-gray-800 !border-gray-700 !text-white"
            />
            <Input
              label="Password"
              type="password"
              value={password}
              onChange={e => setPassword(e.target.value)}
              placeholder="Enter admin password"
              required
              className="!bg-gray-800 !border-gray-700 !text-white"
            />
            {error && (
              <div className="p-3 rounded-lg bg-error-50/10 text-error-400 text-sm">{error}</div>
            )}
            <Button type="submit" loading={loading} className="w-full" icon={<LogIn className="w-4 h-4" />}>
              Sign In to Admin
            </Button>
          </form>
        </div>
      </div>
    </div>
  );
}
