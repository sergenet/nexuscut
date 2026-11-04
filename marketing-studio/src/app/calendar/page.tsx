'use client';

import { useAppContext } from '@/context/AppContext';
import { Download } from 'lucide-react';
import { format, startOfMonth, endOfMonth, eachDayOfInterval, isSameDay } from 'date-fns';
import { useState } from 'react';

export default function CalendarPage() {
  const { contentItems } = useAppContext();
  const [currentDate] = useState(new Date());

  const monthStart = startOfMonth(currentDate);
  const monthEnd = endOfMonth(currentDate);
  const daysInMonth = eachDayOfInterval({ start: monthStart, end: monthEnd });

  const exportCSV = () => {
    if (contentItems.length === 0) return alert('No content to export');

    const headers = ['Platform', 'Date', 'Status', 'Hook', 'Script', 'Caption', 'Hashtags', 'CTA'];
    const rows = contentItems.map(item => [
      item.platform,
      format(new Date(item.scheduledDate), 'yyyy-MM-dd'),
      item.status,
      `"${item.hook.replace(/"/g, '""')}"`,
      `"${item.script.replace(/"/g, '""')}"`,
      `"${item.caption.replace(/"/g, '""')}"`,
      `"${item.hashtags.replace(/"/g, '""')}"`,
      `"${item.cta.replace(/"/g, '""')}"`
    ]);

    const csvContent = [headers.join(','), ...rows.map(e => e.join(','))].join('\n');
    
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement("a");
    const url = URL.createObjectURL(blob);
    link.setAttribute("href", url);
    link.setAttribute("download", `marketing_calendar_${format(new Date(), 'yyyy-MM-dd')}.csv`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold tracking-tight text-slate-900 dark:text-slate-100">
          Calendar
        </h1>
        <button
          onClick={exportCSV}
          className="flex items-center gap-2 bg-slate-900 hover:bg-slate-800 dark:bg-white dark:text-slate-900 dark:hover:bg-slate-100 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors"
        >
          <Download className="w-4 h-4" />
          Export CSV
        </button>
      </div>

      <div className="bg-white dark:bg-slate-900 shadow-sm border border-slate-200 dark:border-slate-800 rounded-xl overflow-hidden">
        <div className="px-6 py-4 border-b border-slate-200 dark:border-slate-800 flex justify-between items-center">
          <h2 className="text-lg font-bold">{format(currentDate, 'MMMM yyyy')}</h2>
        </div>
        <div className="grid grid-cols-7 border-b border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/50">
          {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(day => (
            <div key={day} className="py-2 text-center text-xs font-semibold text-slate-500 uppercase tracking-wider">
              {day}
            </div>
          ))}
        </div>
        <div className="grid grid-cols-7 auto-rows-[120px]">
          {Array.from({ length: monthStart.getDay() }).map((_, i) => (
            <div key={`empty-${i}`} className="border-b border-r border-slate-100 dark:border-slate-800/50 bg-slate-50/50 dark:bg-slate-900/50" />
          ))}
          
          {daysInMonth.map((day) => {
            const dayItems = contentItems.filter(item => isSameDay(new Date(item.scheduledDate), day));
            
            return (
              <div key={day.toISOString()} className="border-b border-r border-slate-100 dark:border-slate-800/50 p-2 overflow-y-auto">
                <span className={`text-sm font-medium ${isSameDay(day, new Date()) ? 'bg-indigo-600 text-white w-6 h-6 flex items-center justify-center rounded-full' : 'text-slate-500'}`}>
                  {format(day, 'd')}
                </span>
                <div className="mt-2 space-y-1">
                  {dayItems.map(item => (
                    <div key={item.id} className="text-[10px] leading-tight px-1.5 py-1 rounded bg-indigo-50 text-indigo-700 dark:bg-indigo-500/20 dark:text-indigo-300 truncate">
                      {item.platform} - {item.status}
                    </div>
                  ))}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
