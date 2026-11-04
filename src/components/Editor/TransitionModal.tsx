import React, { useState } from 'react';
import { X, Minus, Plus, Zap } from 'lucide-react';

interface TransitionModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (duration: number) => void;
  transitionType: string;
}

export default function TransitionModal({ isOpen, onClose, onSave, transitionType }: TransitionModalProps) {
  const [duration, setDuration] = useState(1);

  if (!isOpen) return null;

  const handleDecrease = () => setDuration(prev => Math.max(0.1, prev - 0.5));
  const handleIncrease = () => setDuration(prev => Math.min(5, prev + 0.5));

  return (
    <div className="fixed inset-0 z-[99999] flex items-center justify-center bg-black/80 backdrop-blur-sm pointer-events-auto">
      <div className="bg-neutral-900 border border-neutral-800 rounded-2xl shadow-2xl w-full max-w-sm overflow-hidden flex flex-col pointer-events-auto">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-neutral-800 bg-neutral-950">
          <h2 className="text-white font-bold flex items-center gap-2">
            <Zap className="w-5 h-5 text-amber-500" /> 
            Apply {transitionType}
          </h2>
          <button onClick={onClose} className="text-neutral-500 hover:text-white transition-colors">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Body */}
        <div className="p-6 flex flex-col items-center gap-6">
          <div className="text-center space-y-2">
            <h3 className="text-neutral-300 font-medium">Transition Duration</h3>
            <p className="text-xs text-neutral-500">How long should the transition last?</p>
          </div>

          <div className="flex items-center gap-6">
            <button 
              onClick={handleDecrease}
              className="w-12 h-12 rounded-full bg-neutral-800 border border-neutral-700 flex items-center justify-center hover:bg-neutral-700 hover:border-amber-500/50 text-white transition-colors"
            >
              <Minus className="w-6 h-6" />
            </button>

            <div className="flex flex-col items-center w-24">
              <span className="text-4xl font-black text-amber-500 tracking-tighter">
                {duration.toFixed(1)}
              </span>
              <span className="text-xs font-bold text-neutral-500 uppercase tracking-widest mt-1">
                Seconds
              </span>
            </div>

            <button 
              onClick={handleIncrease}
              className="w-12 h-12 rounded-full bg-neutral-800 border border-neutral-700 flex items-center justify-center hover:bg-neutral-700 hover:border-amber-500/50 text-white transition-colors"
            >
              <Plus className="w-6 h-6" />
            </button>
          </div>
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-neutral-800 bg-neutral-950 flex justify-end gap-3">
          <button 
            onClick={onClose}
            className="px-4 py-2 rounded-lg font-bold text-sm text-neutral-400 hover:text-white transition-colors"
          >
            Cancel
          </button>
          <button 
            onClick={() => onSave(duration)}
            className="px-6 py-2 rounded-lg font-bold text-sm bg-amber-600 hover:bg-amber-500 text-white transition-colors flex items-center gap-2 shadow-lg shadow-amber-900/20"
          >
            Apply Transition
          </button>
        </div>
      </div>
    </div>
  );
}
