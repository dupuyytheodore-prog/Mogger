/*
 * Mogger PSL-style scoring example
 *
 * Geometry subscores are expected on a 1–10 scale. This is an illustrative,
 * user-defined rubric, not a scientific attractiveness measure or a true
 * population bell curve. The supplied piecewise PSL mapping has jumps.
 */

function clamp(value, min, max) {
  return Math.min(max, Math.max(min, value));
}

/** Weighted geometry score, using the supplied structure weights. */
function geometryScore({
  symmetry,
  horizontalFifths,
  verticalThirds,
  goldenRatioProximity
}) {
  return (
    0.35 * symmetry +
    0.25 * horizontalFifths +
    0.25 * verticalThirds +
    0.15 * goldenRatioProximity
  );
}

/** Normalize a 1–10 geometry result to 0–100. */
function geometryTo100(score) {
  return clamp(((score - 1) / 9) * 100, 0, 100);
}

/** Apply the supplied integer-based 0–100 to PSL-style mapping. */
function mapToPsl(geometry100) {
  const score = Math.round(clamp(geometry100, 0, 100));
  let rating;
  let label;

  if (score < 56) {
    rating = 1 + (score / 56) * 2.5;
    label = "Sub-5 (below average)";
  } else if (score <= 74) {
    rating = 4 + ((score - 56) / 18) * 0.5;
    label = "Population average";
  } else if (score <= 86) {
    rating = 5 + ((score - 75) / 11) * 0.5;
    label = "Above average";
  } else if (score <= 94) {
    rating = 6 + ((score - 87) / 7) * 0.5;
    label = "Elite / model tier";
  } else {
    rating = 7 + ((score - 95) / 5);
    label = "Top model tier";
  }

  return {
    geometry: score,
    psl: Math.round(rating * 100) / 100,
    label
  };
}

/** Mogger's separate display composite: 95% geometry and 5% eye-color rating. */
function moggerComposite(geometry, eyeColorRating) {
  return 0.95 * geometry + 0.05 * eyeColorRating;
}

/**
 * Angle at the jaw point, in degrees.
 * Requires three {x, y} points. A true gonial angle requires an ear/ramus
 * landmark; a 68-point front-facing scan can only provide a 2D contour proxy.
 */
function angleDegrees(pointA, jawPoint, chinPoint) {
  const ax = pointA.x - jawPoint.x;
  const ay = pointA.y - jawPoint.y;
  const cx = chinPoint.x - jawPoint.x;
  const cy = chinPoint.y - jawPoint.y;
  const denominator = Math.hypot(ax, ay) * Math.hypot(cx, cy);

  if (!denominator) return null;

  const cosine = clamp((ax * cx + ay * cy) / denominator, -1, 1);
  return Math.acos(cosine) * (180 / Math.PI);
}

// Example: geometry 82/100 maps to PSL-style 5.32, “Above average”.
const example = mapToPsl(82);
console.log(`Geometry: ${example.geometry}/100`);
console.log(`PSL-style score: ${example.psl} — ${example.label}`);

// CommonJS export for Node.js use. In a browser, call the functions directly.
if (typeof module !== "undefined" && module.exports) {
  module.exports = {
    geometryScore,
    geometryTo100,
    mapToPsl,
    moggerComposite,
    angleDegrees
  };
}
