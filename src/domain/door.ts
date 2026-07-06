import type { ArtifactBlock } from './artifact';

export type DoorId =
  | 'leadership' | 'engineering' | 'elsewhere' | 'ai' | 'about' | 'fortune';

export interface Door {
  readonly id: DoorId;
  readonly name: string;
  readonly tagline: string;
  /** Number of tile slots required to power this door. */
  readonly slots: number;
  readonly artifact: readonly ArtifactBlock[];
}
