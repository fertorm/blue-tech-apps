
import React from 'react';
import { GameState } from '../types';

interface ParentsDashboardProps {
  state: GameState;
  onBack: () => void;
}

const ParentsDashboard: React.FC<ParentsDashboardProps> = ({ state, onBack }) => {
  const isOceano = state.currentBiome === 'Oceano';
  const accentColor = isOceano ? 'bg-[#0ea5e9]' : 'bg-[#4CAF50]';
  const textColor = isOceano ? 'text-[#0ea5e9]' : 'text-[#4CAF50]';

  return (
    <div className={`flex-1 flex flex-col ${isOceano ? 'bg-sky-500' : 'bg-emerald-500'} transition-colors duration-500 overflow-hidden`}>
      {/* Header Compacto */}
      <div className="px-6 py-4 flex justify-between items-center text-white shrink-0">
        <button onClick={onBack} className="text-2xl font-bold p-1 active:scale-90 transition-transform">❮</button>
        <div className="text-center">
            <h1 className="text-[8px] font-black uppercase tracking-widest opacity-80">Dashboard</h1>
            <h2 className="text-lg font-black italic">Panel Familiar</h2>
        </div>
        <div className="w-8"></div>
      </div>

      <div className="px-4 space-y-4 overflow-hidden flex-1 pb-6">
        
        {/* Progress Detailed Panel */}
        <div className="bg-white rounded-[2rem] p-5 shadow-xl border-b-4 border-slate-100 h-full flex flex-col">
            <div className="flex justify-between items-start mb-4">
                <div>
                    <h2 className={`${textColor} font-black text-xl italic mb-0.5 uppercase tracking-tight`}>Progreso</h2>
                    <p className="text-[8px] font-bold text-slate-400 uppercase tracking-widest">Educación & Arte</p>
                </div>
            </div>

            <div className="flex-1 space-y-6">
                {/* Math Mastery */}
                <div className="flex items-center gap-4">
                    <div className={`w-10 h-10 ${accentColor} rounded-2xl flex items-center justify-center text-white text-xl shrink-0`}>📐</div>
                    <div className="flex-1">
                        <div className="flex justify-between items-end mb-1">
                            <p className="text-[10px] font-black text-slate-700 uppercase tracking-wide">Fracciones</p>
                            <p className="text-[10px] font-black text-indigo-600 italic">{state.mathProficiency}%</p>
                        </div>
                        <div className="w-full bg-slate-100 h-3 rounded-full overflow-hidden p-0.5 border border-slate-50">
                            <div 
                              className={`${accentColor} h-full rounded-full transition-all duration-1000`} 
                              style={{ width: `${state.mathProficiency}%` }}
                            ></div>
                        </div>
                    </div>
                </div>

                {/* Accuracy */}
                <div className="flex items-center gap-4">
                    <div className="w-10 h-10 bg-indigo-500 rounded-2xl flex items-center justify-center text-white text-xl shrink-0">🎯</div>
                    <div className="flex-1">
                        <div className="flex justify-between items-end mb-1">
                            <p className="text-[10px] font-black text-slate-700 uppercase tracking-wide">Precisión</p>
                            <p className="text-[10px] font-black text-indigo-600 italic">{state.accuracyLevel}%</p>
                        </div>
                        <div className="w-full bg-slate-100 h-3 rounded-full overflow-hidden p-0.5 border border-slate-50">
                            <div 
                              className="bg-indigo-400 h-full rounded-full transition-all duration-1000" 
                              style={{ width: `${state.accuracyLevel}%` }}
                            ></div>
                        </div>
                    </div>
                </div>

                {/* Activity */}
                <div className="bg-slate-50 rounded-2xl p-4 border border-slate-100">
                    <h3 className="font-black text-slate-800 text-xs mb-2 uppercase italic">Actividad de hoy</h3>
                    <div className="flex items-start gap-3">
                        <div className="text-xl shrink-0">🏠</div>
                        <p className="text-[10px] font-bold text-slate-600 leading-snug">
                            Busca 3 objetos de color <b>{isOceano ? 'Azul' : 'Verde'}</b> con tu hijo en la sala.
                        </p>
                    </div>
                </div>

                {/* Discovery */}
                <div className="bg-indigo-900 rounded-2xl p-4 shadow-lg text-white">
                  <div className="flex justify-between items-center mb-2">
                    <p className="text-[10px] font-black uppercase">Descubrimiento</p>
                    <span className="text-xs">💎</span>
                  </div>
                  <div className="w-full bg-white/10 h-2 rounded-full overflow-hidden">
                    <div className="bg-yellow-400 h-full rounded-full" style={{ width: `${state.discoveryProgress}%` }}></div>
                  </div>
                </div>
            </div>
            
            <button className="w-full mt-4 py-3 bg-yellow-400 text-yellow-950 font-black text-[10px] uppercase tracking-widest rounded-xl shadow-lg border-b-4 border-yellow-600 active:border-0 active:translate-y-1 transition-all">
                MÁS DETALLES ❯
            </button>
        </div>
      </div>
    </div>
  );
};

export default ParentsDashboard;
