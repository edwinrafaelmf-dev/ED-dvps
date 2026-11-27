import { motion } from 'motion/react';
import { Heart, RotateCcw } from 'lucide-react';
import { FirebaseMemoriesSection } from './FirebaseMemoriesSection';

interface FarewellCardProps {
  noAttemptsCount: number;
  onRestart: () => void;
}

export function FarewellCard({ noAttemptsCount, onRestart }: FarewellCardProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20, scale: 0.97 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, y: -12, scale: 0.98 }}
      transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
      className="relative w-full max-w-2xl rounded-2xl border border-white/15 bg-[#120D1A]/86 p-5 text-[#FFFDFC] shadow-[0_28px_80px_-16px_rgba(0,0,0,0.72)] backdrop-blur-xl sm:p-10"
    >
      <div className="flex items-center justify-between text-xs font-medium tracking-wide text-[#E7C6D4]">
        <span>Mensaje final · De Edwin</span>
        <span className="inline-flex items-center gap-1.5">
          <Heart className="h-3.5 w-3.5 fill-[#FB7185] text-[#FB7185]" aria-hidden="true" />
          <span>Para Marie</span>
        </span>
      </div>

      <div className="my-4 border-t border-white/12 sm:my-5" />

      <div className="space-y-3 sm:space-y-3.5">
        <motion.div
          initial={{ scale: 0.92, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ delay: 0.12, duration: 0.45, ease: [0.16, 1, 0.3, 1] }}
          className="inline-flex h-11 w-11 items-center justify-center rounded-xl border border-[#FB7185]/30 bg-[#BE185D]/20 text-[#FDA4AF]"
          aria-hidden="true"
        >
          <Heart className="h-5 w-5 fill-[#FB7185] text-[#FB7185]" />
        </motion.div>

        <h1 className="font-display text-3xl font-semibold tracking-tight text-[#FFFDFC] sm:text-5xl">
          ¡Me encantas!
        </h1>

        <p className="max-w-[54ch] text-[15px] leading-relaxed text-[#F3E9EE] sm:text-lg">
          Aunque a veces diga que te odio, la verdad es que me encantas muchísimo, Marie.
          Nunca olvides que aquí estoy para ti.
        </p>

        <p className="font-display text-base italic text-[#FDA4AF] sm:text-lg">
          Con cariño, Edwin.
        </p>
      </div>

      <FirebaseMemoriesSection noAttemptsCount={noAttemptsCount} />

      <div className="mt-6 border-t border-white/12 pt-5">
        <button
          type="button"
          onClick={onRestart}
          className="inline-flex min-h-[46px] w-full sm:w-auto shrink-0 items-center justify-center gap-2 whitespace-nowrap rounded-xl border border-white/20 bg-white/8 px-5 py-2.5 text-sm font-medium text-[#FFFDFC] transition-colors duration-150 hover:bg-white/14 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#FB7185] cursor-pointer"
        >
          <RotateCcw className="h-4 w-4" aria-hidden="true" />
          <span>Volver a empezar</span>
        </button>
      </div>
    </motion.div>
  );
}
