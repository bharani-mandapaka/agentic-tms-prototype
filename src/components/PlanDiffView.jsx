import { useEffect, useState } from 'react'
import {
  X,
  Zap,
  Clock,
  ArrowRight,
  TrendingUp,
  TrendingDown,
  CheckCircle2,
  RotateCcw,
  RefreshCw,
  ChevronDown,
  ChevronUp,
  Truck,
} from 'lucide-react'
import { constraintPillConfig } from '../data/mockDataV2'

export default function PlanDiffView({ scenario, onAccept, onRevert, onReplan, onClose }) {
  const [showUnchanged, setShowUnchanged] = useState(false)
  const [animateIn, setAnimateIn] = useState(false)

  useEffect(() => {
    setAnimateIn(true)
    const handleEsc = (e) => { if (e.key === 'Escape') onClose() }
    window.addEventListener('keydown', handleEsc)
    return () => window.removeEventListener('keydown', handleEsc)
  }, [onClose])

  if (!scenario) return null

  const costUp = scenario.costDelta > 0

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center p-8 overflow-y-auto" role="dialog" aria-modal="true">
      {/* Backdrop */}
      <div
        className={`fixed inset-0 bg-slate-950/75 backdrop-blur-sm transition-opacity duration-200 ${animateIn ? 'opacity-100' : 'opacity-0'}`}
        onClick={onClose}
      />

      {/* Modal */}
      <div className={`relative bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-4xl shadow-2xl my-8 transition-all duration-200 ${animateIn ? 'scale-100 opacity-100' : 'scale-95 opacity-0'}`}>
        {/* Header */}
        <div className="p-5 border-b border-slate-800 flex items-start justify-between">
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-1">
              <div className="w-6 h-6 rounded-md bg-amber-500/20 flex items-center justify-center">
                <Zap size={12} className="text-amber-400" />
              </div>
              <h2 className="text-base font-semibold text-white">Plan Diff</h2>
              <span className="text-[10px] text-slate-500">·</span>
              <span className="text-xs text-slate-400">
                v{scenario.previousVersion} (09:12 AM) → v{scenario.newVersion} (11:04 AM)
              </span>
            </div>
            <p className="text-sm text-slate-300 mt-1">{scenario.triggerEvent}</p>
            <p className="text-xs text-slate-400 mt-0.5 leading-relaxed">{scenario.triggerDescription}</p>
          </div>
          <button onClick={onClose} className="p-1.5 rounded hover:bg-slate-800 text-slate-400 hover:text-white flex-shrink-0">
            <X size={16} />
          </button>
        </div>

        {/* Summary strip */}
        <div className="grid grid-cols-4 gap-0 border-b border-slate-800 bg-slate-950/40">
          <div className="p-3 border-r border-slate-800">
            <p className="text-[10px] text-slate-500 uppercase tracking-wide">Changes</p>
            <p className="text-base font-semibold text-white mt-0.5">{scenario.changesCount}</p>
          </div>
          <div className="p-3 border-r border-slate-800">
            <p className="text-[10px] text-slate-500 uppercase tracking-wide">Cost delta</p>
            <div className="flex items-baseline gap-1 mt-0.5">
              {costUp ? <TrendingUp size={11} className="text-rose-400" /> : scenario.costDelta === 0 ? null : <TrendingDown size={11} className="text-emerald-400" />}
              <p className={`text-base font-semibold ${costUp ? 'text-rose-400' : scenario.costDelta === 0 ? 'text-slate-300' : 'text-emerald-400'}`}>
                {scenario.costDelta === 0 ? 'No change' : `${costUp ? '+' : '-'}₹${Math.abs(scenario.costDelta).toLocaleString('en-IN')}`}
              </p>
            </div>
          </div>
          <div className="p-3 border-r border-slate-800">
            <p className="text-[10px] text-slate-500 uppercase tracking-wide">Utilisation</p>
            <p className="text-base font-semibold text-white mt-0.5">
              {scenario.utilBefore}% <ArrowRight size={10} className="inline mx-1 text-slate-500" /> {scenario.utilAfter}%
            </p>
          </div>
          <div className="p-3">
            <p className="text-[10px] text-slate-500 uppercase tracking-wide">Total cost</p>
            <p className="text-base font-semibold text-white mt-0.5">
              ₹{scenario.costAfter.toLocaleString('en-IN')}
            </p>
          </div>
        </div>

        {/* Changed trucks */}
        <div className="p-5 max-h-[50vh] overflow-y-auto">
          <p className="text-[10px] font-semibold text-slate-400 uppercase tracking-wide mb-3">
            Changed trucks ({scenario.changedTrucks.length})
          </p>

          <div className="space-y-3">
            {scenario.changedTrucks.map((t) => (
              <div key={t.truckId} className="bg-slate-800/30 rounded-lg border border-slate-800 overflow-hidden">
                <div className="px-4 py-2.5 border-b border-slate-800 bg-slate-800/40 flex items-center gap-2">
                  <Truck size={12} className="text-blue-400" />
                  <span className="text-sm font-semibold text-white">{t.truckId}</span>
                </div>
                <div className="grid grid-cols-2 gap-0">
                  {/* Before */}
                  <div className="p-3 border-r border-slate-800 bg-rose-500/5">
                    <p className="text-[10px] text-rose-400 font-semibold uppercase tracking-wide mb-1.5">Before (v{scenario.previousVersion})</p>
                    <div className="space-y-1 text-xs">
                      <div>
                        <span className="text-slate-500">Composition: </span>
                        <span className="text-slate-200 font-mono">{t.before.composition}</span>
                      </div>
                      <div>
                        <span className="text-slate-500">Driver: </span>
                        <span className="text-slate-200">{t.before.driver}</span>
                      </div>
                      <div>
                        <span className="text-slate-500">Util: </span>
                        <span className="text-slate-200 font-mono">{t.before.util}%</span>
                      </div>
                    </div>
                  </div>
                  {/* After */}
                  <div className="p-3 bg-emerald-500/5">
                    <p className="text-[10px] text-emerald-400 font-semibold uppercase tracking-wide mb-1.5">After (v{scenario.newVersion})</p>
                    <div className="space-y-1 text-xs">
                      <div>
                        <span className="text-slate-500">Composition: </span>
                        <span className="text-slate-200 font-mono">{t.after.composition}</span>
                      </div>
                      <div>
                        <span className="text-slate-500">Driver: </span>
                        <span className="text-slate-200">{t.after.driver}</span>
                      </div>
                      <div>
                        <span className="text-slate-500">Util: </span>
                        <span className="text-slate-200 font-mono">{t.after.util}%</span>
                      </div>
                    </div>
                  </div>
                </div>
                {/* Reason */}
                <div className="p-3 bg-slate-900/50 border-t border-slate-800">
                  <p className="text-[10px] text-slate-500 font-semibold uppercase tracking-wide mb-1">Why this changed</p>
                  <p className="text-xs text-slate-300 leading-relaxed">{t.reason}</p>
                  <div className="flex flex-wrap gap-1 mt-2">
                    {t.constraintsTriggered.map((c) => {
                      const cfg = constraintPillConfig[c]
                      if (!cfg) return null
                      return (
                        <span key={c} className={`text-[10px] px-1.5 py-0.5 rounded-full border font-medium ${cfg.bg} ${cfg.text} ${cfg.border}`}>
                          {cfg.short}
                        </span>
                      )
                    })}
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Unchanged */}
          <div className="mt-4">
            <button
              onClick={() => setShowUnchanged((v) => !v)}
              className="flex items-center gap-1.5 text-[11px] text-slate-400 hover:text-white transition-colors"
            >
              {showUnchanged ? <ChevronUp size={11} /> : <ChevronDown size={11} />}
              Unchanged trucks ({scenario.unchangedTrucks.length})
            </button>
            {showUnchanged && (
              <div className="mt-2 flex flex-wrap gap-1.5">
                {scenario.unchangedTrucks.map((t) => (
                  <span key={t} className="text-[10px] px-2 py-1 rounded bg-slate-800/50 border border-slate-800 text-slate-400">
                    {t}
                  </span>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Footer actions */}
        <div className="border-t border-slate-800 p-4 flex items-center justify-between gap-2 bg-slate-950/40">
          <div className="flex items-center gap-1.5 text-[11px] text-slate-500">
            <Clock size={10} /> Audit-logged at {new Date().toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })}
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={onRevert}
              className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-slate-300 hover:text-white rounded-lg border border-slate-700 hover:border-slate-600 transition-colors"
            >
              <RotateCcw size={11} />
              Revert to approved
            </button>
            <button
              onClick={onReplan}
              className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-slate-300 hover:text-white rounded-lg border border-slate-700 hover:border-slate-600 transition-colors"
            >
              <RefreshCw size={11} />
              Re-plan
            </button>
            <button
              onClick={onAccept}
              className="flex items-center gap-1.5 px-4 py-1.5 rounded-lg text-xs font-semibold bg-blue-600 hover:bg-blue-500 text-white shadow-lg shadow-blue-900/30 transition-colors"
            >
              <CheckCircle2 size={11} />
              Accept updated plan
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
