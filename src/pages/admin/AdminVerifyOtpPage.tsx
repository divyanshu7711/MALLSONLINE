import { useState, useRef, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { ShieldCheck } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../context/ToastContext';
import Button from '../../components/ui/Button';

export default function AdminVerifyOtpPage() {
  const location = useLocation();
  const navigate = useNavigate();
  const { verifyOtp } = useAuth();
  const { addToast } = useToast();
  const email = (location.state as { email?: string })?.email || '';
  const otpType = (location.state as { type?: 'signup' | 'email' })?.type || 'email';

  const [code, setCode] = useState(['', '', '', '', '', '']);
  const [loading, setLoading] = useState(false);
  const [resendCooldown, setResendCooldown] = useState(0);
  const [error, setError] = useState('');
  const inputRefs = useRef<(HTMLInputElement | null)[]>([]);

  useEffect(() => {
    if (!email) navigate('/admin/divyanshu', { replace: true });
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
    if (value && index < 5) inputRefs.current[index + 1]?.focus();
  };

  const handleKeyDown = (index: number, e: React.KeyboardEvent) => {
    if (e.key === 'Backspace' && !code[index] && index > 0) inputRefs.current[index - 1]?.focus();
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
      addToast('Admin verification successful!', 'success');
      navigate('/admin/dashboard', { replace: true });
    }
  };

  useEffect(() => {
    if (code.every(c => c !== '')) handleVerify();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [code]);

  return (
    <div className="min-h-screen bg-gray-950 flex items-center justify-center px-4">
      <div className="w-full max-w-md animate-fade-in">
        <div className="text-center mb-8">
          <div className="w-16 h-16 rounded-2xl bg-primary-900/30 border border-primary-800 flex items-center justify-center mx-auto mb-4">
            <ShieldCheck className="w-8 h-8 text-primary-400" />
          </div>
          <h1 className="text-2xl font-bold text-white mb-2">Admin Verification</h1>
          <p className="text-gray-400 text-sm">
            Enter the 6-digit code sent to <span className="font-medium text-gray-300">{email}</span>
          </p>
        </div>

        <div className="bg-gray-900 border border-gray-800 rounded-2xl p-8">
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
                className={`w-12 h-14 text-center text-xl font-bold rounded-lg border-2 outline-none transition-colors bg-gray-800 ${
                  digit ? 'border-primary-500 text-primary-400' : 'border-gray-700 text-white'
                } focus:border-primary-500 focus:ring-2 focus:ring-primary-900`}
              />
            ))}
          </div>
          {error && <div className="p-3 rounded-lg bg-error-50/10 text-error-400 text-sm mb-4 text-center">{error}</div>}
          <Button onClick={handleVerify} loading={loading} className="w-full">Verify Code</Button>
          <div className="text-center mt-4">
            <button
              onClick={() => { if (resendCooldown === 0) { setResendCooldown(60); } }}
              disabled={resendCooldown > 0}
              className="text-sm text-primary-400 font-medium hover:underline disabled:text-gray-500 disabled:no-underline"
            >
              {resendCooldown > 0 ? `Resend in ${resendCooldown}s` : "Didn't receive code? Resend"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
