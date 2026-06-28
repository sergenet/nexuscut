import Link from "next/link";
import { Play, Sparkles, Languages, Smile, Video, ArrowRight, HelpCircle } from "lucide-react";

export default function LandingPage() {
  const features = [
    {
      icon: <Sparkles className="w-8 h-8 text-yellow-400" />,
      title: "AI Auto-Captions",
      description: "Generate highly accurate, viral-style captions instantly using OpenAI Whisper.",
      helpLink: "/help#captions"
    },
    {
      icon: <Languages className="w-8 h-8 text-blue-400" />,
      title: "1-Click Translate",
      description: "Translate your video's captions into 20 languages with perfect timing.",
      helpLink: "/help#translate"
    },
    {
      icon: <Smile className="w-8 h-8 text-pink-400" />,
      title: "Auto-Emojis",
      description: "Automatically add context-aware emojis to your captions to boost engagement.",
      helpLink: "/help#emojis"
    },
    {
      icon: <Video className="w-8 h-8 text-green-400" />,
      title: "AI B-Roll Generation",
      description: "Automatically insert high-quality Pexels B-Roll clips over your video based on spoken context.",
      helpLink: "/help#broll"
    },
    {
      icon: <Sparkles className="w-8 h-8 text-purple-400" />,
      title: "Magic Clip",
      description: "Let AI find the most viral hook in your video and trim it down to the best 15 seconds.",
      helpLink: "/help#magicclip"
    }
  ];

  return (
    <main className="min-h-screen bg-neutral-950 text-white font-sans overflow-x-hidden">
      {/* Header */}
      <header className="flex items-center justify-between px-6 lg:px-12 py-6">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-indigo-600 rounded-xl flex items-center justify-center shadow-[0_0_15px_rgba(79,70,229,0.5)]">
            <Play className="w-5 h-5 text-white" />
          </div>
          <span className="text-2xl font-black tracking-tight text-white">NexusCut</span>
        </div>
        <div className="flex gap-4 items-center">
          <Link href="/help" className="text-sm font-medium text-neutral-300 hover:text-white transition-colors flex items-center gap-1">
            <HelpCircle className="w-4 h-4" /> Tutorials & FAQ
          </Link>
          <Link href="/editor" className="bg-white text-black px-5 py-2.5 rounded-full text-sm font-bold hover:bg-neutral-200 transition-colors">
            Launch Editor
          </Link>
        </div>
      </header>

      {/* Hero Section */}
      <section className="relative px-6 py-20 lg:py-32 flex flex-col items-center text-center">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[400px] bg-indigo-600/20 blur-[120px] rounded-full pointer-events-none" />
        
        <h1 className="text-5xl lg:text-7xl font-black tracking-tighter mb-6 relative z-10 max-w-4xl">
          Edit Viral Shorts at <br/>
          <span className="bg-gradient-to-r from-indigo-400 via-purple-400 to-pink-400 text-transparent bg-clip-text">Lightning Speed.</span>
        </h1>
        
        <p className="text-lg lg:text-xl text-neutral-400 mb-10 max-w-2xl relative z-10">
          The ultimate AI video collaborator. Generate captions, auto-b-roll, and translate to 20 languages with a single click.
        </p>

        <Link href="/editor" className="relative z-10 bg-indigo-600 hover:bg-indigo-500 text-white px-8 py-4 rounded-full text-lg font-bold transition-all flex items-center gap-2 shadow-[0_0_30px_rgba(79,70,229,0.3)] hover:shadow-[0_0_50px_rgba(79,70,229,0.5)] hover:-translate-y-1">
          Start Creating Free <ArrowRight className="w-5 h-5" />
        </Link>
      </section>

      {/* Features Index Section */}
      <section className="px-6 py-20 bg-neutral-900/50 border-t border-neutral-800">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold mb-4">Everything You Need to Go Viral</h2>
            <p className="text-neutral-400">Master every feature in minutes with our comprehensive tutorials.</p>
          </div>
          
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {features.map((feature, idx) => (
              <div key={idx} className="bg-neutral-900 border border-neutral-800 rounded-2xl p-6 hover:border-indigo-500/50 transition-colors group relative overflow-hidden">
                <div className="absolute inset-0 bg-gradient-to-br from-indigo-500/5 to-purple-500/5 opacity-0 group-hover:opacity-100 transition-opacity" />
                <div className="mb-4 relative z-10">{feature.icon}</div>
                <h3 className="text-xl font-bold text-white mb-2 relative z-10">{feature.title}</h3>
                <p className="text-neutral-400 text-sm mb-6 relative z-10">{feature.description}</p>
                <Link href={feature.helpLink} className="inline-flex items-center gap-1 text-sm text-indigo-400 hover:text-indigo-300 font-semibold relative z-10 transition-colors">
                  Learn How <ArrowRight className="w-4 h-4" />
                </Link>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-neutral-800 py-12 text-center text-neutral-500">
        <div className="flex justify-center mb-4">
          <a href="mailto:contact@nexuscut.io" className="text-indigo-400 hover:text-indigo-300 font-semibold transition-colors">Contact Us</a>
        </div>
        <p>© 2026 NexusCut. All rights reserved.</p>
      </footer>
    </main>
  );
}
