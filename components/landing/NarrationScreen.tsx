import React, { useState, useEffect, useRef } from 'react';
import { useSpeech } from '../../hooks/useSpeech';
import Button from '../ui/Button';

interface NarrationPoint {
  id: string;
  type: 'pillar' | 'step';
  title?: string;
  text: string;
}

interface NarrationScreenProps {
  onNarrationComplete: () => void;
  onSkip: () => void; // Nueva propiedad para saltar la narración
}

const narrationPoints: NarrationPoint[] = [
    { id: 'pillar-1', type: 'pillar', text: 'Primero: Tu rol es estratégico, no técnico. La IA te ayuda a analizar las necesidades del cliente y a elegir la mejor solución. Tu te enfocas en la relación y la negociación.' },
    { id: 'pillar-2', type: 'pillar', text: 'Segundo: Tienes control total sobre la ganancia. Te mostramos nuestro costo de producción, y tú decides el porcentaje de ganancia.' },
    { id: 'pillar-3', type: 'pillar', text: 'Tercero: Somos tu equipo de desarrollo invisible. Operamos como tu marca blanca para construir y entregar todo el proyecto.' },
    { id: 'step-1', type: 'step', title: '01', text: 'Paso uno: Nuestro asistente de inteligencia artificial te ayuda a elegir los servicios que tu cliente necesita y te asistirá para cerrar las ventas.' },
    { id: 'step-2', type: 'step', title: '02', text: 'Paso dos: Defines tu margen de ganancia sobre nuestro costo. El sistema calcula el precio final para tu cliente automáticamente.' },
    { id: 'step-3', type: 'step', title: '03', text: 'Paso tres: Generas un PDF con tu propia marca y se lo envías a tu cliente para cerrar el trato.' },
    { id: 'step-4', type: 'step', title: '04', text: 'Paso cuatro, Le cobrás a tu cliente el 50% de anticipo. Con ese dinero, ya tenés tu primera ganancia en el bolsillo y los fondos para el desarrollo.' },
    { id: 'step-5', type: 'step', title: '05', text: 'Paso cinco, Nos entregas 50% (costo de desarrollo) para iniciar, el resto al entregar el proyecto a tu cliente.' },
];

const SectionHeading: React.FC<{ children: React.ReactNode }> = ({ children }) => (
    <h3 className="font-sans text-cyan-300 uppercase text-lg font-bold tracking-wider mb-6 border-b border-slate-700 pb-2">
        {children}
    </h3>
);

const NarrationScreen: React.FC<NarrationScreenProps> = ({ onNarrationComplete, onSkip }) => {
    const [highlightedId, setHighlightedId] = useState<string | null>(null);
    const { speak, cancel } = useSpeech();
    const narrationQueue = useRef<NarrationPoint[]>([...narrationPoints]);
    const containerRef = useRef<HTMLDivElement>(null);
    const pointRefs = useRef<{[key: string]: HTMLDivElement | null}>({});

    useEffect(() => {
        const processQueue = () => {
            if (narrationQueue.current.length === 0) {
                onNarrationComplete();
                return;
            }
            const currentPoint = narrationQueue.current.shift()!;
            setHighlightedId(currentPoint.id);
            pointRefs.current[currentPoint.id]?.scrollIntoView({ behavior: 'smooth', block: 'center' });
            speak(currentPoint.text, processQueue);
        };

        const startTimeout = setTimeout(processQueue, 500);

        return () => {
            clearTimeout(startTimeout);
            cancel();
        };
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    const pillars = narrationPoints.filter(p => p.type === 'pillar');
    const steps = narrationPoints.filter(p => p.type === 'step');

    return (
        <div 
            ref={containerRef}
            className="text-left max-h-[80vh] overflow-y-auto pr-4 scroll-smooth relative"
            style={{ animation: 'fadeInContainer 1s ease-out forwards', opacity: 0 }}
        >
            <div className="flex justify-between items-center mb-8">
                <p className="text-cyan-400 text-lg font-bold tracking-widest uppercase">
                    [PRESENTACIÓN DEL PROYECTO ZEN]
                </p>
                <Button variant="ghost" onClick={onSkip}>Saltar al Acceso →</Button>
            </div>

            <div className="mb-10">
                <SectionHeading>La Oportunidad: Los 3 Pilares del Negocio</SectionHeading>
                {pillars.map(p => (
                    <div
                        key={p.id}
                        // FIX: Changed ref callback to not return a value to fix TypeScript error.
                        ref={el => { pointRefs.current[p.id] = el; }}
                        className={`mb-6 pl-4 border-l-4 transition-all duration-500 ${highlightedId === p.id ? 'opacity-100 border-cyan-400' : 'opacity-50 border-slate-700'}`}
                    >
                        <p className={`transition-colors duration-300 ${highlightedId === p.id ? 'text-white' : ''}`}>{p.text}</p>
                    </div>
                ))}
            </div>

            <div>
                <SectionHeading>El Proceso: Tu Flujo de Trabajo en 5 Pasos</SectionHeading>
                {steps.map(s => (
                    <div
                        key={s.id}
                        // FIX: Changed ref callback to not return a value to fix TypeScript error.
                        ref={el => { pointRefs.current[s.id] = el; }}
                        className={`flex items-start gap-6 mb-6 transition-opacity duration-500 ${highlightedId === s.id ? 'opacity-100' : 'opacity-50'}`}
                    >
                        <div className={`text-5xl font-extrabold transition-colors duration-500 ${highlightedId === s.id ? 'text-cyan-400' : 'text-slate-700'}`}>{s.title}</div>
                        <p className={`pt-2 transition-colors duration-300 ${highlightedId === s.id ? 'text-white' : ''}`}>{s.text}</p>
                    </div>
                ))}
            </div>
        </div>
    );
};

export default NarrationScreen;