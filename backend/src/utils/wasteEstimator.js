/**
 * EcoEvent Waste Estimation Engine
 *
 * SOURCES FOR ALL VALUES:
 * [1] 700-800kg wet waste per 400-guest Indian wedding
 *     → Everything Experiential (2024), industry experts + NGO Feeding India
 *     → 750kg ÷ 400 guests ÷ 3 days = 0.625 → conservative = 0.5 (buffet)
 *
 * [2] Buffet generates more waste than plated service
 *     → Vyas (2012), Bangalore UAS study — cited in Abacademies Journal 2022
 *     → Plated = 40% less than buffet → 0.5 × 0.6 = 0.3 kg/guest
 *
 * [3] Bin capacities — CPCB Solid Waste Management Rules 2016
 *     → 120L bin = 45 kg wet waste, 22 kg dry waste
 *     → 60L bin = 15 kg recyclable
 *
 * [4] PET 500ml bottle weight = ~20g (physical measurement)
 *     → 1 crate × 24 bottles × 0.02 kg = 0.48 kg per crate
 *
 * [5] Field research — Chembur & Thane venues, Feb 2026
 *     → Floral setup = ~8 kg wet waste per event
 *     → Thermocol decoration = ~5 kg non-recyclable per event
 *     → General packaging = ~0.05 kg per guest
 *     → Paper/cardboard = ~0.02 kg per guest
 */

function estimateWaste({
  guestCount,
  cateringStyle,
  plateType,
  bottleCrates,
  decorTypes
}) {
  // Sanitize inputs
  const guests = Math.max(0, Number(guestCount) || 0)
  const crates = Math.max(0, Number(bottleCrates) || 0)
  const decor = Array.isArray(decorTypes) ? decorTypes : []
  const style = (cateringStyle || 'buffet').toLowerCase()
  const plate = (plateType || 'disposable').toLowerCase()

  // ─── WET WASTE ───────────────────────────────────────────────────────────
  // Source [1] [2]: per-guest food waste by catering style
  const foodPerGuest =
    style === 'buffet'   ? 0.50 :  // highest wastage
    style === 'plated'   ? 0.30 :  // controlled portions
    style === 'cocktail' ? 0.15 :  // snacks only
    style === 'snacks'   ? 0.15 :  // snacks only
    0.50                            // default to buffet

  let wetKg = guests * foodPerGuest

  // Source [5]: flowers = organic = wet waste
  if (decor.includes('flowers')) {
    wetKg += 8
  }

  // Bin count: Source [3] — 120L bin = 45 kg wet
  const wetBins = Math.max(1, Math.ceil(wetKg / 45))

  // ─── DRY WASTE ───────────────────────────────────────────────────────────
  let dryKg = 0

  // Source [4]: disposable plates = 15g each, 1 per guest
  if (plate === 'disposable' || plate === 'yes' || plate === 'yes — disposable') {
    dryKg += guests * 0.015
  }

  // Source [4]: water bottles — all bottles go to dry first
  // (60% will be clean enough to recycle — handled in recyclable section)
  dryKg += crates * 0.48

  // Source [5]: thermocol = 100% non-recyclable dry waste
  if (decor.includes('thermocol')) {
    dryKg += 5
  }

  // Source [5]: general packaging waste (wrappers, foil, bags)
  dryKg += guests * 0.05

  // Bin count: Source [3] — 120L bin = 22 kg dry
  const dryBins = Math.max(1, Math.ceil(dryKg / 22))

  // ─── RECYCLABLE WASTE ────────────────────────────────────────────────────
  let recyclableKg = 0

  // Clean bottles: 60% of bottles are clean enough to recycle
  recyclableKg += crates * 0.48 * 0.6

  // Paper/cardboard: menus, gift wrap, cardboard boxes
  // Source [5]: ~0.02 kg per guest
  recyclableKg += guests * 0.02

  // Bin count: Source [3] — 60L bin = 15 kg recyclable
  const recycleBins = Math.max(1, Math.ceil(recyclableKg / 15))

  // ─── SMART TIPS ──────────────────────────────────────────────────────────
  const tips = []

  if (plate === 'disposable' || plate === 'yes' || plate === 'yes — disposable') {
    const saved = (guests * 0.015).toFixed(1)
    tips.push(`Switch to steel plates → saves ${saved} kg of dry waste`)
  }

  if (decor.includes('thermocol')) {
    tips.push('Avoid thermocol décor → 100% non-recyclable, adds 5 kg to landfill')
  }

  if (decor.includes('flowers')) {
    tips.push('Donate flowers post-event to temples or composting units → saves ~8 kg wet waste')
  }

  if (crates > 5) {
    tips.push(`Replace ${crates} crates of bottles with water dispensers → major plastic reduction`)
  }

  if (style === 'buffet') {
    tips.push('Consider portion-controlled buffet service → can reduce food waste by up to 30%')
  }

  if (tips.length === 0) {
    tips.push('Excellent choices — your event is well optimised for sustainability!')
  }

  return {
    // Bin counts — shown to user
    wetBins,
    dryBins,
    recycleBins,
    totalBins: wetBins + dryBins + recycleBins,

    // Raw kg — shown in donut chart, NOT shown as primary output
    wetKg:        Math.round(wetKg * 100) / 100,
    dryKg:        Math.round(dryKg * 100) / 100,
    recyclableKg: Math.round(recyclableKg * 100) / 100,
    totalKg:      Math.round((wetKg + dryKg + recyclableKg) * 100) / 100,

    // Improvement tips
    tips
  }
}

module.exports = { estimateWaste }
