
import React, { useState, useEffect, useMemo } from 'react';
import { ColorData } from '../types';
import { COLORS, INITIAL_STICKERS } from '../constants';
import { mixColors, checkAccuracy, getHexFromColorName, generateAIImage } from '../colorService';
import SushiVisualizer from './SushiVisualizer';

interface GameViewProps {
  currentLevel: number;
  characterImage?: string;
  onSuccess: (acc: number, generatedSticker?: string) => void;
  onExit: () => void;
}

const GameView: React.FC<GameViewProps> = ({ currentLevel, characterImage, onSuccess, onExit }) => {
  useEffect(() => {
    handleReset();
  }, [currentLevel]);

  const targetColor = useMemo(() => {
    return COLORS.find(c => c.level === currentLevel) || COLORS[COLORS.length - 1];
  }, [currentLevel]);

  const isOceano = targetColor.worldId === 'oceano';
  const friendName = isOceano ? "Olly" : "Chroma";
  const bgColor = isOceano ? "bg-[#0ea5e9]" : "bg-[#4CAF50]";
  const cardAccent = isOceano ? "bg-sky-50" : "bg-emerald-50";
  const accentColor = isOceano ? "#0ea5e9" : "#4CAF50";

  const [portions, setPortions] = useState<{[key: string]: number}>({ 'azul': 0, 'negro': 0, 'blanco': 0, 'amarillo': 0, 'rojo': 0 });
  const [mixedHex, setMixedHex] = useState('#FFFFFF');
  const [feedback, setFeedback] = useState(`¡Hola! Necesito este color.`);
  const [isMixing, setIsMixing] = useState(false);
  const [isGeneratingSticker, setIsGeneratingSticker] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  const [lastAccuracy, setLastAccuracy] = useState(0);
  const [generatedSticker, setGeneratedSticker] = useState<string | null>(null);

  useEffect(() => { setMixedHex(mixColors(portions)); }, [portions]);

  const handleReset = () => {
    setPortions({ 'azul': 0, 'negro': 0, 'blanco': 0, 'amarillo': 0, 'rojo': 0 });
    setFeedback(`¡${friendName} espera su color mágico!`);
    setIsMixing(false);
    setShowSuccess(false);
    setGeneratedSticker(null);
  };

  const updatePortion = (color: string, val: number) => {
    if (isMixing || showSuccess) return;
    setPortions(prev => ({ ...prev, [color]: val }));
  };

  const handleFeed = async () => {
    setIsMixing(true);
    setFeedback(`¡Mezclando magia! ✨`);
    
    setTimeout(async () => {
      const acc = checkAccuracy(portions, targetColor.targetProportions);
      setIsMixing(false);
      setLastAccuracy(acc);
      
      if (acc >= 90) {
        setShowSuccess(true);
        setFeedback('¡PERFECTO! 🌟');
        setIsGeneratingSticker(true);
        const stickerData = INITIAL_STICKERS.find(s => s.level === currentLevel);
        const prompt = `A funny 3D cartoon character ${friendName} wearing ${stickerData?.accessory} and surrounded by splashes of ${targetColor.name} paint. Soft colors, clean white background, Pixar style.`;
        const stickerUrl = await generateAIImage(prompt);
        setGeneratedSticker(stickerUrl);
        setIsGeneratingSticker(false);
      } else {
        setFeedback('¡Casi! Prueba otra vez.');
      }
    }, 1200);
  };

  const total = Object.values(portions).reduce((a, b) => a + (b as number), 0);

  return (
    <div className={`flex-1 flex flex-col ${bgColor} relative overflow-hidden h-full transition-colors duration-500`}>
      {/* Éxito Overlay */}
      {showSuccess && (
        <div className="absolute inset-0 z-[100] bg-white/95 flex flex-col items-center justify-center p-4 text-center animate-pop-in">
          <div className={`relative w-40 h-40 sm:w-56 sm:h-56 ${isOceano ? 'bg-sky-100' : 'bg-emerald-100'} rounded-[2.5rem] flex items-center justify-center shadow-2xl mb-4 overflow-hidden border-4 border-white`}>
             {isGeneratingSticker ? (
               <div className="flex flex-col items-center gap-3 animate-pulse">
                 <div className="w-8 h-8 border-3 border-indigo-500 border-t-transparent rounded-full animate-spin"></div>
                 <p className="text-indigo-900 font-black text-[10px] uppercase tracking-widest">Pintando...</p>
               </div>
             ) : (
               <img src={generatedSticker || characterImage} className="w-full h-full object-cover animate-float" alt="Sticker" />
             )}
          </div>
          <h2 className="text-2xl font-black text-slate-900 mb-1 leading-tight uppercase italic">
            {isGeneratingSticker ? 'Pintando...' : '¡Genial! 🌟'}
          </h2>
          <button 
            disabled={isGeneratingSticker}
            onClick={() => onSuccess(lastAccuracy, generatedSticker || undefined)}
            className={`w-full max-w-[200px] ${isGeneratingSticker ? 'bg-slate-200 text-slate-400' : 'bg-indigo-600 text-white'} text-lg font-black py-4 rounded-2xl shadow-xl transition-all`}
          >
            {isGeneratingSticker ? '...' : 'LISTO 🖼️'}
          </button>
        </div>
      )}

      {/* Header Compacto */}
      <div className="flex justify-between items-center text-white px-4 py-1 shrink-0 h-10">
        <button onClick={onExit} className="text-2xl font-bold p-1 active:scale-90 transition-transform">❮</button>
        <div className="flex flex-col items-center">
            <h1 className="font-black text-[7px] uppercase tracking-[0.2em] opacity-80 leading-none">
              {isOceano ? 'Mundo Océano' : 'Mundo Bosque'}
            </h1>
            <h2 className="font-black text-xs italic tracking-tight leading-none">Nivel {currentLevel}</h2>
        </div>
        <button onClick={handleReset} className="bg-white/30 px-2 py-0.5 rounded-full text-[7px] font-black uppercase tracking-widest active:bg-white/50 backdrop-blur-md">Reiniciar</button>
      </div>

      <div className="bg-white rounded-t-[2rem] p-3 sm:p-4 shadow-2xl flex-1 flex flex-col gap-2 overflow-hidden">
        
        {/* Personaje y Globo Compacto */}
        <div className="flex items-center gap-2 shrink-0 h-12 sm:h-14">
          <div className={`w-10 h-10 sm:w-12 sm:h-12 ${cardAccent} rounded-xl flex items-center justify-center shadow-inner shrink-0 relative overflow-hidden border-2 border-white`}>
            <img src={characterImage} className={`w-full h-full object-cover ${isMixing ? 'animate-bounce' : ''}`} alt={friendName} />
          </div>
          <div className="flex-1 relative bg-white border border-slate-100 p-1.5 sm:p-2 rounded-xl shadow-sm">
            <div className="absolute left-0 top-1/2 -translate-x-1 -translate-y-1/2 w-3 h-3 bg-white border-l border-b border-slate-100 rotate-45 rounded-bl-sm"></div>
            <p className="text-[9px] font-bold text-slate-800 leading-tight">
              Color <b className="text-indigo-600">{targetColor.name}</b>: <span className="text-indigo-500 font-black">{targetColor.fractionDisplay}</span>
            </p>
          </div>
        </div>

        {/* Zona de Mezcla con scroll restringido o flex adaptado */}
        <div className="flex-1 overflow-hidden flex flex-col gap-2">
          <div className="wood-texture rounded-2xl p-2 sm:p-3 flex flex-col lg:flex-row items-center justify-center gap-2 border border-amber-50 shadow-inner flex-1 min-h-0">
            
            <div className={`transition-transform duration-500 shrink-0 transform scale-90 sm:scale-100 ${isMixing ? 'animate-shake scale-95' : ''}`}>
              <SushiVisualizer 
                portions={portions} 
                mixedHex={mixedHex} 
                isJuniorMode={true} 
                isMixing={isMixing}
                biome={isOceano ? 'Oceano' : 'Bosque'}
              />
            </div>

            <div className={`flex flex-col gap-1 w-full max-w-[260px] lg:w-1/2 transition-opacity ${isMixing || showSuccess ? 'opacity-30 pointer-events-none' : 'opacity-100'}`}>
              {['azul', 'negro', 'blanco', 'amarillo', 'rojo'].map(color => (
                <div key={color} className="flex flex-col gap-0">
                  <div className="flex justify-between items-center px-1">
                    <div className="flex items-center gap-1.5">
                        <div className="w-2.5 h-2.5 rounded-full border border-slate-100 shadow-xs" style={{ backgroundColor: getHexFromColorName(color) }}></div>
                        <span className="text-[8px] font-black uppercase text-slate-500 tracking-wider">{color}</span>
                    </div>
                    <span className="text-[9px] font-black text-indigo-600 bg-indigo-50 px-1 rounded-full">
                      {portions[color] || 0}/4
                    </span>
                  </div>
                  
                  <div className="relative pt-0.5 pb-2.5">
                    <div className="absolute inset-x-0 top-1/2 -translate-y-1/2 h-2.5 bg-slate-50 rounded-full border border-slate-100 overflow-hidden shadow-inner">
                        <div className="h-full flex justify-between px-1 pointer-events-none opacity-20">
                            {[0,1,2,3,4].map(tick => <div key={tick} className="w-0.5 h-full bg-slate-400"></div>)}
                        </div>
                    </div>
                    <input 
                        type="range" min="0" max="4" step="1"
                        disabled={isMixing || showSuccess}
                        value={portions[color] || 0}
                        onChange={(e) => updatePortion(color, parseInt(e.target.value))}
                        className="relative z-10 w-full h-5 bg-transparent appearance-none cursor-pointer slider-ultra-compact"
                        style={{ '--accent': accentColor } as any}
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Botón de Mezcla Compacto */}
        <div className="mt-auto shrink-0 flex flex-col items-center pb-1">
          <p className={`mb-0.5 font-black text-[9px] uppercase tracking-widest transition-all ${isMixing ? 'text-indigo-600 animate-pulse' : 'text-slate-400'}`}>
            {feedback}
          </p>
          <button 
            onClick={handleFeed}
            disabled={total === 0 || isMixing || showSuccess}
            className={`w-full py-2.5 rounded-xl font-black text-base shadow-lg transition-all transform active:scale-95 border-b-4 active:border-b-0 active:translate-y-0.5 uppercase tracking-wider ${
                isMixing ? 'bg-indigo-400 text-white border-indigo-700' : 
                total > 0 ? (isOceano ? 'bg-[#0ea5e9] text-white border-[#0369a1]' : 'bg-[#4CAF50] text-white border-[#2e7d32]') : 'bg-slate-100 text-slate-300 border-slate-200'
            }`}
          >
            {isMixing ? 'Mezclando...' : '¡MEZCLAR! ✨'}
          </button>
        </div>
      </div>

      <style>{`
        .slider-ultra-compact::-webkit-slider-thumb {
            -webkit-appearance: none;
            width: 18px;
            height: 18px;
            background: #ffffff;
            border: 3px solid var(--accent);
            border-radius: 50%;
            cursor: pointer;
            box-shadow: 0 2px 4px rgba(0,0,0,0.1);
        }
        .slider-ultra-compact::-moz-range-thumb {
            width: 18px;
            height: 18px;
            background: #ffffff;
            border: 3px solid var(--accent);
            border-radius: 50%;
            cursor: pointer;
        }
      `}</style>
    </div>
  );
};

export default GameView;
