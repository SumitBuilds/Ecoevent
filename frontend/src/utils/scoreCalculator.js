/**
 * SEGREGACY — Sustainability Score Calculator
 * Implements Stage 3 of the FINAL methodology
 *
 * Score out of 100 based on 4 criteria.
 */

/**
 * @param {Object} params
 * @param {string} params.segregationStatus  — 'yes' | 'partial' | 'no'
 * @param {string} params.plateType          — 'steel' | 'disposable'
 * @param {string[]} params.decorTypes       — decoration types array
 * @param {number} params.predictedTotal     — total predicted waste (kg)
 * @param {number} params.actualTotal        — total actual waste (kg)
 * @returns {Object} score result
 */
export function calculateScore({
  segregationStatus,
  plateType,
  decorTypes = [],
  predictedTotal,
  actualTotal,
}) {
  let score = 0;
  const breakdown = {};

  // ─── Criterion 1: Segregation (40 points) ─────────────────────────
  const seg =
    segregationStatus === 'yes' ? 40 :
      segregationStatus === 'partial' ? 20 :
        0;
  score += seg;
  breakdown.segregation = { points: seg, max: 40, label: 'Waste Segregation' };

  // ─── Criterion 2: Reusable Plates (20 points) ─────────────────────
  const plateScore = plateType === 'steel' ? 20 : 0;
  score += plateScore;
  breakdown.plateType = { points: plateScore, max: 20, label: 'Reusable Plates Used' };

  // ─── Criterion 3: No Thermocol (15 points) ────────────────────────
  const noThermocol = !decorTypes.includes('thermocol') ? 15 : 0;
  score += noThermocol;
  breakdown.decor = { points: noThermocol, max: 15, label: 'No Thermocol Décor' };

  // ─── Criterion 4: Estimation Accuracy (25 points) ─────────────────
  const predicted = parseFloat(predictedTotal) || 0;
  const actual = parseFloat(actualTotal) || 0;

  const accuracy = predicted > 0
    ? Math.max(0, 1 - Math.abs(predicted - actual) / predicted)
    : 0;

  const accuracyScore =
    accuracy >= 0.85 ? 25 :
      accuracy >= 0.65 ? 15 :
        accuracy >= 0.40 ? 8 :
          0;
  score += accuracyScore;
  breakdown.accuracy = { points: accuracyScore, max: 25, label: 'Estimation Accuracy' };

  // ─── Final Score & Grade ──────────────────────────────────────────
  const finalScore = Math.min(100, Math.round(score));

  const grade =
    finalScore >= 80 ? { label: 'Excellent', color: 'green' } :
      finalScore >= 60 ? { label: 'Good', color: 'teal' } :
        finalScore >= 40 ? { label: 'Average', color: 'amber' } :
          { label: 'Poor', color: 'red' };

  return {
    score: finalScore,
    grade,
    breakdown,
    accuracy: round2(accuracy * 100),
    summary: `This event scored ${finalScore}/100 for sustainable waste management, ` +
      `with ${seg === 40 ? 'full segregation compliance' : seg === 20 ? 'partial segregation' : 'no segregation'} ` +
      `and ${plateType === 'steel' ? 'reusable plates' : 'disposable plates'}. ` +
      `Estimation accuracy was ${(accuracy * 100).toFixed(0)}%.`,
    details: { predictedTotal: predicted, actualTotal: actual, accuracy: round2(accuracy) },
  };
}

function round2(n) {
  return Math.round(n * 100) / 100;
}
