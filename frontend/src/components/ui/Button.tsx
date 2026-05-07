import clsx from 'clsx';
import type { ButtonHTMLAttributes, ReactNode } from 'react';

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'danger';
  size?: 'sm' | 'md' | 'lg';
  children: ReactNode;
}

export function Button({ variant = 'primary', size = 'md', className, children, ...props }: ButtonProps) {
  return (
    <button
      className={clsx(
        'inline-flex items-center justify-center font-medium rounded-[14px] transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2',
        {
          'bg-[var(--color-primary)] text-white hover:bg-[var(--color-primary-hover)] focus:ring-[var(--color-primary)]':
            variant === 'primary',
          'bg-white text-[var(--color-primary)] border border-[var(--color-accent-blue-light)] hover:bg-[var(--color-accent-blue-pale)] focus:ring-[var(--color-primary)]':
            variant === 'secondary',
          'bg-[var(--color-accent-red)] text-white hover:opacity-90 focus:ring-[var(--color-accent-red)]':
            variant === 'danger',
        },
        {
          'px-3 py-1.5 text-sm': size === 'sm',
          'px-4 py-2.5 text-sm': size === 'md',
          'px-6 py-3 text-base': size === 'lg',
        },
        className,
      )}
      {...props}
    >
      {children}
    </button>
  );
}
