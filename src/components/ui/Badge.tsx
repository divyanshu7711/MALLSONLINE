interface BadgeProps {
  children: React.ReactNode;
  variant?: 'default' | 'success' | 'warning' | 'error' | 'info';
  size?: 'sm' | 'md';
  className?: string;
}

const variants = {
  default: 'bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-300',
  success: 'bg-success-100 text-success-700 dark:bg-success-50/20 dark:text-success-400',
  warning: 'bg-warning-100 text-warning-700 dark:bg-warning-50/20 dark:text-warning-400',
  error: 'bg-error-100 text-error-700 dark:bg-error-50/20 dark:text-error-400',
  info: 'bg-accent-100 text-accent-700 dark:bg-accent-50/20 dark:text-accent-400',
};

export default function Badge({ children, variant = 'default', size = 'sm', className = '' }: BadgeProps) {
  return (
    <span className={`inline-flex items-center font-medium rounded-full ${variants[variant]} ${size === 'sm' ? 'px-2 py-0.5 text-xs' : 'px-3 py-1 text-sm'} ${className}`}>
      {children}
    </span>
  );
}
