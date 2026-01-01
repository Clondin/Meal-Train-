import React from 'react';
import { cn } from '@/lib/utils';

export interface SpinnerProps {
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}

const sizeStyles = {
  sm: 'h-4 w-4 border-2',
  md: 'h-8 w-8 border-3',
  lg: 'h-12 w-12 border-4',
};

export const Spinner: React.FC<SpinnerProps> = ({
  size = 'md',
  className,
}) => {
  return (
    <div
      role="status"
      aria-label="Loading"
      className={cn('inline-block', className)}
    >
      <div
        className={cn(
          'animate-spin rounded-full border-solid border-current border-r-transparent',
          sizeStyles[size]
        )}
      />
      <span className="sr-only">Loading...</span>
    </div>
  );
};
