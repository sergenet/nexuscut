import { Metadata } from 'next';
import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import { hashSessionId } from '@/lib/auth';
import Link from 'next/link';
import Stripe from 'stripe';
import {
  BarChart3,
  CreditCard,
  FileText,
  FileVideo,
  Mail,
  Package,
  ShieldCheck,
  Sparkles,
  Users,
  Trash2,
  Save,
  X,
} from 'lucide-react';
import prisma from '@/lib/prisma';
import AdminSignIn from '@/components/AdminSignIn';
import { SoroDraft } from '@/lib/soroBlog';

export const metadata: Metadata = {
  title: 'NexusCut Owner Dashboard',
  robots: { index: false, follow: false },
};

const ownerEmail = (process.env.ADMIN_EMAIL || '').trim().toLowerCase();

function getStripe() {
  const key = process.env.STRIPE_SECRET_KEY;
  return key ? new Stripe(key, { apiVersion: '2026-06-24.dahlia' }) : null;
}

function displayDate(value: Date) {
  return new Intl.DateTimeFormat('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
    hour: 'numeric',
    minute: '2-digit',
  }).format(value);
}

function money(value: number) {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
  }).format(value);
}

function getSoroArticles() {
  return prisma.soroDraft.findMany({
    orderBy: { importedAt: 'desc' },
    select: {
      id: true,
      title: true,
      slug: true,
      excerpt: true,
      contentHtml: true,
      publishedAt: true,
      importedAt: true,
      sourceUrl: true,
      status: true,
    },
  });
}

export default async function AdminPage({ searchParams }: { searchParams: Promise<{ soro?: string; detail?: string; filter?: 'all' | 'published' | 'draft' }> }) {
  const sessionId = (await cookies()).get('nexus_session_id')?.value;
  const soroParams = await searchParams;
  const soroNotice = soroParams.soro;
  const filter = (soroParams.filter || 'all') as 'all' | 'published' | 'draft';

  if (!sessionId) return <AdminSignIn />;
  if (!ownerEmail) redirect('/downloads');

  const owner = await prisma.user.findUnique({
    where: { clerkId: hashSessionId(sessionId) },
    select: { email: true },
  });

  // The site creates an anonymous browser session for first-time visitors.
  // That is not an account yet, so show the secure sign-in screen instead of
  // treating it as an unauthorized person and redirecting without explanation.
  if (!owner) return <AdminSignIn />;
  if (owner?.email?.toLowerCase() !== ownerEmail) redirect('/downloads');

  const [
    verifiedAccounts,
    proAccessAccounts,
    projects,
    purchases,
    purchaseValue,
    exportUsage,
    waitlist,
    affiliateApplications,
    foundingTesterApplications,
    recentFoundingTesterApplications,
    recentAccounts,
    recentPurchases,
    recentProjects,
    soroFeed,
    soroDrafts,
    trialConversions,
    paidConverters,
    trackedRevenue,
    recentConversions,
  ] = await Promise.all([
    prisma.user.count({ where: { email: { not: null } } }),
    prisma.user.count({ where: { isPro: true } }),
    prisma.project.count(),
    prisma.purchase.count(),
    prisma.purchase.aggregate({ _sum: { amount: true } }),
    prisma.user.aggregate({ _sum: { exportCount: true } }),
    prisma.waitlistEntry.count(),
    prisma.affiliateApplication.count({ where: { status: 'pending' } }),
    prisma.foundingTesterApplication.count(),
    prisma.foundingTesterApplication.findMany({
      take: 20,
      orderBy: { createdAt: 'desc' },
    }),
    prisma.user.findMany({
      take: 10,
      orderBy: { createdAt: 'desc' },
      select: { id: true, email: true, isPro: true, planTier: true, exportCount: true, createdAt: true },
    }),
    prisma.purchase.findMany({
      take: 10,
      orderBy: { createdAt: 'desc' },
      include: { user: { select: { email: true } } },
    }),
    prisma.project.findMany({
      take: 10,
      orderBy: { updatedAt: 'desc' },
      select: { id: true, name: true, updatedAt: true, user: { select: { email: true } } },
    }),
    prisma.soroFeedConfig.findUnique({ where: { id: 'primary' }, select: { updatedAt: true } }),
    getSoroArticles(),
    prisma.conversionEvent.count({ where: { eventName: 'StartTrial' } }),
    prisma.conversionEvent.findMany({ where: { eventName: 'Subscribe', userId: { not: null } }, distinct: ['userId'], select: { userId: true } }),
    prisma.conversionEvent.aggregate({ where: { eventName: { in: ['Subscribe', 'Refund'] }, currency: 'USD' }, _sum: { value: true } }),
    prisma.conversionEvent.findMany({
      take: 20,
      orderBy: { createdAt: 'desc' },
      include: { user: { select: { email: true } } },
    }),
  ]);

  const stripe = getStripe();
  const activeSubscriptions = stripe
    ? await stripe.subscriptions.list({ status: 'active', limit: 100, expand: ['data.customer'] })
    : { data: [] };
  const conversionRate = verifiedAccounts === 0
    ? '0%'
    : `${((activeSubscriptions.data.length / verifiedAccounts) * 100).toFixed(1)}%`;
  const trialToPaidRate = trialConversions === 0 ? '0%' : `${((paidConverters.length / trialConversions) * 100).toFixed(1)}%`;

  const cards = [
    { label: 'Active subscribers', value: activeSubscriptions.data.length.toString(), detail: 'Live paid subscriptions in Stripe', icon: CreditCard },
    { label: 'Pro access accounts', value: proAccessAccounts.toString(), detail: 'Includes manually granted or legacy access', icon: ShieldCheck },
    { label: 'Verified accounts', value: verifiedAccounts.toString(), detail: 'Customers who signed in with email', icon: Users },
    { label: 'Subscriber conversion', value: conversionRate, detail: 'Active subscribers ÷ verified accounts', icon: BarChart3 },
    { label: 'Exports used', value: (exportUsage._sum.exportCount || 0).toString(), detail: 'Across all accounts', icon: FileVideo },
    { label: 'Marketplace sales', value: money(purchaseValue._sum.amount || 0), detail: `${purchases} completed purchases`, icon: Package },
    { label: 'Saved projects', value: projects.toString(), detail: 'Projects saved in NexusCut', icon: BarChart3 },
    { label: 'Growth leads', value: waitlist.toString(), detail: `${affiliateApplications} pending affiliate applications`, icon: Mail },
    { label: 'Founding tester applications', value: foundingTesterApplications.toString(), detail: 'Completed applications from the 7-day challenge', icon: Users },
    { label: 'Tracked Pro trials', value: trialConversions.toString(), detail: 'Verified Stripe trial checkouts', icon: Sparkles },
    { label: 'Trial to paid', value: trialToPaidRate, detail: `${paidConverters.length} distinct converted customer(s)`, icon: BarChart3 },
    { label: 'Tracked subscription revenue', value: money(trackedRevenue._sum.value || 0), detail: 'Tracked USD invoices minus successful refunds; before fees', icon: CreditCard },
  ];

  return (
    <div className="min-h-screen bg-[#080808] text-white selection:bg-[#39ff14] selection:text-black">
      <header className="border-b border-zinc-800 bg-black/80 backdrop-blur">
        <div className="mx-auto flex max-w-7xl items-center justify-between gap-4 px-5 py-4 sm:px-8">
          <div>
            <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-[0.22em] text-[#39ff14]">
              <ShieldCheck className="h-4 w-4" /> Private owner area
            </div>
            <h1 className="mt-1 text-2xl font-black tracking-tight sm:text-3xl">NexusCut Dashboard</h1>
          </div>
          <Link href="/" className="border border-zinc-700 px-4 py-2 text-sm font-bold text-zinc-200 transition hover:border-[#39ff14] hover:text-[#39ff14]">
            View website
          </Link>
        </div>
      </header>

      <main className="mx-auto max-w-7xl px-5 py-8 sm:px-8">
        <div className="mb-8 flex flex-wrap items-end justify-between gap-3">
          <div>
            <h2 className="text-xl font-bold">Business at a glance</h2>
            <p className="mt-1 text-sm text-zinc-400">Live data from the NexusCut application database.</p>
          </div>
          <div className="flex items-center gap-2 text-sm text-zinc-400"><Sparkles className="h-4 w-4 text-[#39ff14]" /> Signed in as owner</div>
        </div>

        <section className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {cards.map(({ label, value, detail, icon: Icon }) => (
            <article key={label} className="border border-zinc-800 bg-zinc-950 p-5 shadow-[0_0_30px_rgba(57,255,20,0.03)]">
              <div className="flex items-start justify-between gap-3">
                <p className="text-sm font-semibold uppercase tracking-wider text-zinc-400">{label}</p>
                <Icon className="h-5 w-5 text-[#39ff14]" />
              </div>
              <p className="mt-4 text-3xl font-black tracking-tight">{value}</p>
              <p className="mt-2 text-sm text-zinc-500">{detail}</p>
            </article>
          ))}
        </section>

        <section className="mt-8 border border-zinc-800 bg-zinc-950 p-5 shadow-[0_0_30px_rgba(57,255,20,0.03)]">
          <div className="flex flex-wrap items-start justify-between gap-4">
            <div>
              <div className="flex items-center gap-2 text-sm font-bold uppercase tracking-wider text-[#39ff14]"><FileText className="h-4 w-4" /> Soro draft review</div>
              <h2 className="mt-2 text-xl font-bold">Private RSS importer</h2>
              <p className="mt-1 max-w-2xl text-sm text-zinc-400">Imports Soro articles for owner review only. This tool has no public publishing or social-sharing action.</p>
            </div>
            {soroFeed && <form action="/api/admin/soro/import" method="post"><button className="rounded-lg bg-[#39ff14] px-4 py-2.5 text-sm font-black text-black transition hover:bg-[#83ff58]">Import latest drafts</button></form>}
          </div>

          {soroNotice && <p className={`mt-4 rounded-lg border px-3 py-2 text-sm ${soroNotice === 'import-failed' || soroNotice === 'invalid-feed' ? 'border-rose-500/40 bg-rose-500/10 text-rose-200' : 'border-[#39ff14]/30 bg-[#39ff14]/10 text-[#b8ffa7]'}`}>
            {soroNotice === 'feed-saved' && 'Private feed configured.'}
            {soroNotice?.startsWith('imported-') && `Imported ${soroNotice.replace('imported-', '')} Soro draft(s). Nothing was published.`}
            {soroNotice === 'missing-feed' && 'Add a private Soro RSS feed before importing.'}
            {soroNotice === 'invalid-feed' && 'That does not look like a valid Soro RSS feed URL.'}
            {soroNotice === 'import-failed' && `The RSS import failed${soroParams.detail ? `: ${soroParams.detail}` : ''}. The feed remains private and no content was published.`}
          </p>}

          {!soroFeed ? (
            <form action="/api/admin/soro/config" method="post" className="mt-5 flex max-w-3xl flex-col gap-3 sm:flex-row">
              <input name="feedUrl" type="url" required placeholder="Paste the private Soro RSS feed URL" className="min-w-0 flex-1 rounded-lg border border-zinc-700 bg-black px-3 py-2.5 text-sm text-white outline-none focus:border-[#39ff14]" />
              <button className="rounded-lg border border-[#39ff14]/50 px-4 py-2.5 text-sm font-bold text-[#39ff14] transition hover:bg-[#39ff14]/10">Save private feed</button>
            </form>
          ) : (
            <p className="mt-4 text-xs text-zinc-500">Private feed configured. The feed address is never displayed after saving.</p>
          )}

          {soroDrafts.length > 0 && (
            <div className="mt-5 grid gap-3 md:grid-cols-2">
              {soroDrafts.map((draft) => (
                <article key={draft.id} className="rounded-lg border border-zinc-800 bg-black p-4">
                  <div className="flex flex-wrap items-start justify-between gap-3">
                    <h3 className="font-bold text-zinc-100 truncate" title={draft.title}>{draft.title}</h3>
                    <div className="flex shrink-0 items-center gap-2">
                      <span className={`rounded bg-amber-400/10 px-2 py-1 text-[10px] font-bold uppercase tracking-wider ${draft.status === 'published' ? 'text-[#39ff14]' : 'text-amber-300'}`}>{draft.status}</span>
                      <form action="/api/admin/soro/new-status" method="post" className="flex shrink-0 items-center gap-1 rounded-md p-1 text-zinc-400 transition hover:bg-zinc-800/50">
                        <input type="hidden" name="id" value={draft.id} />
                        <select name="status" className="rounded border border-zinc-700 bg-black px-2 py-1 text-xs text-white outline-none focus:border-[#39ff14]">
                          <option value="published">Public</option>
                          <option value="draft">Draft</option>
                          <option value="archived">Archive</option>
                        </select>
                        <button type="submit" className="rounded bg-[#39ff14]/10 px-2 py-1 text-[10px] font-bold text-[#39ff14] transition hover:bg-[#39ff14]/20">Save</button>
                      </form>
                      <form action="/api/admin/soro/new-status" method="post">
                        <input type="hidden" name="id" value={draft.id} />
                        <input type="hidden" name="status" value="archived" />
                        <button type="submit" className="rounded bg-zinc-800/60 px-2 py-1 text-[10px] font-bold text-zinc-400 transition hover:bg-zinc-700/40"><X className="h-3 w-3" /></button>
                      </form>
                    </div>
                  </div>
                  {draft.excerpt && <p className="mt-2 line-clamp-3 text-sm leading-6 text-zinc-400">{draft.excerpt}</p>}
                  <p className="mt-3 text-xs text-zinc-600">Imported {displayDate(draft.importedAt)} · Not public</p>
                </article>
              ))}
            </div>
          )}
        </section>
      </main>
    </div>
  );
}
