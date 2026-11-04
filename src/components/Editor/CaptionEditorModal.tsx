import React, { useState, useEffect } from 'react';
import { X, Lock, Type, Save, Trash2 } from 'lucide-react';
import { useEditorStore, TrackSegment } from '@/store/useEditorStore';

interface CaptionEditorModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function CaptionEditorModal({ isOpen, onClose }: CaptionEditorModalProps) {
  const { tracks, updateSegment, removeAllCaptions, setTranscriptionText } = useEditorStore();
  const [captions, setCaptions] = useState<TrackSegment[]>([]);

  useEffect(() => {
    if (isOpen) {
      const textTrack = tracks.find(t => t.id === 'text-1');
      if (textTrack) {
        const sortedCaptions = [...textTrack.segments]
          .filter(s => s.name === 'Caption')
          .sort((a, b) => a.start - b.start);
        queueMicrotask(() => setCaptions(sortedCaptions));
      }
    }
  }, [isOpen, tracks]);

  if (!isOpen) return null;

  const handleUpdate = (id: string, field: 'text' | 'start' | 'end', value: string | number) => {
    setCaptions(prev => prev.map(c => c.id === id ? { ...c, [field]: value } : c));
  };

  const handleSave = () => {
    captions.forEach(c => {
      // For duration updates based on start/end
      const duration = c.end - c.start;
      updateSegment('text-1', c.id, { 
        text: c.text, 
        start: c.start, 
        end: c.end, 
        duration: duration 
      });
    });
    onClose();
  };

  const handleDeleteAll = () => {
    if (!window.confirm('Delete the entire caption transcription? This removes every generated caption from the timeline and clears the raw transcript.')) return;
    removeAllCaptions('text-1');
    setTranscriptionText('');
    setCaptions([]);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/80 backdrop-blur-sm">
      <div className="bg-neutral-900 border border-neutral-800 rounded-2xl shadow-2xl w-full max-w-4xl max-h-[85vh] overflow-hidden flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between p-5 border-b border-neutral-800 bg-neutral-950">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-indigo-500/20 flex items-center justify-center text-indigo-400">
              <Type className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-white font-bold text-lg flex items-center gap-2">
                Bulk Caption Editor
                <span className="bg-gradient-to-r from-amber-500 to-orange-600 text-white text-[10px] uppercase tracking-wider font-black px-2 py-0.5 rounded-full flex items-center gap-1 shadow-lg shadow-orange-500/20">
                  <Lock className="w-3 h-3" /> PRO
                </span>
              </h2>
              <p className="text-xs text-neutral-500">Upgrade to Pro to export these advanced manual edits.</p>
            </div>
          </div>
          <button onClick={onClose} className="text-neutral-500 hover:text-white transition-colors bg-neutral-800 hover:bg-neutral-700 p-2 rounded-lg">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Body */}
        <div className="flex-1 overflow-y-auto p-0 bg-black/50 custom-scrollbar relative">
          {captions.length === 0 ? (
            <div className="absolute inset-0 flex items-center justify-center text-neutral-500 flex-col gap-2">
              <Type className="w-12 h-12 text-neutral-700" />
              <p>No captions found. Generate Auto Captions first.</p>
            </div>
          ) : (
            <div className="w-full text-sm">
              <div className="grid grid-cols-12 gap-4 p-4 border-b border-neutral-800 text-neutral-400 font-bold uppercase tracking-wider text-xs sticky top-0 bg-neutral-900/95 backdrop-blur z-10">
                <div className="col-span-8">Caption Text</div>
                <div className="col-span-2">Start (s)</div>
                <div className="col-span-2">End (s)</div>
              </div>
              
              <div className="p-2 space-y-2">
                {captions.map((cap) => (
                  <div key={cap.id} className="grid grid-cols-12 gap-4 p-2 bg-neutral-900/50 hover:bg-neutral-800 border border-transparent hover:border-neutral-700 rounded-lg items-center transition-colors">
                    <div className="col-span-8">
                      <input 
                        type="text" 
                        value={cap.text}
                        onChange={(e) => handleUpdate(cap.id, 'text', e.target.value)}
                        className="w-full bg-black border border-neutral-800 rounded px-3 py-2 text-white focus:border-indigo-500 focus:outline-none transition-colors"
                      />
                    </div>
                    <div className="col-span-2">
                      <input 
                        type="number" 
                        step="0.1"
                        value={cap.start}
                        onChange={(e) => handleUpdate(cap.id, 'start', parseFloat(e.target.value))}
                        className="w-full bg-black border border-neutral-800 rounded px-3 py-2 text-white font-mono focus:border-indigo-500 focus:outline-none transition-colors"
                      />
                    </div>
                    <div className="col-span-2">
                      <input 
                        type="number" 
                        step="0.1"
                        value={cap.end}
                        onChange={(e) => handleUpdate(cap.id, 'end', parseFloat(e.target.value))}
                        className="w-full bg-black border border-neutral-800 rounded px-3 py-2 text-white font-mono focus:border-indigo-500 focus:outline-none transition-colors"
                      />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-5 border-t border-neutral-800 bg-neutral-950 flex justify-between items-center">
          <div className="text-xs text-neutral-500">
            {captions.length} captions loaded
          </div>
          <div className="flex flex-wrap gap-3">
            <button
              onClick={handleDeleteAll}
              disabled={captions.length === 0}
              className="mr-auto px-4 py-2.5 rounded-lg font-bold text-sm text-red-300 hover:text-white bg-red-950/50 hover:bg-red-900 disabled:opacity-40 disabled:hover:bg-red-950/50 transition-colors flex items-center gap-2"
              title="Delete all generated captions and the raw transcript"
            >
              <Trash2 className="w-4 h-4" /> Delete Entire Transcription
            </button>
            <button 
              onClick={onClose}
              className="px-6 py-2.5 rounded-lg font-bold text-sm text-neutral-400 hover:text-white bg-neutral-900 hover:bg-neutral-800 transition-colors"
            >
              Cancel
            </button>
            <button 
              onClick={handleSave}
              disabled={captions.length === 0}
              className="px-8 py-2.5 rounded-lg font-bold text-sm bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 disabled:hover:bg-indigo-600 text-white transition-colors flex items-center gap-2 shadow-lg shadow-indigo-900/20"
            >
              <Save className="w-4 h-4" /> Save Changes
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
