function estimateWaste({ guestCount, cateringStyle, plateType, bottleCrates, decorTypes }) {
  const guests = Math.max(0, Number(guestCount) || 0)
  const crates = Math.max(0, Number(bottleCrates) || 0)
  const decor = Array.isArray(decorTypes) ? decorTypes : []
  const style = (cateringStyle || 'buffet').toLowerCase()
  const plate = (plateType || 'disposable').toLowerCase()

  // WET — Source: Everything Experiential 2024 (700-800kg/3-day wedding ÷ 400 guests)
  const foodPerGuest = style==='buffet' ? 0.50 : style==='plated' ? 0.30 : 0.15
  let wetKg = guests * foodPerGuest
  if (decor.includes('flowers')) wetKg += 8      // organic, field research Feb 2026
  const wetBins = Math.max(1, Math.ceil(wetKg / 45))  // CPCB SWM Rules 2016

  // DRY
  let dryKg = 0
  if (plate==='disposable' || plate==='yes' || plate==='yes — disposable') {
    dryKg += guests * 0.015   // 15g per disposable plate, physical measurement
  }
  dryKg += crates * 0.48      // 24 bottles × 20g = 0.48kg per crate
  if (decor.includes('thermocol')) dryKg += 5    // field research Feb 2026
  dryKg += guests * 0.05      // general packaging, CPCB MSW composition data
  const dryBins = Math.max(1, Math.ceil(dryKg / 22))  // CPCB SWM Rules 2016

  // RECYCLABLE
  let recyclableKg = 0
  recyclableKg += crates * 0.48 * 0.60    // 60% of bottles clean enough to recycle
  recyclableKg += guests * 0.02           // paper/cardboard, CPCB data
  const recycleBins = Math.max(1, Math.ceil(recyclableKg / 15))  // CPCB SWM Rules 2016

  return {
    wetBins, dryBins, recycleBins,
    totalBins: wetBins + dryBins + recycleBins,
    wetKg: Math.round(wetKg * 100) / 100,
    dryKg: Math.round(dryKg * 100) / 100,
    recyclableKg: Math.round(recyclableKg * 100) / 100,
    totalKg: Math.round((wetKg + dryKg + recyclableKg) * 100) / 100
  }
}
module.exports = { estimateWaste }
