/**
 * Segregacy Frontend Waste Estimation Engine
 * Keep in sync with segregacy-backend/src/utils/wasteEstimator.js
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

/**
 * @param {Object} params
 * @param {number} params.guestCount       — number of guests
 * @param {string} params.cateringStyle    — 'buffet' | 'plated' | 'snacks' | 'cocktail'
 * @param {string} params.plateType        — 'steel' | 'disposable'
 * @param {number} params.bottleCrates     — number of water bottle crates (24 bottles each)
 * @param {string[]} params.decorTypes     — e.g. ['flowers', 'thermocol', 'none']
 * @returns {Object} prediction result
 */
export function estimateWaste({
  guestCount,
  cateringStyle = 'buffet',
  plateType = 'disposable',
  bottleCrates = 0,
  decorTypes = [],
}) {
  // Sanitize inputs
  const guests = Math.max(0, parseInt(guestCount || 0, 10))
  const crates = Math.max(0, parseInt(bottleCrates || 0, 10))
  const decor  = Array.isArray(decorTypes) ? decorTypes : []
  const style  = (cateringStyle || 'buffet').toLowerCase()
  const plate  = (plateType || 'disposable').toLowerCase()
  const tips   = []

  // ─── WET WASTE ───────────────────────────────────────────────────────────
  // Source [1] [2]: per-guest food waste by catering style
  const foodPerGuest =
    style === 'buffet'   ? 0.50 :
    style === 'plated'   ? 0.30 :
    style === 'cocktail' ? 0.15 :
    style === 'snacks'   ? 0.15 :
    0.50

  let wetKg = guests * foodPerGuest

  // Source [5]: flowers = organic = wet waste (scaled: ~0.02kg per guest)
  if (decor.includes('flowers')) {
    wetKg += guests * 0.02
  }

  // Bin count: Source [3] — 120L bin = 45 kg wet
  const wetBins = wetKg > 0 ? Math.ceil(wetKg / 45) : 0

  // ─── DRY WASTE ───────────────────────────────────────────────────────────
  let dryKg = 0

  // Source [4]: disposable plates = 15g each, 1 per guest
  if (plate === 'disposable') {
    dryKg += guests * 0.015
  }

  // Source [4]: water bottles — all bottles go to dry first, but we must SPLIT them
  // 60% are clean enough to recycle, remaining 40% are dry waste
  dryKg += crates * 0.48 * 0.4

  // Source [5]: thermocol = 100% non-recyclable dry waste (scaled: ~0.0125kg per guest)
  if (decor.includes('thermocol')) {
    dryKg += guests * 0.0125
  }

  // Source [5]: general packaging waste (wrappers, foil, bags)
  dryKg += guests * 0.05

  // Bin count: Source [3] — 120L bin = 22 kg dry
  const dryBins = dryKg > 0 ? Math.ceil(dryKg / 22) : 0

  // ─── RECYCLABLE WASTE ────────────────────────────────────────────────────
  let recyclableKg = 0

  // Clean bottles: 60% of bottles are clean enough to recycle
  recyclableKg += crates * 0.48 * 0.6

  // Paper/cardboard: menus, gift wrap, cardboard boxes
  // Source [5]: ~0.02 kg per guest
  recyclableKg += guests * 0.02

  // Bin count: Source [3] — 60L bin = 15 kg recyclable
  const recyclableBins = recyclableKg > 0 ? Math.ceil(recyclableKg / 15) : 0

  // ─── SMART TIPS ──────────────────────────────────────────────────────────
  if (plate === 'disposable') {
    const saved = (guests * 0.015).toFixed(1)
    tips.push(`Switch to steel plates → saves ${saved} kg of dry waste`)
  }
  if (decor.includes('thermocol')) {
    const thermoWaste = (guests * 0.0125).toFixed(1)
    tips.push(`Avoid thermocol décor → 100% non-recyclable, adds ~${thermoWaste} kg to landfill`)
  }
  if (decor.includes('flowers')) {
    const flowerWaste = (guests * 0.02).toFixed(1)
    tips.push(`Donate flowers post-event to temples or composting units → saves ~${flowerWaste} kg wet waste`)
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
    // Bin counts
    wetBins,
    dryBins,
    recyclableBins,
    totalBins: wetBins + dryBins + recyclableBins,

    // Raw kg — for donut chart
    wetKg:           round2(wetKg),
    dryKg:           round2(dryKg),
    recyclableKg:    round2(recyclableKg),
    totalPredictedKg: round2(wetKg + dryKg + recyclableKg),

    // Tips
    tips,
    guests,
  }
}

function round2(n) {
  return Math.round(n * 100) / 100
}
