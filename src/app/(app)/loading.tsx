import { Loader2 } from "lucide-react";

export default function Loading() {
  return (
    <div className="flex-1 flex flex-col p-6 md:p-10 gap-6 w-full h-full relative">
      <div className="flex flex-col gap-3">
        <div className="h-8 w-48 bg-white/5 rounded-md animate-pulse"></div>
        <div className="h-4 w-72 bg-white/5 rounded-md animate-pulse"></div>
      </div>
      
      <div className="mt-8 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {[...Array(6)].map((_, i) => (
          <div key={i} className="flex flex-col rounded-2xl border border-white/5 bg-white/5 p-5 animate-pulse h-[140px]">
            <div className="h-5 w-3/4 bg-white/10 rounded mb-4"></div>
            <div className="h-3 w-full bg-white/5 rounded mb-2"></div>
            <div className="h-3 w-5/6 bg-white/5 rounded mb-2"></div>
            <div className="h-3 w-4/6 bg-white/5 rounded"></div>
          </div>
        ))}
      </div>
    </div>
  );
}
