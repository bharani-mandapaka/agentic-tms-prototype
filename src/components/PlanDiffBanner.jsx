import { Zap, ArrowRight } from 'lucide-react'

export default function PlanDiffBanner({ scenario, onView, onDismiss }) {
  if (!scenario) return null
  return (
    <div className="mb-4 bg-amber-500/10 border border-amber-500/30 rounded-xl px-4 py-2.5 flex items-center gap-3 animate-pulse-subtle">
      <div className="w-7 h-7 rounded-lg bg-amber-500/20 flex items-center justify-center flex-shrink-0">
        <Zap size={13} className="text-amber-400" />
      </div>
      <div className="flex-1">
        <p className="text-xs font-semibold text-amber-200">
          Plan updated. {scenario.changesCount} change{scenario.changesCount > 1 ? 's' : ''} since approval.
        </p>
        <p className="text-[11px] text-amber-100/70 truncate">{scenario.triggerEvent}</p>
      </div>
      <button
        onClick={onView}
        className="flex items-center gap-1 px-3 py-1.5 rounded-lg bg-amber-500/20 hover:bg-amber-500/30 text-amber-200 text-xs font-semibold border border-amber-500/30 transition-colors"
      >
        View diff <ArrowRight size={11} />
      </button>
      <button
        onClick={onDismiss}
        className="text-xs text-amber-300/60 hover:text-amber-200 px-2"
        title="Dismiss"
      >
        ×
      </button>
    </div>
  )
}
