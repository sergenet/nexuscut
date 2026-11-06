"use client";
import React from "react";
import VideoEditor from "@/components/VideoEditor";
import Link from "next/link";

class ErrorBoundary extends React.Component<{children: React.ReactNode}, {hasError: boolean, error: Error | null}> {
  constructor(props: { children: React.ReactNode }) {
    super(props);
    this.state = { hasError: false, error: null };
  }
  static getDerivedStateFromError(error: Error) {
    return { hasError: true, error };
  }
  render() {
    if (this.state.hasError) {
      return (
        <div style={{ color: 'red', padding: 20 }}>
          <h2>Something went wrong.</h2>
          <pre>{this.state.error?.toString()}</pre>
          <pre>{this.state.error?.stack}</pre>
        </div>
      );
    }
    return this.props.children;
  }
}

export default function Home() {
  return (
    <main className="min-h-screen bg-black text-white p-2 xl:p-6 font-sans overflow-x-hidden">
      {/* The visible brand block below is hidden on phones in landscape, so the
          document still needs one heading that is always in the served HTML. */}
      <h1 className="sr-only">NexusCut online video editor with word-by-word captions</h1>
      <header className="flex landscape:hidden xl:flex justify-between items-center mb-3 xl:mb-8">
        <div>
          <Link href="/" className="text-2xl font-bold bg-gradient-to-r from-indigo-400 to-purple-500 bg-clip-text text-transparent hover:opacity-80 transition-opacity block w-max">
            NexusCut
          </Link>
          <p className="text-sm text-neutral-500">The hybrid AI video collaborator.</p>
        </div>
      </header>

      {/* Phones and tablets keep the action bar inside the visible viewport.
          Desktop retains its existing roomy editor height at the lg breakpoint. */}
      <section className="h-[calc(100svh-5rem)] landscape:h-[calc(100dvh-1rem)] xl:h-[calc(100vh-8rem)]">
        <ErrorBoundary>
          <VideoEditor />
        </ErrorBoundary>
      </section>
    </main>
  );
}
