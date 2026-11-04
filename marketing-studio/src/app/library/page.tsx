'use client';

import { useAppContext } from '@/context/AppContext';
import { useState } from 'react';
import { Status, ContentItem } from '@/types';
import { Copy, Trash2, Edit3, CheckCircle } from 'lucide-react';

export default function LibraryPage() {
  const { contentItems, editContentItem, removeContentItem, addContentItems } = useAppContext();
  const [filter, setFilter] = useState<Status | 'All'>('All');

  const filteredItems = contentItems
    .filter(item => filter === 'All' || item.status === filter)
    .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());

  const handleCopy = (item: ContentItem) => {
    const text = `Hook: ${item.hook}\n\nScript: ${item.script}\n\nCaption: ${item.caption}\n\n${item.hashtags}`;
    navigator.clipboard.writeText(text);
    alert('Copied to clipboard!');
  };

  const handleDuplicate = (item: ContentItem) => {
    addContentItems([{
      ...item,
      status: 'Draft'
    }]);
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <h1 className="text-3xl font-bold tracking-tight text-slate-900 dark:text-slate-100">
          Content Library
        </h1>
        <div className="flex gap-2">
          {['All', 'Draft', 'Approved', 'Published'].map((f) => (
            <button
              key={f}
              onClick={() => setFilter(f as Status | 'All')}
              className={`px-4 py-1.5 rounded-full text-sm font-medium transition-colors ${
                filter === f
                  ? 'bg-indigo-100 text-indigo-700 dark:bg-indigo-500/20 dark:text-indigo-300'
                  : 'bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-700'
              }`}
            >
              {f}
            </button>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
        {filteredItems.map(item => (
          <ContentCard
            key={item.id}
            item={item}
            onUpdate={(updates) => editContentItem(item.id, updates)}
            onDelete={() => removeContentItem(item.id)}
            onCopy={() => handleCopy(item)}
            onDuplicate={() => handleDuplicate(item)}
          />
        ))}
        {filteredItems.length === 0 && (
          <p className="text-slate-500 col-span-full">No content found for this filter.</p>
        )}
      </div>
    </div>
  );
}

function ContentCard({ item, onUpdate, onDelete, onCopy, onDuplicate }: { item: ContentItem, onUpdate: (updates: Partial<ContentItem>) => void, onDelete: () => void, onCopy: () => void, onDuplicate: () => void }) {
  const [isEditing, setIsEditing] = useState(false);
  const [edited, setEdited] = useState({ hook: item.hook, script: item.script, caption: item.caption });

  const statusColors = {
    Draft: 'bg-amber-100 text-amber-700 dark:bg-amber-500/20 dark:text-amber-300',
    Approved: 'bg-green-100 text-green-700 dark:bg-green-500/20 dark:text-green-300',
    Published: 'bg-purple-100 text-purple-700 dark:bg-purple-500/20 dark:text-purple-300',
  };

  const handleSave = () => {
    onUpdate(edited);
    setIsEditing(false);
  };

  return (
    <div className="bg-white dark:bg-slate-900 shadow-sm border border-slate-200 dark:border-slate-800 rounded-xl p-5 flex flex-col">
      <div className="flex justify-between items-start mb-4">
        <div>
          <span className="text-sm font-bold text-indigo-600 dark:text-indigo-400">{item.platform}</span>
          <p className="text-xs text-slate-500">{new Date(item.scheduledDate).toLocaleDateString()}</p>
        </div>
        <select
          value={item.status}
          onChange={(e) => onUpdate({ status: e.target.value as Status })}
          className={`text-xs font-medium px-2.5 py-1 rounded-full outline-none appearance-none cursor-pointer ${statusColors[item.status as Status]}`}
        >
          <option value="Draft">Draft</option>
          <option value="Approved">Approved</option>
          <option value="Published">Published</option>
        </select>
      </div>

      {isEditing ? (
        <div className="space-y-3 flex-1">
          <div>
            <label className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Hook</label>
            <textarea className="w-full text-sm p-2 border rounded dark:bg-slate-800 dark:border-slate-700" value={edited.hook} onChange={e => setEdited({...edited, hook: e.target.value})} rows={2} />
          </div>
          <div>
            <label className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Script</label>
            <textarea className="w-full text-sm p-2 border rounded dark:bg-slate-800 dark:border-slate-700" value={edited.script} onChange={e => setEdited({...edited, script: e.target.value})} rows={3} />
          </div>
          <div>
            <label className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Caption</label>
            <textarea className="w-full text-sm p-2 border rounded dark:bg-slate-800 dark:border-slate-700" value={edited.caption} onChange={e => setEdited({...edited, caption: e.target.value})} rows={3} />
          </div>
          <button onClick={handleSave} className="w-full bg-slate-900 dark:bg-slate-100 text-white dark:text-slate-900 py-1.5 rounded text-sm font-medium">Save Changes</button>
        </div>
      ) : (
        <div className="space-y-4 flex-1">
          <div>
            <label className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Hook</label>
            <p className="text-sm font-medium">{item.hook}</p>
          </div>
          <div>
            <label className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Script</label>
            <p className="text-sm text-slate-600 dark:text-slate-300">{item.script}</p>
          </div>
          <div>
            <label className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Caption</label>
            <p className="text-sm text-slate-600 dark:text-slate-300">{item.caption}</p>
          </div>
          <p className="text-xs text-indigo-500">{item.hashtags}</p>
        </div>
      )}

      <div className="flex justify-between items-center mt-6 pt-4 border-t border-slate-100 dark:border-slate-800">
        <div className="flex gap-2 text-slate-400">
          <button onClick={() => setIsEditing(!isEditing)} className="hover:text-indigo-500 transition-colors" title="Edit">
            <Edit3 className="w-4 h-4" />
          </button>
          <button onClick={onDuplicate} className="hover:text-slate-700 dark:hover:text-slate-200 transition-colors" title="Duplicate">
            <Copy className="w-4 h-4" />
          </button>
          <button onClick={onDelete} className="hover:text-red-500 transition-colors" title="Delete">
            <Trash2 className="w-4 h-4" />
          </button>
        </div>
        <button
          onClick={onCopy}
          className="flex items-center gap-1.5 text-sm font-medium text-indigo-600 hover:text-indigo-700 dark:text-indigo-400 dark:hover:text-indigo-300"
        >
          <CheckCircle className="w-4 h-4" />
          Copy for posting
        </button>
      </div>
    </div>
  );
}
