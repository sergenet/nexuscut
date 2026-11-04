import React from 'react';
import { useEditorStore, Track, TrackSegment } from '@/store/useEditorStore';
import { Type, Maximize, Bold, Italic, AlignLeft, AlignCenter, AlignRight } from 'lucide-react';

const FONTS = [
  'Inter', 'Roboto', 'Montserrat', 'Oswald', 'Playfair Display',
  'Bebas Neue', 'Anton', 'Righteous', 'Bangers', 'Permanent Marker',
  'Pacifico', 'Raleway', 'Nunito', 'Poppins', 'DM Sans',
  'Space Grotesk', 'Syne', 'Barlow Condensed', 'Fjalla One', 'Exo 2',
];

function SectionLabel({ children }: { children: React.ReactNode }) {
  return (
    <p className="text-[10px] font-bold text-neutral-500 uppercase tracking-widest mb-2">{children}</p>
  );
}

export default function PropertiesPanel({ onDone }: { onDone?: () => void }) {
  const { selectedSegmentId, tracks, updateSegment, updateSegmentRealtime, updateAllSegments, selectSegment, videoDuration } = useEditorStore();

  if (!selectedSegmentId) return null;

  let selectedSeg: TrackSegment | null = null;
  let selectedTrack: Track | null = null;
  for (const track of tracks) {
    const seg = track.segments.find((s) => s.id === selectedSegmentId);
    if (seg) { selectedSeg = seg; selectedTrack = track; break; }
  }

  if (!selectedSeg || !selectedTrack) return null;

  const handleUpdate = (updates: Partial<TrackSegment>) => {
    if (selectedSeg.name === 'Caption' && !('text' in updates)) {
      updateAllSegments(selectedTrack.id, updates, (s) => s.name === 'Caption');
    } else {
      updateSegment(selectedTrack.id, selectedSeg.id, updates);
    }
  };

  const handleRealtimeUpdate = (updates: Partial<TrackSegment>) => {
    updateSegmentRealtime(selectedTrack.id, selectedSeg.id, updates);
  };

  const closePanel = () => {
    selectSegment(null);
    onDone?.();
  };

  if (selectedSeg.type === 'text') {
    return (
      <div className="w-full md:w-64 bg-neutral-900 border-l border-neutral-800 flex flex-col h-full flex-shrink-0 z-20 shadow-[-10px_0_30px_rgba(0,0,0,0.5)]">
        {/* Header */}
        <div className="px-4 py-3 border-b border-neutral-800 flex items-center justify-between bg-neutral-950 flex-shrink-0">
          <h2 className="text-white font-bold flex items-center gap-2 text-sm">
            <Type className="w-4 h-4 text-indigo-400" />
            Text Properties
          </h2>
          <button
            onClick={closePanel}
            className="text-neutral-400 hover:text-white px-2 py-1 rounded bg-neutral-800 hover:bg-neutral-700 text-xs font-bold transition-colors"
          >
            Done
          </button>
        </div>

        <div className="flex-1 overflow-y-auto custom-scrollbar">
          <div className="p-4 space-y-5">

            {/* Content */}
            <div>
              <SectionLabel>Content</SectionLabel>
              <textarea
                value={selectedSeg.text || ''}
                onChange={(e) => handleUpdate({ text: e.target.value })}
                className="w-full h-20 bg-black border border-neutral-800 rounded-lg p-3 text-white text-sm focus:border-indigo-500 focus:outline-none resize-none transition-colors"
                placeholder="Enter text..."
              />
            </div>

            {/* Font Family */}
            <div>
              <SectionLabel>Font Family</SectionLabel>
              <select
                value={selectedSeg.fontFamily || 'Inter'}
                onChange={(e) => handleUpdate({ fontFamily: e.target.value })}
                className="w-full bg-black border border-neutral-800 rounded-lg px-3 py-2 text-white text-sm focus:border-indigo-500 focus:outline-none"
              >
                {FONTS.map(f => <option key={f} value={f}>{f}</option>)}
              </select>
            </div>

            {/* Font Size */}
            <div>
              <div className="flex justify-between mb-1">
                <SectionLabel>Font Size</SectionLabel>
                <span className="text-xs text-neutral-400">{selectedSeg.fontSize || 48}px</span>
              </div>
              <input
                type="range" min="12" max="200"
                value={selectedSeg.fontSize || 48}
                onChange={(e) => handleRealtimeUpdate({ fontSize: parseInt(e.target.value) })}
                onPointerUp={(e) => handleUpdate({ fontSize: parseInt(e.currentTarget.value) })}
                className="w-full accent-indigo-500"
              />
            </div>

            {/* Style Buttons: Bold / Italic / Align */}
            <div>
              <SectionLabel>Style</SectionLabel>
              <div className="flex gap-2">
                <button
                  onClick={() => handleUpdate({ bold: !selectedSeg.bold })}
                  className={`flex-1 py-2 rounded-lg border text-sm font-bold transition-all flex items-center justify-center gap-1 ${selectedSeg.bold ? 'bg-indigo-600 border-indigo-500 text-white' : 'bg-black border-neutral-800 text-neutral-400 hover:text-white hover:border-neutral-600'}`}
                >
                  <Bold className="w-4 h-4" />
                </button>
                <button
                  onClick={() => handleUpdate({ italic: !selectedSeg.italic })}
                  className={`flex-1 py-2 rounded-lg border text-sm font-bold transition-all flex items-center justify-center gap-1 italic ${selectedSeg.italic ? 'bg-indigo-600 border-indigo-500 text-white' : 'bg-black border-neutral-800 text-neutral-400 hover:text-white hover:border-neutral-600'}`}
                >
                  <Italic className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* Alignment */}
            <div>
              <SectionLabel>Alignment</SectionLabel>
              <div className="flex gap-2">
                {(['left', 'center', 'right'] as const).map(align => {
                  const Icon = align === 'left' ? AlignLeft : align === 'center' ? AlignCenter : AlignRight;
                  return (
                    <button
                      key={align}
                      onClick={() => handleUpdate({ textAlign: align })}
                      className={`flex-1 py-2 rounded-lg border transition-all flex items-center justify-center ${(selectedSeg.textAlign || 'center') === align ? 'bg-indigo-600 border-indigo-500 text-white' : 'bg-black border-neutral-800 text-neutral-400 hover:text-white hover:border-neutral-600'}`}
                    >
                      <Icon className="w-4 h-4" />
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Color */}
            <div>
              <SectionLabel>Text Color</SectionLabel>
              <div className="flex gap-2 items-center">
                  <input
                    type="color"
                    value={selectedSeg.color || '#ffffff'}
                    onInput={(e) => handleRealtimeUpdate({ color: e.currentTarget.value })}
                    onChange={(e) => handleRealtimeUpdate({ color: e.target.value })}
                    onBlur={(e) => { const val = e.target.value; setTimeout(() => handleUpdate({ color: val }), 0); }}
                    className="w-12 h-10 rounded-lg border border-neutral-800 bg-transparent cursor-pointer flex-shrink-0"
                  />
                <input
                  type="text"
                  value={selectedSeg.color || '#ffffff'}
                  onChange={(e) => { if (/^#[0-9a-fA-F]{0,6}$/.test(e.target.value)) handleUpdate({ color: e.target.value }); }}
                  className="flex-1 bg-black border border-neutral-800 rounded-lg px-3 py-2 text-white text-sm font-mono focus:border-indigo-500 focus:outline-none"
                />
              </div>
            </div>

            {/* Letter Spacing */}
            <div>
              <div className="flex justify-between mb-1">
                <SectionLabel>Letter Spacing</SectionLabel>
                <span className="text-xs text-neutral-400">{selectedSeg.letterSpacing ?? 0}px</span>
              </div>
              <input
                type="range" min="-5" max="30" step="0.5"
                value={selectedSeg.letterSpacing ?? 0}
                onChange={(e) => handleRealtimeUpdate({ letterSpacing: parseFloat(e.target.value) })}
                onPointerUp={(e) => handleUpdate({ letterSpacing: parseFloat(e.currentTarget.value) })}
                className="w-full accent-indigo-500"
              />
            </div>

            {/* Line Height */}
            <div>
              <div className="flex justify-between mb-1">
                <SectionLabel>Line Height</SectionLabel>
                <span className="text-xs text-neutral-400">{(selectedSeg.lineHeight ?? 1.2).toFixed(1)}×</span>
              </div>
              <input
                type="range" min="0.8" max="3" step="0.1"
                value={selectedSeg.lineHeight ?? 1.2}
                onChange={(e) => handleRealtimeUpdate({ lineHeight: parseFloat(e.target.value) })}
                onPointerUp={(e) => handleUpdate({ lineHeight: parseFloat(e.currentTarget.value) })}
                className="w-full accent-indigo-500"
              />
            </div>

            {/* Outline */}
            <div>
              <div className="flex justify-between items-center mb-2">
                <SectionLabel>Outline</SectionLabel>
                <span className="text-xs text-neutral-400">{selectedSeg.outlineWidth ?? 0}px</span>
              </div>
              <div className="flex gap-2 items-center mb-2">
                <input
                    type="color"
                    value={selectedSeg.outlineColor || '#000000'}
                    onInput={(e) => handleRealtimeUpdate({ outlineColor: e.currentTarget.value })}
                    onChange={(e) => handleRealtimeUpdate({ outlineColor: e.target.value })}
                  onBlur={(e) => { const val = e.target.value; setTimeout(() => handleUpdate({ outlineColor: val }), 0); }}
                  className="w-10 h-8 rounded border border-neutral-800 bg-transparent cursor-pointer flex-shrink-0"
                />
                <input
                  type="range" min="0" max="10" step="0.5"
                  value={selectedSeg.outlineWidth ?? 0}
                  onChange={(e) => handleRealtimeUpdate({ outlineWidth: parseFloat(e.target.value) })}
                  onPointerUp={(e) => handleUpdate({ outlineWidth: parseFloat(e.currentTarget.value) })}
                  className="flex-1 accent-indigo-500"
                />
              </div>
            </div>

            {/* Shadow */}
            <div>
              <div className="flex justify-between items-center mb-2">
                <SectionLabel>Text Shadow</SectionLabel>
                <button
                  onClick={() => handleUpdate({ textShadow: !selectedSeg.textShadow })}
                  className={`w-10 h-5 rounded-full transition-colors relative ${selectedSeg.textShadow ? 'bg-indigo-600' : 'bg-neutral-700'}`}
                >
                  <span className={`absolute top-0.5 w-4 h-4 rounded-full bg-white transition-all shadow ${selectedSeg.textShadow ? 'left-5' : 'left-0.5'}`} />
                </button>
              </div>
              {selectedSeg.textShadow && (
                <div className="flex gap-2 items-center">
                  <input
                    type="color"
                    value={selectedSeg.shadowColor || '#000000'}
                    onInput={(e) => handleRealtimeUpdate({ shadowColor: e.currentTarget.value })}
                    onChange={(e) => handleRealtimeUpdate({ shadowColor: e.target.value })}
                    onBlur={(e) => { const val = e.target.value; setTimeout(() => handleUpdate({ shadowColor: val }), 0); }}
                    className="w-10 h-8 rounded border border-neutral-800 bg-transparent cursor-pointer flex-shrink-0"
                  />
                  <div className="flex-1">
                    <div className="flex justify-between text-[10px] text-neutral-500 mb-1"><span>Blur</span><span>{selectedSeg.shadowBlur ?? 8}px</span></div>
                    <input
                      type="range" min="0" max="40"
                      value={selectedSeg.shadowBlur ?? 8}
                      onChange={(e) => handleRealtimeUpdate({ shadowBlur: parseInt(e.target.value) })}
                      onPointerUp={(e) => handleUpdate({ shadowBlur: parseInt(e.currentTarget.value) })}
                      className="w-full accent-indigo-500"
                    />
                  </div>
                </div>
              )}
            </div>

            {/* Position */}
            <div className="border-t border-neutral-800 pt-4">
              <SectionLabel>Position</SectionLabel>

              <div className="mb-3">
                <div className="flex justify-between mb-1">
                  <span className="text-xs text-neutral-500">Horizontal (X)</span>
                  <span className="text-xs text-neutral-400">{selectedSeg.x ?? 50}%</span>
                </div>
                <input
                  type="range" min="0" max="100"
                  value={selectedSeg.x ?? 50}
                  onChange={(e) => handleRealtimeUpdate({ x: parseInt(e.target.value) })}
                  onPointerUp={(e) => handleUpdate({ x: parseInt(e.currentTarget.value) })}
                  className="w-full accent-indigo-500"
                />
              </div>

              <div>
                <div className="flex justify-between mb-1">
                  <span className="text-xs text-neutral-500">Vertical (Y)</span>
                  <span className="text-xs text-neutral-400">{selectedSeg.y ?? 80}%</span>
                </div>
                <input
                  type="range" min="0" max="100"
                  value={selectedSeg.y ?? 80}
                  onChange={(e) => handleRealtimeUpdate({ y: parseInt(e.target.value) })}
                  onPointerUp={(e) => handleUpdate({ y: parseInt(e.currentTarget.value) })}
                  className="w-full accent-indigo-500"
                />
              </div>

              {/* Position presets */}
              <div className="grid grid-cols-3 gap-1 mt-3">
                {[
                  { label: 'Top', x: 50, y: 10 },
                  { label: 'Center', x: 50, y: 50 },
                  { label: 'Bottom', x: 50, y: 85 },
                ].map(preset => (
                  <button
                    key={preset.label}
                    onClick={() => handleUpdate({ x: preset.x, y: preset.y })}
                    className="py-1.5 text-xs bg-neutral-800 hover:bg-neutral-700 text-neutral-300 rounded transition-colors"
                  >
                    {preset.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Apply to All Captions */}
            {selectedSeg.name === 'Caption' && (
              <div className="border-t border-neutral-800 pt-4">
                <button
                  onClick={(e) => {
                    const btn = e.currentTarget;
                    btn.textContent = 'Applied ✓';
                    btn.classList.add('bg-indigo-600', 'text-white');
                    setTimeout(() => {
                      btn.textContent = 'Apply Style to All Captions';
                      btn.classList.remove('bg-indigo-600', 'text-white');
                    }, 1200);
                    updateAllSegments(
                      selectedSeg.trackId,
                      {
                        fontFamily: selectedSeg.fontFamily,
                        fontSize: selectedSeg.fontSize,
                        color: selectedSeg.color,
                        bold: selectedSeg.bold,
                        italic: selectedSeg.italic,
                        textAlign: selectedSeg.textAlign,
                        letterSpacing: selectedSeg.letterSpacing,
                        lineHeight: selectedSeg.lineHeight,
                        textShadow: selectedSeg.textShadow,
                        shadowColor: selectedSeg.shadowColor,
                        shadowBlur: selectedSeg.shadowBlur,
                        outlineWidth: selectedSeg.outlineWidth,
                        outlineColor: selectedSeg.outlineColor,
                        x: selectedSeg.x,
                        y: selectedSeg.y,
                      },
                      (s) => s.name === 'Caption' && s.id !== selectedSeg.id
                    );
                  }}
                  className="w-full py-2.5 bg-indigo-600/20 hover:bg-indigo-600/30 text-indigo-400 border border-indigo-600/30 rounded-lg text-sm font-semibold transition-all"
                >
                  Apply Style to All Captions
                </button>
              </div>
            )}

            {/* Timing */}
            <div className="border-t border-neutral-800 pt-4">
              <SectionLabel>Timing</SectionLabel>
              <div className="mb-3">
                <div className="flex justify-between mb-1">
                  <span className="text-xs text-neutral-500">Duration</span>
                  <span className="text-xs text-neutral-400">{selectedSeg.duration.toFixed(1)}s</span>
                </div>
                <input
                  type="range" min="0.1" max={Math.max(10, videoDuration)} step="0.1"
                  value={selectedSeg.duration}
                  onChange={(e) => {
                    const val = parseFloat(e.target.value);
                    handleUpdate({ duration: val, end: selectedSeg.start + val });
                  }}
                  className="w-full accent-indigo-500"
                />
              </div>
              <button
                onClick={() => {
                  const vt = tracks.find((t) => t.id === 'video-1');
                  let maxEnd = 0;
                  if (vt && vt.segments.length > 0) maxEnd = Math.max(...vt.segments.map((s) => s.end));
                  const newDuration = Math.max(0.1, maxEnd - selectedSeg.start);
                  handleUpdate({ duration: newDuration, end: selectedSeg.start + newDuration });
                }}
                className="w-full py-2 bg-neutral-800 hover:bg-neutral-700 text-neutral-300 rounded-lg text-sm font-medium transition-colors flex items-center justify-center gap-2"
              >
                <Maximize className="w-4 h-4" /> Stretch to End of Video
              </button>
            </div>

          </div>
        </div>
      </div>
    );
  }

  // Non-text segments
  return (
    <div className="w-full md:w-64 bg-neutral-900 border-l border-neutral-800 flex flex-col h-full flex-shrink-0 z-20 shadow-[-10px_0_30px_rgba(0,0,0,0.5)]">
      <div className="p-4 border-b border-neutral-800 flex items-center justify-between bg-neutral-950">
        <h2 className="text-white font-bold capitalize flex items-center gap-2 text-sm">{selectedSeg.type} Properties</h2>
        <button
          onClick={closePanel}
          className="text-neutral-400 hover:text-white px-2 py-1 rounded bg-neutral-800 hover:bg-neutral-700 text-xs font-bold transition-colors"
        >
          Done
        </button>
      </div>
      <div className="flex-1 p-4 space-y-6 overflow-y-auto custom-scrollbar">

        {selectedSeg.type === 'video' && (
          <div className="space-y-4">
            <SectionLabel>Visual</SectionLabel>
            <div className="space-y-2">
              <div className="flex justify-between">
                <span className="text-xs text-neutral-500">Scale</span>
                <span className="text-xs text-neutral-400">{((selectedSeg.scale ?? 1) * 100).toFixed(0)}%</span>
              </div>
              <input type="range" min="0.1" max="3" step="0.1" value={selectedSeg.scale ?? 1}
                onChange={(e) => handleUpdate({ scale: parseFloat(e.target.value) })}
                className="w-full accent-indigo-500" />
            </div>
            <div className="space-y-2">
              <div className="flex justify-between">
                <span className="text-xs text-neutral-500">Opacity</span>
                <span className="text-xs text-neutral-400">{((selectedSeg.opacity ?? 1) * 100).toFixed(0)}%</span>
              </div>
              <input type="range" min="0" max="1" step="0.05" value={selectedSeg.opacity ?? 1}
                onChange={(e) => handleUpdate({ opacity: parseFloat(e.target.value) })}
                className="w-full accent-indigo-500" />
            </div>
            <div className="space-y-2">
              <div className="flex justify-between">
                <span className="text-xs text-neutral-500">Volume</span>
                <span className="text-xs text-neutral-400">{((selectedSeg.volume ?? 1) * 100).toFixed(0)}%</span>
              </div>
              <input type="range" min="0" max="2" step="0.1" value={selectedSeg.volume ?? 1}
                onChange={(e) => handleUpdate({ volume: parseFloat(e.target.value) })}
                className="w-full accent-indigo-500" />
            </div>
          </div>
        )}

        {selectedSeg.type === 'audio' && (
          <div className="space-y-4">
            <SectionLabel>Audio</SectionLabel>
            <div className="space-y-2">
              <div className="flex justify-between">
                <span className="text-xs text-neutral-500">Volume</span>
                <span className="text-xs text-neutral-400">{((selectedSeg.volume ?? 1) * 100).toFixed(0)}%</span>
              </div>
              <input type="range" min="0" max="2" step="0.1" value={selectedSeg.volume ?? 1}
                onChange={(e) => handleUpdate({ volume: parseFloat(e.target.value) })}
                className="w-full accent-indigo-500" />
            </div>
          </div>
        )}

        {(selectedSeg.type === 'effect' || selectedSeg.type === 'transition') && (
          <div className="flex items-center justify-center p-4 bg-neutral-900 border border-neutral-800 rounded-lg text-neutral-500 text-sm text-center">
            Properties for this {selectedSeg.type} are not available yet.
          </div>
        )}
      </div>
    </div>
  );
}
