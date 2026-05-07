import clsx from 'clsx';
import type { ReactNode } from 'react';

interface CardProps {
  children: ReactNode;
  className?: string;
}

export function Card({ children, className }: CardProps) {
  return (
    <div
      className={clsx(
        'bg-white rounded-2xl border border-[var(--color-border)] shadow-sm p-6',
        className,
      )}
    >
      {children}
    </div>
  );
}
