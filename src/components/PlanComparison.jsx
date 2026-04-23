import { plans } from '../data/mockData'
import { reasoningTraces } from '../data/mockDataV2'
import PullPushTimeline from './PullPushTimeline'
import PlanDiffBanner from './PlanDiffBanner'
import {
  Clock,
  Truck,
  AlertTriangle,
  ChevronRight,
  Star,
  ThumbsUp,
  Snowflake,
  AlertCircle,
  ShieldCheck,
  ShieldAlert,
  Siren,
  Target,
  Brain,
} from 'lucide-react'

const vehicleIcon = (type) => {
  if (type.includes('Reefer')) return <Snowflake size={11} className="text-sky-400" />
  if (type.includes('Hazmat')) return <AlertTriangle size={11} className="text-red-400" />
  if (type.includes('Insulated')) return <Snowflake size={11} className="text-blue-400" />
  return <Truck size={11} className="text-slate-400" />
}

const slaScoreStyle = (s) => {
  if (s >= 90) return { color: 'text-emerald-400', bg: 'bg-emerald-500/10', border: 'border-emerald-500/25', bar: 'bg-emerald-500/70' }
  if (s >= 70) return { color: 'text-amber-400',   bg: 'bg-amber-500/10',   border: 'border-amber-500/25',   bar: 'bg-amber-500/70' }
  return              { color: 'text-red-400',      bg: 'bg-red-500/10',     border: 'border-red-500/20',      bar: 'bg-red-500/60' }
}

const corridorColors = {
  BOM: 'border-l-blue-500',
  PNQ: 'border-l-violet-500',
  MAA: 'border-l-emerald-500',
  BLR: 'border-l-amber-500',
  HYD: 'border-l-rose-500',
}

export default function PlanComparison({
  onApprove,
  pendingScenario,
  onViewDiff,
  onDismissDiff,
  onOpenReasoning,
  planVersion = 1,
}) {
  return (
    <div className="p-6">
      <div className="max-w-6xl">
        {/* Header */}
        <div className="mb-5">
          <div className="flex items-center gap-2">
            <h1 className="text-xl font-semibold text-white">Dispatch Plans — Batch 14</h1>
            <span className="text-[10px] px-2 py-0.5 rounded-full bg-slate-800 text-slate-400 border border-slate-700 font-mono">
              v{planVersion}
            </span>
          </div>
          <p className="text-sm text-slate-400 mt-1">
            38 orders across 5 corridors. Agent generated 2 plans — review vehicle assignments and trade-offs.
          </p>
        </div>

        {/* Plan diff banner (shown when a re-plan trigger is pending) */}
        <PlanDiffBanner
          scenario={pendingScenario}
          onView={onViewDiff}
          onDismiss={onDismissDiff}
        />

        {/* Dynamic pull/push timeline */}
        <PullPushTimeline />

        {/* Pull/Push banner */}
        <div className="mb-5 p-3.5 bg-blue-500/8 border border-blue-500/30 rounded-xl flex items-start gap-3">
          <div className="w-7 h-7 rounded-lg bg-blue-500/20 flex items-center justify-center flex-shrink-0">
            <Clock size={13} className="text-blue-400" />
          </div>
          <div>
            <p className="text-sm font-semibold text-blue-200">3 Hold Recommendations Active</p>
            <p className="text-xs text-blue-300/70 mt-0.5 leading-relaxed">
              V11 (Hyderabad, <span className="text-red-400">34% util — below 40% threshold</span>) → hold for Batch 16 (+2h, 89% prob, saves ₹8,400) ·
              V9 (Bangalore, <span className="text-amber-400">38% util — below 40% threshold</span>) → hold for Batch 15 (+1h, 81% prob, saves ₹6,200) ·
              V5 (Pune, 41% util) → pull opportunity in Batch 15 (+1h, 74% prob, saves ₹4,800).{' '}
              <span className="text-blue-400/60">
                Combined saving: ₹19,400. All SLA windows absorb holds. Auto-dispatch triggers armed.
              </span>
            </p>
          </div>
        </div>

        {/* Plans grid */}
        <div className="grid grid-cols-2 gap-5">
          {plans.map((plan) => (
            <div
              key={plan.id}
              className={`bg-slate-900 rounded-xl border flex flex-col ${
                plan.recommended ? 'border-blue-500/50 ring-1 ring-blue-500/15' : 'border-slate-800'
              }`}
            >
              {/* Plan header */}
              <div className="p-5 pb-0">
                <div className="flex items-start justify-between mb-4">
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="text-lg font-bold text-white">{plan.title}</span>
                      {plan.recommended && <Star size={13} className="text-amber-400" fill="currentColor" />}
                    </div>
                    <p className="text-sm text-slate-400 mt-0.5">{plan.subtitle}</p>
                  </div>
                  <span className={`text-xs px-2 py-0.5 rounded-full font-medium border ${
                    plan.recommended ? 'bg-blue-500/15 text-blue-300 border-blue-500/30' : 'bg-slate-800 text-slate-400 border-slate-700'
                  }`}>{plan.badge}</span>
                </div>

                {/* Confidence score */}
                <div className={`flex items-center gap-3 p-3 rounded-lg border mb-3 ${
                  plan.confidenceScore >= 90
                    ? 'bg-emerald-500/8 border-emerald-500/25'
                    : 'bg-amber-500/8 border-amber-500/25'
                }`}>
                  <div className={`w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0 ${
                    plan.confidenceScore >= 90 ? 'bg-emerald-500/20 text-emerald-400' : 'bg-amber-500/20 text-amber-400'
                  }`}>
                    {plan.confidenceScore >= 90
                      ? <ShieldCheck size={15} />
                      : <ShieldAlert size={15} />
                    }
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center justify-between mb-1">
                      <p className={`text-xs font-semibold ${plan.confidenceScore >= 90 ? 'text-emerald-300' : 'text-amber-300'}`}>
                        Confidence Score — {plan.confidenceScore}%
                      </p>
                      <span className="text-[10px] text-slate-500">8 constraints</span>
                    </div>
                    <div className="h-1 bg-slate-800 rounded-full overflow-hidden">
                      <div
                        className={`h-full rounded-full ${plan.confidenceScore >= 90 ? 'bg-emerald-500/70' : 'bg-amber-500/70'}`}
                        style={{ width: `${plan.confidenceScore}%` }}
                      />
                    </div>
                  </div>
                </div>

                {/* Per-constraint breakdown (compact) */}
                {plan.confidenceBreakdown && (
                  <div className="grid grid-cols-4 gap-1 mb-3">
                    {plan.confidenceBreakdown.map((item) => (
                      <div key={item.constraint} className="text-center">
                        <div className={`text-[10px] font-bold ${item.score === 100 ? 'text-emerald-400' : item.score >= 70 ? 'text-amber-400' : 'text-red-400'}`}>
                          {item.score}%
                        </div>
                        <div className="text-[9px] text-slate-600 leading-tight truncate">{item.constraint.split(' ')[0]}</div>
                      </div>
                    ))}
                  </div>
                )}

                {/* Primary metrics row: Cost + SLA Score */}
                {(() => {
                  const sla = slaScoreStyle(plan.slaScore)
                  return (
                    <div className="grid grid-cols-2 gap-3 mb-3">
                      {/* Cost */}
                      <div className={`p-3 rounded-lg border ${plan.recommended ? 'bg-blue-500/8 border-blue-500/20' : 'bg-slate-800/50 border-slate-700'}`}>
                        <p className="text-[10px] text-slate-500 mb-0.5">Total Dispatch Cost</p>
                        <div className="flex items-baseline gap-1.5">
                          <p className="text-xl font-bold text-white">₹{plan.totalCost.toLocaleString('en-IN')}</p>
                          {plan.saving && <span className="text-xs text-emerald-400 font-semibold">-₹{plan.saving.toLocaleString('en-IN')}</span>}
                        </div>
                        <p className="text-[10px] text-slate-500 mt-0.5">{plan.vehicleCount} vehicles · {plan.orderCount} orders</p>
                        {!plan.recommended && <p className="text-[10px] text-red-400/70 mt-0.5">Risk-adj: ₹1,52,600</p>}
                      </div>

                      {/* SLA Score — primary */}
                      <div className={`p-3 rounded-lg border ${sla.bg} ${sla.border}`}>
                        <div className="flex items-center gap-1.5 mb-0.5">
                          <Target size={11} className={sla.color} />
                          <p className="text-[10px] text-slate-400">SLA Score</p>
                        </div>
                        <p className={`text-xl font-bold ${sla.color}`}>{plan.slaScore}%</p>
                        <div className="h-1 bg-slate-800/50 rounded-full overflow-hidden mt-1.5">
                          <div className={`h-full rounded-full ${sla.bar}`} style={{ width: `${plan.slaScore}%` }} />
                        </div>
                        <p className={`text-[10px] mt-1 ${sla.color} opacity-80`}>
                          {plan.slaScore >= 90 ? 'All corridors on-time' : plan.slaScore >= 70 ? 'Some corridors at risk' : 'Critical SLA risks'}
                        </p>
                      </div>
                    </div>
                  )
                })()}

                {/* Per-corridor SLA breakdown */}
                {plan.slaBreakdown && (
                  <div className="mb-4">
                    <p className="text-[10px] text-slate-500 font-semibold uppercase tracking-wide mb-2">SLA by Corridor</p>
                    <div className="space-y-1.5">
                      {plan.slaBreakdown.map((row) => {
                        const s = slaScoreStyle(row.score)
                        return (
                          <div key={row.corridor} className="flex items-center gap-2">
                            <span className="text-[10px] font-mono text-slate-400 w-20 flex-shrink-0">{row.corridor}</span>
                            <div className="flex-1 h-1.5 bg-slate-800 rounded-full overflow-hidden">
                              <div className={`h-full rounded-full ${s.bar}`} style={{ width: `${row.score}%` }} />
                            </div>
                            <span className={`text-[10px] font-bold w-8 text-right flex-shrink-0 ${s.color}`}>{row.score}%</span>
                            {row.score < 80 && (
                              <AlertTriangle size={9} className={s.color + ' flex-shrink-0'} />
                            )}
                          </div>
                        )
                      })}
                    </div>
                    {plan.slaBreakdown.some(r => r.score < 80) && (
                      <div className="mt-2 p-2 bg-red-500/8 border border-red-500/20 rounded-lg">
                        {plan.slaBreakdown.filter(r => r.score < 80).map(r => (
                          <p key={r.corridor} className="text-[10px] text-red-300/80 leading-relaxed">
                            <span className="font-semibold">{r.corridor}:</span> {r.note}
                          </p>
                        ))}
                      </div>
                    )}
                  </div>
                )}
              </div>

              {/* Vehicle list by corridor */}
              <div className="px-5 flex-1 overflow-y-auto" style={{ maxHeight: '340px' }}>
                {plan.corridors.map((corridor) => (
                  <div key={corridor.code} className="mb-3">
                    <p className="text-xs text-slate-500 font-medium mb-1.5">{corridor.name}</p>
                    <div className="space-y-1.5">
                      {corridor.vehicles.map((v) => {
                        const util = Math.round((v.weight / v.capacity) * 100)
                        const hasTrace = Boolean(reasoningTraces[`${plan.id}-${v.id}`])
                        return (
                          <div
                            key={v.id}
                            className={`bg-slate-800/40 rounded-md p-2.5 border-l-2 ${corridorColors[corridor.code] || 'border-l-slate-600'} ${
                              v.riskFlag ? 'border border-amber-600/20 border-l-amber-500' : ''
                            } ${hasTrace ? 'hover:bg-slate-800/60 transition-colors' : ''}`}
                          >
                            <div className="flex items-center justify-between">
                              <div className="flex items-center gap-2 min-w-0">
                                {vehicleIcon(v.type)}
                                <span className="text-xs font-bold text-white">{v.id}</span>
                                <span className="text-[10px] text-slate-500 truncate">{v.type}</span>
                                {v.urgent && <span className="text-[10px] px-1 py-0.5 rounded bg-red-500/20 text-red-300 border border-red-500/30 flex items-center gap-0.5 flex-shrink-0"><Siren size={8} />Urgent</span>}
                                {v.deferred && <span className="text-[10px] px-1 py-0.5 rounded bg-blue-500/20 text-blue-300 flex-shrink-0">Hold</span>}
                                {v.riskFlag && <span className="text-[10px] px-1 py-0.5 rounded bg-amber-500/20 text-amber-400 flex-shrink-0">Risk</span>}
                              </div>
                              <div className="flex items-center gap-1.5 flex-shrink-0">
                                <span className={`text-[10px] font-medium ${util > 80 ? 'text-emerald-400' : util < 40 ? 'text-amber-400' : 'text-slate-400'}`}>
                                  {util}%
                                </span>
                                {hasTrace && onOpenReasoning && (
                                  <button
                                    onClick={() => onOpenReasoning(plan.id, v.id)}
                                    className="flex items-center gap-0.5 text-[10px] px-1.5 py-0.5 rounded bg-blue-500/10 hover:bg-blue-500/20 text-blue-300 border border-blue-500/25 hover:border-blue-500/40 transition-colors font-medium"
                                    title={`View reasoning trace for ${v.id}`}
                                  >
                                    <Brain size={9} />
                                    Reasoning
                                    <ChevronRight size={9} />
                                  </button>
                                )}
                              </div>
                            </div>
                            <div className="flex items-center gap-3 mt-1 text-[10px] text-slate-500">
                              <span>{v.orders} orders</span>
                              <span>{v.weight}/{v.capacity} kg</span>
                              <span>{v.tempReq}</span>
                            </div>
                            {/* Util bar */}
                            <div className="h-0.5 bg-slate-700 rounded-full mt-1.5 overflow-hidden">
                              <div className={`h-full rounded-full ${util > 80 ? 'bg-emerald-500/60' : util < 40 ? 'bg-amber-500/60' : 'bg-slate-500/60'}`} style={{ width: `${util}%` }} />
                            </div>
                            <p className="text-[10px] text-slate-500 mt-1 truncate">{v.note}</p>
                          </div>
                        )
                      })}
                    </div>
                  </div>
                ))}
              </div>

              {/* Rationale + CTA */}
              <div className="p-5 pt-3 border-t border-slate-800 mt-auto">
                <div className="text-xs text-slate-400 leading-relaxed space-y-1.5 mb-4">
                  <p className="text-slate-300 font-medium">Agent rationale</p>
                  <p>{plan.rationale}</p>
                  {plan.risk && (
                    <div className="flex gap-1.5 text-amber-400/80">
                      <AlertTriangle size={10} className="flex-shrink-0 mt-0.5" />
                      <span>{plan.risk}</span>
                    </div>
                  )}
                </div>
                <button
                  onClick={() => onApprove(plan)}
                  className={`w-full py-2.5 rounded-lg text-sm font-semibold flex items-center justify-center gap-2 transition-colors ${
                    plan.recommended
                      ? 'bg-blue-600 hover:bg-blue-500 text-white shadow-lg shadow-blue-900/30'
                      : 'bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-700'
                  }`}
                >
                  <ThumbsUp size={13} />
                  Approve {plan.title} ({plan.vehicleCount} vehicles)
                  <ChevronRight size={13} />
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
