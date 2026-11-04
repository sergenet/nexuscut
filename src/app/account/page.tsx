import Navigation from '@/components/Navigation';
import Footer from '@/components/Footer';
import AccountActions from '@/components/AccountActions';
import AccountLogin from '@/components/AccountLogin';
import PasswordSetupForm from '@/components/PasswordSetupForm';
import { getVerifiedUser } from '@/lib/auth';
import { redirect } from 'next/navigation';

export const dynamic = 'force-dynamic';

export const metadata = {
  title: 'My Account - NexusCut',
  description: 'View your NexusCut membership and manage billing.',
  robots: { index: false, follow: false },
};

export default async function AccountPage({ searchParams }: { searchParams: Promise<{ setPassword?: string; returnTo?: string }> }) {
  const user = await getVerifiedUser();
  const params = await searchParams;
  const requestedPasswordSetup = params.setPassword === '1';
  const returnTo = params.returnTo?.startsWith('/') && !params.returnTo.startsWith('//') ? params.returnTo : '/account';
  if (user && returnTo.startsWith('/api/stripe/checkout?')) redirect(returnTo);

  return (
    <div className="min-h-screen bg-neutral-950 text-white">
      <Navigation />
      <main className="mx-auto min-h-[75vh] max-w-3xl px-5 pb-24 pt-28">
        <h1 className="text-4xl font-black tracking-tight">My account</h1>
        {!user ? (
          <div className="mt-8 rounded-2xl border border-neutral-800 bg-neutral-900 p-7">
            <h2 className="text-xl font-bold">You are not signed in</h2>
            <p className="mt-2 text-neutral-400">Enter your NexusCut email and password. Existing customers who have not created a password can verify their email once below.</p>
            <AccountLogin returnTo={returnTo} />
          </div>
        ) : (
          <div className="mt-8 overflow-hidden rounded-2xl border border-neutral-800 bg-neutral-900">
            {(requestedPasswordSetup || !user.passwordHash) && <PasswordSetupForm required={!user.passwordHash} />}
            <div className="border-b border-neutral-800 p-7">
              <p className="text-sm font-bold uppercase tracking-wider text-neutral-500">Signed in as</p>
              <p className="mt-2 break-all text-lg font-semibold">{user.email}</p>
            </div>
            <div className="p-7">
              <p className="text-sm font-bold uppercase tracking-wider text-neutral-500">Current membership</p>
              <div className="mt-3 flex flex-wrap items-center gap-3">
                <span className="rounded-full border border-indigo-400/30 bg-indigo-500/15 px-4 py-2 text-xl font-black capitalize text-indigo-200">{user.isPro ? user.planTier : 'Free'}</span>
                <span className="text-sm text-neutral-400">{user.planTier === 'agency' ? 'Includes all Pro tools and five client Brand Kits.' : user.planTier === 'pro' ? 'Includes Nexus ScriptCut and all Pro benefits.' : user.planTier === 'creator' ? 'Includes Creator benefits and unlimited 1080p exports.' : 'Includes the monthly free export allowance.'}</span>
              </div>
              <AccountActions hasBillingAccount={Boolean(user.stripeCustomerId)} />
            </div>
          </div>
        )}
      </main>
      <Footer />
    </div>
  );
}
