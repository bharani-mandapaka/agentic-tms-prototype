import { useState } from 'react'
import {
  Settings,
  Zap,
  AlertTriangle,
  RotateCcw,
  ChevronUp,
  ChevronDown,
  Wrench,
  CheckCircle2,
} from 'lucide-react'
import { planDiffScenarios } from '../data/mockDataV2'

export default function DemoControls({
  demoMode,
  onToggleMode,
  onTriggerScenario,
  onReset,
  pendingScenarioId,
}) {
  const [open, setOpen] = useState(false)

  return (
    <div className="fixed bottom-4 right-4 z-40">
      {open && (
        <div className="mb-2 bg-slate-900 border border-slate-700 rounded-xl shadow-2xl w-80 p-4">
          {/* Panel header */}
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <Wrench size={12} className="text-amber-400" />
              <p className="text-xs font-semibold text-white uppercase tracking-wide">Demo Controls</p>
            </div>
            <span className="text-[10px] text-slate-500">Presenter only</span>
          </div>

          {/* Mode toggle */}
          <div className="mb-3 bg-slate-950/60 border border-slate-800 rounded-lg p-2.5">
            <p className="text-[10px] text-slate-500 font-semibold uppercase tracking-wide mb-1.5">
              Input scenario
            </p>
            <div className="grid grid-cols-2 gap-1">
              <button
                onClick={() => onToggleMode('normal')}
                className={`px-2 py-1.5 rounded text-[11px] font-semibold transition-colors flex items-center justify-center gap-1 ${
                  demoMode === 'normal'
                    ? 'bg-blue-600/80 text-white'
                    : 'bg-slate-800 text-slate-400 hover:text-white'
                }`}
              >
                {demoMode === 'normal' && <CheckCircle2 size={10} />}
                Normal day
              </button>
              <button
                onClick={() => onToggleMode('stress')}
                className={`px-2 py-1.5 rounded text-[11px] font-semibold transition-colors flex items-center justify-center gap-1 ${
                  demoMode === 'stress'
                    ? 'bg-amber-600/80 text-white'
                    : 'bg-slate-800 text-slate-400 hover:text-white'
                }`}
              >
                {demoMode === 'stress' && <CheckCircle2 size={10} />}
                Stress day
              </button>
            </div>
            <p className="text-[10px] text-slate-500 mt-1.5 leading-relaxed">
              {demoMode === 'stress'
                ? 'Infeasible conditions active — the Dispatch Plans screen surfaces trade-off negotiation.'
                : 'Standard dispatch. All 8 constraints satisfiable; agent produces 2 plans.'}
            </p>
          </div>

          {/* Trigger diff */}
          <div className="mb-3 bg-slate-950/60 border border-slate-800 rounded-lg p-2.5">
            <p className="text-[10px] text-slate-500 font-semibold uppercase tracking-wide mb-1.5">
              Trigger re-plan event
            </p>
            <div className="space-y-1">
              {planDiffScenarios.map((s) => {
                const isActive = pendingScenarioId === s.id
                return (
                  <button
                    key={s.id}
                    onClick={() => onTriggerScenario(s.id)}
                    className={`w-full text-left px-2 py-1.5 rounded text-[11px] transition-colors flex items-center gap-1.5 ${
                      isActive
                        ? 'bg-amber-500/20 border border-amber-500/40 text-amber-100'
                        : 'bg-slate-800 hover:bg-slate-700 border border-transparent text-slate-300'
                    }`}
                  >
                    <Zap size={10} className={isActive ? 'text-amber-300' : 'text-amber-400/70'} />
                    <span className="flex-1 leading-tight">{s.triggerLabel}</span>
                    {isActive && <span className="text-[9px] uppercase tracking-wider font-semibold text-amber-300">Live</span>}
                  </button>
                )
              })}
            </div>
            <p className="text-[10px] text-slate-500 mt-1.5 leading-relaxed">
              Open the Dispatch Plans screen to see the diff banner — click "View diff" for the modal.
            </p>
          </div>

          <button
            onClick={onReset}
            className="w-full flex items-center justify-center gap-1.5 px-3 py-1.5 rounded text-[11px] font-medium text-slate-300 hover:text-white border border-slate-700 hover:border-slate-600 transition-colors"
          >
            <RotateCcw size={10} />
            Reset demo state
          </button>
        </div>
      )}

      {/* Toggle button */}
      <button
        onClick={() => setOpen((v) => !v)}
        className={`flex items-center gap-1.5 px-3 py-2 rounded-full shadow-2xl border transition-colors ${
          demoMode === 'stress'
            ? 'bg-amber-600 hover:bg-amber-500 border-amber-500 text-white'
            : pendingScenarioId
              ? 'bg-blue-600 hover:bg-blue-500 border-blue-500 text-white'
              : 'bg-slate-800 hover:bg-slate-700 border-slate-700 text-slate-200'
        }`}
      >
        {demoMode === 'stress' ? <AlertTriangle size={13} /> : <Settings size={13} />}
        <span className="text-xs font-semibold">
          {demoMode === 'stress'
            ? 'Stress day active'
            : pendingScenarioId
              ? 'Re-plan triggered'
              : 'Demo controls'}
        </span>
        {open ? <ChevronDown size={11} /> : <ChevronUp size={11} />}
      </button>
    </div>
  )
}
