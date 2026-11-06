import Link from 'next/link';
import Navigation from '@/components/Navigation';
import Footer from '@/components/Footer';

/**
 * 404. Next.js ships a plain black "This page could not be found" screen with
 * no way back into the site, which is what a visitor got for every typo and
 * every retired route. This keeps the response a real 404 (status and
 * noindex come from Next) but gives people somewhere to go.
 */

const suggestions = [
  { href: '/editor', label: 'Open the editor', hint: 'Cut and caption a clip in the browser' },
  { href: '/tools/auto-captions', label: 'Auto captions', hint: 'How word-timed captions work' },
  { href: '/pricing', label: 'Pricing', hint: 'Free tier, Creator, Pro and Agency' },
  { href: '/blog', label: 'Blog', hint: 'Editing and retention guides' },
  { href: '/help', label: 'Help center', hint: 'Fixes for common editor problems' },
  { href: '/templates', label: 'Templates', hint: 'Caption styles and hooks' },
];

export default function NotFound() {
  return (
    <div className="min-h-screen bg-neutral-950 text-white flex flex-col font-sans">
      <Navigation />

      <main className="mx-auto w-full max-w-3xl flex-grow px-6 pb-24 pt-32">
        <p className="text-sm font-black uppercase tracking-[0.2em] text-indigo-400">404</p>
        <h1 className="mt-3 text-4xl font-black tracking-tight md:text-5xl">
          That page does not exist
        </h1>
        <p className="mt-4 text-lg leading-relaxed text-neutral-400">
          The address may have been mistyped, or the page may have been renamed. Nothing is broken
          on your account — projects and exports are exactly where you left them.
        </p>

        <h2 className="mt-12 text-lg font-bold">Try one of these</h2>
        <ul className="mt-4 grid gap-3 sm:grid-cols-2">
          {suggestions.map(({ href, label, hint }) => (
            <li key={href}>
              <Link
                href={href}
                className="block rounded-2xl border border-neutral-800 bg-neutral-900/60 p-4 transition hover:border-indigo-500/60 hover:bg-neutral-900"
              >
                <span className="font-bold text-white">{label}</span>
                <span className="mt-1 block text-sm text-neutral-400">{hint}</span>
              </Link>
            </li>
          ))}
        </ul>

        <p className="mt-10 text-sm text-neutral-500">
          Looking for something that used to be here?{' '}
          <Link href="/help" className="text-indigo-400 underline hover:text-indigo-300">
            The help center
          </Link>{' '}
          lists every current page, or email support@nexuscut.io and we will point you at it.
        </p>
      </main>

      <Footer />
    </div>
  );
}
