"use client";
import React, { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { PlayCircle, Smartphone, Wand2, Home } from "lucide-react";
import WaitlistModal from "@/components/WaitlistModal";

export default function MobileProductPage() {
  const [isWaitlistOpen, setIsWaitlistOpen] = useState(false);
  const [waitlistProduct, setWaitlistProduct] = useState("");

  const openWaitlist = (product: string) => {
    setWaitlistProduct(product);
    setIsWaitlistOpen(true);
  };

  return (
    <div className="min-h-screen bg-neutral-950 pb-24 relative">
      <Link href="/" className="absolute top-6 left-6 p-3 bg-neutral-900 hover:bg-neutral-800 rounded-full transition-colors z-10">
        <Home className="w-6 h-6 text-white" />
      </Link>

      <WaitlistModal
        isOpen={isWaitlistOpen}
        onClose={() => setIsWaitlistOpen(false)}
        productName={waitlistProduct}
      />
      {/* Hero Section */}
      <div className="pt-32 pb-20 px-6 text-center max-w-5xl mx-auto">
        <h1 className="text-5xl md:text-7xl font-black tracking-tight text-white mb-6">
          NexusCut <span className="text-rose-500">Mobile</span> Preview
        </h1>
        <p className="text-xl text-neutral-400 mb-10 max-w-2xl mx-auto">
          The mobile app is in development and is not available for purchase or production use. Join the platform waitlist for release updates.
        </p>
        <div className="flex items-center justify-center gap-4">
          <button
            onClick={() => openWaitlist("NexusCut Mobile for iOS")}
            className="flex items-center gap-2 bg-rose-600 hover:bg-rose-500 text-white font-bold px-8 py-4 rounded-full transition-all shadow-lg shadow-rose-500/20 hover:scale-105"
          >
            <Smartphone className="w-5 h-5" /> Join iOS Waitlist
          </button>
          <button
            onClick={() => openWaitlist("NexusCut Mobile for Android")}
            className="flex items-center gap-2 bg-neutral-800 hover:bg-neutral-700 text-white font-bold px-8 py-4 rounded-full transition-all"
          >
            Join Android Waitlist
          </button>
        </div>
      </div>

      {/* Concept mockup, not a released product */}
      <div className="px-6 max-w-sm mx-auto mb-32 relative">
        <div className="absolute inset-0 bg-rose-500/20 blur-[80px] rounded-full" />
        <div className="relative rounded-[3rem] overflow-hidden border-4 border-neutral-800 shadow-2xl shadow-black/50 aspect-[9/19]">
          <Image
            src="/assets/mobile_mockup.png"
            alt="Concept mockup of the planned NexusCut Mobile interface"
            fill
            className="object-cover"
          />
        </div>
      </div>

      {/* Features Grid */}
      <div className="px-6 max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-3 gap-8">
        <FeatureCard
          icon={<PlayCircle />}
          title="Planned social formats"
          desc="The roadmap includes vertical exports for TikTok, Instagram Reels, and YouTube Shorts."
        />
        <FeatureCard
          icon={<Smartphone />}
          title="Prototype timeline"
          desc="A touch-oriented vertical timeline is being prototyped and is not yet a released feature."
        />
        <FeatureCard
          icon={<Wand2 />}
          title="Templates on the roadmap"
          desc="Template-assisted mobile editing is planned; no template quantity or release date is promised."
        />
      </div>

      {/* What is usable from a phone today, so this page answers the question it
          is actually asked: "can I edit on my phone right now?" */}
      <section className="px-6 max-w-3xl mx-auto mt-24">
        <h2 className="text-2xl font-bold text-white mb-4">Can I edit on a phone today?</h2>
        <p className="text-neutral-400 leading-relaxed">
          Yes, through the browser. The{" "}
          <Link href="/editor" className="text-indigo-400 underline hover:text-indigo-300">
            web editor
          </Link>{" "}
          is responsive and runs on a modern mobile browser, so you can trim a clip and caption it
          without installing anything. The export itself happens on the server, which is what makes
          that practical on a phone: the handset is not rendering the video.
        </p>
        <p className="mt-4 text-neutral-400 leading-relaxed">
          What a phone browser does not give you is a native timeline. Dragging clips with a finger,
          scrubbing frame by frame, and switching between apps mid-edit are all worse in a browser
          tab than in an app built for touch. That gap is the only reason this page exists.
        </p>

        <h2 className="text-2xl font-bold text-white mt-12 mb-4">Why the waitlist instead of a release date</h2>
        <p className="text-neutral-400 leading-relaxed">
          A half-finished editor on the App Store is worse than no app. The list exists so an email
          goes out when a build is genuinely usable, and so the platform with more signups is built
          first. Nothing is charged to join, and leaving the list is a one-click unsubscribe.
        </p>

        <h2 className="text-2xl font-bold text-white mt-12 mb-4">Common questions</h2>
        <dl className="divide-y divide-neutral-800 rounded-2xl border border-neutral-800">
          <div className="p-6">
            <dt className="font-bold text-white">Is NexusCut available on the App Store or Play Store?</dt>
            <dd className="mt-2 text-neutral-400 leading-relaxed">
              No. There is no released mobile app. Any listing using the NexusCut name that offers
              one is not ours.
            </dd>
          </div>
          <div className="p-6">
            <dt className="font-bold text-white">Will the mobile app be a separate subscription?</dt>
            <dd className="mt-2 text-neutral-400 leading-relaxed">
              Undecided, and nothing is promised here. The browser editor and its plans are
              unaffected either way.
            </dd>
          </div>
          <div className="p-6">
            <dt className="font-bold text-white">Can I record on my phone and edit on a laptop?</dt>
            <dd className="mt-2 text-neutral-400 leading-relaxed">
              Yes. Record with the phone camera, then upload the file in the browser editor on
              whichever device you prefer. Exports download as ordinary MP4 files.
            </dd>
          </div>
          <div className="p-6">
            <dt className="font-bold text-white">Does the free tier work on mobile browsers?</dt>
            <dd className="mt-2 text-neutral-400 leading-relaxed">
              The free tier is the same account and the same allowance regardless of device. The
              limits are on exports, not on where you edit.
            </dd>
          </div>
        </dl>
      </section>
    </div>
  );
}

function FeatureCard({ icon, title, desc }: { icon: React.ReactNode, title: string, desc: string }) {
  return (
    <div className="p-8 rounded-3xl bg-neutral-900 border border-neutral-800 hover:border-rose-500/50 transition-colors">
      <div className="w-14 h-14 bg-rose-500/10 rounded-2xl flex items-center justify-center text-rose-400 mb-6">
        {React.cloneElement(icon as React.ReactElement<{ className?: string }>, { className: "w-7 h-7" })}
      </div>
      <h3 className="text-xl font-bold text-white mb-3">{title}</h3>
      <p className="text-neutral-400 leading-relaxed">{desc}</p>
    </div>
  );
}
