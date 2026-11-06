'use client';
import { useEffect, useState } from 'react';
import Link from 'next/link';
import Navigation from '@/components/Navigation';
import Footer from '@/components/Footer';

type Profile = { id: string; name: string; primaryColor: string | null; secondaryColor: string | null; fontUrl: string | null; logoUrl: string | null };
const empty = { name: '', primaryColor: '#4f46e5', secondaryColor: '#10b981', fontUrl: '', logoUrl: '' };

export default function AgencyPage() {
  const [profiles, setProfiles] = useState<Profile[]>([]);
  const [form, setForm] = useState(empty);
  const [message, setMessage] = useState('');
  const [locked, setLocked] = useState(false);

  const load = () => fetch('/api/agency/brand-profiles', { cache: 'no-store' }).then(async r => {
    const d = await r.json();
    if (!r.ok) { setLocked(true); throw new Error(d.error); }
    setProfiles(d.profiles);
  }).catch(e => setMessage(e.message));

  useEffect(() => { void load(); }, []);

  const save = async () => {
    setMessage('Saving…');
    const r = await fetch('/api/agency/brand-profiles', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(form) });
    const d = await r.json();
    setMessage(r.ok ? 'Client Brand Kit saved.' : d.error);
    if (r.ok) { setForm(empty); load(); }
  };

  const action = async (id: string, action: 'activate' | 'delete') => {
    const r = await fetch('/api/agency/brand-profiles', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ id, action }) });
    const d = await r.json();
    setMessage(r.ok ? (action === 'activate' ? 'Client Brand Kit is now active in the editor.' : 'Profile deleted.') : d.error);
    if (r.ok) load();
  };

  return (
    <div className="min-h-screen bg-neutral-950 text-white flex flex-col font-sans">
      <Navigation />

      <main className="mx-auto w-full max-w-5xl flex-grow px-5 pb-24 pt-28">
        <p className="text-sm font-black uppercase tracking-[.2em] text-amber-300">Agency workspace</p>
        <h1 className="mt-2 text-4xl font-black">Client Brand Kits</h1>
        <p className="mt-3 max-w-2xl text-neutral-400">
          Save up to five client identities and activate one before creating captions or exporting.
        </p>

        {/* Explains what the workspace does before the interactive panel, so the
            page is not a single button for anyone reading it cold. */}
        <section className="mt-10 grid gap-6 rounded-2xl border border-neutral-800 bg-neutral-900/60 p-6 md:grid-cols-2">
          <div>
            <h2 className="text-lg font-black">What a client Brand Kit holds</h2>
            <ul className="mt-3 space-y-2 text-sm leading-6 text-neutral-400">
              <li>A primary caption color and a secondary highlight color.</li>
              <li>An optional font file URL, applied to captions instead of the presets.</li>
              <li>An optional logo URL, used as a watermark at export time.</li>
            </ul>
            <p className="mt-3 text-sm leading-6 text-neutral-500">
              Activating a kit switches the editor to that client. Switching back is one click, so
              two clients in one afternoon do not mean two accounts.
            </p>
          </div>
          <div>
            <h2 className="text-lg font-black">What Agency does not include</h2>
            <ul className="mt-3 space-y-2 text-sm leading-6 text-neutral-400">
              <li>No team seats and no shared workspace: it is one login run by one person.</li>
              <li>No client-facing review links or approval flow.</li>
              <li>No separate billing per client.</li>
            </ul>
            <p className="mt-3 text-sm leading-6 text-neutral-500">
              If you need several editors in the same account at once, NexusCut is not that tool
              yet — this page would rather say so than sell it to you.
            </p>
          </div>
        </section>

        {locked ? (
          <div className="mt-10 rounded-2xl border border-amber-500/30 bg-amber-500/10 p-8">
            <h2 className="text-2xl font-black">Agency membership required</h2>
            <p className="mt-2 max-w-xl text-sm leading-6 text-amber-100/80">
              Client Brand Kits are part of the Agency plan. The editor, captions and exports work
              without it; this is the feature that adds per-client identities.
            </p>
            <Link href="/pricing#agency-tier" className="mt-5 inline-flex rounded-xl bg-amber-400 px-5 py-3 font-black text-black">
              View Agency plan
            </Link>
          </div>
        ) : (
          <>
            <div className="mt-8 grid gap-4 md:grid-cols-2">
              {profiles.map(p => (
                <article key={p.id} className="rounded-2xl border border-neutral-800 bg-neutral-900 p-5">
                  <h2 className="text-xl font-black">{p.name}</h2>
                  <div className="mt-3 flex gap-2">
                    <span className="h-8 w-8 rounded-full border border-white/20" style={{ background: p.primaryColor || '#000' }} />
                    <span className="h-8 w-8 rounded-full border border-white/20" style={{ background: p.secondaryColor || '#000' }} />
                  </div>
                  <div className="mt-5 flex gap-2">
                    <button onClick={() => action(p.id, 'activate')} className="rounded-lg bg-indigo-600 px-4 py-2 text-sm font-bold">Use in editor</button>
                    <button onClick={() => action(p.id, 'delete')} className="rounded-lg border border-rose-900 px-4 py-2 text-sm font-bold text-rose-300">Delete</button>
                  </div>
                </article>
              ))}
            </div>

            <section className="mt-8 rounded-2xl border border-neutral-800 bg-neutral-900 p-6">
              <h2 className="text-xl font-black">Add client</h2>
              <p className="mt-2 text-sm text-neutral-500">{profiles.length} of 5 client kits saved.</p>
              <div className="mt-5 grid gap-4 md:grid-cols-2">
                <input placeholder="Client name" value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} className="rounded-xl border border-neutral-700 bg-black p-3" />
                <div className="flex gap-4">
                  <input type="color" value={form.primaryColor} onChange={e => setForm({ ...form, primaryColor: e.target.value })} aria-label="Primary color" />
                  <input type="color" value={form.secondaryColor} onChange={e => setForm({ ...form, secondaryColor: e.target.value })} aria-label="Secondary color" />
                </div>
                <input placeholder="HTTPS font URL (optional)" value={form.fontUrl} onChange={e => setForm({ ...form, fontUrl: e.target.value })} className="rounded-xl border border-neutral-700 bg-black p-3" />
                <input placeholder="HTTPS logo URL (optional)" value={form.logoUrl} onChange={e => setForm({ ...form, logoUrl: e.target.value })} className="rounded-xl border border-neutral-700 bg-black p-3" />
              </div>
              <button onClick={save} disabled={profiles.length >= 5} className="mt-5 rounded-xl bg-amber-400 px-5 py-3 font-black text-black disabled:opacity-40">Save client Brand Kit</button>
            </section>
          </>
        )}

        {message && <p className="mt-5 text-sm text-emerald-300">{message}</p>}
      </main>

      <Footer />
    </div>
  );
}
