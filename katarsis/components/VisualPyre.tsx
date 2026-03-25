
import React, { useEffect, useState } from 'react';

export const VisualPyre: React.FC<{ onComplete: () => void }> = ({ onComplete }) => {
  const [particles, setParticles] = useState<{ 
    id: number, 
    x: number, 
    size: number, 
    delay: number, 
    duration: number,
    color: string,
    blur: string,
    drift: number
  }[]>([]);

  useEffect(() => {
    const colors = [
      '#ff4d00', // Deep Orange
      '#ff9100', // Bright Orange
      '#ffcc00', // Yellow
      '#ff5e00', // Red-Orange
      '#ffffff', // Spark white
      '#4a00e0', // Ethereal purple base hint
    ];

    const newParticles = Array.from({ length: 60 }).map((_, i) => ({
      id: i,
      x: 40 + Math.random() * 20, // Concentrated in the center
      size: Math.random() * 6 + 1,
      delay: Math.random() * 4,
      duration: 3 + Math.random() * 4,
      color: colors[Math.floor(Math.random() * colors.length)],
      blur: Math.random() > 0.7 ? 'blur(4px)' : 'blur(1px)',
      drift: (Math.random() - 0.5) * 40 // Horizontal drift
    }));
    setParticles(newParticles);

    const timer = setTimeout(onComplete, 10000);
    return () => clearTimeout(timer);
  }, []);

  return (
    <div className="relative w-full h-96 flex items-center justify-center overflow-hidden bg-black/40 rounded-3xl border border-white/5">
      <div className="absolute inset-0 burn-gradient opacity-20 blur-[100px]"></div>
      
      {/* Burning Text Simulation */}
      <div className="relative z-10 flex flex-col items-center w-full">
        <div className="text-amber-100/80 font-mystic text-2xl animate-pulse text-center mb-12 px-8 italic max-w-md">
          "Las palabras se transforman en luz y humo que se eleva hacia el infinito..."
        </div>
        
        <div className="relative w-64 h-64 flex items-center justify-center">
          {/* Base Glow */}
          <div className="absolute bottom-0 w-12 h-12 bg-orange-600 rounded-full blur-2xl opacity-60 animate-pulse"></div>
          <div className="absolute bottom-4 w-8 h-8 bg-amber-400 rounded-full blur-xl opacity-40"></div>
          
          {particles.map(p => (
            <div
              key={p.id}
              className="absolute rounded-full opacity-0"
              style={{
                left: `${p.x}%`,
                bottom: '20%',
                width: p.size,
                height: p.size,
                backgroundColor: p.color,
                filter: p.blur,
                boxShadow: `0 0 ${p.size * 2}px ${p.color}`,
                animation: `ethereal-rise ${p.duration}s infinite linear`,
                animationDelay: `${p.delay}s`,
                '--drift-x': `${p.drift}px`
              } as any}
            ></div>
          ))}
        </div>
      </div>

      <style>{`
        @keyframes ethereal-rise {
          0% { 
            transform: translateY(0) translateX(0) scale(1); 
            opacity: 0; 
          }
          10% { 
            opacity: 0.8; 
          }
          50% {
            transform: translateY(-100px) translateX(calc(var(--drift-x) * 0.5)) scale(1.2);
            opacity: 0.4;
          }
          100% { 
            transform: translateY(-250px) translateX(var(--drift-x)) scale(0.5); 
            opacity: 0; 
          }
        }
      `}</style>
    </div>
  );
};
