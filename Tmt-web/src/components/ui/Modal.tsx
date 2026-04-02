'use client';

import React, { useEffect } from 'react';
import { createPortal } from 'react-dom';
import clsx from 'clsx';

interface ModalProps {
  isOpen:   boolean;
  onClose:  () => void;
  title:    string;
  children: React.ReactNode;
  size?:    'sm' | 'md' | 'lg' | 'square';
}

const sizeClasses = {
  sm: 'max-w-sm',
  md: 'max-w-md',
  lg: 'max-w-lg',
  square: 'w-[520px] h-[520px] max-w-[92vw] max-h-[92vh]',
};

export default function Modal({ isOpen, onClose, title, children, size = 'md' }: ModalProps) {
  useEffect(() => {
    const handler = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose(); };
    if (isOpen) document.addEventListener('keydown', handler);
    return () => document.removeEventListener('keydown', handler);
  }, [isOpen, onClose]);

  useEffect(() => {
    document.body.style.overflow = isOpen ? 'hidden' : '';
    return () => { document.body.style.overflow = ''; };
  }, [isOpen]);

  if (!isOpen) return null;
  if (typeof document === 'undefined') return null;

  const isSquare = size === 'square';

  return createPortal(
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div className="absolute inset-0 bg-[#1C1A18]/40 backdrop-blur-sm" onClick={onClose} />

      {/* Panel */}
      <div className={clsx(
        'relative bg-[#FAF7F2] rounded-lg shadow-2xl',
        'max-h-[90vh] overflow-y-auto border border-[#E8DDD4]',
        !isSquare && 'w-full',
        sizeClasses[size]
      )}>
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-[#E8DDD4]">
          <h2 className="font-serif text-xl font-semibold text-[#1C1A18]">{title}</h2>
          <button
            onClick={onClose}
            className="p-1.5 rounded text-[#8A8278] hover:text-[#1C1A18] hover:bg-[#F5E6DC] transition-colors"
          >
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
        <div className="px-6 py-5">{children}</div>
      </div>
    </div>,
    document.body
  );
}
