import { useState, useEffect } from 'react'
import {
  X,
  Check,
  X as XIcon,
  AlertTriangle,
  ChevronDown,
  ChevronUp,
  Filter,
  Truck,
  Info,
  CheckCircle2,
  XCircle,
  Flag,
} from 'lucide-react'
import { reasoningTraces, constraintPillConfig, ALL_CONSTRAINTS } from '../data/mockDataV2'

const decisionIcon = (type) => {
  if (type === 'accepted') return <CheckCircle2 size={13} className="text-emerald-400 flex-shrink-0 mt-0.5" />
  if (type === 'rejected') return <XCircle size={13} className="text-rose-400 flex-shrink-0 mt-0.5" />
  if (type === 'flagged')  return <Flag size={13} className="text-amber-400 flex-shrink-0 mt-0.5" />
  return null
}

const decisionLabel = (type) => {
  if (type === 'accepted') return { label: 'Accepted', style: 'text-emerald-300' }
  if (type === 'rejected') return { label: 'Rejected', style: 'text-rose-300' }
  if (type === 'flagged')  return { label: 'Flagged',  style: 'text-amber-300' }
  return { label: '', style: '' }
}

export default function ReasoningTracePanel({ planId, vehicleId, onClose }) {
  const trace = reasoningTraces[`${planId}-${vehicleId}`]
  const [filterConstraint, setFilterConstraint] = useState(null)
  const [confidenceExpanded, setConfidenceExpanded] = useState(false)
  const [animateIn, setAnimateIn] = useState(false)

  useEffect(() => {
    setAnimateIn(true)
    const handleEsc = (e) => { if (e.key === 'Escape') onClose() }
    window.addEventListener('keydown', handleEsc)
    return () => window.removeEventListener('keydown', handleEsc)
  }, [onClose])

  if (!trace) {
    return (
      <div className="fixed inset-0 z-50 flex" role="dialog">
        <div className="flex-1 bg-slate-950/70 backdrop-blur-sm" onClick={onClose} />
        <div className="w-[520px] bg-slate-900 border-l border-slate-800 flex flex-col p-6">
          <button onClick={onClose} className="self-end p-1 rounded hover:bg-slate-800"><X size={16} /></button>
          <p className="text-sm text-slate-400 mt-8">
            Reasoning trace not available for {planId}-{vehicleId}. This truck did not produce binding decisions above the trace threshold.
          </p>
        </div>
      </div>
    )
  }

  const filteredDecisions = filterConstraint
    ? trace.decisions.filter((d) => d.constraints_triggered.includes(filterConstraint))
    : trace.decisions

  const accepted = trace.decisions.filter((d) => d.type === 'accepted').length
  const rejected = trace.decisions.filter((d) => d.type === 'rejected').length
  const flagged  = trace.decisions.filter((d) => d.type === 'flagged').length

  return (
    <div className="fixed inset-0 z-50 flex" role="dialog" aria-modal="true">
      {/* Backdrop */}
      <div
        className={`flex-1 bg-slate-950/70 backdrop-blur-sm transition-opacity duration-200 ${animateIn ? 'opacity-100' : 'opacity-0'}`}
        onClick={onClose}
      />

      {/* Drawer */}
      <div className={`w-[560px] bg-slate-900 border-l border-slate-800 flex flex-col shadow-2xl transition-transform duration-200 ${animateIn ? 'translate-x-0' : 'translate-x-full'}`}>
        {/* Header */}
        <div className="p-5 border-b border-slate-800 flex-shrink-0">
          <div className="flex items-start justify-between mb-3">
            <div>
              <div className="flex items-center gap-2">
                <Truck size={14} className="text-blue-400" />
                <h2 className="text-lg font-semibold text-white">{trace.vehicleId} — Reasoning Trace</h2>
              </div>
              <p className="text-xs text-slate-400 mt-1">{trace.type} · {trace.destination}</p>
            </div>
            <button onClick={onClose} className="p-1.5 rounded hover:bg-slate-800 text-slate-400 hover:text-white">
              <X size={16} />
            </button>
          </div>

          {/* Summary strip */}
          <div className="grid grid-cols-3 gap-2 mb-3">
            <div className="bg-slate-800/50 border border-slate-700 rounded-md px-2.5 py-1.5">
              <p className="text-[9px] text-slate-500 uppercase tracking-wide">Utilisation</p>
              <p className="text-sm font-semibold text-white">{trace.utilisation}%</p>
            </div>
            <div className="bg-slate-800/50 border border-slate-700 rounded-md px-2.5 py-1.5">
              <p className="text-[9px] text-slate-500 uppercase tracking-wide">Cost</p>
              <p className="text-sm font-semibold text-white">₹{trace.cost.toLocaleString('en-IN')}</p>
            </div>
            <button
              onClick={() => setConfidenceExpanded((v) => !v)}
              className={`text-left rounded-md px-2.5 py-1.5 border transition-colors ${
                confidenceExpanded
                  ? 'bg-blue-500/15 border-blue-500/40'
                  : 'bg-slate-800/50 border-slate-700 hover:border-blue-500/30'
              }`}
            >
              <p className="text-[9px] text-slate-500 uppercase tracking-wide flex items-center gap-1">
                Confidence {confidenceExpanded ? <ChevronUp size={8} /> : <ChevronDown size={8} />}
              </p>
              <p className={`text-sm font-semibold ${trace.confidence >= 90 ? 'text-emerald-400' : trace.confidence >= 70 ? 'text-amber-400' : 'text-rose-400'}`}>
                {trace.confidence}%
              </p>
            </button>
          </div>

          {/* Confidence breakdown (expandable) */}
          {confidenceExpanded && (
            <div className="bg-slate-800/40 border border-slate-700 rounded-md p-3 mb-3">
              <p className="text-[10px] text-slate-500 font-semibold uppercase tracking-wide mb-2">Confidence drivers</p>
              <div className="space-y-1.5">
                {trace.confidence_factors.map((f, i) => (
                  <div key={i} className="flex items-center justify-between gap-2 text-[11px]">
                    <span className="text-slate-300 flex-1 leading-tight">{f.factor}</span>
                    <span className={`font-mono font-semibold ${f.impact > 0 ? 'text-emerald-400' : f.impact < 0 ? 'text-rose-400' : 'text-slate-500'}`}>
                      {f.impact > 0 ? `+${f.impact}` : f.impact}%
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Composition */}
          <div className="bg-slate-800/30 rounded-md p-2.5">
            <p className="text-[10px] text-slate-500 uppercase tracking-wide mb-1">Final composition</p>
            <p className="text-xs text-slate-200 font-mono leading-relaxed">{trace.composition.join(' · ')}</p>
          </div>
        </div>

        {/* Decision log */}
        <div className="flex-1 overflow-y-auto p-5">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <p className="text-xs font-semibold text-slate-300 uppercase tracking-wide">Decisions weighed</p>
              <span className="text-[10px] text-slate-500">{trace.decisions.length} total</span>
            </div>
            <div className="flex items-center gap-1.5 text-[10px]">
              <span className="flex items-center gap-1 text-emerald-400"><CheckCircle2 size={10} /> {accepted}</span>
              <span className="flex items-center gap-1 text-rose-400"><XCircle size={10} /> {rejected}</span>
              {flagged > 0 && <span className="flex items-center gap-1 text-amber-400"><Flag size={10} /> {flagged}</span>}
            </div>
          </div>

          {filterConstraint && (
            <div className="mb-3 flex items-center gap-2 text-[11px] text-slate-400">
              <Filter size={10} />
              <span>Filtered by</span>
              <span className={`px-2 py-0.5 rounded-full border font-medium ${constraintPillConfig[filterConstraint].bg} ${constraintPillConfig[filterConstraint].text} ${constraintPillConfig[filterConstraint].border}`}>
                {constraintPillConfig[filterConstraint].short}
              </span>
              <button
                onClick={() => setFilterConstraint(null)}
                className="text-blue-400 hover:text-blue-300 underline"
              >
                Clear
              </button>
            </div>
          )}

          <div className="space-y-3">
            {filteredDecisions.length === 0 ? (
              <p className="text-xs text-slate-500 italic">No decisions matched this constraint on this truck.</p>
            ) : (
              filteredDecisions.map((d) => {
                const lbl = decisionLabel(d.type)
                return (
                  <div
                    key={d.id}
                    className={`rounded-lg border p-3.5 ${
                      d.type === 'accepted'
                        ? 'bg-emerald-500/5 border-emerald-500/20'
                        : d.type === 'rejected'
                          ? 'bg-rose-500/5 border-rose-500/20'
                          : 'bg-amber-500/5 border-amber-500/20'
                    }`}
                  >
                    <div className="flex items-start gap-2.5 mb-2">
                      {decisionIcon(d.type)}
                      <div className="flex-1 min-w-0">
                        <div className="flex items-baseline gap-2">
                          <span className={`text-[10px] font-semibold uppercase tracking-wide ${lbl.style}`}>{lbl.label}</span>
                          {d.cost_impact !== 0 && (
                            <span className="text-[10px] text-slate-500">
                              Cost impact: {d.cost_impact > 0 ? '+' : ''}₹{Math.abs(d.cost_impact).toLocaleString('en-IN')}
                            </span>
                          )}
                        </div>
                        <p className="text-sm font-medium text-white mt-0.5 leading-snug">{d.subject}</p>
                      </div>
                    </div>
                    <p className="text-xs text-slate-300 leading-relaxed ml-6">{d.reason}</p>
                    <div className="flex flex-wrap gap-1 mt-2.5 ml-6">
                      {d.constraints_triggered.map((c) => (
                        <button
                          key={c}
                          onClick={() => setFilterConstraint(filterConstraint === c ? null : c)}
                          className={`text-[10px] px-1.5 py-0.5 rounded-full border font-medium transition-all ${constraintPillConfig[c].bg} ${constraintPillConfig[c].text} ${constraintPillConfig[c].border} hover:opacity-80 ${filterConstraint === c ? 'ring-1 ring-white/20' : ''}`}
                        >
                          {constraintPillConfig[c].short}
                        </button>
                      ))}
                    </div>
                  </div>
                )
              })
            )}
          </div>
        </div>

        {/* Constraints evaluated footer */}
        <div className="border-t border-slate-800 p-4 flex-shrink-0 bg-slate-900">
          <div className="flex items-center justify-between mb-2">
            <p className="text-[10px] text-slate-500 font-semibold uppercase tracking-wide">Constraints evaluated</p>
            <span className="text-[10px] text-slate-500">
              {trace.constraints_evaluated.length}/8 · {trace.binding_constraints.length} binding
            </span>
          </div>
          <div className="flex flex-wrap gap-1.5">
            {ALL_CONSTRAINTS.map((c) => {
              const cfg = constraintPillConfig[c]
              const evaluated = trace.constraints_evaluated.includes(c)
              const binding = trace.binding_constraints.includes(c)
              return (
                <button
                  key={c}
                  onClick={() => setFilterConstraint(filterConstraint === c ? null : (evaluated ? c : null))}
                  disabled={!evaluated}
                  className={`text-[10px] px-2 py-0.5 rounded-full border font-medium transition-all ${
                    evaluated
                      ? `${cfg.bg} ${cfg.text} ${cfg.border} hover:opacity-80 ${filterConstraint === c ? 'ring-1 ring-white/30' : ''} ${binding ? 'ring-1 ring-white/15' : ''}`
                      : 'bg-slate-800/40 text-slate-600 border-slate-800 cursor-not-allowed'
                  }`}
                  title={binding ? 'Binding constraint' : evaluated ? 'Evaluated (non-binding)' : 'Not applicable on this truck'}
                >
                  {cfg.short}{binding ? ' •' : ''}
                </button>
              )
            })}
          </div>
          <p className="text-[10px] text-slate-600 mt-2 leading-relaxed">
            All 8 evaluated. Dot (•) = constraint produced a binding decision on this truck. Click a pill to filter the decision log.
          </p>
        </div>
      </div>
    </div>
  )
}
