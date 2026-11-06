import Link from 'next/link';
import Navigation from '@/components/Navigation';
import Footer from '@/components/Footer';
import { socialFor } from '@/lib/social';

export const metadata = {
  openGraph: socialFor('/contact'),
  title: 'Contact NexusCut | Support, Billing and Press',
  description:
    'How to reach NexusCut about an account, a payment, a bug in the editor, or a press or partnership enquiry.',
  alternates: { canonical: '/contact' },
};

/**
 * A real contact route.
 *
 * AdSense review looks for a way to reach the people behind a site, and the
 * only address before this page was an email buried inside the privacy policy.
 * Everything here is a mailto or a link into the existing help content, so the
 * page cannot go stale or promise a form that does not submit anywhere.
 */
export default function ContactPage() {
  return (
    <div className="min-h-screen bg-neutral-950 text-white font-sans flex flex-col">
      <Navigation />
      <main className="flex-grow pt-32 pb-24 px-6 max-w-3xl mx-auto w-full">
        <h1 className="text-4xl md:text-5xl font-black mb-6">Contact</h1>
        <p className="text-lg text-neutral-300 mb-12">
          One address reaches the people who build NexusCut. We read everything and
          reply to account and billing questions within two business days.
        </p>

        <div className="grid gap-6">
          <section className="rounded-2xl border border-neutral-800 bg-neutral-900/60 p-7">
            <h2 className="text-xl font-bold mb-2">General support</h2>
            <p className="text-neutral-400 mb-3">
              Account access, exports, editing problems, billing and refunds.
            </p>
            <a
              href="mailto:support@nexuscut.io"
              className="text-fuchsia-400 font-semibold hover:text-fuchsia-300"
            >
              support@nexuscut.io
            </a>
          </section>

          <section className="rounded-2xl border border-neutral-800 bg-neutral-900/60 p-7">
            <h2 className="text-xl font-bold mb-2">Press, partnerships and affiliate enquiries</h2>
            <p className="text-neutral-400 mb-3">
              Interviews, product access for review, co-marketing, and the affiliate
              programme.
            </p>
            <a
              href="mailto:hello@nexuscut.io"
              className="text-fuchsia-400 font-semibold hover:text-fuchsia-300"
            >
              hello@nexuscut.io
            </a>
          </section>

          <section className="rounded-2xl border border-neutral-800 bg-neutral-900/60 p-7">
            <h2 className="text-xl font-bold mb-2">Before you write</h2>
            <p className="text-neutral-400 mb-4">
              Three answers are already written down and are usually faster than email.
            </p>
            <ul className="flex flex-col gap-2 text-neutral-300">
              <li>
                <Link href="/help" className="text-fuchsia-400 hover:text-fuchsia-300">
                  Help Centre
                </Link>{' '}
                — exporting, captions, accounts and billing.
              </li>
              <li>
                <Link href="/pricing" className="text-fuchsia-400 hover:text-fuchsia-300">
                  Pricing
                </Link>{' '}
                — what each plan includes and what the free tier covers.
              </li>
              <li>
                <Link href="/refund-policy" className="text-fuchsia-400 hover:text-fuchsia-300">
                  Refund Policy
                </Link>{' '}
                — the terms for cancelling or requesting a refund.
              </li>
              <li>
                <Link href="/privacy" className="text-fuchsia-400 hover:text-fuchsia-300">
                  Privacy Policy
                </Link>{' '}
                — what we collect, and how to control cookies and advertising.
              </li>
            </ul>
          </section>

          <section className="rounded-2xl border border-neutral-800 bg-neutral-900/60 p-7">
            <h2 className="text-xl font-bold mb-2">Reporting a bug</h2>
            <p className="text-neutral-400">
              Include the browser, the page, and what you expected to happen. A screen
              recording of the editor is the fastest way for us to reproduce an export
              or timeline problem. Do not send passwords, payment details or a full
              copy of a client&apos;s footage.
            </p>
          </section>
        </div>

        <p className="mt-12 text-sm text-neutral-500">
          NexusCut is operated by Serge Shammas. Written enquiries can also be sent to
          the address above; there is no postal support desk.
        </p>
      </main>
      <Footer />
    </div>
  );
}
