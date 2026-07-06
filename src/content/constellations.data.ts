import type { Constellation, DestinationDoorId } from '@/domain/constellation-puzzle';

/**
 * One real, recognisable constellation per destination. Coordinates are
 * percentages of the puzzle stage (0..100 in each axis) — not astronomically
 * accurate, but close enough that the shapes read as their namesakes.
 *
 * Pairings are loosely thematic:
 *   about         → Lyra (the lyre — personal, expressive)
 *   ai            → Corona Borealis (the northern crown — "crown of AI")
 *   leadership    → Leo (the lion — leader of the constellations)
 *   engineering   → Hercules / Keystone (a structural, load-bearing asterism)
 *   elsewhere     → Cassiopeia (the queen — visible, outward-facing)
 */
const SHAPES: Record<DestinationDoorId, Constellation> = {
  about: {
    doorId: 'about',
    name: 'Lyra',
    // Vega at top, then a parallelogram body (the "lyre")
    stars: [
      { x: 50, y: 16 }, // Vega
      { x: 36, y: 46 }, // Sheliak (β)
      { x: 40, y: 78 }, // Zeta Lyrae
      { x: 64, y: 78 }, // Delta Lyrae
      { x: 66, y: 46 }, // Sulafat (γ)
    ],
  },
  ai: {
    doorId: 'ai',
    name: 'Corona Borealis',
    // A half-circle arc — the crown, opening downward
    stars: [
      { x: 14, y: 58 },
      { x: 30, y: 32 },
      { x: 52, y: 22 },
      { x: 74, y: 32 },
      { x: 88, y: 58 },
    ],
  },
  leadership: {
    doorId: 'leadership',
    name: 'Leo',
    // The "sickle" — Leo's head, a backwards-question-mark hook
    stars: [
      { x: 52, y: 20 },
      { x: 68, y: 30 },
      { x: 76, y: 50 },
      { x: 64, y: 68 },
      { x: 44, y: 78 }, // Regulus
    ],
  },
  engineering: {
    doorId: 'engineering',
    name: 'Hercules Keystone',
    // The Keystone — four stars forming the load-bearing trapezoid
    stars: [
      { x: 34, y: 26 },
      { x: 62, y: 22 },
      { x: 74, y: 76 },
      { x: 24, y: 80 },
    ],
  },
  elsewhere: {
    doorId: 'elsewhere',
    name: 'Cassiopeia',
    // The W (or M when seen the other way) — five stars in zig-zag
    stars: [
      { x: 14, y: 30 },
      { x: 32, y: 76 },
      { x: 50, y: 38 },
      { x: 68, y: 76 },
      { x: 86, y: 30 },
    ],
  },
};

export function constellationFor(doorId: DestinationDoorId): Constellation {
  return SHAPES[doorId];
}
