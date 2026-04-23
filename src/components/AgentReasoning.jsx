import { useState, useEffect } from 'react'
import { reasoningSteps } from '../data/mockData'
import {
  Search,
  Layers,
  AlertTriangle,
  Snowflake,
  Truck,
  PackageCheck,
  LayoutGrid,
  Clock,
  Sparkles,
  CheckCircle,
  ChevronRight,
  Brain,
  CalendarDays,
  UserCheck,
  ArrowUpDown,
  MessageSquareQuote,
  Siren,
} from 'lucide-react'

const iconMap = {
  scan:          Search,
  group:         Layers,
  hazmat:        AlertTriangle,
  cold:          Snowflake,
  vehicle:       Truck,
  consolidation: PackageCheck,
  load2d:        LayoutGrid,
  pullpush:      ArrowUpDown,
  complete:      Sparkles,
  eta:           Clock,
  holiday:       CalendarDays,
  hos:           UserCheck,
  urgent:        Siren,
}

const cardStyles = {
  ok: 'border-slate-700/60 bg-slate-800/40',
  warn: 'border-amber-600/40 bg-amber-500/5',
  highlight: 'border-blue-500/50 bg-blue-500/8 ring-1 ring-blue-500/20',
}

const iconBgStyles = {
  ok: 'bg-slate-700/80 text-slate-300',
  warn: 'bg-amber-500/20 text-amber-400',
  highlight: 'bg-blue-500/20 text-blue-400',
}

export default function AgentReasoning({ onComplete, refinedPrompt }) {
  const [visibleCount, setVisibleCount] = useState(0)
  const [isDone, setIsDone] = useState(false)

  useEffect(() => {
    const interval = setInterval(() => {
      setVisibleCount((prev) => {
        if (prev >= reasoningSteps.length) {
          clearInterval(interval)
          setTimeout(() => setIsDone(true), 500)
          return prev
        }
        return prev + 1
      })
    }, 1100)
    return () => clearInterval(interval)
  }, [])

  return (
    <div className="p-8">
      <div className="max-w-2xl">
        {/* Header */}
        <div className="flex items-center gap-3 mb-6">
          <div className="w-9 h-9 rounded-xl bg-blue-500/20 border border-blue-500/30 flex items-center justify-center">
            <Brain size={17} className="text-blue-400" />
          </div>
          <div className="flex-1">
            <h1 className="text-xl font-semibold text-white">Agent Reasoning</h1>
            <p className="text-sm text-slate-400 mt-0.5">
              {isDone
                ? 'All 8 constraints evaluated — 2 dispatch plans with confidence scores ready'
                : 'Evaluating 8 constraint categories — orders, drivers, calendar, load configurations…'}
            </p>
          </div>
          {!isDone && (
            <div className="flex items-center gap-1.5 text-xs text-blue-400">
              <span className="w-1.5 h-1.5 bg-blue-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
              <span className="w-1.5 h-1.5 bg-blue-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
              <span className="w-1.5 h-1.5 bg-blue-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
            </div>
          )}
        </div>

        {/* Refined prompt context */}
        {refinedPrompt && (
          <div className="mb-5 bg-emerald-500/5 border border-emerald-500/25 rounded-xl p-3.5">
            <div className="flex items-center gap-2 mb-2">
              <MessageSquareQuote size={11} className="text-emerald-400/70 flex-shrink-0" />
              <span className="text-[10px] font-semibold text-emerald-400/70 uppercase tracking-widest">Optimising against refined prompt</span>
            </div>
            <p className="text-xs text-emerald-300/70 leading-relaxed line-clamp-3">{refinedPrompt}</p>
          </div>
        )}

        {/* Steps */}
        <div className="space-y-2.5">
          {reasoningSteps.slice(0, visibleCount).map((step) => {
            const Icon = iconMap[step.type] || Search
            const isPullPush = step.type === 'pullpush'
            const isConsolidation = step.type === 'consolidation'
            return (
              <div
                key={step.id}
                className={`border rounded-xl p-4 fade-in-up ${cardStyles[step.status]}`}
              >
                <div className="flex items-start gap-3">
                  <div className={`w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0 ${iconBgStyles[step.status]}`}>
                    <Icon size={14} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="text-xs text-slate-500 font-medium">{step.label}</span>
                      {step.status === 'warn' && (
                        <span className="text-xs px-1.5 py-0.5 rounded bg-amber-500/20 text-amber-400 font-medium">
                          Isolation Required
                        </span>
                      )}
                      {isPullPush && (
                        <span className="text-xs px-1.5 py-0.5 rounded bg-blue-500/20 text-blue-300 font-medium">
                          Hold Decision
                        </span>
                      )}
                      {isConsolidation && (
                        <span className="text-xs px-1.5 py-0.5 rounded bg-blue-500/20 text-blue-300 font-medium">
                          Hypothesis Test
                        </span>
                      )}
                    </div>
                    <p
                      className={`text-sm font-semibold mt-0.5 ${
                        step.status === 'highlight'
                          ? 'text-blue-200'
                          : step.status === 'warn'
                          ? 'text-amber-200'
                          : 'text-white'
                      }`}
                    >
                      {step.text}
                    </p>
                    <p className="text-xs text-slate-400 mt-1.5 leading-relaxed">{step.detail}</p>
                  </div>
                  <div className="flex-shrink-0 mt-1">
                    {step.type === 'complete' ? (
                      <CheckCircle size={15} className="text-emerald-400" />
                    ) : (
                      <div className="w-3.5 h-3.5 rounded-full bg-emerald-500/20 flex items-center justify-center">
                        <div className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
                      </div>
                    )}
                  </div>
                </div>
              </div>
            )
          })}
        </div>

        {/* Done CTA */}
        {isDone && (
          <div className="mt-5 flex items-center justify-between p-4 bg-emerald-500/10 border border-emerald-500/30 rounded-xl fade-in-up">
            <div>
              <p className="text-sm font-semibold text-emerald-300">Load optimisation complete</p>
              <p className="text-xs text-emerald-400/70 mt-0.5">
                2 plans generated — Plan A (94% confidence, full compliance) vs Plan B (67% confidence, risk-accepted)
              </p>
            </div>
            <button
              onClick={onComplete}
              className="flex items-center gap-2 px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white text-sm font-semibold rounded-lg transition-colors"
            >
              Review Plans
              <ChevronRight size={14} />
            </button>
          </div>
        )}
      </div>
    </div>
  )
}
