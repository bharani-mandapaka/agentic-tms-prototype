import { Zap, Bell, Settings } from 'lucide-react'

export default function Header() {
  return (
    <header className="bg-slate-900 border-b border-slate-800 h-14 flex items-center px-6 gap-4 flex-shrink-0">
      <div className="flex items-center gap-3">
        <div className="w-7 h-7 bg-blue-600 rounded-md flex items-center justify-center">
          <Zap size={14} className="text-white" fill="white" />
        </div>
        <span className="font-bold text-white tracking-tight text-lg">First-Mile Load Optimisation</span>
      </div>

      <div className="ml-auto flex items-center gap-2">
        <span className="text-xs px-2.5 py-1 rounded-full bg-blue-500/15 text-blue-400 border border-blue-500/30 font-medium flex items-center gap-1.5">
          <span className="w-1.5 h-1.5 rounded-full bg-blue-400 inline-block" />
          Agent Active
        </span>
        <button className="w-8 h-8 rounded-md hover:bg-slate-800 flex items-center justify-center text-slate-500 transition-colors">
          <Bell size={15} />
        </button>
        <button className="w-8 h-8 rounded-md hover:bg-slate-800 flex items-center justify-center text-slate-500 transition-colors">
          <Settings size={15} />
        </button>
        <div className="w-8 h-8 rounded-full bg-gradient-to-br from-blue-500 to-violet-600 flex items-center justify-center text-xs font-bold ml-1">
          P
        </div>
      </div>
    </header>
  )
}
