import { useState, useEffect, useRef } from 'react'
import posthog from 'posthog-js'
import Header from './components/Header'

posthog.init('phc_rQDLWkb7bsnveCGPPh9dJrXzzvELSYVtfhbtK2uPv9iZ', {
  api_host: 'https://us.i.posthog.com',
  person_profiles: 'identified_only',
})
import OrderQueue from './components/OrderQueue'
import ConstraintEvaluator from './components/ConstraintEvaluator'
import AgentReasoning from './components/AgentReasoning'
import PlanComparison from './components/PlanComparison'
import LoadVisualisation from './components/LoadVisualisation'
import ExecutionHandoff from './components/ExecutionHandoff'
import TradeOffNegotiation from './components/TradeOffNegotiation'
import PlanDiffView from './components/PlanDiffView'
import ReasoningTracePanel from './components/ReasoningTracePanel'
import DemoControls from './components/DemoControls'
import { dailyStats } from './data/mockData'
import { planDiffScenarios } from './data/mockDataV2'
import { CheckCircle, TrendingUp } from 'lucide-react'

const steps = [
  { id: 'queue',       label: 'Order Queue',         sublabel: 'Batch 14' },
  { id: 'constraints', label: 'Constraint Evaluator', sublabel: '8 categories' },
  { id: 'reasoning',   label: 'Agent Reasoning',      sublabel: '38 orders' },
  { id: 'plans',       label: 'Dispatch Plans',       sublabel: '2 plans' },
  { id: 'loads',       label: 'Load Plans',           sublabel: '12 vehicles' },
  { id: 'execution',   label: 'Execution',            sublabel: 'Fleet handoff' },
]

export default function App() {
  const [screen, setScreen] = useState('queue')
  const [approvedPlan, setApprovedPlan] = useState(null)
  const [refinedPrompt, setRefinedPrompt] = useState(null)

  // v2 state
  const [demoMode, setDemoMode] = useState('normal')          // 'normal' | 'stress'
  const [pendingScenarioId, setPendingScenarioId] = useState(null)
  const [diffModalId, setDiffModalId] = useState(null)
  const [reasoningTarget, setReasoningTarget] = useState(null) // { planId, vehicleId }
  const [planVersion, setPlanVersion] = useState(1)
  const [toast, setToast] = useState(null)

  const screenEnteredAt = useRef(Date.now())

  useEffect(() => {
    posthog.capture('screen_viewed', { screen, demoMode })
    screenEnteredAt.current = Date.now()
  }, [screen, demoMode])

  useEffect(() => {
    const handleUnload = () => {
      const duration = Math.round((Date.now() - screenEnteredAt.current) / 1000)
      posthog.capture('screen_exited', { screen, duration_seconds: duration })
    }
    window.addEventListener('beforeunload', handleUnload)
    return () => window.removeEventListener('beforeunload', handleUnload)
  }, [screen])

  // Auto-dismiss toasts
  useEffect(() => {
    if (!toast) return
    const t = setTimeout(() => setToast(null), 3500)
    return () => clearTimeout(t)
  }, [toast])

  const navigateTo = (nextScreen) => {
    const duration = Math.round((Date.now() - screenEnteredAt.current) / 1000)
    posthog.capture('screen_exited', { screen, duration_seconds: duration })
    setScreen(nextScreen)
  }

  const currentStepIndex = steps.findIndex((s) => s.id === screen)

  const handleApprove = (plan) => {
    setApprovedPlan(plan)
    navigateTo('loads')
  }

  const handleRunOptimisation = (prompt) => {
    setRefinedPrompt(prompt)
    navigateTo('reasoning')
  }

  // Demo control handlers
  const handleToggleMode = (mode) => {
    setDemoMode(mode)
    posthog.capture('demo_mode_changed', { mode })
    if (mode === 'stress' && screen !== 'plans') {
      navigateTo('plans') // jump straight to the trade-off view
    }
  }

  const handleTriggerScenario = (id) => {
    setPendingScenarioId(id)
    posthog.capture('scenario_triggered', { scenario_id: id })
    if (screen !== 'plans') navigateTo('plans')
  }

  const handleViewDiff = () => {
    if (pendingScenarioId) {
      setDiffModalId(pendingScenarioId)
      posthog.capture('plan_diff_opened', { scenario_id: pendingScenarioId })
    }
  }

  const handleDismissDiff = () => {
    setPendingScenarioId(null)
  }

  const handleAcceptDiff = () => {
    posthog.capture('plan_diff_accepted', { scenario_id: diffModalId, new_version: planVersion + 1 })
    setPlanVersion((v) => v + 1)
    setPendingScenarioId(null)
    setDiffModalId(null)
    setToast({ kind: 'success', msg: `Plan v${planVersion + 1} accepted and audit-logged.` })
  }

  const handleRevertDiff = () => {
    posthog.capture('plan_diff_reverted', { scenario_id: diffModalId })
    setDiffModalId(null)
    setPendingScenarioId(null)
    setToast({ kind: 'info', msg: `Reverted to Plan v${planVersion}.` })
  }

  const handleReplanDiff = () => {
    posthog.capture('plan_diff_replanned', { scenario_id: diffModalId })
    setDiffModalId(null)
    setPendingScenarioId(null)
    setToast({ kind: 'info', msg: 'Agent re-running full optimisation...' })
  }

  const handleOpenReasoning = (planId, vehicleId) => {
    setReasoningTarget({ planId, vehicleId })
    posthog.capture('reasoning_trace_opened', { plan_id: planId, vehicle_id: vehicleId })
  }

  const handleResolveTradeOff = (option) => {
    posthog.capture('tradeoff_resolved', { option_id: option.id, option_label: option.label })
    setDemoMode('normal')
    setToast({ kind: 'success', msg: `${option.label} committed. Plan reconciled and audit-logged.` })
    navigateTo('loads')
  }

  const handleAdjustConstraints = () => {
    setToast({ kind: 'info', msg: 'Returning to constraint evaluator...' })
    setDemoMode('normal')
    navigateTo('constraints')
  }

  const handleReset = () => {
    setDemoMode('normal')
    setPendingScenarioId(null)
    setDiffModalId(null)
    setReasoningTarget(null)
    setPlanVersion(1)
    setApprovedPlan(null)
    setToast({ kind: 'info', msg: 'Demo state reset.' })
    navigateTo('queue')
  }

  const showTradeOff = screen === 'plans' && demoMode === 'stress'

  return (
    <div className="min-h-screen bg-slate-950 text-white flex flex-col">
      <Header />
      <div className="flex flex-1 overflow-hidden" style={{ height: 'calc(100vh - 56px)' }}>
        {/* Sidebar */}
        <aside className="w-60 bg-slate-900 border-r border-slate-800 flex-shrink-0 p-5 overflow-y-auto">
          <p className="text-xs font-semibold text-slate-500 uppercase tracking-widest mb-4">
            Workflow
          </p>
          <div className="space-y-0">
            {steps.map((step, idx) => {
              const isDone = idx < currentStepIndex
              const isCurrent = idx === currentStepIndex
              return (
                <button
                  key={step.id}
                  onClick={() => navigateTo(step.id)}
                  className={`flex items-start gap-3 w-full text-left cursor-pointer rounded-md px-1 -mx-1 transition-colors ${isCurrent ? 'bg-slate-800/50' : 'hover:bg-slate-800/30'}`}
                >
                  <div className="flex flex-col items-center pointer-events-none">
                    <div className="mt-3">
                      {isDone ? (
                        <CheckCircle size={16} className="text-emerald-400" />
                      ) : isCurrent ? (
                        <div className="w-4 h-4 rounded-full border-2 border-blue-400 bg-blue-400/20 flex items-center justify-center">
                          <div className="w-1.5 h-1.5 rounded-full bg-blue-400" />
                        </div>
                      ) : (
                        <div className="w-4 h-4 rounded-full border-2 border-slate-700" />
                      )}
                    </div>
                    {idx < steps.length - 1 && (
                      <div className={`w-px h-8 mt-1 ${isDone ? 'bg-emerald-400/30' : 'bg-slate-800'}`} />
                    )}
                  </div>
                  <div className="pt-2.5 pb-1">
                    <p className={`text-sm font-medium leading-tight ${isCurrent ? 'text-white' : isDone ? 'text-slate-400' : 'text-slate-600'} transition-colors`}>
                      {step.label}
                    </p>
                    <p className={`text-xs mt-0.5 ${isCurrent ? 'text-blue-400' : isDone ? 'text-emerald-400/60' : 'text-slate-700'}`}>
                      {isDone ? '✓ Complete' : step.sublabel}
                    </p>
                  </div>
                </button>
              )
            })}
          </div>

          {/* Daily Operations Summary */}
          <div className="mt-5 pt-4 border-t border-slate-800">
            <p className="text-xs text-slate-600 mb-2 font-medium flex items-center gap-1.5">
              <TrendingUp size={11} />
              Today's Operations
            </p>
            <div className="space-y-1.5">
              {[
                { label: 'Orders processed', value: dailyStats.totalOrders.toLocaleString(), color: 'text-white' },
                { label: 'Dispatched', value: dailyStats.dispatched.toString(), color: 'text-emerald-400' },
                { label: 'In progress', value: dailyStats.inProgress.toString(), color: 'text-blue-400' },
                { label: 'Queued', value: dailyStats.queued.toString(), color: 'text-slate-300' },
              ].map((item) => (
                <div key={item.label} className="flex justify-between text-xs">
                  <span className="text-slate-500">{item.label}</span>
                  <span className={item.color}>{item.value}</span>
                </div>
              ))}
            </div>
            {/* Progress bar */}
            <div className="mt-2.5">
              <div className="flex justify-between text-xs mb-1">
                <span className="text-slate-600">Daily progress</span>
                <span className="text-slate-400">{Math.round((dailyStats.dispatched / dailyStats.totalOrders) * 100)}%</span>
              </div>
              <div className="h-1.5 bg-slate-800 rounded-full overflow-hidden">
                <div className="h-full bg-emerald-500/60 rounded-full" style={{ width: `${(dailyStats.dispatched / dailyStats.totalOrders) * 100}%` }} />
              </div>
            </div>
            <div className="mt-3 space-y-1.5">
              {[
                { label: 'Vehicles today', value: dailyStats.vehiclesDispatched.toString(), color: 'text-slate-300' },
                { label: 'Batches', value: `${dailyStats.batchesCompleted}/${dailyStats.batchesTotal}`, color: 'text-slate-300' },
                { label: 'Corridors', value: dailyStats.corridors.toString(), color: 'text-slate-300' },
                { label: 'Avg utilisation', value: `${dailyStats.avgUtilisation}%`, color: 'text-emerald-400' },
              ].map((item) => (
                <div key={item.label} className="flex justify-between text-xs">
                  <span className="text-slate-500">{item.label}</span>
                  <span className={item.color}>{item.value}</span>
                </div>
              ))}
            </div>
          </div>
        </aside>

        {/* Main Content */}
        <main className="flex-1 overflow-auto">
          {screen === 'queue'       && <OrderQueue onRunAgent={() => navigateTo('constraints')} />}
          {screen === 'constraints' && <ConstraintEvaluator onRunAgent={handleRunOptimisation} />}
          {screen === 'reasoning'   && <AgentReasoning refinedPrompt={refinedPrompt} onComplete={() => navigateTo('plans')} />}
          {screen === 'plans' && (
            showTradeOff
              ? <TradeOffNegotiation
                  onResolve={handleResolveTradeOff}
                  onAdjustConstraints={handleAdjustConstraints}
                />
              : <PlanComparison
                  onApprove={handleApprove}
                  pendingScenario={pendingScenarioId ? planDiffScenarios.find((s) => s.id === pendingScenarioId) : null}
                  onViewDiff={handleViewDiff}
                  onDismissDiff={handleDismissDiff}
                  onOpenReasoning={handleOpenReasoning}
                  planVersion={planVersion}
                />
          )}
          {screen === 'loads'       && <LoadVisualisation plan={approvedPlan} onContinue={() => navigateTo('execution')} />}
          {screen === 'execution'   && <ExecutionHandoff plan={approvedPlan} />}
        </main>
      </div>

      {/* Plan diff modal */}
      {diffModalId && (
        <PlanDiffView
          scenario={planDiffScenarios.find((s) => s.id === diffModalId)}
          onAccept={handleAcceptDiff}
          onRevert={handleRevertDiff}
          onReplan={handleReplanDiff}
          onClose={() => setDiffModalId(null)}
        />
      )}

      {/* Reasoning trace drawer */}
      {reasoningTarget && (
        <ReasoningTracePanel
          planId={reasoningTarget.planId}
          vehicleId={reasoningTarget.vehicleId}
          onClose={() => setReasoningTarget(null)}
        />
      )}

      {/* Toast */}
      {toast && (
        <div className="fixed bottom-20 right-4 z-50 max-w-sm">
          <div className={`px-4 py-3 rounded-lg shadow-2xl border flex items-center gap-2 ${
            toast.kind === 'success'
              ? 'bg-emerald-500/15 border-emerald-500/40 text-emerald-200'
              : 'bg-slate-800 border-slate-700 text-slate-200'
          }`}>
            <CheckCircle size={13} className={toast.kind === 'success' ? 'text-emerald-400' : 'text-blue-400'} />
            <span className="text-xs font-medium">{toast.msg}</span>
          </div>
        </div>
      )}

      {/* Demo controls (always mounted) */}
      <DemoControls
        demoMode={demoMode}
        onToggleMode={handleToggleMode}
        onTriggerScenario={handleTriggerScenario}
        onReset={handleReset}
        pendingScenarioId={pendingScenarioId}
      />
    </div>
  )
}
