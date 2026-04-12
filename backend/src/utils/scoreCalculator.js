// Scoring mapped to project KPIs — Section 3.4 EcoEvent Synopsis 2025-26
function calculateScore({
  segregationStatus,
  plateType,
  decorTypes,
  estimatedTotal,
  actualTotal
}) {
  let score = 0
  const breakdown = {
    segregation: 0,
    plates: 0,
    decor: 0,
    accuracy: 0
  }
  const decor = decorTypes || []

  // KPI 1: Segregation Efficiency (40 pts)
  if (segregationStatus === 'yes') breakdown.segregation = 40
  else if (segregationStatus === 'partial') breakdown.segregation = 20

  // KPI 2: Plate Type / Vendor Compliance (20 pts)
  if (plateType === 'steel') breakdown.plates = 20

  // KPI 3: No Thermocol — Waste Reduction at Source (15 pts)
  if (!decor.includes('thermocol')) breakdown.decor = 15

  // KPI 4: Estimation Accuracy — Pre/Post Analysis (25 pts)
  // More granular scoring for precision
  const est = Number(estimatedTotal) || 1
  const act = Number(actualTotal) || 0
  const diff = Math.abs(act - est)
  const accuracyRatio = Math.max(0, 1 - (diff / est))
  
  // 8-tier accuracy scoring for precision
  if (accuracyRatio >= 0.95)      breakdown.accuracy = 25   // Near-perfect match
  else if (accuracyRatio >= 0.90) breakdown.accuracy = 22   // Excellent accuracy
  else if (accuracyRatio >= 0.85) breakdown.accuracy = 20   // Very good accuracy
  else if (accuracyRatio >= 0.75) breakdown.accuracy = 17   // Good accuracy  
  else if (accuracyRatio >= 0.65) breakdown.accuracy = 14   // Moderate accuracy
  else if (accuracyRatio >= 0.50) breakdown.accuracy = 10   // Fair accuracy
  else if (accuracyRatio >= 0.35) breakdown.accuracy = 6    // Below average
  else if (accuracyRatio >= 0.20) breakdown.accuracy = 3    // Poor accuracy
  else                            breakdown.accuracy = 0    // Very poor

  const total = breakdown.segregation + breakdown.plates + breakdown.decor + breakdown.accuracy
  return {
    total: Math.min(100, Math.round(total)),
    breakdown
  }
}

module.exports = { calculateScore }
