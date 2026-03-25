
import React from 'react';
import { Sticker } from '../types';
import { BIOME_THEMES } from '../constants';

interface StickerAlbumProps {
  stickers: Sticker[];
  onBack: () => void;
}

const StickerItem: React.FC<{ sticker: Sticker }> = ({ sticker }) => {
  const isUnlocked = sticker.unlocked;
  const theme = BIOME_THEMES[sticker.biome as keyof typeof BIOME_THEMES];
  
  return (
    <div className={`relative aspect-square flex flex-col items-center justify-center transition-all duration-500 ${
      isUnlocked ? 'scale-100' : 'scale-90 opacity-40'
    }`}>
      {/* Fondo del Sticker */}
      <div 
        className={`absolute inset-2 rounded-full shadow-inner border-4 border-white transition-colors duration-1000 ${
            isUnlocked ? '' : 'bg-slate-200'
        }`}
        style={{ backgroundColor: isUnlocked ? sticker.colorHex : '#e2e8f0' }}
      >
        {isUnlocked && (
          <div className="absolute inset-0 opacity-20 mix-blend-overlay">
            <svg viewBox="0 0 100 100" className="w-full h-full fill-white">
               <path d="M30,20 Q50,0 70,20 T90,50 T70,80 T30,80 T10,50 Z" />
            </svg>
          </div>
        )}
      </div>

      {/* Personaje Generado por AI */}
      <div className="relative z-10 w-full h-full p-6 flex items-center justify-center overflow-hidden rounded-full">
        {isUnlocked ? (
          <div className="relative w-full h-full group">
            <img 
              src={sticker.imageData || theme.heroImg} 
              alt={theme.friend} 
              className="w-full h-full object-cover rounded-full shadow-lg border-2 border-white/50"
            />
            {/* Si no hay imagen AI, mostrar icono + accesorio */}
            {!sticker.imageData && (
              <div className="absolute top-1/4 right-1/4 text-3xl sm:text-4xl drop-shadow-lg transform rotate-12">
                {sticker.accessory}
              </div>
            )}
          </div>
        ) : (
          <span className="text-4xl sm:text-5xl font-black text-slate-300">?</span>
        )}
      </div>

      {/* Etiqueta con Nombre */}
      <div className={`absolute -bottom-2 px-3 py-1 rounded-full shadow-lg border-2 border-white text-center transition-all ${
        isUnlocked ? 'bg-indigo-600 scale-100' : 'bg-slate-300 scale-90'
      }`}>
        <p className="text-[9px] sm:text-[10px] font-black text-white uppercase tracking-tighter truncate max-w-[80px]">
          {isUnlocked ? sticker.name : 'Bloqueado'}
        </p>
      </div>
    </div>
  );
};

const StickerAlbum: React.FC<StickerAlbumProps> = ({ stickers, onBack }) => {
  const bosqueStickers = stickers.filter(s => s.biome === 'Bosque');
  const oceanoStickers = stickers.filter(s => s.biome === 'Oceano');

  const Section = ({ title, list, icon }: { title: string, list: Sticker[], icon: string }) => (
    <div className="mb-12">
      <div className="flex items-center justify-between mb-6 px-2">
        <div className="flex items-center gap-3">
            <span className="text-4xl">{icon}</span>
            <div>
                <h2 className="text-xl font-black text-indigo-900 leading-none">{title}</h2>
                <p className="text-[10px] font-bold text-indigo-400 uppercase tracking-widest mt-1">Colección de Amigos</p>
            </div>
        </div>
        <div className="bg-white px-4 py-2 rounded-2xl shadow-sm border-2 border-indigo-100">
            <p className="text-xs font-black text-indigo-600">
                {list.filter(s => s.unlocked).length} / {list.length}
            </p>
        </div>
      </div>
      
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-6 sm:gap-8">
        {list.map((sticker) => (
          <StickerItem key={sticker.id} sticker={sticker} />
        ))}
      </div>
    </div>
  );

  return (
    <div className="flex-1 bg-indigo-50 p-6 flex flex-col overflow-y-auto pb-24 scroll-smooth">
      <div className="flex items-center gap-4 mb-10">
        <button 
          onClick={onBack} 
          className="bg-white w-12 h-12 flex items-center justify-center rounded-2xl shadow-xl text-indigo-600 active:scale-90 transition-all font-bold text-xl border-b-4 border-indigo-100"
        >
           ❮
        </button>
        <div>
            <h1 className="text-3xl font-black text-indigo-900 leading-none">Mi Álbum</h1>
            <p className="text-sm font-bold text-indigo-500">¡Mira tus colores únicos!</p>
        </div>
      </div>

      <Section title="Bosque de Chroma" list={bosqueStickers} icon="🦎" />
      <div className="h-0.5 w-full bg-indigo-100/50 mb-12 rounded-full"></div>
      <Section title="Océano de Olly" list={oceanoStickers} icon="🐋" />

      <div className="mt-8 p-8 bg-gradient-to-br from-indigo-600 to-indigo-800 rounded-[2.5rem] shadow-2xl text-center text-white relative overflow-hidden">
         <div className="relative z-10">
            <h3 className="text-xl font-black mb-2">¡Estatus de Maestro!</h3>
            <p className="text-xs font-bold opacity-80 mb-4">Cada sticker es una obra de arte única generada para ti.</p>
            <div className="w-full bg-black/20 h-4 rounded-full overflow-hidden border border-white/10 p-0.5">
                <div 
                  className="bg-yellow-400 h-full rounded-full transition-all duration-1000 shadow-[0_0_10px_rgba(250,204,21,0.5)]" 
                  style={{ width: `${(stickers.filter(s=>s.unlocked).length / stickers.length) * 100}%` }}
                ></div>
            </div>
         </div>
         <div className="absolute -bottom-10 -right-10 w-40 h-40 bg-white/10 rounded-full blur-3xl"></div>
      </div>
    </div>
  );
};

export default StickerAlbum;
