import React from 'react';
import clsx from 'clsx';

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?:    string;
  error?:    string;
  hint?:     string;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
}

export default function Input({ label, error, hint, leftIcon, rightIcon, id, className, ...props }: InputProps) {
  const inputId = id ?? label?.toLowerCase().replace(/\s+/g, '-');
  return (
    <div className="flex flex-col gap-1.5">
      {label && (
        <label htmlFor={inputId} className="text-xs font-medium text-[#1C1A18] tracking-wide uppercase">
          {label}
          {props.required && <span className="text-[#7D1F1F] ml-1">*</span>}
        </label>
      )}
      <div className="relative">
        <input
          id={inputId}
          className={clsx(
            'block w-full rounded border px-3 py-2.5 text-sm font-sans font-light',
            'bg-white placeholder-[#C4B8AD] text-[#1C1A18]',
            'focus:outline-none focus:ring-2 focus:ring-[#7D1F1F]/30 focus:border-[#7D1F1F]/50',
            'transition-colors duration-200',
            error ? 'border-red-400 bg-red-50' : 'border-[#E8DDD4] hover:border-[#C4B8AD]',
            leftIcon ? 'pl-9' : '',
            rightIcon ? 'pr-9' : '',
            className
          )}
          {...props}
        />
        {leftIcon && (
          <span className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-[#8A8278]">
            {leftIcon}
          </span>
        )}
        {rightIcon && (
          <span className="absolute right-3 top-1/2 -translate-y-1/2 text-[#8A8278] z-10 flex items-center justify-center">
            {rightIcon}
          </span>
        )}
      </div>
      {error && <p className="text-xs text-red-600">{error}</p>}
      {hint && !error && <p className="text-xs text-[#8A8278]">{hint}</p>}
    </div>
  );
}

interface TextareaProps extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
  label?: string;
  error?: string;
}

export function Textarea({ label, error, id, className, ...props }: TextareaProps) {
  const inputId = id ?? label?.toLowerCase().replace(/\s+/g, '-');
  return (
    <div className="flex flex-col gap-1.5">
      {label && (
        <label htmlFor={inputId} className="text-xs font-medium text-[#1C1A18] tracking-wide uppercase">
          {label}
        </label>
      )}
      <textarea
        id={inputId}
        rows={3}
        className={clsx(
          'block w-full rounded border px-3 py-2.5 text-sm font-sans font-light',
          'bg-white placeholder-[#C4B8AD] text-[#1C1A18] resize-none',
          'focus:outline-none focus:ring-2 focus:ring-[#7D1F1F]/30 focus:border-[#7D1F1F]/50',
          'transition-colors duration-200',
          error ? 'border-red-400 bg-red-50' : 'border-[#E8DDD4] hover:border-[#C4B8AD]',
          className
        )}
        {...props}
      />
      {error && <p className="text-xs text-red-600">{error}</p>}
    </div>
  );
}

interface SelectProps extends React.SelectHTMLAttributes<HTMLSelectElement> {
  label?:       string;
  error?:       string;
  options:      { value: string; label: string }[];
  placeholder?: string;
  leftIcon?:    React.ReactNode;
}

export function Select({ label, error, leftIcon, id, options, placeholder, className, ...props }: SelectProps) {
  const inputId = id ?? label?.toLowerCase().replace(/\s+/g, '-');
  return (
    <div className="flex flex-col gap-1.5">
      {label && (
        <label htmlFor={inputId} className="text-xs font-medium text-[#1C1A18] tracking-wide uppercase">
          {label}
        </label>
      )}
      <div className="relative">
        {leftIcon && (
          <span className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-[#8A8278]">
            {leftIcon}
          </span>
        )}
        <select
          id={inputId}
          className={clsx(
            'block w-full rounded border px-3 py-2.5 text-sm font-sans font-light',
            'bg-white text-[#1C1A18] appearance-none',
            'focus:outline-none focus:ring-2 focus:ring-[#7D1F1F]/30 focus:border-[#7D1F1F]/50',
            'transition-colors duration-200',
            error ? 'border-red-400' : 'border-[#E8DDD4] hover:border-[#C4B8AD]',
            leftIcon ? 'pl-9' : '',
            className
          )}
          style={{
            backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='12' viewBox='0 0 24 24' fill='none' stroke='%238A8278' stroke-width='2'%3E%3Cpolyline points='6 9 12 15 18 9'%3E%3C/polyline%3E%3C/svg%3E")`,
            backgroundRepeat: 'no-repeat',
            backgroundPosition: 'right 12px center',
            paddingRight: '36px',
          }}
          {...props}
        >
          {placeholder && <option value="">{placeholder}</option>}
          {options.map((opt) => (
            <option key={opt.value} value={opt.value}>{opt.label}</option>
          ))}
        </select>
      </div>
      {error && <p className="text-xs text-red-600">{error}</p>}
    </div>
  );
}
