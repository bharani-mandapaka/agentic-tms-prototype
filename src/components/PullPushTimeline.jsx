import { useState, useMemo } from 'react'
import {
  Clock,
  GripVertical,
  Lock,
  AlertTriangle,
  RotateCcw,
  Sparkles,
  ChevronUp,
  ChevronDown,
} from 'lucide-react'
import {
  timelineOrders,
  TIMELINE_DAYS,
  timelineScenarios,
  timelineBaseline,
} from '../data/mockDataV2'

const priorityStyle = (p) => {
  if (p === 'P0') return { bg: 'bg-rose-500/15',  border: 'border-rose-500/40',  text: 'text-rose-200',  dot: 'bg-rose-400',  label: 'P0' }
  if (p === 'P1') return { bg: 'bg-amber-500/15', border: 'border-amber-500/40', text: 'text-amber-200', dot: 'bg-amber-400', label: 'P1' }
  if (p === 'P2') return { bg: 'bg-blue-500/15',  border: 'border-blue-500/40',  text: 'text-blue-200',  dot: 'bg-blue-400',  label: 'P2' }
  return                 { bg: 'bg-slate-700/40', border: 'border-slate-600/50', text: 'text-slate-200', dot: 'bg-slate-400', label: 'P3' }
}

export default function PullPushTimeline() {
  const [positions, setPositions] = useState(() => {
    const map = {}
    timelineOrders.forEach((o) => { map[o.id] = o.deliveryDate })
    return map
  })
  const [draggingId, setDraggingId] = useState(null)
  const [hoverDay, setHoverDay] = useState(null)
  const [isReplanning, setIsReplanning] = useState(false)
  const [activeScenario, setActiveScenario] = useState(null)
  const [collapsed, setCollapsed] = useState(false)

  const ordersByDay = useMemo(() => {
    const groups = Object.fromEntries(TIMELINE_DAYS.map((d) => [d, []]))
    timelineOrders.forEach((o) => {
      const day = positions[o.id]
      if (groups[day]) groups[day].push(o)
    })
    // Sort within day: P0 → P3, then by id
    Object.values(groups).forEach((list) =>
      list.sort((a, b) => a.priority.localeCompare(b.priority) || a.id.localeCompare(b.id))
    )
    return groups
  }, [positions])

  const isMutated = timelineOrders.some((o) => positions[o.id] !== o.deliveryDate)

  const handleDragStart = (e, order) => {
    if (order.fixed) { e.preventDefault(); return }
    setDraggingId(order.id)
    e.dataTransfer.effectAllowed = 'move'
    e.dataTransfer.setData('text/plain', order.id)
  }

  const handleDragOver = (e, day) => {
    e.preventDefault()
    e.dataTransfer.dropEffect = 'move'
    if (hoverDay !== day) setHoverDay(day)
  }

  const handleDrop = (e, day) => {
    e.preventDefault()
    const id = draggingId || e.dataTransfer.getData('text/plain')
    setHoverDay(null)
    setDraggingId(null)
    if (!id) return
    const order = timelineOrders.find((o) => o.id === id)
    if (!order || order.fixed) return
    if (positions[id] === day) return

    setPositions((prev) => ({ ...prev, [id]: day }))
    const key = `${id}:${day}`
    setIsReplanning(true)
    setActiveScenario(null)
    setTimeout(() => {
      setIsReplanning(false)
      setActiveScenario(
        timelineScenarios[key] || {
          summary: `Moved ${order.id} to ${day}. No meaningful consolidation change.`,
          changes: [
            'Shift fell within existing buffer — same truck assignment, same cost.',
            'Agent re-evaluated all 8 constraints. No binding constraints triggered.',
          ],
          costDelta: 0,
          trucksBefore: timelineBaseline.trucksRequired,
          trucksAfter: timelineBaseline.trucksRequired,
          utilBefore: timelineBaseline.avgUtilisation,
          utilAfter: timelineBaseline.avgUtilisation,
          slaWarning: null,
        }
      )
    }, 700)
  }

  const handleReset = () => {
    const map = {}
    timelineOrders.forEach((o) => { map[o.id] = o.deliveryDate })
    setPositions(map)
    setActiveScenario(null)
    setIsReplanning(false)
  }

  return (
    <div className="mb-5 bg-slate-900 border border-slate-800 rounded-xl overflow-hidden">
      {/* Header */}
      <div className="px-4 py-2.5 border-b border-slate-800 flex items-center justify-between">
        <div className="flex items-center gap-2 min-w-0">
          <Clock size={13} className="text-blue-400 flex-shrink-0" />
          <p className="text-sm font-semibold text-white">Order Timeline</p>
          <span className="text-[11px] text-slate-500 truncate">
            Drag to re-optimise · SLA anchor marked per order · P0 (locked) cannot move
          </span>
          {isMutated && (
            <span className="text-[10px] px-1.5 py-0.5 rounded-full bg-amber-500/20 text-amber-300 border border-amber-500/30 font-semibold flex-shrink-0">
              Modified
            </span>
          )}
        </div>
        <div className="flex items-center gap-2 flex-shrink-0">
          {isMutated && (
            <button
              onClick={handleReset}
              className="flex items-center gap-1 text-[11px] text-slate-400 hover:text-white px-2 py-1 rounded border border-slate-700 hover:border-slate-600 transition-colors"
            >
              <RotateCcw size={10} /> Reset
            </button>
          )}
          <button
            onClick={() => setCollapsed((v) => !v)}
            className="p-1 rounded hover:bg-slate-800 text-slate-400 hover:text-white"
            title={collapsed ? 'Expand' : 'Collapse'}
          >
            {collapsed ? <ChevronDown size={13} /> : <ChevronUp size={13} />}
          </button>
        </div>
      </div>

      {!collapsed && (
        <>
          {/* Timeline grid */}
          <div className="grid grid-cols-5 gap-0 border-b border-slate-800">
            {TIMELINE_DAYS.map((day) => {
              const isHover = hoverDay === day && draggingId
              const isToday = day === 'Today'
              const list = ordersByDay[day] || []
              return (
                <div
                  key={day}
                  onDragOver={(e) => handleDragOver(e, day)}
                  onDragLeave={() => setHoverDay((h) => (h === day ? null : h))}
                  onDrop={(e) => handleDrop(e, day)}
                  className={`border-r border-slate-800 last:border-r-0 p-2.5 min-h-[170px] transition-colors ${
                    isHover ? 'bg-blue-500/10 ring-1 ring-inset ring-blue-500/40' : 'bg-slate-950/30'
                  }`}
                >
                  <div className="flex items-center justify-between mb-2">
                    <p className={`text-[10px] font-semibold uppercase tracking-widest ${isToday ? 'text-white' : 'text-slate-500'}`}>
                      {day}
                    </p>
                    <span className="text-[10px] text-slate-600 font-mono">{list.length}</span>
                  </div>
                  <div className="space-y-1">
                    {list.map((o) => {
                      const style = priorityStyle(o.priority)
                      const isBeingDragged = draggingId === o.id
                      const isShifted = positions[o.id] !== o.deliveryDate
                      const slaIdx = TIMELINE_DAYS.indexOf(o.slaDate)
                      const currIdx = TIMELINE_DAYS.indexOf(positions[o.id])
                      const pastSla = slaIdx !== -1 && currIdx > slaIdx
                      const dragDisabled = o.fixed
                      return (
                        <div
                          key={o.id}
                          draggable={!dragDisabled}
                          onDragStart={(e) => handleDragStart(e, o)}
                          onDragEnd={() => { setDraggingId(null); setHoverDay(null) }}
                          className={`text-[10px] px-1.5 py-1 rounded border transition-all select-none ${
                            pastSla
                              ? 'bg-rose-500/25 border-rose-500/60 text-rose-100 ring-1 ring-rose-500/40'
                              : `${style.bg} ${style.border} ${style.text}`
                          } ${dragDisabled ? 'cursor-not-allowed opacity-80' : 'cursor-grab active:cursor-grabbing hover:brightness-125'} ${
                            isBeingDragged ? 'opacity-30' : ''
                          } ${isShifted && !pastSla ? 'ring-1 ring-amber-400/40' : ''}`}
                          title={`${o.id} · ${o.material} · ${o.customerTier} · SLA ${o.slaDate}${o.fixed ? ' · Fixed (P0)' : ''}`}
                        >
                          <div className="flex items-center gap-1">
                            {dragDisabled
                              ? <Lock size={8} className="flex-shrink-0 opacity-70" />
                              : <GripVertical size={8} className="opacity-50 flex-shrink-0" />}
                            <span className="font-mono font-semibold flex-1 truncate">
                              {o.id.replace('ORD-', '#')}
                            </span>
                            <span className="text-[8px] opacity-70">{style.label}</span>
                            <span className={`w-1 h-1 rounded-full ${style.dot} flex-shrink-0`} />
                          </div>
                          <div className="flex items-center justify-between mt-0.5 pl-2.5">
                            <span className="truncate opacity-80 text-[9.5px]">{o.material}</span>
                            {pastSla && <AlertTriangle size={8} className="text-rose-200 flex-shrink-0" />}
                          </div>
                          <div className="pl-2.5 text-[9px] text-slate-500 flex items-center gap-1">
                            <span>SLA · {o.slaDate}</span>
                            {isShifted && !pastSla && <span className="text-amber-400">• shifted</span>}
                          </div>
                        </div>
                      )
                    })}
                    {list.length === 0 && (
                      <div className="text-[10px] text-slate-700 italic text-center py-4 border border-dashed border-slate-800 rounded">
                        Drop here
                      </div>
                    )}
                  </div>
                </div>
              )
            })}
          </div>

          {/* Callout: Re-optimisation result */}
          <div className="px-4 py-3 bg-slate-950/40 min-h-[56px]">
            {isReplanning ? (
              <div className="flex items-center gap-2 text-xs text-blue-300">
                <div className="w-3 h-3 rounded-full border-2 border-blue-400/30 border-t-blue-400 animate-spin" />
                <span>Re-reasoning through 8 constraints...</span>
              </div>
            ) : activeScenario ? (
              <div className="space-y-2">
                {activeScenario.slaWarning && (
                  <div className="px-3 py-2 bg-rose-500/10 border border-rose-500/30 rounded-lg flex items-start gap-2">
                    <AlertTriangle size={12} className="text-rose-400 flex-shrink-0 mt-0.5" />
                    <p className="text-[11px] text-rose-200 leading-relaxed font-medium">
                      {activeScenario.slaWarning}
                    </p>
                  </div>
                )}
                <div className="flex items-start gap-3">
                  <div className="w-6 h-6 rounded-md bg-blue-500/20 flex items-center justify-center flex-shrink-0">
                    <Sparkles size={11} className="text-blue-300" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-xs font-semibold text-white mb-1">{activeScenario.summary}</p>
                    <div className="space-y-0.5">
                      {activeScenario.changes.map((c, i) => (
                        <p key={i} className="text-[11px] text-slate-300 leading-relaxed">
                          <span className="text-slate-600">·</span> {c}
                        </p>
                      ))}
                    </div>
                  </div>
                  <div className="flex items-center gap-4 text-[11px] flex-shrink-0 pt-0.5">
                    <div className="text-center">
                      <p className="text-slate-500 text-[10px] uppercase tracking-wide">Cost</p>
                      <p className={`font-semibold ${
                        activeScenario.costDelta < 0 ? 'text-emerald-400'
                        : activeScenario.costDelta > 0 ? 'text-rose-400'
                        : 'text-slate-400'
                      }`}>
                        {activeScenario.costDelta === 0
                          ? 'No change'
                          : `${activeScenario.costDelta > 0 ? '+' : '-'}₹${Math.abs(activeScenario.costDelta).toLocaleString('en-IN')}`}
                      </p>
                    </div>
                    <div className="text-center">
                      <p className="text-slate-500 text-[10px] uppercase tracking-wide">Trucks</p>
                      <p className="font-semibold text-white font-mono">
                        {activeScenario.trucksBefore} → {activeScenario.trucksAfter}
                      </p>
                    </div>
                    <div className="text-center">
                      <p className="text-slate-500 text-[10px] uppercase tracking-wide">Util</p>
                      <p className="font-semibold text-white font-mono">
                        {activeScenario.utilBefore}% → {activeScenario.utilAfter}%
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            ) : (
              <p className="text-[11px] text-slate-500 leading-relaxed">
                <span className="text-slate-400 font-medium">Baseline</span> ·{' '}
                {timelineBaseline.trucksRequired} trucks · ₹{timelineBaseline.totalCost.toLocaleString('en-IN')} ·{' '}
                {timelineBaseline.avgUtilisation}% avg util. Try dragging{' '}
                <span className="text-blue-300 font-mono">#5504</span> (Garments, P3) from Day+2 to Day+3
                to see consolidation save a truck.
              </p>
            )}
          </div>
        </>
      )}
    </div>
  )
}
