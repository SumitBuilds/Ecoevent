/**
 * SEGREGACY — Pre-Event Waste Prediction Engine
 * Implements Steps 1–5 of the FINAL methodology
 */

// Step 1 — Food waste multipliers (kg per guest)
const FOOD_WASTE_PER_GUEST = {
  buffet: 0.5,
  plated: 0.3,
  snacks: 0.15,
};

// Step 4 — Category composition percentages
const CATEGORY_SPLIT = {
  wet: 0.60,
  dry: 0.25,
  recyclable: 0.15,
};

// Step 5 — Bin capacities in kg
const BIN_CAPACITY = {
  wet: 45,
  dry: 22,
  recyclable: 15,
};

/**
 * @param {Object} params
 * @param {number} params.guestCount       — number of guests
 * @param {string} params.cateringStyle    — 'buffet' | 'plated' | 'snacks'
 * @param {string} params.plateType        — 'steel' | 'disposable'
 * @param {number} params.bottleCrates     — number of water bottle crates
 * @param {string[]} params.decorTypes     — e.g. ['flowers','thermocol','fabric','led','none']
 * @param {number} params.duration         — event duration in days (default 1)
 * @returns {Object} prediction result
 */
export function estimateWaste({
  guestCount,
  cateringStyle = 'buffet',
  plateType = 'disposable',
  bottleCrates = 0,
  decorTypes = [],
  duration = 1,
}) {
  const guests = parseInt(guestCount || 0, 10);
  const crates = parseInt(bottleCrates || 0, 10);
  const days = Math.max(1, parseInt(duration || 1, 10));
  const tips = [];

  // ─── STEP 1: Food Waste Prediction ─────────────────────────────────
  const wastePerGuest = FOOD_WASTE_PER_GUEST[cateringStyle] || 0.5;
  const foodWaste = guests * wastePerGuest;

  // ─── STEP 2: Item-Based Waste ──────────────────────────────────────
  const plateWaste = plateType === 'disposable' ? guests * 0.015 : 0;
  const bottleWaste = crates * 0.5;
  const thermocolWaste = decorTypes.includes('thermocol') ? 5 : 0;
  const flowerWaste = decorTypes.includes('flowers') ? 8 : 0;
  const packagingWaste = guests * 0.05;

  // ─── STEP 3: Total Predicted Waste ─────────────────────────────────
  const totalPredictedWaste =
    foodWaste +
    plateWaste +
    bottleWaste +
    thermocolWaste +
    flowerWaste +
    packagingWaste;

  // ─── STEP 4: Waste Category Split (Item-Based) ───────────────────
  // Map specific items to categories for much higher accuracy
  const wetWaste = foodWaste + flowerWaste;
  const dryWaste = plateWaste + thermocolWaste + packagingWaste;
  const recyclableWaste = bottleWaste;

  // Global split for "miscellaneous" or residual waste (e.g., from generic guest activity)
  const residualTotal = totalPredictedWaste * 0.05; // 5% buffer for generic city-waste profile
  const finalWet = wetWaste + (residualTotal * CATEGORY_SPLIT.wet);
  const finalDry = dryWaste + (residualTotal * CATEGORY_SPLIT.dry);
  const finalRecyclable = recyclableWaste + (residualTotal * CATEGORY_SPLIT.recyclable);

  // ─── STEP 5: Bin Requirement ──────────────────────────────────────
  const wetBins = Math.max(1, Math.ceil(finalWet / BIN_CAPACITY.wet));
  const dryBins = Math.max(1, Math.ceil(finalDry / BIN_CAPACITY.dry));
  const recyclableBins = Math.max(1, Math.ceil(finalRecyclable / BIN_CAPACITY.recyclable));
  const totalBins = wetBins + dryBins + recyclableBins;

  // ─── Smart Tips ───────────────────────────────────────────────────
  if (plateType === 'disposable') {
    tips.push(`Switch to reusable plates → saves ${plateWaste.toFixed(1)} kg of dry waste`);
  }
  if (decorTypes.includes('thermocol')) {
    tips.push('Avoid thermocol décor — it is 100% non-recyclable and adds ~5 kg to landfill');
  }
  if (decorTypes.includes('flowers')) {
    tips.push('Donate flowers post-event to temples or composting units — saves ~8 kg wet waste');
  }
  if (cateringStyle === 'buffet') {
    tips.push('Consider portion-controlled buffet service — can reduce food waste by up to 30%');
  }
  if (crates > 5) {
    tips.push(`Consider water dispensers instead of ${crates} crates of bottles — major plastic reduction`);
  }
  if (tips.length === 0) {
    tips.push('Excellent choices! Your event is well-optimised for sustainability.');
  }

  return {
    // Step 1
    foodWaste: round2(foodWaste),
    wastePerGuest,

    // Step 2 — item breakdown
    plateWaste: round2(plateWaste),
    bottleWaste: round2(bottleWaste),
    thermocolWaste: round2(thermocolWaste),
    flowerWaste: round2(flowerWaste),
    packagingWaste: round2(packagingWaste),

    // Step 3
    totalPredictedWaste: round2(totalPredictedWaste),

    // Step 4 — category split (kg)
    wetWaste: round2(finalWet),
    dryWaste: round2(finalDry),
    recyclableWaste: round2(finalRecyclable),

    // Step 5 — bins
    wetBins,
    dryBins,
    recyclableBins,
    totalBins,

    // Meta
    tips,
    guests,
    days,
  };
}

function round2(n) {
  return Math.round(n * 100) / 100;
}
