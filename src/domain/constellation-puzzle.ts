/**
 * Pure domain for the constellation puzzle. No React, no DOM.
 *
 * A constellation is a small set of stars on a 0..100 stage. Stars are
 * clicked in any order — each click lights one. The polyline segment
 * between two consecutive stars (in data order) becomes lit when both
 * its endpoints are clicked. Solved when every star has been clicked.
 */

import type { DoorId } from './door';

export type DestinationDoorId = Exclude<DoorId, 'fortune'>;

export interface ConstellationStar {
  /** 0..100, percentage of the puzzle stage along the x-axis. */
  readonly x: number;
  /** 0..100, percentage of the puzzle stage along the y-axis. */
  readonly y: number;
}

export interface Constellation {
  readonly doorId: DestinationDoorId;
  /** Display name of the real-world constellation (e.g. "Lyra"). */
  readonly name: string;
  /**
   * Stars in the order their connecting polyline visits them. Click order
   * doesn't matter for solving, but this array order defines which star
   * pairs are joined by line segments (i.e. star[0]↔star[1], star[1]↔star[2], …).
   */
  readonly stars: readonly ConstellationStar[];
}

export interface ConstellationState {
  readonly constellation: Constellation;
  /** Star indices currently lit. Order recorded for animation, not validation. */
  readonly clicked: readonly number[];
}

export function initial(constellation: Constellation): ConstellationState {
  return { constellation, clicked: [] };
}

/**
 * Returns the next state after clicking `starIdx`. Adds the star if it's
 * not already lit and the index is in range; otherwise the input state is
 * returned unchanged.
 */
export function tryClick(state: ConstellationState, starIdx: number): ConstellationState {
  if (starIdx < 0 || starIdx >= state.constellation.stars.length) return state;
  if (state.clicked.includes(starIdx)) return state;
  return { ...state, clicked: [...state.clicked, starIdx] };
}

export function isClicked(state: ConstellationState, starIdx: number): boolean {
  return state.clicked.includes(starIdx);
}

/**
 * Whether the segment between stars[idxA] and stars[idxB] is lit.
 * Lit when both endpoints are clicked.
 */
export function isSegmentLit(
  state: ConstellationState,
  idxA: number,
  idxB: number,
): boolean {
  return state.clicked.includes(idxA) && state.clicked.includes(idxB);
}

export function isSolved(state: ConstellationState): boolean {
  return state.clicked.length === state.constellation.stars.length;
}
