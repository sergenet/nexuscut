"use client";

import React from 'react';
import { X } from 'lucide-react';

interface MobileBottomSheetProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  children: React.ReactNode;
}

export default function MobileBottomSheet({ isOpen, onClose, title, children }: MobileBottomSheetProps) {
  if (!isOpen) return null;

  return (
    <>
      {/* Backdrop (clickable to close) */}
      <div 
        // Keep the editor preview sharp while a user adjusts text settings.
        // A blurred background made live caption size changes impossible to judge.
        className="fixed inset-0 z-40 bg-black/35"
        onClick={onClose}
      />
      
      {/* Bottom Sheet */}
      <div 
        className="fixed bottom-0 left-0 right-0 z-50 bg-neutral-900 border-t border-neutral-800 rounded-t-2xl shadow-2xl flex flex-col transform transition-transform duration-300 ease-in-out translate-y-0"
        style={{ height: '55vh' }}
      >
        <div className="flex items-center justify-between px-4 py-3 border-b border-neutral-800 bg-neutral-950 rounded-t-2xl flex-shrink-0">
          <h2 className="text-white font-bold text-sm">{title}</h2>
          <button 
            onClick={onClose}
            className="p-1 rounded bg-neutral-800 hover:bg-neutral-700 text-neutral-400 hover:text-white transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
        
        <div className="flex-1 overflow-y-auto custom-scrollbar bg-neutral-900">
          {children}
        </div>
      </div>
    </>
  );
}
