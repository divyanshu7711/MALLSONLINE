import { useToast } from '../../context/ToastContext';
import { CheckCircle, XCircle, AlertTriangle, Info, X } from 'lucide-react';

const icons = {
  success: CheckCircle,
  error: XCircle,
  warning: AlertTriangle,
  info: Info,
};

const colors = {
  success: 'bg-success-50 border-success-500 text-success-700 dark:bg-success-50/10 dark:text-success-400',
  error: 'bg-error-50 border-error-500 text-error-700 dark:bg-error-50/10 dark:text-error-400',
  warning: 'bg-warning-50 border-warning-500 text-warning-700 dark:bg-warning-50/10 dark:text-warning-400',
  info: 'bg-accent-50 border-accent-500 text-accent-700 dark:bg-accent-50/10 dark:text-accent-400',
};

export default function ToastContainer() {
  const { toasts, removeToast } = useToast();

  return (
    <div className="fixed top-4 right-4 z-[100] flex flex-col gap-2 max-w-sm w-full">
      {toasts.map(toast => {
        const Icon = icons[toast.type];
        return (
          <div
            key={toast.id}
            className={`flex items-start gap-3 p-4 rounded-lg border-l-4 shadow-lg animate-slide-down ${colors[toast.type]}`}
          >
            <Icon className="w-5 h-5 flex-shrink-0 mt-0.5" />
            <p className="text-sm flex-1">{toast.message}</p>
            <button onClick={() => removeToast(toast.id)} className="flex-shrink-0 hover:opacity-70">
              <X className="w-4 h-4" />
            </button>
          </div>
        );
      })}
    </div>
  );
}
