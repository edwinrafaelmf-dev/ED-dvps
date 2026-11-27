import { useCallback, useEffect, useRef, useState } from 'react';
import { motion } from 'motion/react';
import { Check, Heart } from 'lucide-react';

interface EvasivePromptCardProps {
  stepLabel: string;
  headline: string;
  subheadline?: string;
  promptText: string;
  yesLabel: string;
  noLabel: string;
  variant: 'light' | 'dark';
  dodgeHints: string[];
  onAccept: () => void;
  onDodge?: () => void;
}

interface Offset {
  x: number;
  y: number;
  rotate: number;
}

export function EvasivePromptCard({
  stepLabel,
  headline,
  subheadline,
  promptText,
  yesLabel,
  noLabel,
  variant,
  dodgeHints,
  onAccept,
  onDodge,
}: EvasivePromptCardProps) {
  const cardRef = useRef<HTMLDivElement | null>(null);
  const yesButtonRef = useRef<HTMLButtonElement | null>(null);
  const noButtonRef = useRef<HTMLButtonElement | null>(null);

  const [dodgeCount, setDodgeCount] = useState(0);
  const [cardShift, setCardShift] = useState<Offset>({ x: 0, y: 0, rotate: 0 });
  const [noOffset, setNoOffset] = useState<{ x: number; y: number }>({ x: 0, y: 0 });
  const lastDodgeTimeRef = useRef(0);

  // Reset positions whenever the step changes
  useEffect(() => {
    setDodgeCount(0);
    setCardShift({ x: 0, y: 0, rotate: 0 });
    setNoOffset({ x: 0, y: 0 });
  }, [stepLabel, headline]);

  const triggerEvade = useCallback(
    (pointerClientX?: number, pointerClientY?: number) => {
      const now = Date.now();
      if (now - lastDodgeTimeRef.current < 90) return;
      lastDodgeTimeRef.current = now;

      const isCompact = typeof window !== 'undefined' && window.innerWidth < 640;

      // Shift the entire card interface gently within safe viewport margins
      const maxCardX = isCompact ? 8 : 42;
      const maxCardY = isCompact ? 12 : 28;

      const dirX = Math.random() > 0.5 ? 1 : -1;
      const dirY = Math.random() > 0.5 ? 1 : -1;

      setCardShift({
        x: dirX * (isCompact ? 5 + Math.random() * 3 : 12 + Math.random() * (maxCardX - 12)),
        y: dirY * (isCompact ? 6 + Math.random() * 6 : 8 + Math.random() * (maxCardY - 8)),
        rotate: dirX * (isCompact ? 0.4 + Math.random() * 0.7 : 0.6 + Math.random() * 1.2),
      });

      // Move the "No" button to a safe non-overlapping offset inside the viewport
      setNoOffset((prev) => {
        const noEl = noButtonRef.current;
        const yesEl = yesButtonRef.current;
        const vw = typeof window !== 'undefined' ? window.innerWidth : 1024;
        const vh = typeof window !== 'undefined' ? window.innerHeight : 768;

        const rangeX = isCompact ? 64 : 170;
        const rangeY = isCompact ? 52 : 96;

        const noRect = noEl?.getBoundingClientRect();
        const yesRect = yesEl?.getBoundingClientRect();

        // Approximate resting center of the No button without its current transform
        const baseCenterX = noRect ? noRect.left + noRect.width / 2 - prev.x : vw / 2;
        const baseCenterY = noRect ? noRect.top + noRect.height / 2 - prev.y : vh / 2;
        const noW = noRect ? noRect.width : 120;
        const noH = noRect ? noRect.height : 48;

        let bestX = prev.x;
        let bestY = prev.y;
        let foundSafe = false;

        for (let attempt = 0; attempt < 20; attempt++) {
          let candX = (Math.random() * 2 - 1) * rangeX;
          let candY = (Math.random() * 2 - 1) * rangeY;

          if (
            attempt < 8 &&
            typeof pointerClientX === 'number' &&
            typeof pointerClientY === 'number' &&
            noRect
          ) {
            const awayX = noRect.left + noW / 2 >= pointerClientX ? 1 : -1;
            const awayY = noRect.top + noH / 2 >= pointerClientY ? 1 : -1;
            candX = awayX * (36 + Math.random() * Math.max(20, rangeX - 36));
            candY = awayY * (24 + Math.random() * Math.max(18, rangeY - 24));
          }

          const candCenterX = baseCenterX + candX;
          const candCenterY = baseCenterY + candY;

          // Keep button safely inside viewport padding
          const pad = 16;
          if (
            candCenterX - noW / 2 < pad ||
            candCenterX + noW / 2 > vw - pad ||
            candCenterY - noH / 2 < pad + 64 ||
            candCenterY + noH / 2 > vh - pad
          ) {
            continue;
          }

          // Never overlap the "Sí" button
          if (yesRect) {
            const margin = 16;
            const overlapsYes =
              candCenterX + noW / 2 > yesRect.left - margin &&
              candCenterX - noW / 2 < yesRect.right + margin &&
              candCenterY + noH / 2 > yesRect.top - margin &&
              candCenterY - noH / 2 < yesRect.bottom + margin;
            if (overlapsYes) continue;
          }

          // Require meaningful movement distance from current position
          const dist = Math.hypot(candX - prev.x, candY - prev.y);
          if (dist >= 44 || attempt >= 14) {
            bestX = Math.round(candX);
            bestY = Math.round(candY);
            foundSafe = true;
            break;
          }
        }

        // Guaranteed non-overlapping fallback below/away from "Sí"
        if (!foundSafe) {
          bestX = 0;
          bestY = prev.y >= 40 ? 0 : 62;
        }

        return { x: bestX, y: bestY };
      });

      setDodgeCount((c) => c + 1);
      onDodge?.();
    },
    [onDodge]
  );

  const handleCardPointerMove = useCallback(
    (e: React.PointerEvent<HTMLDivElement>) => {
      if (e.pointerType === 'touch') return;
      const btn = noButtonRef.current;
      if (!btn) return;

      const rect = btn.getBoundingClientRect();
      const buffer = 22;
      const insideBuffer =
        e.clientX >= rect.left - buffer &&
        e.clientX <= rect.right + buffer &&
        e.clientY >= rect.top - buffer &&
        e.clientY <= rect.bottom + buffer;

      if (insideBuffer) {
        triggerEvade(e.clientX, e.clientY);
      }
    },
    [triggerEvade]
  );

  const isLight = variant === 'light';

  const cardSurfaceClasses = isLight
    ? 'bg-[#FFFDFC]/92 text-[#1F171A] border border-[#E7D8DD] shadow-[0_24px_64px_-20px_rgba(68,25,40,0.18)] backdrop-blur-md'
    : 'bg-[#140F1C]/86 text-[#FFFDFC] border border-white/15 shadow-[0_28px_72px_-18px_rgba(0,0,0,0.65)] backdrop-blur-xl';

  const metaTextClass = isLight ? 'text-[#7C5B66]' : 'text-[#E7C6D4]';
  const bodyTextClass = isLight ? 'text-[#443238]' : 'text-[#F3E9EE]';
  const dividerClass = isLight ? 'border-[#ECDFE3]' : 'border-white/12';

  const noButtonClasses = isLight
    ? 'border border-[#DECBD2] bg-[#FAF4F6] text-[#5C444D] hover:bg-[#F3E7EB]'
    : 'border border-white/20 bg-white/8 text-[#F5E8EE] hover:bg-white/12';

  const activeHint =
    dodgeCount > 0 ? dodgeHints[(dodgeCount - 1) % dodgeHints.length] : null;

  return (
    <motion.div
      ref={cardRef}
      onPointerMove={handleCardPointerMove}
      initial={{ opacity: 0, y: 18, scale: 0.98 }}
      animate={{
        opacity: 1,
        x: cardShift.x,
        y: cardShift.y,
        rotate: cardShift.rotate,
        scale: 1,
      }}
      exit={{ opacity: 0, y: -14, scale: 0.98 }}
      transition={{
        type: 'spring',
        stiffness: 340,
        damping: 22,
        mass: 0.85,
      }}
      className={`relative w-full max-w-xl rounded-2xl p-5 sm:p-10 ${cardSurfaceClasses}`}
    >
      {/* Editorial Chapter Metadata (Unboxed, Zero-Pill) */}
      <div className={`flex items-center justify-between gap-3 text-xs font-medium tracking-wide ${metaTextClass}`}>
        <span className="truncate">{stepLabel}</span>
        <span className="inline-flex shrink-0 items-center gap-1.5">
          <Heart className="h-3.5 w-3.5 text-[#E11D48]" aria-hidden="true" />
          <span>Para Marie</span>
        </span>
      </div>

      <div className={`my-4 border-t sm:my-5 ${dividerClass}`} />

      {/* Main Message */}
      <div className="space-y-3 sm:space-y-3.5">
        <h1 className="font-display text-[1.75rem] font-semibold tracking-tight leading-[1.15] sm:text-5xl">
          {headline}
        </h1>

        {subheadline && (
          <p className={`font-display text-lg italic leading-snug sm:text-2xl ${isLight ? 'text-[#9F1239]' : 'text-[#FDA4AF]'}`}>
            {subheadline}
          </p>
        )}

        <p className={`max-w-[54ch] text-[15px] leading-relaxed sm:text-lg ${bodyTextClass}`}>
          {promptText}
        </p>
      </div>

      {/* Interactive Action Arena */}
      <div className="relative mt-7 flex min-h-[112px] flex-wrap content-start items-center gap-3 pt-1 sm:mt-8 sm:min-h-[72px] sm:gap-4 sm:pt-2">
        <button
          ref={yesButtonRef}
          type="button"
          onClick={onAccept}
          className="inline-flex min-h-[48px] shrink-0 items-center justify-center gap-2 whitespace-nowrap rounded-xl bg-[#BE185D] px-6 py-3 text-sm font-semibold text-white shadow-sm transition-all duration-150 hover:bg-[#9D174D] active:scale-[0.98] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#FB7185] sm:px-7 cursor-pointer"
        >
          <Check className="h-4 w-4" aria-hidden="true" />
          <span>{yesLabel}</span>
        </button>

        <motion.button
          ref={noButtonRef}
          type="button"
          tabIndex={-1}
          aria-disabled="true"
          animate={{ x: noOffset.x, y: noOffset.y }}
          transition={{
            type: 'spring',
            stiffness: 460,
            damping: 24,
          }}
          onMouseEnter={(e) => triggerEvade(e.clientX, e.clientY)}
          onPointerEnter={(e) => triggerEvade(e.clientX, e.clientY)}
          onPointerDown={(e) => {
            e.preventDefault();
            triggerEvade(e.clientX, e.clientY);
          }}
          onTouchStart={(e) => {
            e.preventDefault();
            const touch = e.touches[0];
            triggerEvade(touch?.clientX, touch?.clientY);
          }}
          onFocus={(e) => {
            e.currentTarget.blur();
            triggerEvade();
          }}
          onClick={(e) => {
            e.preventDefault();
            e.stopPropagation();
            triggerEvade(e.clientX, e.clientY);
          }}
          className={`inline-flex min-h-[48px] shrink-0 items-center justify-center whitespace-nowrap rounded-xl px-5 py-3 text-sm font-medium select-none touch-none cursor-not-allowed sm:px-6 ${noButtonClasses}`}
        >
          {noLabel}
        </motion.button>
      </div>

      {/* Subtle Evasive Feedback Line */}
      <div className="mt-5 min-h-[22px]">
        {activeHint && (
          <motion.p
            key={dodgeCount}
            initial={{ opacity: 0, y: 4 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.18 }}
            className={`text-xs font-medium ${metaTextClass}`}
          >
            {activeHint}
          </motion.p>
        )}
      </div>
    </motion.div>
  );
}
