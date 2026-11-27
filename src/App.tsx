import { useState } from 'react';
import { AnimatePresence, MotionConfig } from 'motion/react';
import { Volume2, VolumeX } from 'lucide-react';
import { BackdropStage, type StoryStage } from './components/BackdropStage';
import { EvasivePromptCard } from './components/EvasivePromptCard';
import { FarewellCard } from './components/FarewellCard';
import { FloatingPetals } from './components/FloatingPetals';
import { playAcceptChime, playDodgeTone } from './utils/sound';

const DODGE_HINTS_STAGE_1 = [
  'Ese botón no funciona para ti, Marie.',
  'Mmm... intenta con el otro botón.',
  'No aceptar no es una opción válida hoy.',
  '¿Segura? Mejor dale en Sí · Aceptar.',
];

const DODGE_HINTS_STAGE_2 = [
  'No puedes decir que no a eso.',
  'Prométemelo con el botón de Sí.',
  'Ese botón se escapó otra vez...',
  'Si lloras, me llamas. Pulsa Sí.',
];

const DODGE_HINTS_STAGE_3 = [
  'Sabes perfectamente que sí, Marie.',
  'Ese botón sigue sin dejarse atrapar.',
  'Vamos, solo tienes que pulsar Sí.',
  'Ni lo intentes, solo acepta que lo sabes.',
];

export default function App() {
  const [stage, setStage] = useState<StoryStage>('intro');
  const [soundEnabled, setSoundEnabled] = useState(true);
  const [totalNoAttempts, setTotalNoAttempts] = useState(0);

  const isLightStage = stage === 'intro';
  const isAsymmetricAnimeStage = stage === 'itazura' || stage === 'hate_confirm';

  const handleAdvance = (nextStage: StoryStage, isFinale = false) => {
    playAcceptChime(soundEnabled, isFinale);
    setStage(nextStage);
  };

  const handleDodge = () => {
    setTotalNoAttempts((prev) => prev + 1);
    playDodgeTone(soundEnabled);
  };

  const handleRestart = () => {
    playAcceptChime(soundEnabled, false);
    setTotalNoAttempts(0);
    setStage('intro');
  };

  return (
    <MotionConfig reducedMotion="user">
      <div className="relative min-h-dvh w-full overflow-x-hidden">
        <BackdropStage stage={stage} />
        <FloatingPetals tone={isLightStage ? 'light' : 'dark'} />

        {/* Minimal Floating Header */}
        <header className="relative z-20 mx-auto flex w-full max-w-7xl items-center justify-between gap-4 px-4 pb-3 pt-[max(0.875rem,env(safe-area-inset-top))] sm:gap-8 sm:px-10 sm:py-5">
          <span
            className={`font-display text-base font-semibold tracking-tight whitespace-nowrap shrink-0 transition-colors duration-300 sm:text-lg ${
              isLightStage ? 'text-[#2D1B22]' : 'text-[#FFFDFC]'
            }`}
          >
            Edwin · Marie
          </span>

          <button
            type="button"
            onClick={() => setSoundEnabled((prev) => !prev)}
            aria-label={soundEnabled ? 'Silenciar sonidos' : 'Activar sonidos'}
            className={`inline-flex min-h-[44px] shrink-0 items-center gap-2 whitespace-nowrap rounded-lg px-3.5 py-2 text-xs font-medium transition-colors duration-150 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#FB7185] cursor-pointer ${
              isLightStage
                ? 'border border-[#E2CFD5] bg-[#FFFDFC]/85 text-[#4B343C] hover:bg-[#FFFDFC]'
                : 'border border-white/15 bg-[#140F1C]/70 text-[#F5E8EE] hover:bg-[#140F1C]/90'
            }`}
          >
            {soundEnabled ? (
              <Volume2 className="h-4 w-4 sm:h-3.5 sm:w-3.5" aria-hidden="true" />
            ) : (
              <VolumeX className="h-4 w-4 sm:h-3.5 sm:w-3.5" aria-hidden="true" />
            )}
            <span>{soundEnabled ? 'Sonido activo' : 'Sin sonido'}</span>
          </button>
        </header>

        {/* Main Interactive Stage */}
        <main
          className={`relative z-20 mx-auto flex min-h-[calc(100dvh-76px)] w-full max-w-7xl items-center px-4 pb-[max(1.75rem,env(safe-area-inset-bottom))] pt-2 sm:min-h-[calc(100dvh-84px)] sm:px-10 sm:pb-12 sm:pt-4 ${
            isAsymmetricAnimeStage ? 'justify-center lg:justify-start' : 'justify-center'
          }`}
        >
          <AnimatePresence mode="wait">
            {stage === 'intro' && (
              <EvasivePromptCard
                key="intro"
                stepLabel="01 / 03 · Mensaje de Edwin"
                headline="¡Hola Marie! Te odio"
                promptText="Si quieres ver algo lindo que Edwin te envió, elige si deseas aceptarlo."
                yesLabel="Sí · Aceptar"
                noLabel="No · No aceptar"
                variant="light"
                dodgeHints={DODGE_HINTS_STAGE_1}
                onAccept={() => handleAdvance('itazura')}
                onDodge={handleDodge}
              />
            )}

            {stage === 'itazura' && (
              <EvasivePromptCard
                key="itazura"
                stepLabel="02 / 03 · Para ti"
                headline="No quiero que vuelvas a llorar"
                subheadline="Y si lloras, llámame."
                promptText="¿Me prometes que siempre vas a contar conmigo y llamarme si algo te hace llorar?"
                yesLabel="Sí"
                noLabel="No"
                variant="dark"
                dodgeHints={DODGE_HINTS_STAGE_2}
                onAccept={() => handleAdvance('hate_confirm')}
                onDodge={handleDodge}
              />
            )}

            {stage === 'hate_confirm' && (
              <EvasivePromptCard
                key="hate_confirm"
                stepLabel="03 / 03 · Última pregunta"
                headline="¡Te odio mucho, lo sabes!"
                promptText="Si lo sabes, pulsa Sí para descubrir lo último que quiero decirte."
                yesLabel="Sí"
                noLabel="No"
                variant="dark"
                dodgeHints={DODGE_HINTS_STAGE_3}
                onAccept={() => handleAdvance('farewell', true)}
                onDodge={handleDodge}
              />
            )}

            {stage === 'farewell' && (
              <FarewellCard
                key="farewell"
                noAttemptsCount={totalNoAttempts}
                onRestart={handleRestart}
              />
            )}
          </AnimatePresence>
        </main>
      </div>
    </MotionConfig>
  );
}
