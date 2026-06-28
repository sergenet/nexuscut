"use client";
import React from "react";
import VideoEditor from "@/components/VideoEditor";

class ErrorBoundary extends React.Component<{children: React.ReactNode}, {hasError: boolean, error: any}> {
  constructor(props: any) {
    super(props);
    this.state = { hasError: false, error: null };
  }
  static getDerivedStateFromError(error: any) {
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
    <main className="min-h-screen bg-black text-white p-6 font-sans">
      <header className="flex justify-between items-center mb-8">
        <div>
          <a href="/" className="text-2xl font-bold bg-gradient-to-r from-indigo-400 to-purple-500 bg-clip-text text-transparent hover:opacity-80 transition-opacity block w-max">
            NexusCut
          </a>
          <p className="text-sm text-neutral-500">The hybrid AI video collaborator.</p>
        </div>
      </header>

      <section className="h-[calc(100vh-8rem)]">
        <ErrorBoundary>
          <VideoEditor />
        </ErrorBoundary>
      </section>
    </main>
  );
}
