import { useCallback, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import type { Door } from '@/domain/door';
import { BodyBlocks } from './BodyBlocks';

const REVEAL_EASE = [0.16, 1, 0.3, 1] as const;

interface ArtifactCardProps {
  readonly door: Door;
  readonly onClose: () => void;
  /**
   * Origin point for the bloom animation, in stage percent (0–100).
   * Defaults to the centre. When provided, the card scales out from
   * that pixel — used so an artifact "blooms" from its destination
   * vertex instead of appearing in the middle of the screen.
   */
  readonly originXPercent?: number;
  readonly originYPercent?: number;
}

export function ArtifactCard({
  door,
  onClose,
  originXPercent = 50,
  originYPercent = 50,
}: ArtifactCardProps) {
  const closeButtonRef = useRef<HTMLButtonElement>(null);

  /**
   * Close wrapper that first blurs any focused input and resets the
   * window scroll. On iOS, focusing a <textarea> inside a fixed-
   * positioned panel scrolls the whole window to bring the input into
   * view above the keyboard — even with overflow:hidden on the body.
   * That scroll offset lingers after the modal closes, and the canvas
   * underneath appears shifted. Blur + scrollTo(0,0) undoes both.
   */
  const handleClose = useCallback(() => {
    if (typeof document !== 'undefined') {
      (document.activeElement as HTMLElement | null)?.blur();
    }
    if (typeof window !== 'undefined') {
      window.scrollTo(0, 0);
    }
    onClose();
  }, [onClose]);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') handleClose();
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [handleClose]);

  useEffect(() => {
    const previouslyFocused = document.activeElement as HTMLElement | null;
    closeButtonRef.current?.focus();
    return () => previouslyFocused?.focus();
  }, []);

  /**
   * Bloom origin: use the destination's stage percent directly as the
   * panel's transform-origin percent. Not pixel-accurate to the actual
   * destination position (the panel is now viewport-centred, not stage-
   * aligned), but directionally correct — ABOUT (top-left vertex) blooms
   * from the panel's top-left, LEADERSHIP (top-right) from top-right, etc.
   */
  const originXForPanel = originXPercent;
  const originYForPanel = originYPercent;

  /**
   * Chat-only doors (artifact is a single aiChat block) take over the
   * sticky header instead of nesting their own header inside the body —
   * keeps everything in one visual block, no duplicated bars.
   */
  const isChatOnly =
    door.artifact.length === 1 && door.artifact[0].kind === 'aiChat';

  return (
    <AnimatePresence>
      <motion.div
        role="dialog"
        aria-modal="true"
        aria-label={door.name}
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        transition={{ duration: 0.18 }}
        onClick={handleClose}
        className="artifact-modal-pad"
        style={{
          /* Card lives at viewport level so it can grow well beyond the
           * pentagon stage. Click anywhere outside the panel dismisses.
           * Backdrop padding is class-driven so it tightens on phones. */
          position: 'fixed',
          inset: 0,
          pointerEvents: 'auto',
          zIndex: 10,
          cursor: 'default',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
        }}
      >
        <motion.div
          initial={{ scale: 0.18, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 0.4, opacity: 0 }}
          transition={{ duration: 0.42, ease: REVEAL_EASE }}
          onClick={(e) => e.stopPropagation()}
          className={
            isChatOnly ? 'artifact-panel-width artifact-panel-chat' : 'artifact-panel-width'
          }
          style={{
            /* dvh (not vh) so the panel resizes as the mobile keyboard
             * opens / closes; keeps the sticky composer above the
             * keyboard instead of pinned to the layout-viewport bottom. */
            maxHeight: 'min(86dvh, 760px)',
            overflowY: 'auto',
            /* Explicit hidden — otherwise CSS silently promotes overflowX
             * to 'auto' whenever overflowY is set, and any child that
             * doesn't wrap (postCard row, long token) produces a
             * horizontal scrollbar inside the panel. */
            overflowX: 'hidden',
            transformOrigin: `${originXForPanel}% ${originYForPanel}%`,
            pointerEvents: 'auto',
            cursor: 'auto',
            background: 'linear-gradient(180deg, rgba(13,18,48,0.96) 0%, rgba(6,6,15,0.96) 100%)',
            border: '1px solid rgba(178, 212, 229, 0.18)',
            borderRadius: 12,
            color: 'var(--text-bright)',
            lineHeight: 1.55,
            /* Inset top-edge highlight gives the panel a subtle glass
             * lift; outer glow + heavy drop-shadow do the depth. */
            boxShadow:
              'inset 0 1px 0 rgba(255, 255, 255, 0.06), ' +
              '0 0 24px rgba(178, 212, 229, 0.12), ' +
              '0 0 64px rgba(178, 212, 229, 0.08), ' +
              '0 24px 64px rgba(0, 0, 0, 0.55)',
          }}
        >
          {/* Sticky panel header — section name leads as the eyebrow
           * title, identity + role sit under it as a small mono
           * subtitle, actions align right. Because canvas identity is
           * hidden while a modal is open, this is the ONLY place the
           * visitor sees "who + how to download the CV" during a deep
           * read, without duplicating anything behind the panel. */}
          <header className="artifact-panel-header">
            <div className="artifact-panel-header-inner">
              <div className="artifact-panel-header-title">
                <div className="artifact-panel-header-section">
                  {isChatOnly ? 'ask me anything' : door.name}
                </div>
                <div className="artifact-panel-header-identity">
                  <span className="artifact-panel-header-identity-name">Borbála Szilágyi</span>
                  <span className="artifact-panel-header-identity-role">
                    {' · Software Engineer · Team Lead'}
                  </span>
                </div>
              </div>
              <div className="artifact-panel-header-actions">
                <button
                  ref={closeButtonRef}
                  type="button"
                  aria-label="close"
                  title="close"
                  onClick={handleClose}
                  className="artifact-panel-header-close"
                >
                  ✕
                </button>
              </div>
            </div>
          </header>
          <div className={isChatOnly ? 'artifact-body artifact-body-chat' : 'artifact-body'}>
            <BodyBlocks door={door} />
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}
