import { orders, batchContext, dailyStats, categoryConfig, constraintPrompt } from '../data/mockData'
import {
  Zap,
  ChevronRight,
  AlertTriangle,
  Snowflake,
  Thermometer,
  Ban,
  Clock,
  Package,
  Layers,
  Sparkles,
  CornerDownLeft,
  Siren,
} from 'lucide-react'

export default function OrderQueue({ onRunAgent }) {
  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      onRunAgent()
    }
  }

  return (
    <div className="p-6">
      <div className="max-w-6xl">
        {/* Daily context banner */}
        <div className="mb-4 flex items-center gap-6 text-xs bg-slate-900/60 border border-slate-800 rounded-lg px-4 py-2.5">
          <span className="text-slate-500">Today</span>
          <span className="text-white font-semibold">{dailyStats.totalOrders.toLocaleString()} orders</span>
          <span className="text-emerald-400">{dailyStats.dispatched} dispatched</span>
          <span className="text-blue-400">{dailyStats.inProgress} in-progress</span>
          <span className="text-slate-400">{dailyStats.queued} queued</span>
          <span className="text-slate-600">|</span>
          <span className="text-slate-400">{dailyStats.vehiclesDispatched} vehicles</span>
          <span className="text-slate-400">{dailyStats.shipmentsCreated} shipments</span>
          <span className="text-slate-400">{dailyStats.corridors} corridors</span>
        </div>

        {/* Batch header */}
        <div className="flex items-start justify-between mb-5">
          <div>
            <div className="flex items-center gap-3">
              <h1 className="text-xl font-semibold text-white">Dispatch Batch {batchContext.batchNumber}</h1>
              <span className="text-xs px-2 py-0.5 rounded-full bg-blue-500/15 text-blue-400 border border-blue-500/30">
                Window {batchContext.window}
              </span>
              <span className="text-xs text-slate-500">
                Batch {batchContext.batchNumber} of {batchContext.batchesTotal}
              </span>
            </div>
            <p className="text-sm text-slate-400 mt-1">
              {batchContext.totalOrdersInBatch} orders across {batchContext.corridors} corridors — showing {batchContext.visibleOrders} of {batchContext.totalOrdersInBatch}
            </p>
          </div>
          <span className="text-xs text-slate-600">Scroll down to submit constraints ↓</span>
        </div>

        {/* Batch summary cards */}
        <div className="grid grid-cols-6 gap-3 mb-5">
          {[
            { label: 'Orders', value: batchContext.totalOrdersInBatch, sub: `${batchContext.corridors} corridors` },
            { label: 'Weight', value: `${(batchContext.totalWeight / 1000).toFixed(1)}T`, sub: `${batchContext.totalWeight.toLocaleString()} kg` },
            { label: 'Footprint', value: `${batchContext.totalFootprint} m²`, sub: '2D load area' },
            { label: 'Value', value: `₹${(batchContext.totalValue / 100000).toFixed(0)}L`, sub: 'At risk' },
            { label: 'Cold Chain', value: batchContext.coldChain, sub: `${batchContext.hazmat} hazmat`, highlight: true },
            { label: 'Urgent', value: batchContext.urgent, sub: `${batchContext.pendingAsn} pending ASN`, urgent: true },
          ].map((item) => (
            <div key={item.label} className="bg-slate-900 rounded-lg border border-slate-800 p-3">
              <p className="text-xs text-slate-500">{item.label}</p>
              <p className={`text-lg font-bold ${item.highlight ? 'text-sky-400' : item.warn ? 'text-amber-400' : item.urgent ? 'text-red-400' : 'text-white'}`}>{item.value}</p>
              <p className="text-xs text-slate-600">{item.sub}</p>
            </div>
          ))}
        </div>

        {/* Corridor distribution */}
        <div className="mb-5 bg-slate-900 border border-slate-800 rounded-lg p-3">
          <div className="flex items-center gap-4">
            <span className="text-xs text-slate-500 font-medium flex items-center gap-1.5 flex-shrink-0">
              <Layers size={11} /> Corridors
            </span>
            <div className="flex items-center gap-2 flex-1">
              {[
                { code: 'DEL→BOM', count: 12, pct: 32, color: 'bg-blue-500' },
                { code: 'DEL→MAA', count: 9, pct: 24, color: 'bg-emerald-500' },
                { code: 'DEL→PNQ', count: 8, pct: 21, color: 'bg-violet-500' },
                { code: 'DEL→BLR', count: 5, pct: 13, color: 'bg-amber-500' },
                { code: 'DEL→HYD', count: 4, pct: 10, color: 'bg-rose-500' },
              ].map((c) => (
                <div key={c.code} className="flex items-center gap-1.5 text-xs">
                  <div className={`w-2 h-2 rounded-sm ${c.color}`} />
                  <span className="text-slate-400">{c.code}</span>
                  <span className="text-slate-600">({c.count})</span>
                </div>
              ))}
            </div>
          </div>
          {/* Mini bar */}
          <div className="flex h-1.5 rounded-full overflow-hidden mt-2">
            <div className="bg-blue-500/60" style={{ width: '32%' }} />
            <div className="bg-emerald-500/60" style={{ width: '24%' }} />
            <div className="bg-violet-500/60" style={{ width: '21%' }} />
            <div className="bg-amber-500/60" style={{ width: '13%' }} />
            <div className="bg-rose-500/60" style={{ width: '10%' }} />
          </div>
        </div>

        {/* Compact order table */}
        <div className="bg-slate-900 border border-slate-800 rounded-xl overflow-hidden">
          <table className="w-full text-xs">
            <thead>
              <tr className="border-b border-slate-800 text-slate-500">
                <th className="text-left py-2.5 px-3 font-medium">Order</th>
                <th className="text-left py-2.5 px-3 font-medium">Material</th>
                <th className="text-left py-2.5 px-3 font-medium">Zone</th>
                <th className="text-left py-2.5 px-3 font-medium">Destination</th>
                <th className="text-right py-2.5 px-3 font-medium">Weight</th>
                <th className="text-right py-2.5 px-3 font-medium">Footprint</th>
                <th className="text-left py-2.5 px-3 font-medium">Flags</th>
                <th className="text-right py-2.5 px-3 font-medium">SLA</th>
                <th className="text-right py-2.5 px-3 font-medium">Value</th>
              </tr>
            </thead>
            <tbody>
              {orders.map((order) => {
                const cat = categoryConfig[order.category]
                return (
                  <tr
                    key={order.id}
                    className={`border-b border-slate-800/50 hover:bg-slate-800/30 transition-colors ${
                      order.urgent ? 'bg-red-500/[0.04]' : order.hazmat ? 'bg-red-500/[0.02]' : ''
                    }`}
                  >
                    <td className="py-2 px-3 font-semibold text-white">{order.id}</td>
                    <td className="py-2 px-3">
                      <span className={`inline-flex items-center gap-1 px-1.5 py-0.5 rounded ${cat.bg} ${cat.text}`}>
                        {order.category === 'COLD' && <Snowflake size={9} />}
                        {order.category === 'TEMP' && <Thermometer size={9} />}
                        {order.category === 'HAZMAT' && <AlertTriangle size={9} />}
                        {order.material}
                      </span>
                    </td>
                    <td className="py-2 px-3 text-slate-400">{order.originZone.split(' — ')[0]}</td>
                    <td className="py-2 px-3 text-slate-300">{order.destination}</td>
                    <td className="py-2 px-3 text-right text-slate-300">{order.weight} kg</td>
                    <td className="py-2 px-3 text-right text-slate-400">{order.footprint} m²</td>
                    <td className="py-2 px-3">
                      <div className="flex items-center gap-1 flex-wrap">
                        {order.urgent && (
                          <span className="px-1.5 py-0.5 rounded bg-red-500/20 text-red-300 text-[10px] font-semibold flex items-center gap-0.5 border border-red-500/30">
                            <Siren size={7} />URGENT
                          </span>
                        )}
                        {order.temp && (
                          <span className="px-1.5 py-0.5 rounded bg-sky-500/15 text-sky-300 text-[10px]">{order.temp}</span>
                        )}
                        {order.hazmat && (
                          <span className="px-1.5 py-0.5 rounded bg-red-500/15 text-red-400 text-[10px]">{order.unClass}</span>
                        )}
                        {order.stackable === false && !order.hazmat && (
                          <span className="px-1.5 py-0.5 rounded bg-amber-500/10 text-amber-400/80 text-[10px] flex items-center gap-0.5"><Ban size={7} />No stack</span>
                        )}
                        {order.status === 'pending_asn' && (
                          <span className="px-1.5 py-0.5 rounded bg-amber-500/10 text-amber-400 text-[10px] flex items-center gap-0.5"><Clock size={7} />ASN {order.asnProbability}%</span>
                        )}
                      </div>
                    </td>

                    <td className="py-2 px-3 text-right">
                      {order.urgent
                        ? <span className="text-red-400 text-[10px] font-semibold">{order.urgentDeadline}</span>
                        : <span className="text-slate-400 text-xs">{order.sla}d</span>
                      }
                    </td>
                    <td className="py-2 px-3 text-right text-white font-medium">₹{(order.value / 1000).toFixed(0)}K</td>
                  </tr>
                )
              })}
            </tbody>
          </table>
          {/* "More orders" footer */}
          <div className="px-4 py-2.5 bg-slate-800/30 text-xs text-slate-500 flex items-center justify-between border-t border-slate-800">
            <span>Showing {orders.length} of {batchContext.totalOrdersInBatch} orders in batch</span>
            <button className="text-blue-400 hover:text-blue-300 flex items-center gap-1 transition-colors">
              View all {batchContext.totalOrdersInBatch} orders <ChevronRight size={12} />
            </button>
          </div>
        </div>

        {/* ── Constraint Prompt ─────────────────────────────────────────── */}
        <div className="mt-5">
          <div className="flex items-center gap-2 mb-2">
            <Sparkles size={13} className="text-violet-400" />
            <p className="text-xs font-semibold text-slate-400 uppercase tracking-widest">Optimisation Constraints</p>
            <span className="text-[10px] text-slate-600">Auto-generated from batch · Edit if needed</span>
          </div>

          <div className="relative">
            <textarea
              defaultValue={constraintPrompt}
              onKeyDown={handleKeyDown}
              rows={4}
              className="w-full bg-slate-900 border border-slate-700 hover:border-slate-600 focus:border-violet-500/60 focus:ring-1 focus:ring-violet-500/30 rounded-xl px-4 py-3.5 text-sm text-slate-300 leading-relaxed resize-none outline-none transition-colors pr-24 placeholder-slate-600"
              spellCheck={false}
            />
            {/* Enter hint */}
            <div className="absolute bottom-3.5 right-3.5 flex items-center gap-1.5">
              <span className="text-[10px] text-slate-600">Press</span>
              <kbd className="flex items-center gap-0.5 px-1.5 py-0.5 bg-slate-800 border border-slate-700 rounded text-[10px] text-slate-500 font-mono">
                <CornerDownLeft size={9} />
                Enter
              </kbd>
            </div>
          </div>

          <div className="flex items-center justify-between mt-2.5">
            <p className="text-[11px] text-slate-600">
              Agent will evaluate this against all 8 constraint categories before optimising
            </p>
            <button
              onClick={onRunAgent}
              className="flex items-center gap-2 px-4 py-2 bg-violet-600 hover:bg-violet-500 text-white text-sm font-semibold rounded-lg transition-colors shadow-lg shadow-violet-900/30"
            >
              <Zap size={13} fill="currentColor" />
              Evaluate &amp; Score
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
