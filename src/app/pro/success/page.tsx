import Link from 'next/link';
import { CheckCircle2 } from 'lucide-react';
import ConversionConfirmation from '@/components/ConversionConfirmation';

export const dynamic = 'force-dynamic';

export default async function ProSuccessPage({ searchParams }: { searchParams: Promise<{ session_id?: string }> }) {
  const sessionId = (await searchParams).session_id || '';
  return <main className="grid min-h-screen place-items-center bg-neutral-950 px-5 text-white"><div className="w-full max-w-xl rounded-3xl border border-emerald-500/30 bg-neutral-900 p-8 text-center shadow-2xl"><CheckCircle2 className="mx-auto h-16 w-16 text-emerald-400" /><h1 className="mt-5 text-3xl font-black">Checkout confirmation</h1><p className="mt-3 leading-7 text-neutral-300">We’re checking your subscription details below.</p><ConversionConfirmation sessionId={sessionId} /><Link href="/editor" className="mt-7 inline-flex rounded-xl bg-indigo-600 px-7 py-4 font-black hover:bg-indigo-500">Open the editor</Link><p className="mt-4 text-xs text-neutral-500">Manage or cancel the subscription from My Account.</p></div></main>;
}
