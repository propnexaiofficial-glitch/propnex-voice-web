import { Rocket, Sparkles } from "lucide-react";

interface ComingSoonProps {
  title: string;
  description: string;
}

export function ComingSoon({ title, description }: ComingSoonProps) {
  return (
    <div className="flex h-[80vh] w-full flex-col items-center justify-center p-8">
      <div className="relative flex flex-col items-center justify-center space-y-6 rounded-3xl border border-white/10 bg-white/5 px-12 py-16 text-center backdrop-blur-xl transition-all hover:bg-white/10">
        
        {/* Glow effect behind the icon */}
        <div className="absolute -top-10 left-1/2 -translate-x-1/2 opacity-20 blur-[50px]">
          <div className="h-32 w-32 rounded-full bg-purple-500" />
        </div>

        {/* Icon Container */}
        <div className="relative flex h-24 w-24 items-center justify-center rounded-2xl bg-gradient-to-br from-purple-600/20 to-fuchsia-600/20 border border-purple-500/30 text-purple-400 shadow-[0_0_40px_-10px_rgba(168,85,247,0.4)]">
          <Rocket className="h-10 w-10 animate-pulse" />
          <Sparkles className="absolute -right-3 -top-3 h-6 w-6 text-fuchsia-400 animate-bounce" />
        </div>

        {/* Text content */}
        <div className="space-y-3 z-10 max-w-md">
          <h2 className="bg-gradient-to-r from-purple-400 via-fuchsia-400 to-white bg-clip-text text-4xl font-extrabold tracking-tight text-transparent">
            {title}
          </h2>
          <p className="text-lg text-zinc-400">
            {description}
          </p>
        </div>

        {/* Badge */}
        <div className="mt-8 rounded-full border border-white/10 bg-white/5 px-4 py-1.5 text-sm font-medium text-zinc-300">
          Coming Soon
        </div>
      </div>
    </div>
  );
}
