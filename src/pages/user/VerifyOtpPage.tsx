import { useState, useRef, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { ShieldCheck } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../context/ToastContext';
import Button from '../../components/ui/Button';

export default function VerifyOtpPage() {
  const location = useLocation();
  const navigate = useNavigate();
  const { verifyOtp, signInWithOtp } = useAuth();
  const { addToast } = useToast();
  const email = (location.state as { email?: string })?.email || '';
  const otpType = (location.state as { type?: 'signup' | 'email' })?.type || 'signup';

  const [code, setCode] = useState(['', '', '', '', '', '']);
  const [loading, setLoading] = useState(false);
  const [resendCooldown, setResendCooldown] = useState(0);
  const [error, setError] = useState('');
  const inputRefs = useRef<(HTMLInputElement | null)[]>([]);

  useEffect(() => {
    if (!email) navigate('/signup', { replace: true });
  }, [email, navigate]);

  useEffect(() => {
    if (resendCooldown > 0) {
      const timer = setTimeout(() => setResendCooldown(c => c - 1), 1000);
      return () => clearTimeout(timer);
    }
  }, [resendCooldown]);

  const handleChange = (index: number, value: string) => {
    if (!/^\d*$/.test(value)) return;
    const newCode = [...code];
    newCode[index] = value.slice(-1);
    setCode(newCode);
    if (value && index < 5) {
      inputRefs.current[index + 1]?.focus();
    }
  };

  const handleKeyDown = (index: number, e: React.KeyboardEvent) => {
    if (e.key === 'Backspace' && !code[index] && index > 0) {
      inputRefs.current[index - 1]?.focus();
    }
  };

  const handlePaste = (e: React.ClipboardEvent) => {
    e.preventDefault();
    const pasted = e.clipboardData.getData('text').replace(/\D/g, '').slice(0, 6);
    const newCode = [...code];
    pasted.split('').forEach((char, i) => { newCode[i] = char; });
    setCode(newCode);
    const nextIndex = Math.min(pasted.length, 5);
    inputRefs.current[nextIndex]?.focus();
  };

  const handleVerify = async () => {
    const otp = code.join('');
    if (otp.length !== 6) {
      setError('Please enter the complete 6-digit code');
      return;
    }
    setLoading(true);
    setError('');
    const { error: err } = await verifyOtp(email, otp, otpType);
    setLoading(false);
    if (err) {
      setError(err.includes('expired') ? 'Code expired. Please resend.' : 'Invalid verification code');
    } else {
      addToast('Account verified successfully!', 'success');
      navigate('/marketplace', { replace: true });
    }
  };

  const handleResend = async () => {
    if (resendCooldown > 0) return;
    setLoading(true);
    const { error: err } = await signInWithOtp(email);
    setLoading(false);
    if (err) {
      addToast('Failed to resend code', 'error');
    } else {
      setResendCooldown(60);
      addToast('Verification code resent!', 'success');
    }
  };

  useEffect(() => {
    if (code.every(c => c !== '')) handleVerify();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [code]);

  return (
    <div className="min-h-[80vh] flex items-center justify-center px-4 py-12">
      <div className="w-full max-w-md animate-fade-in">
        <div className="text-center mb-8">
          <div className="w-16 h-16 rounded-2xl bg-primary-100 dark:bg-primary-900 flex items-center justify-center mx-auto mb-4">
            <ShieldCheck className="w-8 h-8 text-primary-600 dark:text-primary-400" />
          </div>
          <h1 className="text-2xl font-bold mb-2">Verify Your Email</h1>
          <p className="text-gray-500 dark:text-gray-400 text-sm">
            We sent a 6-digit code to <span className="font-medium text-gray-700 dark:text-gray-300">{email}</span>
          </p>
        </div>
        <div className="card p-8">
          <div className="flex justify-center gap-2 mb-6">
            {code.map((digit, i) => (
              <input
                key={i}
                ref={el => { inputRefs.current[i] = el; }}
                type="text"
                inputMode="numeric"
                maxLength={1}
                value={digit}
                onChange={e => handleChange(i, e.target.value)}
                onKeyDown={e => handleKeyDown(i, e)}
                onPaste={i === 0 ? handlePaste : undefined}
                className={`w-12 h-14 text-center text-xl font-bold rounded-lg border-2 outline-none transition-colors ${
                  digit
                    ? 'border-primary-500 bg-primary-50 dark:bg-primary-950 text-primary-700 dark:text-primary-400'
                    : 'border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800'
                } focus:border-primary-500 focus:ring-2 focus:ring-primary-200 dark:focus:ring-primary-800`}
              />
            ))}
          </div>
          {error && (
            <div className="p-3 rounded-lg bg-error-50 dark:bg-error-50/10 text-error-600 dark:text-error-400 text-sm mb-4 text-center">
              {error}
            </div>
          )}
          <Button onClick={handleVerify} loading={loading} className="w-full">
            Verify Code
          </Button>
          <div className="text-center mt-4">
            <button
              onClick={handleResend}
              disabled={resendCooldown > 0}
              className="text-sm text-primary-600 dark:text-primary-400 font-medium hover:underline disabled:text-gray-400 disabled:no-underline"
            >
              {resendCooldown > 0 ? `Resend code in ${resendCooldown}s` : "Didn't receive a code? Resend"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
