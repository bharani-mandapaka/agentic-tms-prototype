import { executionData } from '../data/mockData'
import {
  CheckCircle,
  Clock,
  ExternalLink,
  Bell,
  ChevronRight,
  Truck,
  AlertTriangle,
  Snowflake,
  Pause,
  TrendingUp,
} from 'lucide-react'

const docStatus = {
  ready: { icon: CheckCircle, color: 'text-emerald-400', bg: 'bg-emerald-500/10' },
  pending: { icon: Clock, color: 'text-amber-400', bg: 'bg-amber-500/10' },
}

const stageConfig = {
  done: { dot: 'bg-emerald-400', ring: 'ring-4 ring-emerald-400/20', text: 'text-emerald-300', line: 'bg-emerald-400/40' },
  active: { dot: 'bg-blue-400', ring: 'ring-4 ring-blue-400/20', text: 'text-blue-300', line: 'bg-slate-700' },
  upcoming: { dot: 'bg-slate-700', ring: 'ring-4 ring-slate-800', text: 'text-slate-600', line: 'bg-slate-800' },
}

const vehicleIcon = (type) => {
  if (type.includes('Reefer')) return <Snowflake size={12} className="text-sky-400" />
  if (type.includes('Hazmat')) return <AlertTriangle size={12} className="text-red-400" />
  if (type.includes('Insulated')) return <Snowflake size={12} className="text-blue-400" />
  return <Truck size={12} className="text-slate-400" />
}

export default function ExecutionHandoff({ plan }) {
  const data = executionData
  const planLabel = plan?.title || 'Plan A'

  return (
    <div className="p-6">
      <div className="max-w-6xl">
        {/* Success banner */}
        <div className="mb-5 flex items-center gap-4 p-4 bg-emerald-500/10 border border-emerald-500/30 rounded-xl">
          <div className="w-10 h-10 rounded-xl bg-emerald-500/20 flex items-center justify-center flex-shrink-0">
            <CheckCircle size={20} className="text-emerald-400" />
          </div>
          <div className="flex-1">
            <p className="font-semibold text-emerald-300">
              {planLabel} approved — {data.activeVehicles} vehicles dispatching, {data.deferredVehicles} deferred
            </p>
            <p className="text-sm text-emerald-400/70 mt-0.5">
              {data.batchLabel} · {data.totalOrders} orders · Pick lists sent to 5 warehouse zones · Projected saving: ₹{data.projectedSaving.toLocaleString('en-IN')}
            </p>
          </div>
          <button className="flex items-center gap-1.5 text-xs text-emerald-400 hover:text-emerald-300 transition-colors border border-emerald-500/30 px-3 py-1.5 rounded-lg">
            View in Dispatch <ExternalLink size={11} className="ml-0.5" />
          </button>
        </div>

        <div className="grid grid-cols-3 gap-5">
          {/* Left column: 2/3 width */}
          <div className="col-span-2 space-y-5">
            {/* Daily progress context */}
            <div className="bg-slate-900 border border-slate-800 rounded-xl p-4">
              <div className="flex items-center gap-2 mb-3">
                <TrendingUp size={13} className="text-emerald-400" />
                <h2 className="text-sm font-semibold text-white">Daily Progress</h2>
              </div>
              <div className="grid grid-cols-4 gap-4">
                <div>
                  <p className="text-xs text-slate-500">Dispatched today</p>
                  <p className="text-xl font-bold text-emerald-400">{data.dailyProgress.dispatched + data.totalOrders - data.deferredVehicles * 2}</p>
                </div>
                <div>
                  <p className="text-xs text-slate-500">This batch</p>
                  <p className="text-xl font-bold text-blue-400">+{data.totalOrders}</p>
                </div>
                <div>
                  <p className="text-xs text-slate-500">Remaining</p>
                  <p className="text-xl font-bold text-slate-300">{data.dailyProgress.remaining}</p>
                </div>
                <div>
                  <p className="text-xs text-slate-500">Vehicles today</p>
                  <p className="text-xl font-bold text-white">{data.dailyProgress.vehiclesToday}</p>
                </div>
              </div>
              <div className="h-1.5 bg-slate-800 rounded-full overflow-hidden mt-3">
                <div className="h-full bg-emerald-500/60 rounded-full" style={{ width: '34%' }} />
              </div>
            </div>

            {/* Active vehicles table */}
            <div className="bg-slate-900 border border-slate-800 rounded-xl p-4">
              <h2 className="text-sm font-semibold text-white mb-3">Active Vehicles ({data.activeVehicles})</h2>
              <div className="overflow-x-auto">
                <table className="w-full text-xs">
                  <thead>
                    <tr className="border-b border-slate-800 text-slate-500">
                      <th className="text-left py-2 px-2 font-medium">Vehicle</th>
                      <th className="text-left py-2 px-2 font-medium">Type</th>
                      <th className="text-left py-2 px-2 font-medium">Destination</th>
                      <th className="text-center py-2 px-2 font-medium">Orders</th>
                      <th className="text-right py-2 px-2 font-medium">Weight</th>
                      <th className="text-right py-2 px-2 font-medium">Util</th>
                      <th className="text-left py-2 px-2 font-medium">Depart</th>
                      <th className="text-left py-2 px-2 font-medium">ETA</th>
                      <th className="text-left py-2 px-2 font-medium">Dock</th>
                    </tr>
                  </thead>
                  <tbody>
                    {data.vehicles.map((v) => (
                      <tr key={v.id} className="border-b border-slate-800/50 hover:bg-slate-800/30">
                        <td className="py-2 px-2">
                          <div className="flex items-center gap-1.5">
                            {vehicleIcon(v.type)}
                            <span className="font-bold text-white">{v.id}</span>
                          </div>
                        </td>
                        <td className="py-2 px-2 text-slate-400">{v.type}</td>
                        <td className="py-2 px-2 text-slate-300">{v.destination}</td>
                        <td className="py-2 px-2 text-center text-slate-300">{v.orders}</td>
                        <td className="py-2 px-2 text-right text-slate-300">{v.weight}</td>
                        <td className="py-2 px-2 text-right">
                          <span className={`font-medium ${parseInt(v.util) > 70 ? 'text-emerald-400' : parseInt(v.util) < 40 ? 'text-amber-400' : 'text-slate-400'}`}>
                            {v.util}
                          </span>
                        </td>
                        <td className="py-2 px-2 text-slate-400">{v.departure}</td>
                        <td className="py-2 px-2 text-slate-400">{v.eta}</td>
                        <td className="py-2 px-2 text-slate-500">{v.dock}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Deferred vehicles */}
            <div className="bg-slate-900 border border-blue-500/20 rounded-xl p-4">
              <div className="flex items-center gap-2 mb-3">
                <Pause size={13} className="text-blue-400" />
                <h2 className="text-sm font-semibold text-white">Deferred Vehicles ({data.deferredList.length})</h2>
                <span className="text-xs text-blue-400/70">Pull/push hold — auto-dispatch armed</span>
              </div>
              <div className="grid grid-cols-3 gap-3">
                {data.deferredList.map((v) => (
                  <div key={v.id} className="bg-blue-500/5 border border-blue-500/15 rounded-lg p-3">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold text-white">{v.id}</span>
                      <span className="text-[10px] text-blue-300">{v.probability} prob</span>
                    </div>
                    <p className="text-[10px] text-slate-400 mt-1">{v.dest} · {v.orders} orders</p>
                    <p className="text-[10px] text-blue-300/70 mt-1">Hold until: {v.holdUntil}</p>
                    <p className="text-[10px] text-emerald-400 mt-0.5">Saves {v.saving}</p>
                  </div>
                ))}
              </div>
            </div>

            {/* Progress tracker */}
            <div className="bg-slate-900 border border-slate-800 rounded-xl p-4">
              <h2 className="text-sm font-semibold text-white mb-5">Dispatch Progress</h2>
              <div className="flex items-start">
                {data.stages.map((stage, idx) => {
                  const s = stageConfig[stage.status]
                  const isLast = idx === data.stages.length - 1
                  const prevS = idx > 0 ? stageConfig[data.stages[idx - 1].status] : null
                  return (
                    <div key={stage.label} className="flex-1 flex flex-col items-center">
                      <div className="flex items-center w-full">
                        <div className={`flex-1 h-0.5 ${idx === 0 ? 'opacity-0' : prevS?.line || 'bg-slate-800'}`} />
                        <div className={`w-3 h-3 rounded-full flex-shrink-0 ${s.dot} ${s.ring}`} />
                        <div className={`flex-1 h-0.5 ${isLast ? 'opacity-0' : s.line}`} />
                      </div>
                      <p className={`text-xs font-medium mt-2 text-center leading-tight ${s.text}`}>{stage.label}</p>
                      <p className="text-[10px] text-slate-600 mt-0.5">{stage.time}</p>
                    </div>
                  )
                })}
              </div>
            </div>
          </div>

          {/* Right column: 1/3 */}
          <div className="space-y-5">
            {/* Cost summary */}
            <div className="bg-slate-900 border border-slate-800 rounded-xl p-4">
              <h2 className="text-sm font-semibold text-white mb-3">Batch Cost</h2>
              <p className="text-2xl font-bold text-white">₹{data.totalCost.toLocaleString('en-IN')}</p>
              <p className="text-xs text-slate-500 mt-1">{data.totalVehicles} vehicles · {data.totalOrders} orders</p>
              <div className="mt-3 pt-3 border-t border-slate-800 text-xs space-y-1.5">
                <div className="flex justify-between">
                  <span className="text-slate-500">Pull/push saving</span>
                  <span className="text-emerald-400">~₹{data.projectedSaving.toLocaleString('en-IN')}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">Daily spend</span>
                  <span className="text-slate-300">₹18.4L</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">Avg cost/kg</span>
                  <span className="text-slate-300">₹8.42</span>
                </div>
              </div>
            </div>

            {/* Agent actions */}
            <div className="bg-slate-900 border border-slate-800 rounded-xl p-4">
              <h2 className="text-sm font-semibold text-white mb-3">Agent Actions</h2>
              <div className="space-y-2">
                {data.automatedActions.map((action, idx) => (
                  <div key={idx} className="flex items-start gap-2 text-xs text-slate-400">
                    <CheckCircle size={12} className="text-emerald-400 flex-shrink-0 mt-0.5" />
                    <span>{action}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Documents */}
            <div className="bg-slate-900 border border-slate-800 rounded-xl p-4">
              <h2 className="text-sm font-semibold text-white mb-3">Documents</h2>
              <div className="space-y-2.5">
                {data.documents.map((doc, idx) => {
                  const { icon: Icon, color, bg } = docStatus[doc.status]
                  return (
                    <div key={idx} className="flex items-start gap-2.5">
                      <div className={`w-6 h-6 rounded ${bg} flex items-center justify-center flex-shrink-0`}>
                        <Icon size={11} className={color} />
                      </div>
                      <div>
                        <p className="text-xs font-medium text-white">{doc.name}</p>
                        <p className="text-[10px] text-slate-500">{doc.note}</p>
                      </div>
                    </div>
                  )
                })}
              </div>
            </div>

            {/* Active monitors */}
            <div className="bg-slate-900 border border-slate-800 rounded-xl p-4">
              <h2 className="text-sm font-semibold text-white mb-3">Active Monitors</h2>
              <div className="space-y-2">
                <div className="flex items-start gap-2 p-2 bg-sky-500/8 border border-sky-500/20 rounded-lg">
                  <Snowflake size={11} className="text-sky-400 flex-shrink-0 mt-0.5" />
                  <p className="text-[10px] text-sky-300/80">V2, V10 reefer temp: -18°C ✓</p>
                </div>
                <div className="flex items-start gap-2 p-2 bg-blue-500/8 border border-blue-500/20 rounded-lg">
                  <Bell size={11} className="text-blue-400 flex-shrink-0 mt-0.5" />
                  <p className="text-[10px] text-blue-300/80">3 holds active — V5 (15:00), V9 (15:00), V11 (16:00)</p>
                </div>
                <div className="flex items-start gap-2 p-2 bg-amber-500/8 border border-amber-500/20 rounded-lg">
                  <AlertTriangle size={11} className="text-amber-400 flex-shrink-0 mt-0.5" />
                  <p className="text-[10px] text-amber-300/80">V4 hazmat — spill kit staged, Dock 5</p>
                </div>
                <div className="flex items-start gap-2 p-2 bg-blue-500/8 border border-blue-500/20 rounded-lg">
                  <Clock size={11} className="text-blue-400 flex-shrink-0 mt-0.5" />
                  <p className="text-[10px] text-blue-300/80">ORD-5514 ASN watch — auto-add to V6 on confirm</p>
                </div>
              </div>
            </div>

            <button className="w-full flex items-center justify-center gap-2 py-2 bg-slate-900 hover:bg-slate-800 border border-slate-700 rounded-xl text-xs text-slate-400 transition-colors">
              Override & Edit <ChevronRight size={12} />
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
