function calculateScore({ segregationStatus, plateType, decorTypes, estimatedTotal, actualTotal }) {
  let score = 0
  const decor = decorTypes || []

  // KPI 1: Segregation Efficiency (40 pts)
  if (segregationStatus === 'yes') score += 40
  else if (segregationStatus === 'partial') score += 20

  // KPI 2: Plate Type (20 pts)
  if (plateType === 'steel') score += 20

  // KPI 3: No Thermocol (15 pts)
  if (!decor.includes('thermocol')) score += 15

  // KPI 4: Estimation Accuracy (25 pts)
  const diff = Math.abs((actualTotal || 0) - (estimatedTotal || 1))
  const accuracy = Math.max(0, 1 - diff / (estimatedTotal || 1))
  if (accuracy >= 0.85) score += 25
  else if (accuracy >= 0.65) score += 15
  else if (accuracy >= 0.40) score += 8

  return Math.min(100, Math.round(score))
}
module.exports = { calculateScore }
