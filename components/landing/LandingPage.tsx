
import React, { useState, useEffect } from 'react';
import AnimatedHero from './AnimatedHero';
import NarrationScreen from './NarrationScreen';
import Button from '../ui/Button';

interface LandingPageProps {
  onContinueToDashboard: () => void;
}

type PresentationState = 'idle' | 'narrating' | 'finished';

const LandingPage: React.FC<LandingPageProps> = ({ onContinueToDashboard }) => {
  const [presentationState, setPresentationState] = useState<PresentationState>('idle');
  const [showContainer, setShowContainer] = useState(false);

  useEffect(() => {
    // Check for returning user and redirect immediately
    if (localStorage.getItem('hasCompletedPresentation') === 'true') {
      onContinueToDashboard();
      return;
    }

    // Show the container after the main hero animation
    const containerTimeout = setTimeout(() => setShowContainer(true), 2500);

    return () => clearTimeout(containerTimeout);
  }, [onContinueToDashboard]);
  
  const handleContinue = () => {
      localStorage.setItem('hasCompletedPresentation', 'true');
      onContinueToDashboard();
  };

  // When presentation state becomes 'finished', proceed to dashboard
  useEffect(() => {
      if (presentationState === 'finished') {
          handleContinue();
      }
  }, [presentationState]);


  const renderContent = () => {
    if (presentationState === 'narrating') {
        return <NarrationScreen onNarrationComplete={() => setPresentationState('finished')} onSkip={() => setPresentationState('finished')} />;
    }
    
    // Default 'idle' state
    return (
        <div className="text-center">
            <h1 
                className="text-cyan-400 font-sans text-3xl md:text-4xl font-extrabold uppercase tracking-widest"
                style={{ textShadow: '0 0 15px rgba(34, 211, 238, 0.6)', animation: 'fadeIn 1.5s 0.5s ease-out forwards', opacity: 0 }}
            >
                DOMINA EL MERCADO WEB SIN INVERSIÓN NI CÓDIGO
            </h1>
            <p 
                className="mt-6 text-lg md:text-xl text-slate-200 max-w-3xl mx-auto"
                style={{ animation: 'fadeIn 1.5s 0.8s ease-out forwards', opacity: 0 }}
            >
                Vende proyectos web profesionales sin experiencia técnica. <strong className="text-cyan-200 font-bold">Nosotros desarrollamos, tú ganas.</strong>
            </p>
            <div style={{ animation: 'fadeIn 1.5s 1.4s ease-out forwards', opacity: 0 }}>
                <Button 
                    onClick={() => setPresentationState('narrating')}
                    className="mt-8 px-12 py-5 text-xl tracking-widest animate-pulseButton"
                    style={{ animationName: 'fadeIn, pulseButton', animationDuration: '1.5s, 2.5s', animationIterationCount: '1, infinite' }}
                >
                    ▶ COMENZAR PRESENTACIÓN
                </Button>
            </div>
            <div style={{ animation: 'fadeIn 1.5s 1.7s ease-out forwards', opacity: 0 }}>
                 <Button variant="ghost" onClick={() => setPresentationState('finished')} className="mt-4 text-sm">
                    Ya conozco el sistema, ir al dashboard
                </Button>
            </div>
        </div>
    );
  };

  return (
    <div className="min-h-screen w-full flex items-center justify-center p-4">
      <AnimatedHero />

      {showContainer && (
        <div
            className="max-w-4xl w-full p-8 md:p-12 lg:p-16 bg-slate-800 border border-slate-700 shadow-2xl shadow-cyan-500/10 rounded-xl z-20"
            style={{ animation: 'fadeInContainer 1s ease-out forwards', opacity: 0 }}
        >
           {renderContent()}
        </div>
      )}
    </div>
  );
};

export default LandingPage;
