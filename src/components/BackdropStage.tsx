import { useState } from 'react';
import { AnimatePresence, motion } from 'motion/react';

export type StoryStage = 'intro' | 'itazura' | 'hate_confirm' | 'farewell';

interface StageVisual {
  src: string;
  alt: string;
  fallbackGradient: string;
  scrimClass: string;
  imageClass: string;
}

const BASE = import.meta.env.BASE_URL;

const STAGE_VISUALS: Record<StoryStage, StageVisual> = {
  intro: {
    src: `${BASE}src/assets/images/marie_intro_sakura_1795788730134.jpg`,
    alt: 'Cortinas iluminadas por la luz de la mañana con pétalos de cerezo flotando',
    fallbackGradient: 'bg-gradient-to-br from-[#FBF6F4] via-[#F5E4E8] to-[#EBD8DF]',
    scrimClass: 'bg-gradient-to-b from-[#FAF5F4]/55 via-[#FAF5F4]/40 to-[#F3E5E9]/70',
    imageClass: 'object-cover object-center',
  },
  itazura: {
    src: `${BASE}src/assets/images/itazura_anime_bg_1795788730553.jpg`,
    alt: 'Escena romántica estilo anime clásico bajo un paraguas con pétalos de sakura y lluvia suave al atardecer',
    fallbackGradient: 'bg-gradient-to-br from-[#191D3A] via-[#2B2544] to-[#4A2538]',
    scrimClass:
      'bg-gradient-to-t from-[#0E0B16]/90 via-[#120E1D]/60 to-[#120E1D]/28 lg:bg-gradient-to-r lg:from-[#0E0B16]/86 lg:via-[#120E1D]/52 lg:to-transparent',
    imageClass: 'object-cover object-[52%_32%] lg:object-center',
  },
  hate_confirm: {
    src: `${BASE}src/assets/images/itazura_anime_bg_1795788730553.jpg`,
    alt: 'Escena nocturna estilo anime bajo faroles cálidos y cerezos en flor',
    fallbackGradient: 'bg-gradient-to-br from-[#1B1224] via-[#2F1930] to-[#481B2C]',
    scrimClass:
      'bg-gradient-to-t from-[#120A16]/92 via-[#190D1D]/68 to-[#140B18]/36 lg:bg-gradient-to-r lg:from-[#120A16]/90 lg:via-[#190D1D]/70 lg:to-[#140B18]/35',
    imageClass: 'object-cover object-[52%_32%] lg:object-center scale-[1.03]',
  },
  farewell: {
    src: `${BASE}src/assets/images/marie_farewell_starlight_1795788730319.jpg`,
    alt: 'Cielo estrellado nocturno sobre luces cálidas de la ciudad y flores de cerezo en un balcón',
    fallbackGradient: 'bg-gradient-to-br from-[#0F1326] via-[#261934] to-[#441E32]',
    scrimClass: 'bg-gradient-to-t from-[#0D0A14]/82 via-[#120D1A]/52 to-[#0D0A14]/45',
    imageClass: 'object-cover object-center',
  },
};

interface BackdropStageProps {
  stage: StoryStage;
}

export function BackdropStage({ stage }: BackdropStageProps) {
  const [failedSrcs, setFailedSrcs] = useState<Record<string, boolean>>({});
  const visual = STAGE_VISUALS[stage];
  const hasFailed = Boolean(failedSrcs[visual.src]);

  return (
    <div className="fixed inset-0 z-0 overflow-hidden select-none" aria-hidden="true">
      <AnimatePresence mode="wait">
        <motion.div
          key={stage}
          initial={{ opacity: 0, scale: 1.02 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.55, ease: [0.16, 1, 0.3, 1] }}
          className={`absolute inset-0 ${visual.fallbackGradient}`}
        >
          {!hasFailed && (
            <img
              src={visual.src}
              alt={visual.alt}
              referrerPolicy="no-referrer"
              onError={() =>
                setFailedSrcs((prev) => ({
                  ...prev,
                  [visual.src]: true,
                }))
              }
              className={`h-full w-full transition-transform duration-700 ${visual.imageClass}`}
            />
          )}
          <div className={`absolute inset-0 ${visual.scrimClass}`} />
        </motion.div>
      </AnimatePresence>
    </div>
  );
}
