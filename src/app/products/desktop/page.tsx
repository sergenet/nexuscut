"use client";
import React, { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { Download, Zap, Layers, MonitorPlay, Home } from "lucide-react";
import WaitlistModal from "@/components/WaitlistModal";

export default function DesktopProductPage() {
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
          NexusCut <span className="text-indigo-500">Desktop</span> Preview
        </h1>
        <p className="text-xl text-neutral-400 mb-10 max-w-2xl mx-auto">
          The native desktop application is in development. The image below is a concept mockup; current editing is available in the browser editor.
        </p>
        <div className="flex items-center justify-center gap-4">
          <button
            onClick={() => openWaitlist("NexusCut Desktop for Windows")}
            className="flex items-center gap-2 bg-indigo-600 hover:bg-indigo-500 text-white font-bold px-8 py-4 rounded-full transition-all shadow-lg shadow-indigo-500/20 hover:scale-105"
          >
            <Download className="w-5 h-5" /> Join Windows Beta
          </button>
          <button
            onClick={() => openWaitlist("NexusCut Desktop for Mac")}
            className="flex items-center gap-2 bg-neutral-800 hover:bg-neutral-700 text-white font-bold px-8 py-4 rounded-full transition-all"
          >
            Join Mac Beta
          </button>
        </div>
      </div>

      {/* Mockup Showcase */}
      <div className="px-6 max-w-6xl mx-auto mb-32 relative">
        <div className="absolute inset-0 bg-indigo-500/20 blur-[100px] rounded-full" />
        <div className="relative rounded-2xl overflow-hidden border border-neutral-800 shadow-2xl shadow-black/50 aspect-video">
          <Image
            src="/assets/desktop_mockup.png"
            alt="Concept mockup of the planned NexusCut Desktop interface"
            fill
            className="object-cover"
          />
        </div>
      </div>

      {/* Features Grid */}
      <div className="px-6 max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-3 gap-8">
        <FeatureCard
          icon={<Zap />}
          title="Planned native rendering"
          desc="GPU-assisted native rendering is under evaluation; 4K and 8K support are not currently promised."
        />
        <FeatureCard
          icon={<Layers />}
          title="Planned expanded timeline"
          desc="The desktop roadmap includes more flexible video and audio tracks than the current browser editor."
        />
        <FeatureCard
          icon={<MonitorPlay />}
          title="Planned workspace options"
          desc="Detachable panels and multi-monitor workflows are design goals, not released features."
        />
      </div>

      {/* Below the fold: what actually exists today, and what a waitlist signup
          does and does not commit you to. Without this the page was 90 words
          that promised a product nobody can install. */}
      <section className="px-6 max-w-3xl mx-auto mt-24">
        <h2 className="text-2xl font-bold text-white mb-4">What works today, in the browser</h2>
        <p className="text-neutral-400 leading-relaxed">
          Nothing on this page needs to be installed. Open the{" "}
          <Link href="/editor" className="text-indigo-400 underline hover:text-indigo-300">
            browser editor
          </Link>{" "}
          and the same core workflow is available: import clips to a multitrack timeline, split and
          trim, generate auto-captions with word-level timing, restyle them, and export a finished
          MP4 rendered on the server rather than on your machine.
        </p>
        <p className="mt-4 text-neutral-400 leading-relaxed">
          For short vertical clips — a talking-head take, a product demo, a clip cut from a longer
          recording — that covers the job. The desktop app is aimed at the work the browser is worse
          at: long timelines with many layers, repeated exports of the same project, and editing
          while other applications are open.
        </p>

        <h2 className="text-2xl font-bold text-white mt-12 mb-4">What the beta list commits you to</h2>
        <p className="text-neutral-400 leading-relaxed">
          Nothing beyond an email when a build exists. There is no date announced here, no payment
          taken, and no obligation to install anything. If the desktop app never ships, the browser
          editor keeps working exactly as it does now.
        </p>

        <h2 className="text-2xl font-bold text-white mt-12 mb-4">Common questions</h2>
        <dl className="divide-y divide-neutral-800 rounded-2xl border border-neutral-800">
          <div className="p-6">
            <dt className="font-bold text-white">Can I download NexusCut Desktop now?</dt>
            <dd className="mt-2 text-neutral-400 leading-relaxed">
              No. There is no installer for Windows or Mac. The buttons above add you to a list for
              a future beta; they do not start a download.
            </dd>
          </div>
          <div className="p-6">
            <dt className="font-bold text-white">Will my browser projects open in the desktop app?</dt>
            <dd className="mt-2 text-neutral-400 leading-relaxed">
              That is the intent, but it is not built yet, so we are not promising it. Assume your
              browser projects stay in the browser until a desktop build exists and says otherwise.
            </dd>
          </div>
          <div className="p-6">
            <dt className="font-bold text-white">Does it cost anything to join?</dt>
            <dd className="mt-2 text-neutral-400 leading-relaxed">
              No. Beta pricing has not been decided, and joining the list does not lock in a price
              or a plan.
            </dd>
          </div>
          <div className="p-6">
            <dt className="font-bold text-white">Which platform comes first?</dt>
            <dd className="mt-2 text-neutral-400 leading-relaxed">
              Undecided. Both Windows and Mac are listed so the waitlist shows which one people
              actually want.
            </dd>
          </div>
        </dl>
      </section>
    </div>
  );
}

function FeatureCard({ icon, title, desc }: { icon: React.ReactNode, title: string, desc: string }) {
  return (
    <div className="p-8 rounded-3xl bg-neutral-900 border border-neutral-800 hover:border-indigo-500/50 transition-colors">
      <div className="w-14 h-14 bg-indigo-500/10 rounded-2xl flex items-center justify-center text-indigo-400 mb-6">
        {React.cloneElement(icon as React.ReactElement<{ className?: string }>, { className: "w-7 h-7" })}
      </div>
      <h3 className="text-xl font-bold text-white mb-3">{title}</h3>
      <p className="text-neutral-400 leading-relaxed">{desc}</p>
    </div>
  );
}
