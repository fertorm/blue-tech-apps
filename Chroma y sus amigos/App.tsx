
import React, { useState, useEffect } from 'react';
import { View, GameState } from './types';
import { INITIAL_STICKERS, COLORS, BIOME_THEMES } from './constants';
import GameView from './components/GameView';
import StickerAlbum from './components/StickerAlbum';
import ParentsDashboard from './components/ParentsDashboard';
import { generateAIImage } from './colorService';

const App: React.FC = () => {
  const [view, setView] = useState<View>('home');
  const [selectedLevel, setSelectedLevel] = useState<number | null>(null);
  const [isGeneratingCharacter, setIsGeneratingCharacter] = useState(false);
  
  const [gameState, setGameState] = useState<GameState>(() => {
    const saved = localStorage.getItem('chroma_gamestate');
    if (saved) return JSON.parse(saved);
    return {
      currentLevel: 1,
      currentBiome: 'Bosque',
      unlockedWorlds: ['bosque'],
      stickers: INITIAL_STICKERS,
      mathProficiency: 10,
      accuracyLevel: 0,
      discoveryProgress: 0,
      characterAvatars: {}
    };
  });

  useEffect(() => {
    localStorage.setItem('chroma_gamestate', JSON.stringify(gameState));
  }, [gameState]);

  useEffect(() => {
    const charName = gameState.currentBiome === 'Oceano' ? 'Olly the Orca' : 'Chroma the Chameleon';
    if (!gameState.characterAvatars[gameState.currentBiome]) {
      handleGenerateCharacter(gameState.currentBiome, charName);
    }
  }, [gameState.currentBiome]);

  const handleGenerateCharacter = async (biome: string, name: string) => {
    setIsGeneratingCharacter(true);
    const prompt = `A cute and happy ${name} character, friendly big eyes, ${biome} theme, 3D Pixar style mascot.`;
    const imageUrl = await generateAIImage(prompt);
    if (imageUrl) {
      setGameState(prev => ({
        ...prev,
        characterAvatars: { ...prev.characterAvatars, [biome]: imageUrl }
      }));
    }
    setIsGeneratingCharacter(false);
  };

  const handleGameSuccess = (accuracy: number, generatedStickerImage?: string) => {
    const levelJustPlayed = selectedLevel || gameState.currentLevel;
    
    setGameState(prev => {
      const isNewProgress = levelJustPlayed === prev.currentLevel;
      const nextLevel = isNewProgress ? prev.currentLevel + 1 : prev.currentLevel;
      
      const nextStickers = prev.stickers.map(s => {
        if (s.level === levelJustPlayed) {
          return { ...s, unlocked: true, imageData: generatedStickerImage || s.imageData };
        }
        return s;
      });

      let newBiome = prev.currentBiome;
      if (isNewProgress && levelJustPlayed === 10) {
        newBiome = 'Oceano';
      }

      return {
        ...prev,
        currentLevel: nextLevel > COLORS.length ? COLORS.length : nextLevel,
        currentBiome: newBiome,
        unlockedWorlds: newBiome === 'Oceano' && !prev.unlockedWorlds.includes('oceano') 
          ? [...prev.unlockedWorlds, 'oceano'] 
          : prev.unlockedWorlds,
        stickers: nextStickers,
        mathProficiency: Math.min(100, prev.mathProficiency + 5),
        accuracyLevel: Math.round((prev.accuracyLevel + accuracy) / (prev.accuracyLevel === 0 ? 1 : 2)),
        discoveryProgress: Math.min(100, (nextLevel / COLORS.length) * 100)
      };
    });

    setView('album');
    setSelectedLevel(null);
  };

  const startLevel = (lvl: number) => {
    setSelectedLevel(lvl);
    setView('game');
  };

  const currentThemeData = BIOME_THEMES[gameState.currentBiome];
  const themeClasses = {
    Bosque: {
      bg: 'bg-emerald-500',
      hero: gameState.characterAvatars['Bosque'] || currentThemeData.heroImg,
      name: 'Chroma',
      accent: 'text-yellow-300',
      btn: 'bg-yellow-400 border-yellow-600 text-yellow-950'
    },
    Oceano: {
      bg: 'bg-sky-500',
      hero: gameState.characterAvatars['Oceano'] || currentThemeData.heroImg,
      name: 'Olly',
      accent: 'text-cyan-200',
      btn: 'bg-cyan-400 border-cyan-600 text-cyan-950'
    },
    Selva: { bg: '', hero: '', name: '', accent: '', btn: '' },
    Savana: { bg: '', hero: '', name: '', accent: '', btn: '' }
  };

  const currentTheme = themeClasses[gameState.currentBiome] || themeClasses.Bosque;

  const renderContent = () => {
    if (view === 'game') return (
      <GameView 
        currentLevel={selectedLevel || gameState.currentLevel}
        characterImage={currentTheme.hero}
        onSuccess={handleGameSuccess} 
        onExit={() => { setView('home'); setSelectedLevel(null); }} 
      />
    );
    if (view === 'album') return <StickerAlbum stickers={gameState.stickers} onBack={() => setView('home')} />;
    if (view === 'parents') return <ParentsDashboard state={gameState} onBack={() => setView('home')} />;

    return (
      <div className={`flex-1 ${currentTheme.bg} flex flex-col items-center justify-center p-6 text-white transition-colors duration-1000 overflow-hidden`}>
        <h1 className={`text-4xl sm:text-6xl font-black italic ${currentTheme.accent} drop-shadow-lg mb-4 text-center animate-pop-in leading-none`}>
          {currentTheme.name}
        </h1>
        
        <div className="relative animate-float mb-6 shrink-0">
            <div className="w-36 h-36 sm:w-48 sm:h-48 rounded-full bg-white/20 p-2 border-2 border-white/30 backdrop-blur-md shadow-xl overflow-hidden flex items-center justify-center">
                {isGeneratingCharacter ? (
                  <div className="flex flex-col items-center gap-1">
                    <div className="w-6 h-6 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                    <span className="text-[8px] font-black uppercase tracking-widest animate-pulse">Cargando...</span>
                  </div>
                ) : (
                  <img src={currentTheme.hero} className="w-full h-full object-contain rounded-full" alt={currentTheme.name} />
                )}
            </div>
            <div className="absolute -bottom-1 -right-1 bg-white text-slate-800 px-3 py-1 rounded-xl font-black shadow-lg text-[10px]">
              Lvl {gameState.currentLevel}
            </div>
        </div>

        <button 
          onClick={() => startLevel(gameState.currentLevel)}
          className={`${currentTheme.btn} w-full max-w-xs text-lg font-black py-4 rounded-2xl border-b-4 active:border-0 active:translate-y-1 transition-all shadow-xl mb-6`}
        >
          {gameState.currentLevel === 1 ? '¡EMPEZAR!' : `NIVEL ${gameState.currentLevel}`}
        </button>

        <div className="w-full max-w-[280px] bg-black/10 backdrop-blur-sm rounded-3xl p-4 border border-white/10 shadow-inner">
          <p className="text-[8px] font-black uppercase tracking-widest mb-3 opacity-60 text-center">Niveles</p>
          <div className="flex gap-2 overflow-x-auto pb-1 scrollbar-hide px-1">
            {COLORS.slice(0, 10).map((c) => {
              const isUnlocked = c.level <= gameState.currentLevel;
              const isCompleted = c.level < gameState.currentLevel || (gameState.stickers.find(s => s.level === c.level)?.unlocked);
              const isCurrent = c.level === gameState.currentLevel;

              return (
                <button
                  key={c.id}
                  disabled={!isUnlocked}
                  onClick={() => startLevel(c.level)}
                  className={`relative shrink-0 w-10 h-10 rounded-xl flex items-center justify-center font-black text-sm transition-all transform active:scale-90 ${
                    isCurrent ? 'bg-white text-slate-800 ring-2 ring-white/30 scale-105 z-10' :
                    isCompleted ? 'bg-yellow-400 text-yellow-900' :
                    'bg-white/10 text-white/20 cursor-not-allowed'
                  }`}
                >
                  {isUnlocked ? (isCompleted ? '✓' : c.level) : '🔒'}
                </button>
              );
            })}
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="h-screen w-full flex flex-col overflow-hidden bg-slate-900" style={{ height: 'var(--app-height)' }}>
      <div className="flex-1 relative flex flex-col overflow-hidden">
        {renderContent()}
      </div>

      <div className="bg-white h-14 sm:h-16 shadow-[0_-5px_15px_rgba(0,0,0,0.1)] flex items-center justify-around px-2 z-50 shrink-0">
        <button onClick={() => setView('home')} className={`flex flex-col items-center flex-1 ${view === 'home' ? 'text-indigo-600' : 'text-slate-300'}`}>
            <span className="text-lg">🏠</span>
            <span className="text-[8px] font-black uppercase tracking-tighter">Inicio</span>
        </button>
        <button onClick={() => startLevel(gameState.currentLevel)} className={`flex flex-col items-center flex-1 ${view === 'game' ? 'text-indigo-600' : 'text-slate-300'}`}>
            <div className={`w-10 h-10 rounded-full flex items-center justify-center shadow-lg -mt-6 transition-all ${view === 'game' ? 'bg-indigo-600 text-white' : 'bg-white'}`}>
                <span className="text-lg">🎨</span>
            </div>
            <span className="text-[8px] font-black uppercase tracking-tighter mt-0.5">Jugar</span>
        </button>
        <button onClick={() => setView('album')} className={`flex flex-col items-center flex-1 ${view === 'album' ? 'text-indigo-600' : 'text-slate-300'}`}>
            <span className="text-lg">🖼️</span>
            <span className="text-[8px] font-black uppercase tracking-tighter">Álbum</span>
        </button>
        <button onClick={() => setView('parents')} className={`flex flex-col items-center flex-1 ${view === 'parents' ? 'text-indigo-600' : 'text-slate-300'}`}>
            <span className="text-lg">👨‍👩‍👧</span>
            <span className="text-[8px] font-black uppercase tracking-tighter">Padres</span>
        </button>
      </div>
    </div>
  );
};

export default App;
