
import React, { useState, useEffect, useRef } from 'react';
import { RitualStage, Message, ClosureAction, SentimentAnalysis } from './types';
import { getAIResponse, analyzeSentiment } from './services/geminiService';
import { VisualPyre } from './components/VisualPyre';

const App: React.FC = () => {
  const [stage, setStage] = useState<RitualStage>(RitualStage.INTRO);
  const [history, setHistory] = useState<Message[]>([]);
  const [currentResponse, setCurrentResponse] = useState<string>("");
  const [letterContent, setLetterContent] = useState<string>("");
  const [email, setEmail] = useState<string>("");
  const [emailError, setEmailError] = useState<string>("");
  const [isEmailSent, setIsEmailSent] = useState(false);
  const [sentiment, setSentiment] = useState<SentimentAnalysis | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [closureAction, setClosureAction] = useState<ClosureAction | null>(null);
  const [showFinalPoem, setShowFinalPoem] = useState(false);

  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [history, currentResponse]);

  const addMessage = (role: 'user' | 'model', text: string) => {
    setHistory(prev => [...prev, { role, text }]);
  };

  const handleStart = async () => {
    setIsLoading(true);
    setStage(RitualStage.STEP_BACK);
    const initialPrompt = "Inicia el ritual. Ayúdame a dar un 'paso atrás' para conectar con mi intención de cierre.";
    const response = await getAIResponse([], initialPrompt);
    setCurrentResponse(response);
    addMessage('model', response);
    setIsLoading(false);
  };

  const handleStepBackReply = async (reply: string) => {
    addMessage('user', reply);
    setIsLoading(true);
    
    // Analyze sentiment to suggest audio
    const analysis = await analyzeSentiment(reply);
    setSentiment(analysis);

    const response = await getAIResponse([...history, { role: 'user', text: reply }], 
      "Analiza mi respuesta y sugiéreme el ambiente sensorial (audio) adecuado. Luego, invítame a pasar a la fase 'The Alchemist' para empezar a escribir mi carta.");
    
    setCurrentResponse(response);
    addMessage('model', response);
    setIsLoading(false);
  };

  const startWriting = () => {
    setStage(RitualStage.ALCHEMIST);
  };

  const finishWriting = async () => {
    setIsLoading(true);
    const analysis = await analyzeSentiment(letterContent);
    setSentiment(analysis);
    
    const response = await getAIResponse([...history, { role: 'user', text: letterContent }], 
      "He terminado mi carta. Guíame solemnemente hacia las tres vías de cierre: El Baúl, La Pira o El Mensajero.");
    
    setCurrentResponse(response);
    addMessage('model', response);
    setStage(RitualStage.CLOSURE);
    setIsLoading(false);
  };

  const handleClosure = (action: ClosureAction) => {
    setClosureAction(action);
    setStage(RitualStage.FINAL_RITUAL);
  };

  const validateEmail = (email: string) => {
    const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return re.test(email);
  };

  const handleSendEmail = () => {
    if (!validateEmail(email)) {
      setEmailError("Por favor, introduce un correo electrónico válido.");
      return;
    }
    setEmailError("");
    setIsEmailSent(true);
  };

  const resetRitual = () => {
    setStage(RitualStage.INTRO);
    setHistory([]);
    setLetterContent("");
    setEmail("");
    setEmailError("");
    setIsEmailSent(false);
    setSentiment(null);
    setClosureAction(null);
    setShowFinalPoem(false);
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-4 md:p-8">
      {/* Background Decor */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden">
        <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-purple-900/10 blur-[120px] rounded-full"></div>
        <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-amber-900/10 blur-[120px] rounded-full"></div>
      </div>

      <main className="w-full max-w-4xl glass rounded-3xl p-6 md:p-10 shadow-2xl relative z-10 flex flex-col min-h-[80vh]">
        {/* Header */}
        <header className="mb-8 border-b border-white/10 pb-4 flex justify-between items-center">
          <div>
            <h1 className="font-mystic text-4xl md:text-5xl text-amber-50/90 mb-1">Katarsis Engine</h1>
            <p className="text-xs tracking-[0.2em] text-amber-500/60 uppercase font-medium">v1.0 • Ritual de Alquimia Emocional</p>
          </div>
          {stage !== RitualStage.INTRO && (
            <button 
              onClick={resetRitual}
              className="text-xs text-white/40 hover:text-white/80 transition-colors uppercase tracking-widest border border-white/10 px-3 py-1 rounded"
            >
              Reiniciar
            </button>
          )}
        </header>

        {/* Dynamic Content */}
        <div className="flex-grow overflow-y-auto pr-2 custom-scrollbar" ref={scrollRef}>
          {stage === RitualStage.INTRO && (
            <div className="text-center py-20 animate-in fade-in duration-1000">
              <div className="w-24 h-24 border border-amber-500/30 rounded-full mx-auto mb-10 flex items-center justify-center animate-float">
                <div className="w-16 h-16 border border-amber-500/20 rounded-full flex items-center justify-center">
                  <div className="w-4 h-4 bg-amber-500/40 rounded-full blur-[2px]"></div>
                </div>
              </div>
              <h2 className="font-mystic text-3xl mb-6 text-amber-100/80 italic">"Lo que no se dice, se queda en el cuerpo."</h2>
              <p className="text-white/60 mb-10 max-w-md mx-auto leading-relaxed">
                Este es un espacio sagrado para el cierre emocional. A través de la introspección y la escritura, transformaremos tu historia en luz.
              </p>
              <button 
                onClick={handleStart}
                className="px-10 py-4 bg-amber-900/20 hover:bg-amber-900/40 border border-amber-500/40 text-amber-200 rounded-full transition-all tracking-widest uppercase text-sm"
              >
                Comenzar Ritual
              </button>
            </div>
          )}

          {(stage === RitualStage.STEP_BACK || stage === RitualStage.CLOSURE) && (
            <div className="space-y-6 mb-10">
              {history.map((msg, i) => (
                <div key={i} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                  <div className={`max-w-[85%] p-5 rounded-2xl ${
                    msg.role === 'user' 
                      ? 'bg-amber-900/10 border border-amber-500/20 text-amber-50/90' 
                      : 'bg-white/5 border border-white/5 text-white/80 font-mystic text-lg leading-relaxed'
                  }`}>
                    {msg.text.split('\n').map((line, idx) => (
                      <p key={idx} className="mb-2">{line}</p>
                    ))}
                  </div>
                </div>
              ))}
              {isLoading && (
                <div className="flex justify-start animate-pulse">
                  <div className="bg-white/5 border border-white/5 p-4 rounded-2xl text-white/40 italic">
                    El motor está procesando tu intención...
                  </div>
                </div>
              )}
            </div>
          )}

          {stage === RitualStage.ALCHEMIST && (
            <div className="space-y-6 animate-in slide-in-from-bottom duration-700">
              <div className="mb-4">
                <span className="text-xs uppercase tracking-[0.3em] text-amber-500/60 block mb-2">The Alchemist</span>
                <p className="text-amber-50/60 italic font-mystic text-lg">Escribe sin filtros. Las palabras son la materia prima de tu liberación.</p>
              </div>
              <textarea
                value={letterContent}
                onChange={(e) => setLetterContent(e.target.value)}
                placeholder="Escribe aquí tu carta de cierre..."
                className="w-full h-80 bg-black/40 border border-white/10 rounded-2xl p-6 text-amber-50/90 focus:outline-none focus:border-amber-500/40 transition-colors font-mystic text-xl leading-relaxed resize-none"
              />
              <div className="flex justify-end">
                <button 
                  onClick={finishWriting}
                  disabled={letterContent.length < 10 || isLoading}
                  className="px-8 py-3 bg-amber-900/20 hover:bg-amber-900/40 border border-amber-500/40 text-amber-200 rounded-full transition-all tracking-widest uppercase text-xs disabled:opacity-30"
                >
                  Finalizar Carta
                </button>
              </div>
            </div>
          )}

          {stage === RitualStage.FINAL_RITUAL && (
            <div className="text-center py-10 animate-in zoom-in duration-1000">
              {closureAction === ClosureAction.PYRE && (
                <VisualPyre onComplete={() => setShowFinalPoem(true)} />
              )}

              {closureAction === ClosureAction.TRUNK && (
                <div className="py-20">
                  <div className="w-32 h-32 border-2 border-dashed border-amber-500/20 rounded-2xl mx-auto mb-10 flex items-center justify-center">
                    <div className="w-16 h-10 border-2 border-amber-500/40 rounded-md"></div>
                  </div>
                  <h3 className="font-mystic text-2xl text-amber-100/90 mb-4 italic">El Baúl de la Memoria</h3>
                  <p className="text-white/60 max-w-sm mx-auto">Tus palabras han sido cifradas y guardadas en el silencio. Ya no pesarán en tu presente.</p>
                  <button onClick={() => setShowFinalPoem(true)} className="mt-8 text-amber-500/60 hover:text-amber-500 uppercase tracking-widest text-xs">Continuar</button>
                </div>
              )}

              {closureAction === ClosureAction.MESSENGER && (
                <div className="py-10">
                  <div className="w-24 h-24 bg-amber-500/5 border border-amber-500/20 rounded-full mx-auto mb-10 flex items-center justify-center">
                     <div className="text-amber-500 animate-pulse text-3xl">✉</div>
                  </div>
                  <h3 className="font-mystic text-2xl text-amber-100/90 mb-4 italic">El Mensajero Digital</h3>
                  
                  {!isEmailSent ? (
                    <div className="max-w-sm mx-auto animate-in fade-in slide-in-from-bottom duration-500">
                      <p className="text-white/60 mb-6">¿A dónde quieres que el mensajero lleve tus palabras? (Opcional: puedes enviártelo a ti mismo como recordatorio).</p>
                      <div className="space-y-4">
                        <div className="text-left">
                          <label htmlFor="email" className="block text-[10px] uppercase tracking-widest text-amber-500/60 mb-2 ml-1">Dirección de Destino</label>
                          <input 
                            id="email"
                            type="email" 
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            placeholder="tu@email.com"
                            className={`w-full bg-black/40 border ${emailError ? 'border-red-500/50' : 'border-white/10'} rounded-xl px-5 py-3 text-sm focus:outline-none focus:border-amber-500/40 transition-all`}
                          />
                          {emailError && <p className="text-red-400 text-[10px] mt-2 ml-1 italic">{emailError}</p>}
                        </div>
                        <button 
                          onClick={handleSendEmail}
                          className="w-full py-3 bg-amber-900/20 hover:bg-amber-900/40 border border-amber-500/40 text-amber-200 rounded-xl transition-all tracking-widest uppercase text-[10px] font-bold"
                        >
                          Lanzar Mensaje
                        </button>
                        <button 
                          onClick={() => setIsEmailSent(true)}
                          className="text-white/30 hover:text-white/50 text-[10px] uppercase tracking-widest transition-colors"
                        >
                          Omitir y generar enlace
                        </button>
                      </div>
                    </div>
                  ) : (
                    <div className="animate-in zoom-in duration-500">
                      <p className="text-white/60 max-w-sm mx-auto mb-6">Tu botella ha sido lanzada al mar. Aquí tienes tu enlace único y efímero:</p>
                      <div className="bg-white/5 p-3 rounded-lg border border-white/10 text-amber-400 font-mono text-xs break-all mb-8">
                        https://katarsis.ritual/msg/{Math.random().toString(36).substring(7)}
                      </div>
                      <button onClick={() => setShowFinalPoem(true)} className="text-amber-500/60 hover:text-amber-500 uppercase tracking-widest text-xs">Finalizar</button>
                    </div>
                  )}
                </div>
              )}

              {showFinalPoem && (
                <div className="animate-in fade-in slide-in-from-top duration-1000 mt-10 max-w-2xl mx-auto">
                   <div className="relative mb-16">
                     <div className="absolute inset-0 bg-amber-500/5 blur-3xl rounded-full -z-10"></div>
                     <h2 className="font-mystic text-5xl md:text-6xl text-amber-100/90 mb-10 italic tracking-tight">Cenizas y Luz</h2>
                     
                     <div className="space-y-6 text-amber-50/70 font-mystic text-2xl md:text-3xl italic leading-relaxed">
                       <p className="animate-in fade-in slide-in-from-bottom duration-1000 delay-300">
                         "Lo que fue peso, ahora es viento."
                       </p>
                       <p className="animate-in fade-in slide-in-from-bottom duration-1000 delay-700">
                         "Lo que fue nudo, ahora es cauce."
                       </p>
                       <p className="animate-in fade-in slide-in-from-bottom duration-1000 delay-1000">
                         "Has entregado al fuego lo que ya no te pertenece,"
                       </p>
                       <p className="animate-in fade-in slide-in-from-bottom duration-1000 delay-1500">
                         "y en el vacío que dejas, florece tu propia paz."
                       </p>
                     </div>
                   </div>

                   <div className="flex flex-col items-center gap-8">
                     <div className="flex items-center gap-4">
                       <div className="h-[1px] w-12 bg-amber-500/20"></div>
                       <div className="w-2 h-2 rounded-full bg-amber-500/40 blur-[1px]"></div>
                       <div className="h-[1px] w-12 bg-amber-500/20"></div>
                     </div>

                     <button 
                      onClick={resetRitual}
                      className="group relative px-12 py-5 overflow-hidden rounded-full transition-all"
                     >
                       <div className="absolute inset-0 bg-amber-900/10 border border-amber-500/30 group-hover:bg-amber-900/20 transition-colors"></div>
                       <span className="relative text-amber-200/60 group-hover:text-amber-200 uppercase tracking-[0.4em] text-[10px] font-bold transition-colors">
                         Regresar al Silencio
                       </span>
                     </button>
                   </div>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Footer Interaction / Audio Suggestion */}
        <footer className="mt-6 border-t border-white/10 pt-4 flex flex-col md:flex-row gap-4 items-center justify-between">
          <div className="flex items-center gap-3">
            <div className={`w-2 h-2 rounded-full ${isLoading ? 'bg-amber-500 animate-pulse' : 'bg-green-500'}`}></div>
            <span className="text-[10px] uppercase tracking-[0.2em] text-white/40 font-medium">
              {isLoading ? 'Motor Procesando' : 'Motor Activo'}
            </span>
          </div>

          {sentiment && (
            <div className="flex items-center gap-4 bg-white/5 border border-white/10 px-4 py-2 rounded-full">
              <span className="text-[10px] uppercase tracking-widest text-amber-500/80">Ambiente: {sentiment.audioFrequency}</span>
              <div className="h-4 w-[1px] bg-white/10"></div>
              <span className="text-xs italic text-white/60 font-mystic">{sentiment.suggestion}</span>
            </div>
          )}

          {stage === RitualStage.STEP_BACK && !isLoading && (
            <div className="w-full md:w-auto flex gap-2">
              <input 
                type="text" 
                placeholder="Escribe tu respuesta..."
                className="bg-black/40 border border-white/10 rounded-full px-5 py-2 text-sm focus:outline-none focus:border-amber-500/40 w-full"
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    handleStepBackReply(e.currentTarget.value);
                    e.currentTarget.value = "";
                  }
                }}
              />
              <button 
                onClick={startWriting}
                className="bg-white/5 border border-white/10 px-4 py-2 rounded-full text-[10px] uppercase tracking-widest hover:bg-white/10 transition-colors"
              >
                Escribir Carta
              </button>
            </div>
          )}

          {stage === RitualStage.CLOSURE && !isLoading && (
            <div className="flex gap-2">
              <button onClick={() => handleClosure(ClosureAction.TRUNK)} className="bg-amber-900/10 border border-amber-500/20 px-4 py-2 rounded-full text-[10px] uppercase tracking-widest hover:bg-amber-900/20 text-amber-200">El Baúl</button>
              <button onClick={() => handleClosure(ClosureAction.PYRE)} className="bg-orange-900/10 border border-orange-500/20 px-4 py-2 rounded-full text-[10px] uppercase tracking-widest hover:bg-orange-900/20 text-orange-200">La Pira</button>
              <button onClick={() => handleClosure(ClosureAction.MESSENGER)} className="bg-blue-900/10 border border-blue-500/20 px-4 py-2 rounded-full text-[10px] uppercase tracking-widest hover:bg-blue-900/20 text-blue-200">Mensajero</button>
            </div>
          )}
        </footer>
      </main>
    </div>
  );
};

export default App;
