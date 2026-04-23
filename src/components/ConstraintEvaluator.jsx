import { useState, useMemo } from 'react'
import { constraintPrompt, constraintEvaluation } from '../data/mockData'
import {
  ChevronRight,
  CheckCircle,
  AlertTriangle,
  XCircle,
  Layers,
  Clock,
  Package,
  ArrowUpDown,
  Gauge,
  Calendar,
  UserCheck,
  Route,
  Zap,
  Sparkles,
  Info,
  MessageSquareQuote,
  PlusCircle,
  Pencil,
  Check,
  X,
  RotateCcw,
} from 'lucide-react'

const iconMap = {
  layers:      Layers,
  clock:       Clock,
  package:     Package,
  route:       Route,
  arrowupdown: ArrowUpDown,
  gauge:       Gauge,
  calendar:    Calendar,
  usercheck:   UserCheck,
}

const scoreStyle = (s) => {
  if (s >= 80) return { color: 'text-emerald-400', bg: 'bg-emerald-500/10', border: 'border-emerald-500/30', bar: 'bg-emerald-500/70', label: 'Well covered' }
  if (s >= 40) return { color: 'text-amber-400',   bg: 'bg-amber-500/10',   border: 'border-amber-500/30',   bar: 'bg-amber-500/70',   label: 'Partial' }
  return              { color: 'text-red-400',      bg: 'bg-red-500/10',     border: 'border-red-500/25',      bar: 'bg-red-500/60',     label: 'Not addressed' }
}

const overallColor = (s) => {
  if (s >= 80) return 'text-emerald-400'
  if (s >= 50) return 'text-amber-400'
  return 'text-red-400'
}

function ScoreRing({ score, size = 72, prev }) {
  const r = 28
  const circ = 2 * Math.PI * r
  const dash = (score / 100) * circ
  const prevDash = prev != null ? (prev / 100) * circ : null
  const col = score >= 80 ? 'stroke-emerald-400' : score >= 50 ? 'stroke-amber-400' : 'stroke-red-400'
  return (
    <svg width={size} height={size} viewBox="0 0 72 72" className="-rotate-90">
      <circle cx="36" cy="36" r={r} fill="none" stroke="currentColor" strokeWidth="6" className="text-slate-800" />
      {prevDash != null && (
        <circle cx="36" cy="36" r={r} fill="none" strokeWidth="6" strokeLinecap="round"
          strokeDasharray={`${prevDash} ${circ}`} className="stroke-slate-700" />
      )}
      <circle cx="36" cy="36" r={r} fill="none" strokeWidth="6" strokeLinecap="round"
        strokeDasharray={`${dash} ${circ}`} className={`${col} transition-all duration-700`} />
    </svg>
  )
}

export default function ConstraintEvaluator({ onRunAgent }) {
  const { overallScore, categories } = constraintEvaluation

  // Per-category state: null = untouched, 'accepted' = used suggestion, 'edited' = custom text, 'dismissed' = skipped
  const [catStates, setCatStates] = useState(() =>
    Object.fromEntries(categories.map((c) => [c.id, { status: null, text: c.suggestionText || '' }]))
  )
  const [editingId, setEditingId] = useState(null)
  const [editDraft, setEditDraft] = useState('')

  const gappedCats = categories.filter((c) => c.gaps.length > 0)

  // Compute live overall score
  const liveScore = useMemo(() => {
    const scores = categories.map((cat) => {
      const st = catStates[cat.id]
      if (st.status === 'accepted' || st.status === 'edited') return cat.resolvedScore
      return cat.score
    })
    return Math.round(scores.reduce((a, b) => a + b, 0) / scores.length)
  }, [catStates, categories])

  const acceptedCount = Object.values(catStates).filter((s) => s.status === 'accepted' || s.status === 'edited').length

  // Build refined prompt
  const refinedPrompt = useMemo(() => {
    const additions = categories
      .filter((c) => {
        const st = catStates[c.id]
        return (st.status === 'accepted' || st.status === 'edited') && st.text
      })
      .map((c) => catStates[c.id].text)
    if (additions.length === 0) return constraintPrompt
    return constraintPrompt + ' ' + additions.join(' ')
  }, [catStates, categories])

  const handleAccept = (cat) => {
    setCatStates((prev) => ({
      ...prev,
      [cat.id]: { status: 'accepted', text: cat.suggestionText },
    }))
  }

  const handleStartEdit = (cat) => {
    setEditDraft(catStates[cat.id].text || cat.suggestionText || '')
    setEditingId(cat.id)
  }

  const handleSaveEdit = (id) => {
    setCatStates((prev) => ({
      ...prev,
      [id]: { status: 'edited', text: editDraft.trim() },
    }))
    setEditingId(null)
  }

  const handleReset = (id) => {
    setCatStates((prev) => ({
      ...prev,
      [id]: { status: null, text: categories.find((c) => c.id === id)?.suggestionText || '' },
    }))
    if (editingId === id) setEditingId(null)
  }

  return (
    <div className="p-6">
      <div className="max-w-6xl">

        {/* ── Header ── */}
        <div className="flex items-start justify-between mb-5">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-violet-500/20 border border-violet-500/30 flex items-center justify-center">
              <Sparkles size={16} className="text-violet-400" />
            </div>
            <div>
              <h1 className="text-xl font-semibold text-white">Constraint Evaluation</h1>
              <p className="text-sm text-slate-400 mt-0.5">
                Agent scored your prompt — review gaps and refine before optimising
              </p>
            </div>
          </div>
        </div>

        {/* ── Submitted prompt ── */}
        <div className="mb-5 bg-slate-900 border border-slate-700/60 rounded-xl p-4">
          <div className="flex items-center gap-2 mb-2">
            <MessageSquareQuote size={12} className="text-slate-500" />
            <span className="text-[10px] font-semibold text-slate-500 uppercase tracking-widest">Submitted Prompt</span>
          </div>
          <p className="text-sm text-slate-300 leading-relaxed">{constraintPrompt}</p>
        </div>

        {/* ── Score header strip ── */}
        <div className="mb-6 flex items-center gap-5 p-4 bg-slate-900 border border-slate-800 rounded-xl">
          <div className="relative flex-shrink-0">
            <ScoreRing score={liveScore} prev={liveScore !== overallScore ? overallScore : null} />
            <div className="absolute inset-0 flex flex-col items-center justify-center">
              <span className={`text-lg font-bold leading-none transition-colors duration-500 ${overallColor(liveScore)}`}>
                {liveScore}%
              </span>
              <span className="text-[9px] text-slate-500 mt-0.5">complete</span>
            </div>
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-semibold text-white mb-1">
              {liveScore >= 90
                ? 'Fully specified — agent has complete context to optimise'
                : liveScore >= 60
                ? 'Good coverage — a few gaps remain, agent will infer defaults'
                : 'Several constraint categories are missing — agent will use defaults'}
            </p>
            <div className="flex items-center gap-4 text-xs">
              <span className="flex items-center gap-1.5 text-emerald-400">
                <CheckCircle size={11} />
                {categories.filter((c) => {
                  const st = catStates[c.id]
                  const s = (st.status === 'accepted' || st.status === 'edited') ? c.resolvedScore : c.score
                  return s >= 80
                }).length} well covered
              </span>
              <span className="flex items-center gap-1.5 text-amber-400">
                <AlertTriangle size={11} />
                {categories.filter((c) => {
                  const st = catStates[c.id]
                  const s = (st.status === 'accepted' || st.status === 'edited') ? c.resolvedScore : c.score
                  return s >= 40 && s < 80
                }).length} partial
              </span>
              <span className="flex items-center gap-1.5 text-red-400">
                <XCircle size={11} />
                {categories.filter((c) => {
                  const st = catStates[c.id]
                  const s = (st.status === 'accepted' || st.status === 'edited') ? c.resolvedScore : c.score
                  return s < 40
                }).length} not addressed
              </span>
            </div>
          </div>

          {/* Mini bar chart */}
          <div className="hidden lg:grid grid-cols-8 gap-1.5 w-64 flex-shrink-0">
            {categories.map((cat) => {
              const st = catStates[cat.id]
              const s = (st.status === 'accepted' || st.status === 'edited') ? cat.resolvedScore : cat.score
              const { bar } = scoreStyle(s)
              return (
                <div key={cat.id} className="flex flex-col items-center gap-1">
                  <div className="w-full h-8 bg-slate-800 rounded-sm overflow-hidden flex flex-col-reverse">
                    <div className={`w-full ${bar} rounded-sm transition-all duration-700`} style={{ height: `${s}%` }} />
                  </div>
                  <span className="text-[9px] text-slate-600">{cat.id}</span>
                </div>
              )
            })}
          </div>
        </div>

        {/* ── Category cards ── */}
        <div className="grid grid-cols-2 gap-4 mb-5">
          {categories.map((cat) => {
            const Icon = iconMap[cat.icon] || Info
            const st = catStates[cat.id]
            const effectiveScore = (st.status === 'accepted' || st.status === 'edited') ? cat.resolvedScore : cat.score
            const { color, bg, border, bar, label } = scoreStyle(effectiveScore)
            const hasGaps = cat.gaps.length > 0
            const isResolved = st.status === 'accepted' || st.status === 'edited'
            const isEditing = editingId === cat.id

            return (
              <div
                key={cat.id}
                className={`bg-slate-900 border rounded-xl p-4 transition-colors duration-300 ${
                  isResolved ? 'border-emerald-500/30' : border
                }`}
              >
                {/* Card header */}
                <div className="flex items-center justify-between mb-2.5">
                  <div className="flex items-center gap-2.5">
                    <div className={`w-7 h-7 rounded-lg flex items-center justify-center flex-shrink-0 ${bg} ${color}`}>
                      <Icon size={13} />
                    </div>
                    <div>
                      <span className="text-[10px] text-slate-600 font-medium">#{cat.id}</span>
                      <p className="text-xs font-semibold text-white leading-tight">{cat.name}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    {isResolved && (
                      <button
                        onClick={() => handleReset(cat.id)}
                        className="text-[10px] text-slate-600 hover:text-slate-400 flex items-center gap-0.5 transition-colors"
                      >
                        <RotateCcw size={9} /> undo
                      </button>
                    )}
                    <div className="text-right">
                      <p className={`text-sm font-bold ${color} transition-colors duration-500`}>{effectiveScore}%</p>
                      <p className={`text-[10px] ${color} opacity-70`}>{label}</p>
                    </div>
                  </div>
                </div>

                {/* Score bar */}
                <div className="h-1 bg-slate-800 rounded-full overflow-hidden mb-3">
                  <div className={`h-full rounded-full ${bar} transition-all duration-700`} style={{ width: `${effectiveScore}%` }} />
                </div>

                {/* Detected */}
                {cat.detected.length > 0 && (
                  <div className="mb-2.5">
                    <p className="text-[10px] font-semibold text-slate-500 uppercase tracking-wide mb-1.5">Found in prompt</p>
                    <div className="space-y-1">
                      {cat.detected.map((item, i) => (
                        <div key={i} className="flex items-start gap-1.5">
                          <CheckCircle size={10} className="text-emerald-400 flex-shrink-0 mt-0.5" />
                          <span className="text-[11px] text-slate-300 leading-tight">{item}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Gaps */}
                {hasGaps && !isResolved && (
                  <div className="mb-3">
                    <p className="text-[10px] font-semibold text-slate-500 uppercase tracking-wide mb-1.5">Gaps</p>
                    <div className="space-y-1">
                      {cat.gaps.map((gap, i) => (
                        <div key={i} className="flex items-start gap-1.5">
                          <AlertTriangle size={10} className="text-amber-400/80 flex-shrink-0 mt-0.5" />
                          <span className="text-[11px] text-slate-400 leading-tight">{gap}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* ── Suggestion area ── */}
                {hasGaps && cat.suggestionText && (
                  <>
                    {/* RESOLVED state */}
                    {isResolved && (
                      <div className="p-2.5 bg-emerald-500/8 border border-emerald-500/25 rounded-lg">
                        <div className="flex items-center gap-1.5 mb-1.5">
                          <CheckCircle size={11} className="text-emerald-400 flex-shrink-0" />
                          <span className="text-[10px] font-semibold text-emerald-400">
                            {st.status === 'edited' ? 'Custom addition applied' : 'Suggestion applied'}
                          </span>
                        </div>
                        <p className="text-[11px] text-emerald-300/80 leading-relaxed italic">{st.text}</p>
                      </div>
                    )}

                    {/* EDITING state */}
                    {!isResolved && isEditing && (
                      <div className="mt-1">
                        <p className="text-[10px] font-semibold text-slate-500 uppercase tracking-wide mb-1.5">Edit suggestion</p>
                        <textarea
                          value={editDraft}
                          onChange={(e) => setEditDraft(e.target.value)}
                          rows={3}
                          className="w-full bg-slate-800 border border-blue-500/40 focus:border-blue-400/60 focus:ring-1 focus:ring-blue-500/20 rounded-lg px-3 py-2 text-[11px] text-slate-200 leading-relaxed resize-none outline-none transition-colors"
                          autoFocus
                        />
                        <div className="flex items-center gap-2 mt-1.5">
                          <button
                            onClick={() => handleSaveEdit(cat.id)}
                            className="flex items-center gap-1 px-2.5 py-1 bg-emerald-600 hover:bg-emerald-500 text-white text-[11px] font-semibold rounded-md transition-colors"
                          >
                            <Check size={10} /> Apply
                          </button>
                          <button
                            onClick={() => setEditingId(null)}
                            className="flex items-center gap-1 px-2.5 py-1 bg-slate-800 hover:bg-slate-700 text-slate-400 text-[11px] rounded-md transition-colors border border-slate-700"
                          >
                            <X size={10} /> Cancel
                          </button>
                        </div>
                      </div>
                    )}

                    {/* DEFAULT state — show suggestion with actions */}
                    {!isResolved && !isEditing && (
                      <div className="mt-1 p-2.5 bg-blue-500/8 border border-blue-500/20 rounded-lg">
                        <p className="text-[10px] font-semibold text-blue-400/80 uppercase tracking-wide mb-1.5">Suggested addition</p>
                        <p className="text-[11px] text-blue-200/80 leading-relaxed italic mb-2.5">{cat.suggestionText}</p>
                        <div className="flex items-center gap-2">
                          <button
                            onClick={() => handleAccept(cat)}
                            className="flex items-center gap-1.5 px-2.5 py-1.5 bg-blue-600 hover:bg-blue-500 text-white text-[11px] font-semibold rounded-md transition-colors"
                          >
                            <PlusCircle size={10} />
                            Add to prompt
                          </button>
                          <button
                            onClick={() => handleStartEdit(cat)}
                            className="flex items-center gap-1.5 px-2.5 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-300 text-[11px] rounded-md transition-colors border border-slate-700"
                          >
                            <Pencil size={10} />
                            Edit first
                          </button>
                        </div>
                      </div>
                    )}
                  </>
                )}

                {/* Perfect score — no gaps */}
                {!hasGaps && (
                  <div className="flex items-center gap-1.5 text-[11px] text-emerald-400/70 mt-1">
                    <CheckCircle size={10} />
                    Fully specified — no additions needed
                  </div>
                )}
              </div>
            )
          })}
        </div>

        {/* ── Refined prompt + CTA ── */}
        <div className={`rounded-xl border p-4 transition-colors duration-500 ${
          acceptedCount > 0 ? 'bg-slate-900 border-emerald-500/30' : 'bg-slate-900 border-slate-800'
        }`}>
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <Sparkles size={13} className={acceptedCount > 0 ? 'text-emerald-400' : 'text-slate-500'} />
              <p className="text-xs font-semibold text-white">
                {acceptedCount > 0 ? `Refined Prompt — ${acceptedCount} addition${acceptedCount > 1 ? 's' : ''} applied` : 'Refined Prompt'}
              </p>
              {acceptedCount > 0 && (
                <span className={`text-xs font-bold ${overallColor(liveScore)}`}>
                  {liveScore}% coverage
                </span>
              )}
            </div>
            <button
              onClick={() => onRunAgent(refinedPrompt)}
              className={`flex items-center gap-2 px-5 py-2.5 text-white text-sm font-semibold rounded-lg transition-all ${
                acceptedCount > 0
                  ? 'bg-emerald-600 hover:bg-emerald-500 shadow-lg shadow-emerald-900/30'
                  : 'bg-blue-600 hover:bg-blue-500 shadow-lg shadow-blue-900/30'
              }`}
            >
              <Zap size={14} fill="currentColor" />
              {acceptedCount > 0 ? 'Run with Refined Prompt' : 'Run Optimisation anyway'}
              <ChevronRight size={14} />
            </button>
          </div>

          <div className={`rounded-lg px-4 py-3 text-sm leading-relaxed transition-colors duration-500 ${
            acceptedCount > 0 ? 'bg-emerald-500/5 border border-emerald-500/15' : 'bg-slate-800/50 border border-slate-700/50'
          }`}>
            <span className="text-slate-300">{constraintPrompt}</span>
            {categories.map((cat) => {
              const st = catStates[cat.id]
              if ((st.status === 'accepted' || st.status === 'edited') && st.text) {
                return (
                  <span key={cat.id}>
                    {' '}
                    <span className="text-emerald-300 bg-emerald-500/15 rounded px-0.5">{st.text}</span>
                  </span>
                )
              }
              return null
            })}
          </div>

          {acceptedCount === 0 && (
            <p className="text-[11px] text-slate-600 mt-2">
              Apply suggestions above to refine the prompt before running — or proceed with the original.
            </p>
          )}
        </div>

      </div>
    </div>
  )
}
