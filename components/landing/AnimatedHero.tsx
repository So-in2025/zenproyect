
import React from 'react';

const AnimatedHero: React.FC = () => {
    const title = "Proyecto Zen";
    
    return (
        <div className="absolute top-1/4 left-1/2 -translate-x-1/2 text-center z-10 pointer-events-none">
            <h1 className="main-title text-5xl md:text-7xl lg:text-8xl">
                {title.split('').map((char, index) => (
                    <span
                        key={index}
                        className="inline-block"
                        style={{
                            animation: `revealLetter 1s forwards, breathingGlow 4s ease-in-out infinite alternate 2s`,
                            animationDelay: `${0.1 * (index + 1)}s, ${0.1 * (index + 1) + 1}s`,
                            marginLeft: char === 'Z' ? '2rem' : '0'
                        }}
                    >
                        {char}
                    </span>
                ))}
            </h1>
            <p 
                className="text-sm md:text-base text-slate-400 tracking-widest mt-2"
                style={{ animation: 'fadeIn 1.5s 1.5s ease-out forwards', opacity: 0 }}
            >
                by SO-&gt;IN
            </p>
        </div>
    );
};

export default AnimatedHero;
