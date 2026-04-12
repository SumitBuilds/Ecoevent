/**
 * SEGREGACY — Event Day Actual Waste Calculator
 * Implements Step 6 of the FINAL methodology
 *
 * Converts bin fill levels (%) to actual waste in kg using densities.
 */

// Waste densities (kg per litre)
const DENSITY = {
  wet: 0.35,
  dry: 0.17,
  recyclable: 0.12,
};

// Physical bin volumes (litres)
const BIN_VOLUME = {
  wet: 120,
  dry: 120,
  recyclable: 60,
};

/**
 * Calculate actual waste from fill-level observations.
 *
 * @param {Object} params
 * @param {number[]} params.wetFills        — Array of fill fractions per wet bin (0.25, 0.50, 0.75, 1.0)
 * @param {number[]} params.dryFills        — Array of fill fractions per dry bin
 * @param {number[]} params.recyclableFills — Array of fill fractions per recyclable bin
 * @returns {Object} actual waste breakdown
 */
export function calculateActualWaste({
  wetFills = [],
  dryFills = [],
  recyclableFills = [],
}) {
  // Sum across all bins of each type
  const actualWet = wetFills.reduce(
    (sum, fill) => sum + fill * BIN_VOLUME.wet * DENSITY.wet, 0
  );
  const actualDry = dryFills.reduce(
    (sum, fill) => sum + fill * BIN_VOLUME.dry * DENSITY.dry, 0
  );
  const actualRecyclable = recyclableFills.reduce(
    (sum, fill) => sum + fill * BIN_VOLUME.recyclable * DENSITY.recyclable, 0
  );

  const totalActualWaste = actualWet + actualDry + actualRecyclable;

  return {
    actualWet: round2(actualWet),
    actualDry: round2(actualDry),
    actualRecyclable: round2(actualRecyclable),
    totalActualWaste: round2(totalActualWaste),
  };
}

function round2(n) {
  return Math.round(n * 100) / 100;
}
