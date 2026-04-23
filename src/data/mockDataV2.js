// ─── v2 Extensions — Reasoning Traces, Plan Diffs, Trade-offs, Timeline ──────
// Extends v1 mockData.js with richer objects required by the four v2 features.

// ═══════════════════════════════════════════════════════════════════════════
// FEATURE 1 — Reasoning Trace Layer
// Per-vehicle decision logs: accepted consolidations, rejected alternatives,
// constraints evaluated, and confidence factor breakdowns.
// ═══════════════════════════════════════════════════════════════════════════

// Keyed by `${planId}-${vehicleId}`. All 8 constraint categories exist in the
// system; `constraints_evaluated` lists which ones produced binding decisions
// on this specific truck.
export const reasoningTraces = {
  // ── Plan A ─────────────────────────────────────────────────────────────
  'A-V1': {
    vehicleId: 'V1',
    planId: 'A',
    type: 'Standard 9T FTL',
    destination: 'Mumbai Hub',
    composition: ['ORD-5502', 'ORD-5504', 'ORD-5513', '+1 general'],
    utilisation: 71,
    cost: 18400,
    confidence: 92,
    decisions: [
      {
        id: 'd-a-v1-1',
        type: 'accepted',
        subject: 'Combined ORD-5502, ORD-5504, ORD-5513 on Truck V1',
        reason:
          'All three destined for Mumbai Hub (same corridor cluster). ORD-5502 (Electronics) is fragile/no-stack — placed at tailgate. ORD-5504 (Garments) and ORD-5513 (Cosmetics) are stackable and load mid-to-front. All delivery windows overlap within 3-hour tolerance.',
        constraints_triggered: ['Material Bundling', 'Stacking Rules', 'ETA / ETD Windows'],
        cost_impact: 0,
      },
      {
        id: 'd-a-v1-2',
        type: 'rejected',
        subject: 'Add ORD-5507 (pharma vaccines) to V1',
        reason:
          'ORD-5507 requires 2–8°C temperature regime. V1 is an ambient FTL — no cooling capacity. Cold chain breach would result in delivery rejection (₹5.2L at risk). Routed to V3 (Insulated SCV) instead.',
        constraints_triggered: ['Material Bundling'],
        cost_impact: 0,
      },
      {
        id: 'd-a-v1-3',
        type: 'rejected',
        subject: 'Add ORD-5503 (industrial solvent) to V1',
        reason:
          'ORD-5503 is Class 3 Flammable (UN1993). Hazmat isolation rule prohibits co-loading with any other cargo. Routed to dedicated hazmat vehicle V4. Cost impact: +₹4,200 for dedicated hazmat truck.',
        constraints_triggered: ['Material Bundling', 'Stacking Rules'],
        cost_impact: 4200,
      },
      {
        id: 'd-a-v1-4',
        type: 'rejected',
        subject: 'Split ORD-5504 across V1 and V12',
        reason:
          'Splitting ORD-5504 would reduce V12 utilisation from 85% to 78% without meaningful gain on V1. Minimum utilisation threshold satisfied on both vehicles — no reason to split.',
        constraints_triggered: ['Min Utilisation'],
        cost_impact: 0,
      },
    ],
    constraints_evaluated: [
      'Material Bundling',
      'ETA / ETD Windows',
      'Stacking Rules',
      'Pick / Drop Sequence',
      'Push / Pull Logic',
      'Min Utilisation',
      'Holiday Calendar',
      'Driver HOS',
    ],
    binding_constraints: ['Material Bundling', 'Stacking Rules'],
    confidence_factors: [
      { factor: 'All material compatibility checks passed', impact: 5 },
      { factor: 'Stacking plan verified — fragile at tailgate', impact: 3 },
      { factor: 'Driver HOS data fresh (14 min old)', impact: 2 },
      { factor: 'Delivery window buffer: 4h', impact: 2 },
      { factor: 'Corridor historical on-time rate: 94%', impact: 0 },
      { factor: 'Mumbai hub capacity unconfirmed for 06:00 window', impact: -2 },
    ],
  },

  'A-V2': {
    vehicleId: 'V2',
    planId: 'A',
    type: 'Reefer (-18°C) — Multi-drop BOM → PNQ',
    destination: 'Mumbai Hub → Pune Hub',
    composition: ['ORD-5501', 'ORD-5505'],
    utilisation: 50,
    cost: 24600,
    confidence: 89,
    decisions: [
      {
        id: 'd-a-v2-1',
        type: 'accepted',
        subject: 'Combined ORD-5501 and ORD-5505 on Reefer V2 (multi-drop)',
        reason:
          'Both orders are frozen goods (-18°C regime) — compatible in same reefer zone. ORD-5505 is Pune drop (second), loads first (front). ORD-5501 is Mumbai drop (first), loads last (tailgate). Multi-drop sequence preserves cold chain integrity.',
        constraints_triggered: ['Material Bundling', 'Pick / Drop Sequence'],
        cost_impact: 0,
      },
      {
        id: 'd-a-v2-2',
        type: 'rejected',
        subject: 'Add ORD-5507 (pharma 2–8°C) to V2',
        reason:
          'ORD-5507 requires 2–8°C. Mixing pharma with -18°C frozen creates two incompatible temperature zones — would require dual-zone reefer (not available in fleet). Routed to V3 insulated SCV.',
        constraints_triggered: ['Material Bundling'],
        cost_impact: 0,
      },
      {
        id: 'd-a-v2-3',
        type: 'rejected',
        subject: 'Standard forward pick-path (Mumbai order first)',
        reason:
          'Standard pick-path would load Mumbai order at front and Pune at tailgate. At Mumbai stop, driver would need to unload Pune cargo to reach Mumbai crates — 25-minute delay plus cold chain break. Reversed pick-path adopted (+3 min cold store penalty absorbed).',
        constraints_triggered: ['Pick / Drop Sequence'],
        cost_impact: 0,
      },
    ],
    constraints_evaluated: [
      'Material Bundling',
      'ETA / ETD Windows',
      'Stacking Rules',
      'Pick / Drop Sequence',
      'Push / Pull Logic',
      'Min Utilisation',
      'Holiday Calendar',
      'Driver HOS',
    ],
    binding_constraints: ['Material Bundling', 'Pick / Drop Sequence'],
    confidence_factors: [
      { factor: 'Reefer pre-cool schedule confirmed', impact: 4 },
      { factor: 'Reversed pick-path validated with warehouse', impact: 3 },
      { factor: 'Both orders within SLA windows', impact: 2 },
      { factor: 'Driver DRV-002 fresh HOS: 70/70 cycle hours', impact: 2 },
      { factor: 'Utilisation 50% — above 40% threshold', impact: 0 },
      { factor: 'Cold chain temp sensor calibration: 3 days old', impact: -2 },
    ],
  },

  'A-V3': {
    vehicleId: 'V3',
    planId: 'A',
    type: 'Insulated SCV (2–8°C)',
    destination: 'Mumbai Hub',
    composition: ['ORD-5507 — URGENT Pharma Vaccines'],
    utilisation: 20,
    cost: 9800,
    confidence: 96,
    decisions: [
      {
        id: 'd-a-v3-1',
        type: 'accepted',
        subject: 'Assigned ORD-5507 to dedicated Insulated SCV V3',
        reason:
          'Pharma vaccines require 2–8°C — V3 is the only fleet vehicle with this temperature regime. Order value ₹5.2L and 38-hour batch expiry window classify as URGENT. V3 locked out of deferred pool — dispatches at 14:30 regardless of utilisation.',
        constraints_triggered: ['Material Bundling', 'Min Utilisation'],
        cost_impact: 0,
      },
      {
        id: 'd-a-v3-2',
        type: 'rejected',
        subject: 'Consolidate V3 with another 2–8°C order',
        reason:
          'No other 2–8°C orders in Batch 14. Holding V3 for Batch 15 or 16 consolidation would exceed ORD-5507 pharma batch expiry. Min utilisation exemption granted (reefer/insulated exempt from 40% threshold).',
        constraints_triggered: ['Min Utilisation', 'Push / Pull Logic'],
        cost_impact: 0,
      },
      {
        id: 'd-a-v3-3',
        type: 'rejected',
        subject: 'Downgrade to passive-cooled FTL (as in Plan B)',
        reason:
          'Passive cooling on ambient FTL = 8% cold chain breach probability over 16h transit. Expected loss: ₹41,600 on ₹5.2L shipment. Confidence cost exceeds savings. Dedicated SCV retained.',
        constraints_triggered: ['Material Bundling'],
        cost_impact: -5200,
      },
    ],
    constraints_evaluated: [
      'Material Bundling',
      'ETA / ETD Windows',
      'Stacking Rules',
      'Pick / Drop Sequence',
      'Push / Pull Logic',
      'Min Utilisation',
      'Holiday Calendar',
      'Driver HOS',
    ],
    binding_constraints: ['Material Bundling', 'Min Utilisation'],
    confidence_factors: [
      { factor: 'Single high-value order, dedicated vehicle', impact: 6 },
      { factor: 'Temp monitoring active, pre-cooled to 4°C', impact: 4 },
      { factor: 'Driver DRV-003 pharma-certified', impact: 3 },
      { factor: 'Urgent deadline buffer: ~22h', impact: 2 },
      { factor: 'SCV mechanical check: 2 days old (edge)', impact: -1 },
    ],
  },

  'A-V4': {
    vehicleId: 'V4',
    planId: 'A',
    type: 'Hazmat Class 3',
    destination: 'Pune Hub',
    composition: ['ORD-5503 — UN1993 Industrial Solvent'],
    utilisation: 15,
    cost: 14200,
    confidence: 94,
    decisions: [
      {
        id: 'd-a-v4-1',
        type: 'accepted',
        subject: 'Isolated ORD-5503 on dedicated hazmat vehicle V4',
        reason:
          'UN1993 Class 3 Flammable — hazmat regulation requires isolation from all other cargo including other hazmat classes. V4 is DGR-compliant with spill containment tray, emergency kit, and placarding. Driver DRV-004 (Vikram S.) ADR-certified.',
        constraints_triggered: ['Material Bundling', 'Driver HOS'],
        cost_impact: 0,
      },
      {
        id: 'd-a-v4-2',
        type: 'rejected',
        subject: 'Co-load ORD-5503 with general Pune cargo',
        reason:
          'Hazmat Class 3 cannot be co-loaded under any circumstances — regulatory violation and insurance exclusion. Even a 15% utilisation vehicle is preferable to the compliance risk.',
        constraints_triggered: ['Material Bundling'],
        cost_impact: -4200,
      },
      {
        id: 'd-a-v4-3',
        type: 'rejected',
        subject: 'Defer ORD-5503 to next batch for hazmat consolidation',
        reason:
          'No other hazmat orders scheduled in Batch 15 or 16 (checked 48h forward). Order SLA is 2 days. Holding risks SLA breach for marginal utilisation gain.',
        constraints_triggered: ['ETA / ETD Windows', 'Push / Pull Logic'],
        cost_impact: 0,
      },
    ],
    constraints_evaluated: [
      'Material Bundling',
      'ETA / ETD Windows',
      'Stacking Rules',
      'Pick / Drop Sequence',
      'Push / Pull Logic',
      'Min Utilisation',
      'Holiday Calendar',
      'Driver HOS',
    ],
    binding_constraints: ['Material Bundling', 'Driver HOS'],
    confidence_factors: [
      { factor: 'ADR-certified driver DRV-004 assigned', impact: 4 },
      { factor: 'Spill kit + placarding pre-staged at Dock 5', impact: 3 },
      { factor: 'Hazmat exempt from min utilisation threshold', impact: 2 },
      { factor: 'Emergency response plan filed', impact: 2 },
      { factor: 'Vehicle last inspection: 8 days ago (within 14d)', impact: -1 },
    ],
  },

  'A-V6': {
    vehicleId: 'V6',
    planId: 'A',
    type: 'Standard 9T FTL',
    destination: 'Chennai Hub',
    composition: ['ORD-5506 URGENT', 'ORD-5509', 'ORD-5514', '+2 Chennai orders'],
    utilisation: 91,
    cost: 22400,
    confidence: 88,
    decisions: [
      {
        id: 'd-a-v6-1',
        type: 'accepted',
        subject: 'Locked ORD-5506 (URGENT auto parts) to V6',
        reason:
          'Plant line-stop deadline Apr 10, 08:00. V6 dispatches 14:30 today — arrival 06:00 vs deadline 08:00. Two-hour buffer. Heaviest order loads rear for weight distribution. V6 locked out of deferred pool.',
        constraints_triggered: ['ETA / ETD Windows', 'Stacking Rules'],
        cost_impact: 0,
      },
      {
        id: 'd-a-v6-2',
        type: 'accepted',
        subject: 'Added ORD-5514 (pending ASN, 92% prob) with late-add slot',
        reason:
          'Pending ASN with 92% confirmation probability by 14:30. Front-of-truck slot reserved. If ASN fails to confirm, V6 dispatches without it — remaining 4 orders already at 75% util.',
        constraints_triggered: ['Pick / Drop Sequence', 'Push / Pull Logic'],
        cost_impact: 0,
      },
      {
        id: 'd-a-v6-3',
        type: 'rejected',
        subject: 'Merge all 9 Chennai orders into V6 (as in Plan B)',
        reason:
          'At 95% utilisation, load tightness creates risk for URGENT ORD-5506 — no margin for late-add or dock delays. Split into V6 (5 orders @ 91%) + V7 (4 orders @ 73%). Plan B accepts this risk for ₹4,200 saving — Plan A prioritises urgent SLA certainty.',
        constraints_triggered: ['ETA / ETD Windows', 'Stacking Rules'],
        cost_impact: -4200,
      },
    ],
    constraints_evaluated: [
      'Material Bundling',
      'ETA / ETD Windows',
      'Stacking Rules',
      'Pick / Drop Sequence',
      'Push / Pull Logic',
      'Min Utilisation',
      'Holiday Calendar',
      'Driver HOS',
    ],
    binding_constraints: ['ETA / ETD Windows', 'Stacking Rules'],
    confidence_factors: [
      { factor: 'URGENT order locked with 2h SLA buffer', impact: 4 },
      { factor: 'Weight distribution verified (heaviest rear)', impact: 3 },
      { factor: 'ASN watch active for ORD-5514', impact: 2 },
      { factor: 'Driver DRV-006 fresh (5h used today)', impact: 2 },
      { factor: 'Chennai hub receiving window confirmed', impact: 1 },
      { factor: 'Utilisation 91% — dock delay risk', impact: -2 },
      { factor: 'ORD-5514 ASN not yet confirmed', impact: -2 },
    ],
  },

  'A-V8': {
    vehicleId: 'V8',
    planId: 'A',
    type: 'Standard 9T FTL',
    destination: 'Bangalore Hub',
    composition: ['ORD-5508', 'ORD-5511', '+1 Bangalore'],
    utilisation: 75,
    cost: 19200,
    confidence: 85,
    decisions: [
      {
        id: 'd-a-v8-1',
        type: 'accepted',
        subject: 'Combined 3 Bangalore orders on V8',
        reason:
          'All destined for Bangalore Hub. ORD-5511 (Electronics Displays) is fragile — no-stack zone with 1.2m clearance above. Loaded at tailgate. FMCG Beverages + General cargo stackable, loaded front/mid.',
        constraints_triggered: ['Material Bundling', 'Stacking Rules'],
        cost_impact: 0,
      },
      {
        id: 'd-a-v8-2',
        type: 'rejected',
        subject: 'Add V9 orders to V8',
        reason:
          'V9 is below 40% utilisation (38%) — deferring to Batch 15 for consolidation saves ₹6,200 (81% probability of fill). Merging into V8 would over-utilise at 95% with fragile displays at risk.',
        constraints_triggered: ['Min Utilisation', 'Push / Pull Logic', 'Stacking Rules'],
        cost_impact: 6200,
      },
      {
        id: 'd-a-v8-3',
        type: 'flagged',
        subject: 'Driver DRV-008 HOS monitoring',
        reason:
          'DRV-008 (Santosh K.) has 6.5h used today, 58/70 cycle hours. BLR route is 48h estimated transit — within 14h daily limit per segment. Monitoring flag raised but not blocking. Samsara sync active.',
        constraints_triggered: ['Driver HOS'],
        cost_impact: 0,
      },
    ],
    constraints_evaluated: [
      'Material Bundling',
      'ETA / ETD Windows',
      'Stacking Rules',
      'Pick / Drop Sequence',
      'Push / Pull Logic',
      'Min Utilisation',
      'Holiday Calendar',
      'Driver HOS',
    ],
    binding_constraints: ['Stacking Rules', 'Push / Pull Logic'],
    confidence_factors: [
      { factor: 'No-stack zone enforced for displays', impact: 3 },
      { factor: 'Utilisation 75% — healthy range', impact: 2 },
      { factor: 'SLA window comfortable (48h)', impact: 2 },
      { factor: 'Driver DRV-008 HOS at 58/70 cycle — monitoring', impact: -3 },
      { factor: 'Bangalore hub receiving slot confirmed', impact: 1 },
    ],
  },

  // ── Plan B (risk-accepted) — abbreviated traces ─────────────────────────
  'B-V1': {
    vehicleId: 'V1',
    planId: 'B',
    type: 'Standard 9T FTL',
    destination: 'Mumbai Hub',
    composition: ['ORD-5502', 'ORD-5504', 'ORD-5507 (pharma)', 'ORD-5513', '+1'],
    utilisation: 77,
    cost: 15200,
    confidence: 54,
    decisions: [
      {
        id: 'd-b-v1-1',
        type: 'accepted',
        subject: 'Merged ORD-5507 (pharma) into V1 with passive cooling',
        reason:
          'Saves ₹5,200 vs dedicated SCV. Pharma loaded in insulated wrap, positioned inside ambient FTL. Cold chain breach probability 8% over 16h transit.',
        constraints_triggered: ['Material Bundling', 'Min Utilisation'],
        cost_impact: -5200,
      },
      {
        id: 'd-b-v1-2',
        type: 'flagged',
        subject: 'High cold chain breach risk on ₹5.2L shipment',
        reason:
          'Expected loss: ₹41,600 (8% × ₹5.2L value). Planner must accept risk — recommendation is Plan A.',
        constraints_triggered: ['Material Bundling'],
        cost_impact: 0,
      },
    ],
    constraints_evaluated: [
      'Material Bundling',
      'ETA / ETD Windows',
      'Stacking Rules',
      'Pick / Drop Sequence',
      'Push / Pull Logic',
      'Min Utilisation',
      'Holiday Calendar',
      'Driver HOS',
    ],
    binding_constraints: ['Material Bundling'],
    confidence_factors: [
      { factor: 'Cold chain compromise — 8% breach probability', impact: -25 },
      { factor: 'High-value shipment (₹5.2L) at risk', impact: -18 },
      { factor: 'Utilisation 77% — healthy', impact: 2 },
      { factor: 'Passive cooling validated for short hauls', impact: -3 },
    ],
  },

  'B-V6': {
    vehicleId: 'V6',
    planId: 'B',
    type: 'Standard 9T FTL',
    destination: 'Chennai Hub',
    composition: ['All 9 Chennai orders incl URGENT ORD-5506'],
    utilisation: 95,
    cost: 18200,
    confidence: 62,
    decisions: [
      {
        id: 'd-b-v6-1',
        type: 'accepted',
        subject: 'Merged all 9 Chennai orders into V6',
        reason:
          'Eliminates V7 (₹4,200 saving). 95% utilisation — just under capacity.',
        constraints_triggered: ['Min Utilisation'],
        cost_impact: -4200,
      },
      {
        id: 'd-b-v6-2',
        type: 'flagged',
        subject: 'Load tightness risk for URGENT auto parts',
        reason:
          'At 95% utilisation, any pick delay or dock slot change cascades. URGENT ORD-5506 buffer narrows from 2h to 30min.',
        constraints_triggered: ['ETA / ETD Windows', 'Stacking Rules'],
        cost_impact: 0,
      },
    ],
    constraints_evaluated: [
      'Material Bundling',
      'ETA / ETD Windows',
      'Stacking Rules',
      'Pick / Drop Sequence',
      'Push / Pull Logic',
      'Min Utilisation',
      'Holiday Calendar',
      'Driver HOS',
    ],
    binding_constraints: ['ETA / ETD Windows', 'Stacking Rules'],
    confidence_factors: [
      { factor: 'Cost saving via consolidation', impact: 5 },
      { factor: '95% utilisation — no margin', impact: -12 },
      { factor: 'URGENT order buffer shrunk to 30 min', impact: -18 },
      { factor: 'Fragile loads more sensitive at high fill', impact: -8 },
    ],
  },
}

// ═══════════════════════════════════════════════════════════════════════════
// FEATURE 2 — Dynamic Pull/Push Timeline
// Orders with delivery_date, sla_date, priority to enable draggable timeline.
// Pre-computed re-optimisation outcomes for demo scenarios.
// ═══════════════════════════════════════════════════════════════════════════

// Current date anchor for relative dates (prototype uses a fixed "today")
export const TODAY = 'Apr 9'

// Timeline-enriched orders (subset used in the draggable strip).
// `priority`: P0 (urgent, fixed) → P3 (flexible, easy to shift)
// Pills arranged on a 5-day horizon: Today → Day+4
export const timelineOrders = [
  { id: 'ORD-5506', priority: 'P0', customerTier: 'Tier-1', material: 'Auto Parts', deliveryDate: 'Day+1', slaDate: 'Day+1', fixed: true, corridor: 'DEL→MAA', weight: 500 },
  { id: 'ORD-5507', priority: 'P0', customerTier: 'Tier-1', material: 'Pharma',     deliveryDate: 'Day+1', slaDate: 'Day+2', fixed: true, corridor: 'DEL→BOM', weight: 100 },
  { id: 'ORD-5503', priority: 'P1', customerTier: 'Tier-2', material: 'Hazmat',     deliveryDate: 'Day+1', slaDate: 'Day+2', fixed: true, corridor: 'DEL→PNQ', weight: 150 },
  { id: 'ORD-5502', priority: 'P1', customerTier: 'Tier-1', material: 'Electronics', deliveryDate: 'Day+2', slaDate: 'Day+3', fixed: false, corridor: 'DEL→BOM', weight: 600 },
  { id: 'ORD-5511', priority: 'P1', customerTier: 'Tier-2', material: 'Electronics', deliveryDate: 'Day+2', slaDate: 'Day+3', fixed: false, corridor: 'DEL→BLR', weight: 380 },
  { id: 'ORD-5501', priority: 'P2', customerTier: 'Tier-2', material: 'Frozen',     deliveryDate: 'Day+2', slaDate: 'Day+2', fixed: false, corridor: 'DEL→BOM', weight: 400 },
  { id: 'ORD-5505', priority: 'P2', customerTier: 'Tier-2', material: 'Frozen',     deliveryDate: 'Day+2', slaDate: 'Day+3', fixed: false, corridor: 'DEL→PNQ', weight: 350 },
  { id: 'ORD-5504', priority: 'P3', customerTier: 'Tier-3', material: 'Garments',   deliveryDate: 'Day+2', slaDate: 'Day+4', fixed: false, corridor: 'DEL→BOM', weight: 200 },
  { id: 'ORD-5508', priority: 'P3', customerTier: 'Tier-3', material: 'FMCG',       deliveryDate: 'Day+2', slaDate: 'Day+4', fixed: false, corridor: 'DEL→BLR', weight: 320 },
  { id: 'ORD-5509', priority: 'P3', customerTier: 'Tier-3', material: 'Textiles',   deliveryDate: 'Day+3', slaDate: 'Day+5', fixed: false, corridor: 'DEL→MAA', weight: 450 },
  { id: 'ORD-5513', priority: 'P3', customerTier: 'Tier-3', material: 'Cosmetics',  deliveryDate: 'Day+3', slaDate: 'Day+4', fixed: false, corridor: 'DEL→BOM', weight: 160 },
  { id: 'ORD-5510', priority: 'P2', customerTier: 'Tier-2', material: 'Frozen',     deliveryDate: 'Day+1', slaDate: 'Day+2', fixed: false, corridor: 'DEL→HYD', weight: 280 },
]

export const TIMELINE_DAYS = ['Today', 'Day+1', 'Day+2', 'Day+3', 'Day+4']

// Pre-computed re-optimisation outcomes for 3 demo scenarios.
// Lookup key: `${orderId}:${newDay}`
export const timelineScenarios = {
  // Scenario 1: Push ORD-5504 (Garments, Tier-3) from Day+2 to Day+3
  // Consolidates with ORD-5513 (Cosmetics) already on Day+3 → saves a truck
  'ORD-5504:Day+3': {
    summary: 'Pushed 1 order back. Pulled 0 orders forward.',
    changes: [
      'ORD-5504 now consolidates with ORD-5513 (Cosmetics) on Day+3 — same corridor, stackable.',
      'Trucks required for Day+2: 3 → 2.',
      'Utilisation: 71% → 89%.',
    ],
    costDelta: -8400,
    trucksBefore: 3,
    trucksAfter: 2,
    utilBefore: 71,
    utilAfter: 89,
    slaWarning: null,
  },
  // Scenario 2: Push ORD-5509 (Textiles, Tier-3) from Day+3 to Day+4
  'ORD-5509:Day+4': {
    summary: 'Pushed 1 order back. SLA buffer reduced but intact.',
    changes: [
      'ORD-5509 now ships on Day+4 with ORD-5506 follow-up consolidation opportunity.',
      'Trucks required for Day+3: 2 → 1.',
      'Utilisation: 68% → 86%.',
    ],
    costDelta: -6200,
    trucksBefore: 2,
    trucksAfter: 1,
    utilBefore: 68,
    utilAfter: 86,
    slaWarning: null,
  },
  // Scenario 3: Pull ORD-5513 (Cosmetics, Tier-3) forward to Today — breaks consolidation
  'ORD-5513:Today': {
    summary: 'Pulled 1 order forward. Consolidation broken — added truck required.',
    changes: [
      'ORD-5513 no longer consolidates with Day+3 Mumbai group.',
      'Today batch adds 1 truck (low utilisation at 24%).',
      'Utilisation: 82% → 59%.',
    ],
    costDelta: 5200,
    trucksBefore: 3,
    trucksAfter: 4,
    utilBefore: 82,
    utilAfter: 59,
    slaWarning: null,
    pullForward: true,
  },
  // Scenario 4: Push ORD-5507 (Pharma) past SLA — warning
  'ORD-5507:Day+3': {
    summary: 'SLA breach — pharma batch expiry at Day+2, 04:00.',
    changes: [
      'ORD-5507 is Tier-1 URGENT — batch expiry in 38h.',
      'Pushing to Day+3 violates customer SLA.',
      'Customer impact: HIGH.',
    ],
    costDelta: 0,
    trucksBefore: 3,
    trucksAfter: 3,
    utilBefore: 71,
    utilAfter: 71,
    slaWarning: 'Pushing beyond SLA — customer impact: High. Agent recommends not exceeding Day+2.',
  },
}

// ═══════════════════════════════════════════════════════════════════════════
// FEATURE 3 — Plan Diff View
// Versioned plan history with trigger events. At least 3 demo scenarios.
// ═══════════════════════════════════════════════════════════════════════════

export const planHistory = {
  v1: {
    version: 1,
    approvedAt: '09:12',
    approvedLabel: 'Plan A approved at 09:12',
    snapshot: 'baseline',
  },
}

// Three pre-built diff scenarios. Each can be triggered via demo controls.
export const planDiffScenarios = [
  {
    id: 'new-priority-order',
    triggerLabel: 'New priority order arrives',
    triggerEvent: 'New priority order #ORD-5599 arrived at 11:04 AM',
    triggerDescription:
      'Tier-1 customer placed a rush order: ORD-5599, pharma accessories (ambient), 180 kg, DEL→BOM corridor, SLA 24h.',
    previousVersion: 1,
    newVersion: 2,
    changesCount: 3,
    costBefore: 124800,
    costAfter: 127400,
    costDelta: 2600,
    utilBefore: 82,
    utilAfter: 84,
    changedTrucks: [
      {
        truckId: 'V1',
        before: { composition: 'ORD-5502, ORD-5504, ORD-5513, +1', driver: 'Rajesh K. (DRV-001)', util: 71 },
        after:  { composition: 'ORD-5502, ORD-5504, ORD-5513, +1, +ORD-5599', driver: 'Suresh M. (DRV-002)', util: 84 },
        reason:
          'Adding ORD-5599 to V1 was route-optimal (same Mumbai corridor) and respected material compatibility (ambient general). However, DRV-001 Rajesh K.\'s HOS would exceed legal limit (14h/day) with the added stop. DRV-002 Suresh M. has 4.5h available — reassigned.',
        constraintsTriggered: ['Driver HOS', 'Material Bundling'],
      },
    ],
    unchangedTrucks: ['V2', 'V3', 'V4', 'V5 (deferred)', 'V6', 'V7', 'V8', 'V9 (deferred)', 'V10', 'V11 (deferred)', 'V12'],
  },
  {
    id: 'driver-hos-update',
    triggerLabel: 'Driver HOS update from Samsara',
    triggerEvent: 'Samsara webhook at 11:21 AM — DRV-008 HOS update',
    triggerDescription:
      'DRV-008 (Santosh K., assigned to V8 Bangalore) completed a personal conveyance trip earlier this morning. HOS remaining dropped from 8.5h to 4h — insufficient for 48h Bangalore route.',
    previousVersion: 1,
    newVersion: 2,
    changesCount: 1,
    costBefore: 124800,
    costAfter: 124800,
    costDelta: 0,
    utilBefore: 82,
    utilAfter: 82,
    changedTrucks: [
      {
        truckId: 'V8',
        before: { composition: '3 Bangalore orders', driver: 'Santosh K. (DRV-008)', util: 75 },
        after:  { composition: '3 Bangalore orders (unchanged)', driver: 'Arun P. (DRV-011) — swap', util: 75 },
        reason:
          'DRV-008 HOS remaining 4h < required 14h for BLR route. DRV-011 Arun P. available with 12h cycle remaining and fresh daily limit. Samsara data refreshed — confirmed ready at Dock 4-A.',
        constraintsTriggered: ['Driver HOS'],
      },
    ],
    unchangedTrucks: ['V1', 'V2', 'V3', 'V4', 'V5 (deferred)', 'V6', 'V7', 'V9 (deferred)', 'V10', 'V11 (deferred)', 'V12'],
  },
  {
    id: 'truck-unavailable',
    triggerLabel: 'Truck V7 unavailable (mechanical)',
    triggerEvent: 'Fleet alert at 11:45 AM — V7 mechanical issue',
    triggerDescription:
      'V7 (Chennai FTL) flagged maintenance issue during pre-dispatch inspection. Estimated repair: 4h. Agent re-planned Chennai corridor.',
    previousVersion: 1,
    newVersion: 2,
    changesCount: 2,
    costBefore: 124800,
    costAfter: 131200,
    costDelta: 6400,
    utilBefore: 82,
    utilAfter: 86,
    changedTrucks: [
      {
        truckId: 'V7',
        before: { composition: '4 Chennai orders @ 73% util', driver: 'Manoj T. (DRV-007)', util: 73 },
        after:  { composition: 'REMOVED — replaced by V13 (spot-hired)', driver: '—', util: 0 },
        reason:
          'V7 flagged for maintenance. Spot vehicle V13 booked via carrier API — arriving at Dock 3-D by 14:30. Cost delta: +₹6,400 (spot premium over contracted rate). Alternative: merge into V6 at 95%+ util rejected (URGENT buffer risk).',
        constraintsTriggered: ['Driver HOS', 'ETA / ETD Windows'],
      },
      {
        truckId: 'V13',
        before: { composition: '—', driver: '—', util: 0 },
        after:  { composition: '4 Chennai orders (from V7)', driver: 'Ravi S. (DRV-014, spot)', util: 73 },
        reason:
          'Spot vehicle V13 provisioned. DRV-014 ADR-background-checked. Chennai corridor SLA unchanged — spot arrival 14:30 matches original dispatch window.',
        constraintsTriggered: ['ETA / ETD Windows'],
      },
    ],
    unchangedTrucks: ['V1', 'V2', 'V3', 'V4', 'V5 (deferred)', 'V6', 'V8', 'V9 (deferred)', 'V10', 'V11 (deferred)', 'V12'],
  },
]

// ═══════════════════════════════════════════════════════════════════════════
// FEATURE 4 — Infeasibility / Trade-off Negotiation
// Stress-day scenario: no clean Plan A possible. 3 trade-off options.
// ═══════════════════════════════════════════════════════════════════════════

export const stressDayContext = {
  label: 'Stress Day — Apr 14',
  batchNumber: 14,
  dateLabel: 'Apr 14, 2026',
  conditions: [
    { icon: 'Calendar',    text: 'Dr. Ambedkar Jayanti holiday in Maharashtra — Pune hub closed tomorrow' },
    { icon: 'UserMinus',   text: '2 drivers on leave (DRV-005 sick, DRV-009 personal)' },
    { icon: 'FlaskConical', text: '4 ADG Class 3 orders requiring isolation (UN1993 x2, UN1263 x2)' },
    { icon: 'TrendingDown', text: 'Minimum utilisation threshold (70%) conflicting with available fleet' },
  ],
  variantsEvaluated: 14,
  exhaustedApproaches: [
    'Standard consolidation — violates ADG isolation (4 hazmat in 3 vehicles)',
    'Hazmat split across 4 dedicated trucks — 2 drivers short',
    'Defer all hazmat to Day+1 — Pune hub closed tomorrow',
    'Relax min utilisation to 50% — still 1 truck short (driver shortage)',
  ],
}

export const tradeOffOptions = [
  {
    id: 'defer-low-priority',
    label: 'Option 1',
    title: 'Defer low-priority orders',
    description:
      'Defer 2 Tier-3 orders (ORD-5556 Textiles, ORD-5567 Cosmetics) to Day+2. Hazmat routed on 3 dedicated vehicles with available drivers.',
    costDelta: -6000,
    costDeltaLabel: 'Save ₹6,000',
    slaImpact: '2 orders delayed by 24 hrs',
    customerImpact: 'Low — both are Tier-3 accounts with 5-day SLA',
    riskLevel: 'low',
    confidence: 88,
    agentRecommended: false,
    rationale: 'Cheapest option. Risk is SLA breach on deferred orders — mitigated by Tier-3 tolerance.',
    details: [
      'Trucks required: 3 (all with available drivers)',
      'Hazmat isolation maintained (1 order per truck)',
      'Pune hub closure: avoided (deferred orders reschedule to Day+2)',
      'Utilisation: 72% avg across 3 trucks',
    ],
  },
  {
    id: 'spot-hire',
    label: 'Option 2',
    title: 'Spot-hire additional vehicle',
    description:
      'Hire 1 spot vehicle (hazmat-certified) via carrier API. All 4 hazmat orders dispatched on dedicated trucks. No SLA impact.',
    costDelta: 12000,
    costDeltaLabel: '+₹12,000',
    slaImpact: 'None — all orders meet SLA',
    customerImpact: 'None',
    riskLevel: 'medium',
    confidence: 79,
    agentRecommended: true,
    rationale:
      'Recommended. SLA breach cost on deferred Tier-3 orders (downstream escalation, possible repeat business impact) is estimated higher than ₹6,000 saving. Spot vehicle reliability risk is mitigated by isolating hazmat orders to a dedicated truck (single point of failure is acceptable for 1 vehicle vs fleet-wide).',
    details: [
      'Trucks required: 4 (3 contracted + 1 spot)',
      'Spot carrier reliability: 85% vs 98% contracted',
      'Spot carrier ADR-certified driver confirmed',
      'Utilisation: 78% avg',
    ],
  },
  {
    id: 'relax-utilisation',
    label: 'Option 3',
    title: 'Relax utilisation threshold',
    description:
      'Lower minimum truck utilisation from 70% to 55%. Deploy 4 trucks with existing drivers. All orders dispatch today.',
    costDelta: 9500,
    costDeltaLabel: '+₹9,500',
    slaImpact: 'None',
    customerImpact: 'None',
    riskLevel: 'medium',
    confidence: 82,
    agentRecommended: false,
    rationale:
      'Operationally simplest. Cost is higher than Option 1 but avoids SLA breach. Risk is setting a precedent — relaxed thresholds tend to persist, eroding the utilisation discipline the threshold enforces.',
    details: [
      'Trucks required: 4 (existing fleet, existing drivers)',
      'Min utilisation applied for today only: 55%',
      'Hazmat isolation maintained',
      'Utilisation: 58% avg across 4 trucks (below standard)',
    ],
  },
]

// ═══════════════════════════════════════════════════════════════════════════
// FEATURE 2 — Current plan snapshot (for timeline baseline state)
// ═══════════════════════════════════════════════════════════════════════════

export const timelineBaseline = {
  trucksRequired: 12,
  totalCost: 124800,
  avgUtilisation: 82,
}

// ═══════════════════════════════════════════════════════════════════════════
// Utility: map constraint name → short pill label & colour
// ═══════════════════════════════════════════════════════════════════════════

export const constraintPillConfig = {
  'Material Bundling':    { short: 'Material',    bg: 'bg-violet-500/15',  text: 'text-violet-300',  border: 'border-violet-500/30' },
  'ETA / ETD Windows':    { short: 'ETA/ETD',     bg: 'bg-blue-500/15',    text: 'text-blue-300',    border: 'border-blue-500/30' },
  'Stacking Rules':       { short: 'Stacking',    bg: 'bg-amber-500/15',   text: 'text-amber-300',   border: 'border-amber-500/30' },
  'Pick / Drop Sequence': { short: 'Pick/Drop',   bg: 'bg-cyan-500/15',    text: 'text-cyan-300',    border: 'border-cyan-500/30' },
  'Push / Pull Logic':    { short: 'Pull/Push',   bg: 'bg-emerald-500/15', text: 'text-emerald-300', border: 'border-emerald-500/30' },
  'Min Utilisation':      { short: 'Utilisation', bg: 'bg-pink-500/15',    text: 'text-pink-300',    border: 'border-pink-500/30' },
  'Holiday Calendar':     { short: 'Holiday',     bg: 'bg-orange-500/15',  text: 'text-orange-300',  border: 'border-orange-500/30' },
  'Driver HOS':           { short: 'HOS',         bg: 'bg-rose-500/15',    text: 'text-rose-300',    border: 'border-rose-500/30' },
}

export const ALL_CONSTRAINTS = Object.keys(constraintPillConfig)
