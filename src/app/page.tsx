import Link from "next/link";
import { ArrowRight, Sparkles } from "lucide-react";

export default function Home() {
  return (
    <div className="flex min-h-[100dvh] flex-col items-center justify-center bg-black text-white relative overflow-hidden">
      {/* Background glow effects */}
      <div className="absolute top-1/4 left-1/4 h-96 w-96 rounded-full bg-blue-600/20 blur-[120px] pointer-events-none" />
      <div className="absolute bottom-1/4 right-1/4 h-96 w-96 rounded-full bg-purple-600/20 blur-[120px] pointer-events-none" />

      <main className="z-10 flex flex-col items-center justify-center text-center px-4 sm:px-6 lg:px-8 max-w-5xl mx-auto space-y-8 animate-in fade-in duration-1000">
        
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/5 border border-white/10 text-sm font-medium text-zinc-300">
          <Sparkles className="w-4 h-4 text-blue-400" />
          <span>Introducing Notagia 0.1</span>
        </div>

        <h1 className="text-5xl sm:text-7xl font-bold tracking-tight text-transparent bg-clip-text bg-gradient-to-br from-white via-white/90 to-zinc-500 pb-2">
          Think boldly.<br /> Organize intelligently.
        </h1>
        
        <p className="max-w-2xl text-lg sm:text-xl text-zinc-400 leading-relaxed">
          Welcome to the new standard for intelligent note-taking and knowledge management. Start building your workspace without limits.
        </p>
        
        <div className="flex flex-col sm:flex-row items-center gap-4 pt-4">
          <Link 
            href="/login"
            className="group relative inline-flex h-12 items-center justify-center overflow-hidden rounded-full bg-white px-8 font-medium text-black transition-all duration-300 hover:scale-105 hover:bg-zinc-200"
          >
            <span>Get Started</span>
            <ArrowRight className="ml-2 h-4 w-4 transition-transform group-hover:translate-x-1" />
          </Link>
          <Link 
            href="/docs" 
            className="inline-flex h-12 items-center justify-center rounded-full border border-zinc-800 bg-transparent px-8 font-medium text-white transition-colors hover:bg-zinc-900"
          >
            Read Documentation
          </Link>
        </div>
      </main>
    </div>
  );
}
