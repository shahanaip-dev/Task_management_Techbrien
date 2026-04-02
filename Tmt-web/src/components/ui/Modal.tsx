import React from 'react';

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title?: string;
  children: React.ReactNode;
}

export default function Modal({ isOpen, onClose, title, children }: ModalProps) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center px-4">
      <div className="absolute inset-0 bg-black/40" onClick={onClose} />
      <div className="relative w-full max-w-md bg-white rounded-lg border border-[#E8DDD4] shadow-lg p-5">
        {title && <h3 className="font-serif text-lg font-semibold text-[#1C1A18] mb-4">{title}</h3>}
        {children}
      </div>
    </div>
  );
}
