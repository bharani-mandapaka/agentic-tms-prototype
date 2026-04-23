import { useState } from 'react'
import {
  AlertTriangle,
  Calendar,
  UserMinus,
  FlaskConical,
  TrendingDown,
  ChevronDown,
  ChevronUp,
  Sparkles,
  ThumbsUp,
  Settings,
  CheckCircle2,
  Info,
} from 'lucide-react'
import { stressDayContext, tradeOffOptions } from '../data/mockDataV2'

const iconMap = {
  Calendar: Calendar,
  UserMinus: UserMinus,
  FlaskConical: FlaskConical,
  TrendingDown: TrendingDown,
}

const riskStyle = (level) => {
  if (level === 'low')    return { text: 'text-emerald-400', bg: 'bg-emerald-500/10', border: 'border-emerald-500/25', label: 'Low risk' }
  if (level === 'medium') return { text: 'text-amber-400',   bg: 'bg-amber-500/10',   border: 'border-amber-500/25',   label: 'Medium risk' }
  return                         { text: 'text-rose-400',    bg: 'bg-rose-500/10',    border: 'border-rose-500/25',    label: 'High risk' }
}

export default function TradeOffNegotiation({ onResolve, onAdjustConstraints }) {
  const [expandedId, setExpandedId] = useState(null)
  const [selectedId, setSelectedId] = useState(null)
  const recommended = tradeOffOptions.find((o) => o.agentRecommended)

  return (
    <div className="p-6">
      <div className="max-w-5xl">
        {/* Header */}
        <div className="mb-4">
          <div className="flex items-center gap-2 mb-1">
            <span className="text-[10px] px-2 py-0.5 rounded-full bg-amber-500/15 text-amber-300 border border-amber-500/30 font-semibold uppercase tracking-wide">
              Stress Day · {stressDayContext.dateLabel}
            </span>
          </div>
          <h1 className="text-xl font-semibold text-white flex items-center gap-2">
            <AlertTriangle size={18} className="text-amber-400" />
            No viable plan under current constraints
          </h1>
          <p className="text-sm text-slate-400 mt-1">
            The agent evaluated <span className="text-white font-semibold">{stressDayContext.variantsEvaluated} plan variants</span>.
            All either breach SLA, violate material compatibility, or exceed driver HOS limits. Three trade-off options exist.
          </p>
        </div>

        {/* Context card */}
        <div className="mb-5 bg-amber-500/8 border border-amber-500/25 rounded-xl p-4">
          <p className="text-xs font-semibold text-amber-300 uppercase tracking-wide mb-2.5">Why this batch is infeasible</p>
          <div className="grid grid-cols-2 gap-2.5">
            {stressDayContext.conditions.map((c, i) => {
              const Icon = iconMap[c.icon] || Info
              return (
                <div key={i} className="flex items-start gap-2 text-xs text-amber-100/90">
                  <Icon size={12} className="text-amber-400 flex-shrink-0 mt-0.5" />
                  <span className="leading-relaxed">{c.text}</span>
                </div>
              )
            })}
          </div>

          <div className="mt-3 pt-3 border-t border-amber-500/20">
            <p className="text-[10px] text-amber-300/80 font-semibold uppercase tracking-wide mb-1.5">Approaches the agent already exhausted</p>
            <div className="space-y-1">
              {stressDayContext.exhaustedApproaches.map((a, i) => (
                <div key={i} className="flex items-start gap-2 text-[11px] text-slate-400">
                  <span className="text-rose-400/80 font-mono flex-shrink-0">✗</span>
                  <span className="leading-relaxed">{a}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Trade-off options grid */}
        <div className="grid grid-cols-3 gap-3 mb-5">
          {tradeOffOptions.map((opt) => {
            const risk = riskStyle(opt.riskLevel)
            const isExpanded = expandedId === opt.id
            const isSelected = selectedId === opt.id
            const isRecommended = opt.agentRecommended
            return (
              <div
                key={opt.id}
                className={`bg-slate-900 rounded-xl border transition-all flex flex-col ${
                  isSelected
                    ? 'border-blue-500 ring-2 ring-blue-500/30'
                    : isRecommended
                      ? 'border-blue-500/40 ring-1 ring-blue-500/15'
                      : 'border-slate-800'
                }`}
              >
                {/* Header */}
                <div className="p-4 pb-3 border-b border-slate-800/70">
                  <div className="flex items-start justify-between mb-1.5">
                    <span className="text-[10px] font-mono text-slate-500 uppercase tracking-widest">{opt.label}</span>
                    {isRecommended && (
                      <span className="text-[10px] px-1.5 py-0.5 rounded-full bg-blue-500/20 text-blue-300 border border-blue-500/40 font-semibold flex items-center gap-1">
                        <Sparkles size={9} /> Recommended
                      </span>
                    )}
                  </div>
                  <h3 className="text-sm font-semibold text-white leading-tight">{opt.title}</h3>
                  <p className="text-xs text-slate-400 mt-1.5 leading-relaxed">{opt.description}</p>
                </div>

                {/* Metrics */}
                <div className="p-4 pt-3 space-y-2">
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-slate-500">Cost</span>
                    <span className={`font-semibold ${opt.costDelta < 0 ? 'text-emerald-400' : 'text-rose-400'}`}>{opt.costDeltaLabel}</span>
                  </div>
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-slate-500">SLA impact</span>
                    <span className="text-slate-200 text-right text-[11px] leading-tight">{opt.slaImpact}</span>
                  </div>
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-slate-500">Customer impact</span>
                    <span className="text-slate-200 text-right text-[11px] leading-tight">{opt.customerImpact}</span>
                  </div>
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-slate-500">Risk</span>
                    <span className={`px-1.5 py-0.5 rounded text-[10px] font-medium border ${risk.bg} ${risk.text} ${risk.border}`}>
                      {risk.label}
                    </span>
                  </div>

                  <div className="pt-1.5">
                    <div className="flex items-center justify-between text-xs mb-1">
                      <span className="text-slate-500">Confidence</span>
                      <span className={`font-semibold ${opt.confidence >= 85 ? 'text-emerald-400' : opt.confidence >= 70 ? 'text-amber-400' : 'text-rose-400'}`}>
                        {opt.confidence}%
                      </span>
                    </div>
                    <div className="h-1 bg-slate-800 rounded-full overflow-hidden">
                      <div
                        className={`h-full rounded-full ${opt.confidence >= 85 ? 'bg-emerald-500/70' : opt.confidence >= 70 ? 'bg-amber-500/70' : 'bg-rose-500/70'}`}
                        style={{ width: `${opt.confidence}%` }}
                      />
                    </div>
                  </div>
                </div>

                {/* Expand toggle */}
                <button
                  onClick={() => setExpandedId(isExpanded ? null : opt.id)}
                  className="px-4 py-2 text-[11px] text-slate-400 hover:text-white border-t border-slate-800/70 flex items-center justify-center gap-1.5 transition-colors"
                >
                  {isExpanded ? <>Hide details <ChevronUp size={11} /></> : <>Show details <ChevronDown size={11} /></>}
                </button>

                {isExpanded && (
                  <div className="px-4 py-3 bg-slate-950/50 border-t border-slate-800/70 space-y-1.5">
                    {opt.details.map((d, i) => (
                      <div key={i} className="flex items-start gap-1.5 text-[11px] text-slate-300">
                        <span className="text-slate-600 flex-shrink-0">·</span>
                        <span className="leading-relaxed">{d}</span>
                      </div>
                    ))}
                    <div className="pt-2 mt-2 border-t border-slate-800/70">
                      <p className="text-[10px] text-slate-500 font-semibold uppercase tracking-wide mb-1">Rationale</p>
                      <p className="text-[11px] text-slate-300 leading-relaxed">{opt.rationale}</p>
                    </div>
                  </div>
                )}

                {/* Choose button */}
                <div className="p-4 pt-2 mt-auto">
                  <button
                    onClick={() => setSelectedId(opt.id)}
                    className={`w-full py-2 rounded-lg text-xs font-semibold transition-colors ${
                      isSelected
                        ? 'bg-blue-600 text-white'
                        : isRecommended
                          ? 'bg-blue-600/80 hover:bg-blue-500 text-white'
                          : 'bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700'
                    }`}
                  >
                    {isSelected ? (<span className="flex items-center justify-center gap-1.5"><CheckCircle2 size={12} /> Selected</span>) : `Choose ${opt.label}`}
                  </button>
                </div>
              </div>
            )
          })}
        </div>

        {/* Agent recommendation callout */}
        {recommended && (
          <div className="mb-5 bg-blue-500/8 border border-blue-500/30 rounded-xl p-4">
            <div className="flex items-start gap-3">
              <div className="w-8 h-8 rounded-lg bg-blue-500/20 flex items-center justify-center flex-shrink-0">
                <Sparkles size={14} className="text-blue-300" />
              </div>
              <div className="flex-1">
                <p className="text-xs font-semibold text-blue-200 uppercase tracking-wide mb-1">Agent recommendation</p>
                <p className="text-sm text-white mb-1"><span className="font-semibold">{recommended.label}: {recommended.title}</span></p>
                <p className="text-xs text-blue-100/80 leading-relaxed">{recommended.rationale}</p>
              </div>
            </div>
          </div>
        )}

        {/* Action bar */}
        <div className="flex items-center justify-between gap-3 p-4 bg-slate-900 border border-slate-800 rounded-xl">
          <button
            onClick={onAdjustConstraints}
            className="flex items-center gap-1.5 px-3 py-2 text-xs font-medium text-slate-300 hover:text-white rounded-lg border border-slate-700 hover:border-slate-600 transition-colors"
          >
            <Settings size={12} />
            Adjust constraints and retry
          </button>

          <div className="flex items-center gap-2">
            <p className="text-[11px] text-slate-500 mr-1">
              {selectedId
                ? <>Ready to commit <span className="text-white font-semibold">{tradeOffOptions.find((o) => o.id === selectedId)?.label}</span></>
                : 'Select an option to proceed'}
            </p>
            <button
              disabled={!selectedId}
              onClick={() => selectedId && onResolve(tradeOffOptions.find((o) => o.id === selectedId))}
              className={`flex items-center gap-1.5 px-4 py-2 rounded-lg text-xs font-semibold transition-colors ${
                selectedId
                  ? 'bg-blue-600 hover:bg-blue-500 text-white shadow-lg shadow-blue-900/30'
                  : 'bg-slate-800 text-slate-600 cursor-not-allowed'
              }`}
            >
              <ThumbsUp size={12} />
              Commit selected option
            </button>
          </div>
        </div>

        {/* Footer principle */}
        <p className="text-[11px] text-slate-500 mt-4 flex items-center gap-1.5">
          <Info size={10} />
          The agent recommends. The planner decides. Human-in-the-loop by design.
        </p>
      </div>
    </div>
  )
}
