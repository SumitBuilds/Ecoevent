/**
 * EcoEvent Sustainability Score Calculator
 * 4 KPIs — 100 points total — mapped to project synopsis Section 3.4
 */
function calculateScore({
  segregationStatus,
  plateType,
  decorTypes,
  estimatedBins,
  wetFill,
  dryFill,
  recycleFill,
  compactionFactor = 1.0
}) {
  let score = 0
  const decor = (Array.isArray(decorTypes) ? decorTypes : []).map(d => d.toLowerCase())

  // Normalise to lowercase — prevents 'Yes' vs 'yes' bugs
  const seg   = (segregationStatus || '').toString().toLowerCase().trim()
  const plate = (plateType         || '').toString().toLowerCase().trim()

  // KPI 1 — Segregation (40 pts)
  if      (seg === 'yes')     score += 40
  else if (seg === 'partial') score += 20

  // KPI 2 — Plate type (20 pts)
  if (plate === 'steel' || plate === 'reusable' || plate.includes('steel')) {
    score += 20
  }

  // KPI 3 — No thermocol (15 pts)
  const hasThermocol = decor.some(d => d.includes('thermocol'))
  if (!hasThermocol) score += 15

  // KPI 4 — Estimation accuracy (25 pts)
  // CORRECT formula: fill level × predicted bins = actual bins used
  const estWet = Math.max(1, Number(estimatedBins?.wet)        || 1)
  const estDry = Math.max(1, Number(estimatedBins?.dry)        || 1)
  const estRec = Math.max(1, Number(estimatedBins?.recyclable) || 1)
  const estTotal = estWet + estDry + estRec

  const actualWet = Math.ceil((Number(wetFill)     || 0) * estWet)
  const actualDry = Math.ceil((Number(dryFill)     || 0) * estDry * (compactionFactor || 1.0))
  const actualRec = Math.ceil((Number(recycleFill) || 0) * estRec)
  const actTotal  = actualWet + actualDry + actualRec

  const diff     = Math.abs(actTotal - estTotal)
  const accuracy = estTotal > 0 ? Math.max(0, 1 - diff / estTotal) : 0

  const accuracyPts =
    accuracy >= 0.85 ? 25 :
    accuracy >= 0.65 ? 15 :
    accuracy >= 0.40 ?  8 : 0
  score += accuracyPts

  const total = Math.min(100, Math.round(score))
  const grade =
    total >= 80 ? 'Excellent' :
    total >= 60 ? 'Good'      :
    total >= 40 ? 'Average'   : 'Poor'

  return {
    total,
    grade,
    breakdown: {
      segregation:  seg === 'yes' ? 40 : seg === 'partial' ? 20 : 0,
      plateType:    (plate === 'steel' || plate.includes('steel')) ? 20 : 0,
      noThermocol:  !hasThermocol ? 15 : 0,
      accuracy:     accuracyPts
    },
    accuracyPercent: Math.round(accuracy * 100),
    actualTotal:     actTotal,
    estimatedTotal:  estTotal
  }
}
module.exports = { calculateScore }
