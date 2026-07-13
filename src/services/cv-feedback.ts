import { useCallback, useEffect, useRef, useState } from 'react';

/**
 * Two-state feedback for CV download buttons.
 *
 * On click: flips `clicked` true, holds for `durationMs`, then flips
 * back. Callers drive an animation from this state — text swap,
 * border glow, whatever fits the surrounding button style.
 *
 * The <a download> click doesn't need JS to trigger the download —
 * we're just piggybacking on the click event to acknowledge it.
 */
export function useCvClickFeedback(durationMs = 1400): {
  readonly clicked: boolean;
  readonly onClick: () => void;
} {
  const [clicked, setClicked] = useState(false);
  const timerRef = useRef<number | null>(null);

  useEffect(
    () => () => {
      if (timerRef.current !== null) window.clearTimeout(timerRef.current);
    },
    [],
  );

  const onClick = useCallback(() => {
    setClicked(true);
    if (timerRef.current !== null) window.clearTimeout(timerRef.current);
    timerRef.current = window.setTimeout(() => {
      setClicked(false);
      timerRef.current = null;
    }, durationMs);
  }, [durationMs]);

  return { clicked, onClick };
}
