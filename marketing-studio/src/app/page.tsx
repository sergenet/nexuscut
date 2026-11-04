'use client';

import { useAppContext } from '@/context/AppContext';
import { isThisWeek, parseISO } from 'date-fns';
import { CheckCircle2, FileEdit, LayoutList, PlayCircle, Send } from 'lucide-react';

export default function Dashboard() {
  const { contentItems, campaigns } = useAppContext();

  const total = contentItems.length;
  const drafts = contentItems.filter((i) => i.status === 'Draft').length;
  const approved = contentItems.filter((i) => i.status === 'Approved').length;
  const published = contentItems.filter((i) => i.status === 'Published').length;

  const upcomingThisWeek = contentItems.filter((i) => {
    if (i.status === 'Published') return false;
    return isThisWeek(parseISO(i.scheduledDate));
  }).sort((a, b) => new Date(a.scheduledDate).getTime() - new Date(b.scheduledDate).getTime());

  const platformCounts = contentItems.reduce((acc, item) => {
    acc[item.platform] = (acc[item.platform] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  return (
    <div className="space-y-6 max-w-5xl">
      <h1 className="text-3xl font-bold tracking-tight text-slate-900 dark:text-slate-100">
        Dashboard
      </h1>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <MetricCard title="Total Planned" value={total} icon={LayoutList} color="text-blue-500" />
        <MetricCard title="Drafts" value={drafts} icon={FileEdit} color="text-amber-500" />
        <MetricCard title="Approved" value={approved} icon={CheckCircle2} color="text-green-500" />
        <MetricCard title="Published" value={published} icon={Send} color="text-purple-500" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white dark:bg-slate-900 shadow-sm border border-slate-200 dark:border-slate-800 rounded-xl p-6">
          <h2 className="text-lg font-semibold mb-4">Posts by Platform</h2>
          {Object.keys(platformCounts).length === 0 ? (
            <p className="text-sm text-slate-500">No posts generated yet.</p>
          ) : (
            <div className="space-y-3">
              {Object.entries(platformCounts).map(([platform, count]) => (
                <div key={platform} className="flex justify-between items-center border-b border-slate-100 dark:border-slate-800 pb-2">
                  <span className="font-medium flex items-center gap-2">
                    <PlayCircle className="w-4 h-4 text-slate-400" />
                    {platform}
                  </span>
                  <span className="text-slate-600 dark:text-slate-400">{count} posts</span>
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="bg-white dark:bg-slate-900 shadow-sm border border-slate-200 dark:border-slate-800 rounded-xl p-6">
          <h2 className="text-lg font-semibold mb-4">Upcoming This Week</h2>
          {upcomingThisWeek.length === 0 ? (
            <p className="text-sm text-slate-500">No upcoming posts this week.</p>
          ) : (
            <div className="space-y-4">
              {upcomingThisWeek.slice(0, 5).map((post) => (
                <div key={post.id} className="flex flex-col gap-1 border-l-2 border-indigo-500 pl-3">
                  <div className="flex justify-between">
                    <span className="font-medium text-sm">{post.platform}</span>
                    <span className="text-xs text-slate-500">
                      {new Date(post.scheduledDate).toLocaleDateString()}
                    </span>
                  </div>
                  <p className="text-sm text-slate-600 dark:text-slate-300 line-clamp-1">{post.hook}</p>
                </div>
              ))}
              {upcomingThisWeek.length > 5 && (
                <p className="text-xs text-center text-slate-500 pt-2">
                  + {upcomingThisWeek.length - 5} more
                </p>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

function MetricCard({ title, value, icon: Icon, color }: { title: string, value: number, icon: any, color: string }) {
  return (
    <div className="bg-white dark:bg-slate-900 shadow-sm border border-slate-200 dark:border-slate-800 rounded-xl p-5 flex items-center gap-4">
      <div className={`p-3 rounded-lg bg-slate-50 dark:bg-slate-800 ${color}`}>
        <Icon className="w-6 h-6" />
      </div>
      <div>
        <p className="text-sm font-medium text-slate-500 dark:text-slate-400">{title}</p>
        <p className="text-2xl font-bold text-slate-900 dark:text-slate-100">{value}</p>
      </div>
    </div>
  );
}
