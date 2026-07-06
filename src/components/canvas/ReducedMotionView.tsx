import { doors } from '@/content/doors.data';
import type { DoorId } from '@/domain/door';
import { AllDoorsStack } from './AllDoorsStack';

const DOOR_ORDER: readonly DoorId[] =
  ['about', 'ai', 'leadership', 'engineering', 'elsewhere'];

/**
 * Fallback for visitors who've requested reduced motion. Skips the cosmic
 * canvas entirely (no parallax, no orbit, no puzzles) and renders every
 * room's content as a static, scrollable stack — same visual treatment as
 * the "see all" skip path elsewhere, but with no close button since there's
 * nowhere to go back to.
 */
export function ReducedMotionView() {
  const ordered = DOOR_ORDER
    .map((id) => doors.find((d) => d.id === id))
    .filter((d): d is import('@/domain/door').Door => d !== undefined);
  return <AllDoorsStack doors={ordered} />;
}
