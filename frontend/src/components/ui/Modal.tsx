'use client';
import { ReactNode, useEffect } from 'react';
import { X } from 'lucide-react';

interface ModalProps {
  isOpen:   boolean;
  onClose:  () => void;
  title?:   string;
  children: ReactNode;
  size?:    'sm' | 'md' | 'lg';
}

const sizeMap = { sm:'max-w-md', md:'max-w-lg', lg:'max-w-2xl' };

export default function Modal({ isOpen, onClose, title, children, size='md' }: ModalProps) {
  // Close modal when Escape key is pressed
  useEffect(() => {
    const handler = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose(); };
    if (isOpen) document.addEventListener('keydown', handler);
    return () => document.removeEventListener('keydown', handler);
  }, [isOpen, onClose]);

  // Prevent body scroll when modal is open
  useEffect(() => {
    document.body.style.overflow = isOpen ? 'hidden' : '';
    return () => { document.body.style.overflow = ''; };
  }, [isOpen]);

  if (!isOpen) return null;

  return (
    <div className='fixed inset-0 z-50 flex items-center justify-center p-4'>
      {/* Backdrop */}
      <div
        className='absolute inset-0 bg-black/50 backdrop-blur-sm'
        onClick={onClose}
      />
      {/* Modal panel */}
      <div className={`relative bg-white rounded-2xl shadow-xl w-full ${sizeMap[size]} z-10`}>
        {/* Header */}
        {title && (
          <div className='flex items-center justify-between p-6 border-b'>
            <h2 className='text-xl font-bold text-gray-800'>{title}</h2>
            <button onClick={onClose}
              className='text-gray-400 hover:text-gray-600 transition'>
              <X className='h-5 w-5' />
            </button>
          </div>
        )}
        {/* Body */}
        <div className='p-6'>{children}</div>
      </div>
    </div>
  );
}