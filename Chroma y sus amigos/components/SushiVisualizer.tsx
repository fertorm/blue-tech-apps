
import React, { useRef, useEffect, useState } from 'react';
import { getHexFromColorName } from '../colorService';
import { Biome } from '../types';

interface SushiVisualizerProps {
  portions: { [key: string]: number };
  mixedHex: string;
  isJuniorMode: boolean;
  isMixing?: boolean;
  biome: Biome;
}

const SushiVisualizer: React.FC<SushiVisualizerProps> = ({ portions, mixedHex, isJuniorMode, isMixing = false, biome }) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const animationRef = useRef<number>(0);
  const [rotation, setRotation] = useState(0);
  const [corePulse, setCorePulse] = useState(1);
  const prevMixedHex = useRef(mixedHex);

  useEffect(() => {
    if (prevMixedHex.current !== mixedHex) {
      setCorePulse(1.05);
      const timer = setTimeout(() => setCorePulse(1), 200);
      prevMixedHex.current = mixedHex;
      return () => clearTimeout(timer);
    }
  }, [mixedHex]);

  const drawLeafVeins = (ctx: CanvasRenderingContext2D, centerX: number, centerY: number, radius: number, startAngle: number, endAngle: number) => {
    ctx.save();
    ctx.strokeStyle = 'rgba(255,255,255,0.1)';
    ctx.lineWidth = 0.5;
    const midAngle = (startAngle + endAngle) / 2;
    ctx.beginPath();
    ctx.moveTo(centerX, centerY);
    ctx.lineTo(centerX + Math.cos(midAngle) * radius, centerY + Math.sin(midAngle) * radius);
    ctx.stroke();
    ctx.restore();
  };

  const drawOilTexture = (
    ctx: CanvasRenderingContext2D,
    x: number,
    y: number,
    radius: number,
    color: string,
    startAngle: number,
    endAngle: number,
    isForest: boolean
  ) => {
    ctx.save();
    ctx.beginPath();
    ctx.moveTo(x, y);
    ctx.arc(x, y, radius, startAngle, endAngle);
    ctx.closePath();
    ctx.clip();
    ctx.fillStyle = color;
    ctx.fill();

    if (isForest) drawLeafVeins(ctx, x, y, radius, startAngle, endAngle);

    const midAngle = (startAngle + endAngle) / 2;
    for (let i = 0; i < 20; i++) {
        const strokeAngle = midAngle + (Math.random() - 0.5) * 1.5;
        const dist = Math.random() * radius;
        const px = x + Math.cos(strokeAngle) * dist;
        const py = y + Math.sin(strokeAngle) * dist;
        ctx.beginPath();
        ctx.ellipse(px, py, Math.random() * 10 + 3, Math.random() * 3 + 1, strokeAngle + Math.PI/2, 0, Math.PI * 2);
        ctx.fillStyle = i % 2 === 0 ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.03)';
        ctx.fill();
    }

    const shineX = x + Math.cos(startAngle + 0.2) * (radius * 0.7);
    const shineY = y + Math.sin(startAngle + 0.2) * (radius * 0.7);
    const shineGrad = ctx.createRadialGradient(shineX, shineY, 0, shineX, shineY, radius * 0.25);
    shineGrad.addColorStop(0, 'rgba(255,255,255,0.15)');
    shineGrad.addColorStop(1, 'rgba(255,255,255,0)');
    ctx.fillStyle = shineGrad;
    ctx.fill();
    ctx.restore();
  };

  useEffect(() => {
    if (isMixing) {
      const animate = () => {
        setRotation(prev => prev + 0.1);
        animationRef.current = requestAnimationFrame(animate);
      };
      animationRef.current = requestAnimationFrame(animate);
    } else {
      cancelAnimationFrame(animationRef.current);
      setRotation(0);
    }
    return () => cancelAnimationFrame(animationRef.current);
  }, [isMixing]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const size = canvas.width;
    const centerX = size / 2;
    const centerY = size / 2;
    const radius = size * 0.36;
    const isForest = biome === 'Bosque';

    ctx.clearRect(0, 0, size, size);

    // exterior
    ctx.beginPath();
    if (isForest) {
        for (let i = 0; i < 360; i += 10) {
            const angle = (i * Math.PI) / 180;
            const r = radius + 8 + (Math.sin(i * 12) * 1.5);
            if (i === 0) ctx.moveTo(centerX + Math.cos(angle) * r, centerY + Math.sin(angle) * r);
            else ctx.lineTo(centerX + Math.cos(angle) * r, centerY + Math.sin(angle) * r);
        }
        ctx.closePath();
    } else {
        ctx.arc(centerX, centerY, radius + 8, 0, Math.PI * 2);
    }
    ctx.fillStyle = isForest ? '#388E3C' : '#111111';
    ctx.fill();

    // interior bg
    ctx.beginPath();
    ctx.arc(centerX, centerY, radius + 2, 0, Math.PI * 2);
    ctx.fillStyle = isForest ? '#E8F5E9' : '#FFFFFF';
    ctx.fill();

    const portionsList = Object.entries(portions) as [string, number][];
    const total = portionsList.reduce((sum, [, val]) => sum + val, 0);
    
    ctx.save();
    ctx.translate(centerX, centerY);
    ctx.rotate(rotation);
    ctx.translate(-centerX, -centerY);

    if (total > 0) {
      let currentAngle = -Math.PI / 2;
      portionsList.forEach(([colorName, amount]) => {
        if (amount === 0) return;
        const sliceAngle = (amount / total) * Math.PI * 2;
        const endAngle = currentAngle + sliceAngle;
        drawOilTexture(ctx, centerX, centerY, radius, getHexFromColorName(colorName), currentAngle, endAngle, isForest);
        currentAngle = endAngle;
      });
    }

    if (total > 0) {
      ctx.save();
      const finalScale = isMixing ? 0.3 : corePulse;
      ctx.translate(centerX, centerY);
      ctx.scale(finalScale, finalScale);
      ctx.translate(-centerX, -centerY);
      
      ctx.beginPath();
      ctx.arc(centerX, centerY, radius * 0.4, 0, Math.PI * 2);
      ctx.fillStyle = '#FFFFFF';
      ctx.fill();

      ctx.beginPath();
      ctx.arc(centerX, centerY, radius * 0.32, 0, Math.PI * 2);
      ctx.clip();
      ctx.fillStyle = mixedHex;
      ctx.fill();
      ctx.restore();
    }
    
    ctx.restore();
  }, [portions, mixedHex, rotation, isMixing, corePulse, biome]);

  return (
    <div className="relative flex flex-col items-center gap-1">
      <div className="relative p-0.5 bg-white/10 rounded-full border border-white/10">
        <canvas 
          ref={canvasRef} 
          width={150} 
          height={150} 
          className="max-w-full sm:w-[180px] sm:h-[180px] transition-all duration-300"
        />
        {isMixing && (
          <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
             <span className="text-3xl animate-spin opacity-20">🌀</span>
          </div>
        )}
      </div>
      <div className="flex flex-wrap justify-center gap-1 px-2 py-0.5 bg-white/60 backdrop-blur-sm rounded-full border border-white shadow-xs">
        {Object.entries(portions).map(([color, count]) => count > 0 && (
           <div key={color} className="flex items-center gap-1 px-1 py-0 rounded-full bg-white text-[8px] font-black text-slate-700 italic border border-slate-50">
              <div className="w-2 h-2 rounded-full" style={{ backgroundColor: getHexFromColorName(color) }}></div>
              {count}/4
           </div>
        ))}
      </div>
    </div>
  );
};

export default SushiVisualizer;
