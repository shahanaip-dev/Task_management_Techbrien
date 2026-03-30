import React from 'react';
import clsx from 'clsx';

type Variant = 'primary' | 'secondary' | 'danger' | 'ghost';
type Size    = 'sm' | 'md' | 'lg';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?:  Variant;
  size?:     Size;
  loading?:  boolean;
  children:  React.ReactNode;
}

const variantClasses: Record<Variant, string> = {
  primary:   'bg-[#7D1F1F] text-white hover:bg-[#5C1616] focus:ring-[#7D1F1F]/40',
  secondary: 'bg-white text-[#1C1A18] border border-[#E8DDD4] hover:border-[#8A8278] hover:bg-[#FAF7F2] focus:ring-[#8A8278]/30',
  danger:    'bg-red-600 text-white hover:bg-red-700 focus:ring-red-400',
  ghost:     'bg-transparent text-[#8A8278] hover:text-[#1C1A18] hover:bg-[#F5E6DC] focus:ring-[#8A8278]/30',
};

const sizeClasses: Record<Size, string> = {
  sm:  'px-3 py-1.5 text-xs tracking-wide',
  md:  'px-5 py-2.5 text-sm tracking-wide',
  lg:  'px-7 py-3 text-sm tracking-wider',
};

export default function Button({
  variant = 'primary',
  size    = 'md',
  loading = false,
  disabled,
  children,
  className,
  ...props
}: ButtonProps) {
  return (
    <button
      disabled={disabled || loading}
      className={clsx(
        'inline-flex items-center justify-center gap-2 rounded font-sans font-medium',
        'transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-offset-1',
        'disabled:opacity-50 disabled:cursor-not-allowed',
        variantClasses[variant],
        sizeClasses[size],
        className
      )}
      {...props}
    >
      {loading && (
        <svg className="animate-spin h-3.5 w-3.5" viewBox="0 0 24 24" fill="none">
          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
        </svg>
      )}
      {children}
    </button>
  );
}
