import { loadPlans, compactLoadSummaries, categoryConfig } from '../data/mockData'
import {
  ChevronRight,
  ArrowDown,
  RotateCcw,
  Clock,
  LayoutGrid,
  Truck,
  Snowflake,
  AlertTriangle,
  MapPin,
  Navigation,
  Siren,
} from 'lucide-react'

const vehicleIcon = (type) => {
  if (type.includes('Reefer')) return <Snowflake size={11} className="text-sky-400" />
  if (type.includes('Hazmat')) return <AlertTriangle size={11} className="text-red-400" />
  if (type.includes('Insulated')) return <Snowflake size={11} className="text-blue-400" />
  return <Truck size={11} className="text-slate-400" />
}

export default function LoadVisualisation({ plan, onContinue }) {
  return (
    <div className="p-6">
      <div className="max-w-6xl">
        {/* Header */}
        <div className="flex items-center justify-between mb-5">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-emerald-500/20 border border-emerald-500/30 flex items-center justify-center">
              <LayoutGrid size={16} className="text-emerald-400" />
            </div>
            <div>
              <h1 className="text-xl font-semibold text-white">
                2D Load Plans — {plan?.title || 'Plan A'}
              </h1>
              <p className="text-sm text-slate-400 mt-0.5">
                12 vehicles · Detailed layout for 6 key vehicles · Pick sequences aligned with drop order
              </p>
            </div>
          </div>
          <button
            onClick={onContinue}
            className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white text-sm font-semibold rounded-lg transition-colors"
          >
            Proceed to Execution
            <ChevronRight size={14} />
          </button>
        </div>

        {/* Detailed load plans grid */}
        <div className="grid grid-cols-3 gap-4 mb-5">
          {loadPlans.map((lp) => {
            const weightPct = Math.round((lp.totalWeight / lp.truckBed.weightCap) * 100)
            const fpPct = Math.round((lp.totalFootprint / lp.truckBed.footprintCap) * 100)
            return (
              <div
                key={lp.vehicleId}
                className={`bg-slate-900 border rounded-xl p-4 ${
                  lp.isDeferred ? 'border-blue-500/20 opacity-50' : 'border-slate-800'
                }`}
              >
                {/* Vehicle header */}
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-bold text-white">{lp.vehicleId}</span>
                    <span className="text-[10px] text-slate-500">{lp.vehicleType}</span>
                    {lp.urgent && (
                      <span className="text-[9px] px-1.5 py-0.5 rounded bg-red-500/20 text-red-300 border border-red-500/30 flex items-center gap-0.5 font-semibold">
                        <Siren size={8} />URGENT
                      </span>
                    )}
                  </div>
                  <span className="text-[10px] text-slate-400">{lp.destination}</span>
                </div>

                {/* Util bars (compact) */}
                <div className="grid grid-cols-2 gap-2 mb-3">
                  <div>
                    <div className="flex justify-between text-[10px] mb-0.5">
                      <span className="text-slate-500">Wt</span>
                      <span className={weightPct < 40 ? 'text-amber-400' : 'text-emerald-400'}>{weightPct}%</span>
                    </div>
                    <div className="h-1 bg-slate-800 rounded-full overflow-hidden">
                      <div className={`h-full rounded-full ${weightPct < 40 ? 'bg-amber-500/60' : 'bg-emerald-500/60'}`} style={{ width: `${weightPct}%` }} />
                    </div>
                  </div>
                  <div>
                    <div className="flex justify-between text-[10px] mb-0.5">
                      <span className="text-slate-500">Fp</span>
                      <span className={fpPct < 40 ? 'text-amber-400' : 'text-emerald-400'}>{fpPct}%</span>
                    </div>
                    <div className="h-1 bg-slate-800 rounded-full overflow-hidden">
                      <div className={`h-full rounded-full ${fpPct < 40 ? 'bg-amber-500/60' : 'bg-emerald-500/60'}`} style={{ width: `${fpPct}%` }} />
                    </div>
                  </div>
                </div>

                {/* 2D Truck bed */}
                <div className="border border-slate-700 rounded-lg overflow-hidden mb-3">
                  <div className="bg-slate-800 text-center py-1 text-[10px] text-slate-500 font-medium border-b border-slate-700">▲ CAB</div>
                  <div className="p-1.5 space-y-1 bg-slate-800/20 min-h-[60px]">
                    {lp.items.map((item) => {
                      const cat = categoryConfig[item.category] || categoryConfig.GEN
                      const h = Math.max(36, Math.round((item.footprint / lp.truckBed.footprintCap) * 100))
                      return (
                        <div
                          key={item.order}
                          className={`${cat.bg} ${cat.border} border rounded px-2 py-1.5 flex items-center justify-between`}
                          style={{ minHeight: `${h}px` }}
                        >
                          <div>
                            <div className="flex items-center gap-1">
                              <div className={`w-1.5 h-1.5 rounded-full ${cat.dot}`} />
                              <span className={`text-[10px] font-bold ${cat.text}`}>{item.order}</span>
                            </div>
                            <p className="text-[10px] text-slate-400 mt-0.5">{item.material} · {item.weight}kg</p>
                          </div>
                          <div className="text-right">
                            <span className="text-[10px] text-slate-500">#{item.dropSeq}</span>
                            {!item.stackable && <p className="text-[10px] text-amber-400/70">No stack</p>}
                          </div>
                        </div>
                      )
                    })}
                  </div>
                  <div className="bg-slate-800 text-center py-1 text-[10px] text-slate-500 font-medium border-t border-slate-700 flex items-center justify-center gap-0.5">
                    <ArrowDown size={8} /> TAILGATE
                  </div>
                </div>

                {/* Route */}
                {lp.route && (
                  <div className={`mb-2 p-2 rounded-lg border text-[10px] ${
                    lp.urgent
                      ? 'bg-red-500/8 border-red-500/20'
                      : 'bg-slate-800/40 border-slate-700/50'
                  }`}>
                    <div className="flex items-center gap-1.5 mb-1.5">
                      <Navigation size={9} className={lp.urgent ? 'text-red-400' : 'text-slate-500'} />
                      <span className={`font-semibold uppercase tracking-wide ${lp.urgent ? 'text-red-400' : 'text-slate-500'}`}>
                        Route · {lp.route.totalDistance}
                      </span>
                    </div>
                    <div className="space-y-1">
                      {lp.route.segments.map((seg, i) => (
                        <div key={i} className="flex items-center gap-1.5">
                          <MapPin size={8} className="text-slate-600 flex-shrink-0" />
                          <span className="text-slate-400">{seg.from}</span>
                          <span className="text-slate-600">→</span>
                          <span className="text-slate-300 font-medium">{seg.to}</span>
                          <span className="text-slate-600 ml-auto">{seg.distance} · {seg.duration}</span>
                        </div>
                      ))}
                      {lp.route.stops?.map((stop, i) => (
                        <div key={i} className="flex items-center gap-1.5 pl-3 border-l-2 border-blue-500/30 ml-1">
                          <span className="text-blue-300/80">Stop: {stop.location}</span>
                          <span className="text-slate-500 ml-auto">Arr: {stop.arrival}</span>
                        </div>
                      ))}
                    </div>
                    <div className="flex items-center justify-between mt-1.5 pt-1.5 border-t border-slate-700/40">
                      <span className="text-slate-500">Depart: <span className="text-slate-300">{lp.route.departure}</span></span>
                      <span className="text-slate-500">ETA: <span className={lp.urgent ? 'text-red-300 font-semibold' : 'text-slate-300'}>{lp.route.arrival}</span></span>
                      <span className={lp.urgent ? 'text-red-400/80' : 'text-slate-600'}>
                        SLA: {lp.urgent ? lp.route.urgentDeadline : lp.route.slaDeadline}
                      </span>
                    </div>
                  </div>
                )}

                {/* Pick sequence (compact) */}
                <div className="mb-2">
                  <p className="text-[10px] text-slate-500 font-medium mb-1">Pick: {lp.totalPickTime}</p>
                  <div className="flex items-center gap-1 flex-wrap">
                    {lp.pickSequence.map((pick, idx) => (
                      <span key={idx} className="text-[10px] text-slate-400">
                        {pick.zone.replace('Zone ', '')}
                        {idx < lp.pickSequence.length - 1 && <span className="text-slate-600 mx-0.5">→</span>}
                      </span>
                    ))}
                  </div>
                </div>

                {/* Pick note */}
                <div className={`text-[10px] rounded p-2 flex items-start gap-1.5 ${
                  lp.pickConflict
                    ? 'bg-amber-500/8 border border-amber-500/20 text-amber-300/80'
                    : lp.isDeferred
                    ? 'bg-blue-500/8 border border-blue-500/20 text-blue-300/70'
                    : 'bg-slate-800/50 border border-slate-700/50 text-slate-500'
                }`}>
                  {lp.pickConflict && <RotateCcw size={9} className="flex-shrink-0 mt-0.5 text-amber-400" />}
                  {lp.isDeferred && <Clock size={9} className="flex-shrink-0 mt-0.5 text-blue-400" />}
                  <span className="line-clamp-2">{lp.pickNote}</span>
                </div>

                <div className="mt-2 text-[10px] text-slate-600">{lp.stagingLane}</div>
              </div>
            )
          })}
        </div>

        {/* Compact summaries for remaining vehicles */}
        <div className="bg-slate-900 border border-slate-800 rounded-xl p-4">
          <p className="text-xs text-slate-500 font-medium mb-3">Remaining Vehicles (standard loads)</p>
          <div className="grid grid-cols-3 gap-2">
            {compactLoadSummaries.map((v) => {
              const util = Math.round((v.weight / v.capacity) * 100)
              return (
                <div
                  key={v.id}
                  className={`bg-slate-800/40 rounded-lg p-3 border ${
                    v.deferred ? 'border-blue-500/20 opacity-60' : 'border-slate-700/50'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-1.5">
                      {vehicleIcon(v.type)}
                      <span className="text-xs font-bold text-white">{v.id}</span>
                      <span className="text-[10px] text-slate-500">{v.type}</span>
                    </div>
                    <span className={`text-[10px] font-medium ${util < 40 ? 'text-amber-400' : 'text-emerald-400'}`}>{util}%</span>
                  </div>
                  <p className="text-[10px] text-slate-400 mt-1">{v.dest} · {v.orders} orders · {v.weight}/{v.capacity} kg</p>
                  <div className="h-0.5 bg-slate-700 rounded-full mt-1.5 overflow-hidden">
                    <div className={`h-full rounded-full ${util < 40 ? 'bg-amber-500/60' : 'bg-emerald-500/60'}`} style={{ width: `${util}%` }} />
                  </div>
                  <p className="text-[10px] text-slate-500 mt-1">{v.status}</p>
                </div>
              )
            })}
          </div>
        </div>
      </div>
    </div>
  )
}
