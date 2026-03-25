import { useState, useEffect } from "react";

const GOALS = [{ v: "hypertrophy", l: "Ganar músculo" }, { v: "strength", l: "Fuerza máxima" }, { v: "fat_loss", l: "Quemar grasa" }, { v: "endurance", l: "Resistencia" }];
const LEVELS = [{ v: "beginner", l: "Principiante" }, { v: "intermediate", l: "Intermedio" }, { v: "advanced", l: "Avanzado" }];
const MUSCLES = [{ v: "Chest", l: "Pecho" }, { v: "Back", l: "Espalda" }, { v: "Shoulders", l: "Hombros" }, { v: "Biceps", l: "Bíceps" }, { v: "Triceps", l: "Tríceps" }, { v: "Quadriceps", l: "Cuádriceps" }, { v: "Hamstrings", l: "Isquiotibiales" }, { v: "Glutes", l: "Glúteos" }, { v: "Abs", l: "Core / Abs" }, { v: "Calves", l: "Pantorrillas" }];
const EQUIP = [{ v: "Dumbbells", l: "Mancuernas" }, { v: "Barbell", l: "Barra" }, { v: "Cables", l: "Poleas" }, { v: "Machines", l: "Máquinas" }, { v: "Bodyweight", l: "Peso corporal" }];
const QUOTES = ["NO PAIN, NO GAIN", "IRON NEVER LIES", "TRAIN HARD, WIN EASY", "EVERY REP COUNTS", "YOUR ONLY LIMIT IS YOU"];
const GMAP = { hypertrophy: "Muscle hypertrophy", strength: "Maximum strength", fat_loss: "Fat loss", endurance: "Muscular endurance" };
const LMAP = { beginner: "Principiante", intermediate: "Intermedio", advanced: "Avanzado" };

const css = `
@import url('https://fonts.googleapis.com/css2?family=Bebas+Neue&family=DM+Sans:wght@400;500;600&display=swap');
*{box-sizing:border-box;margin:0;padding:0}
body{background:#111;font-family:'DM Sans',sans-serif;color:#ccc;min-height:100vh}
.box{background:#0c0c0c;border-radius:14px;border:.5px solid #252525;overflow:hidden;max-width:680px;margin:0 auto}
.hdr{padding:24px 22px 14px;border-bottom:.5px solid #1e1e1e}
.logo{font-family:'Bebas Neue',Impact,sans-serif;font-size:2.2rem;color:#FF5C00;letter-spacing:.1em;line-height:1}
.sub{font-size:.63rem;color:#555;letter-spacing:.2em;text-transform:uppercase;margin-top:3px}
.body{padding:18px 22px}
.sec{margin-bottom:18px}
.lbl{font-size:.62rem;font-weight:600;letter-spacing:.15em;text-transform:uppercase;color:#555;margin-bottom:8px;display:block}
.tiles{display:grid;grid-template-columns:1fr 1fr;gap:7px}
button{cursor:pointer;font-family:'DM Sans',sans-serif}
.tile{background:#161616;border:1.5px solid #252525;border-radius:9px;padding:10px 12px;font-size:.78rem;font-weight:500;color:#aaa;text-align:left;transition:all .15s;width:100%}
.tile.on,.tile:hover{border-color:#FF5C00;background:#160b02;color:#F0EEE8}
.lvls{display:flex;gap:7px}
.lvl{flex:1;padding:9px;text-align:center;font-size:.74rem;font-weight:500;background:#161616;border:1.5px solid #252525;border-radius:8px;color:#888;transition:all .15s}
.lvl.on,.lvl:hover{border-color:#FF5C00;color:#FF5C00;background:#110700}
.chips{display:flex;flex-wrap:wrap;gap:6px}
.chip{padding:6px 11px;font-size:.71rem;font-weight:500;background:#161616;border:1.5px solid #252525;border-radius:20px;color:#777;transition:all .15s}
.chip.on,.chip:hover{border-color:#FF5C00;background:#110700;color:#FF8A3D}
.srow{display:flex;align-items:center;gap:12px}
input[type=range]{flex:1;-webkit-appearance:none;height:4px;border-radius:2px;background:#282828;outline:none}
input[type=range]::-webkit-slider-thumb{-webkit-appearance:none;width:16px;height:16px;border-radius:50%;background:#FF5C00;cursor:pointer}
.sval{min-width:52px;text-align:center;font-size:.78rem;font-weight:600;color:#FF5C00;background:#110700;border:.5px solid #FF5C0040;padding:4px 8px;border-radius:6px}
.gbtn{width:100%;padding:13px;font-family:'Bebas Neue',Impact,sans-serif;font-size:1.05rem;letter-spacing:.12em;background:#FF5C00;color:#fff;border:none;border-radius:9px;margin-top:4px;transition:all .2s}
.gbtn:hover{background:#FF7A2A}
.gbtn:disabled{background:#252525;color:#444;cursor:not-allowed}
.err{color:#ff6b6b;font-size:.71rem;padding:10px 13px;background:#180505;border-radius:7px;border:.5px solid #380000;margin-top:10px;line-height:1.6}
.load{display:flex;flex-direction:column;justify-content:center;align-items:center;gap:18px;min-height:420px;padding:40px}
@keyframes spin{to{transform:rotate(360deg)}}
.spin{width:44px;height:44px;border:3px solid #1e1e1e;border-top-color:#FF5C00;border-radius:50%;animation:spin 1s linear infinite}
@keyframes fp{0%,100%{opacity:.2}50%{opacity:1}}
.qt{font-family:'Bebas Neue',Impact,sans-serif;font-size:1.45rem;color:#FF5C00;letter-spacing:.08em;text-align:center;animation:fp 2.5s ease-in-out infinite}
.ltxt{font-size:.63rem;color:#444;letter-spacing:.18em;text-transform:uppercase}
.wh{padding:18px 22px 12px;border-bottom:.5px solid #1e1e1e}
.wt{font-family:'Bebas Neue',Impact,sans-serif;font-size:1.6rem;color:#F0EEE8;letter-spacing:.06em;line-height:1.1}
.wtag{font-size:.73rem;color:#555;margin-top:3px;font-style:italic}
.wstats{display:flex;gap:20px;margin-top:10px}
.wsv{font-size:.95rem;font-weight:600;color:#FF5C00}
.wsl{font-size:.58rem;color:#444;text-transform:uppercase;letter-spacing:.12em;margin-top:1px}
.exs{padding:12px 22px;display:flex;flex-direction:column;gap:10px}
.card{background:#131313;border:.5px solid #222;border-radius:11px;overflow:hidden}
.ctop{display:grid;grid-template-columns:100px 1fr;min-height:78px}
.cimg{width:100px;min-height:78px;background:#191919;display:flex;align-items:center;justify-content:center;overflow:hidden}
.cimg img{width:100%;height:100%;object-fit:cover}
.cbody{padding:9px 11px;display:flex;flex-direction:column;justify-content:space-between}
.cn{font-size:.8rem;font-weight:600;color:#F0EEE8;line-height:1.2}
.cne{font-size:.62rem;color:#3a3a3a;margin-top:1px}
.mscl{display:inline-block;font-size:.58rem;font-weight:600;letter-spacing:.1em;text-transform:uppercase;padding:2px 7px;border-radius:4px;background:#130900;color:#FF8A3D;border:.5px solid #FF5C0025;margin-top:3px}
.cm{display:flex;gap:9px;margin-top:4px;flex-wrap:wrap}
.ms{font-size:.64rem;color:#666}
.ms b{color:#ccc;font-weight:600}
.cdet{padding:8px 11px;border-top:.5px solid #1a1a1a}
.inst{font-size:.7rem;color:#888;line-height:1.65}
.tip{margin-top:6px;padding:5px 9px;background:#0f0900;border-left:2px solid #FF5C00;border-radius:0 5px 5px 0;font-size:.67rem;color:#bb8c44}
.numex{display:inline-flex;align-items:center;justify-content:center;width:19px;height:19px;border-radius:50%;background:#FF5C00;color:#fff;font-size:.57rem;font-weight:700;margin-right:5px;flex-shrink:0;vertical-align:middle}
.rbar{padding:12px 22px;border-top:.5px solid #1e1e1e}
.rbtn{width:100%;padding:9px;font-size:.67rem;font-weight:500;letter-spacing:.1em;text-transform:uppercase;background:transparent;color:#444;border:.5px solid #252525;border-radius:8px;transition:all .15s}
.rbtn:hover{color:#FF5C00;border-color:#FF5C00;background:#0a0400}
`;

function PlaceholderSVG() {
  return (
    <svg width="44" height="38" viewBox="0 0 44 38" fill="none">
      <rect x="1" y="14" width="8" height="10" rx="2.5" fill="#242424"/>
      <rect x="9" y="10" width="5" height="18" rx="2" fill="#2e2e2e"/>
      <rect x="14" y="16" width="16" height="6" rx="1.5" fill="#383838"/>
      <rect x="30" y="10" width="5" height="18" rx="2" fill="#2e2e2e"/>
      <rect x="35" y="14" width="8" height="10" rx="2.5" fill="#242424"/>
      <circle cx="22" cy="7" r="5" fill="#FF5C00" fillOpacity="0.35"/>
    </svg>
  );
}

function ExCard({ ex, idx }) {
  const [img, setImg] = useState(null);
  useEffect(() => {
    fetch(`https://wger.de/api/v2/exercise/search/?term=${encodeURIComponent(ex.name)}&language=english&format=json`)
      .then(r => r.json())
      .then(d => {
        const p = d.suggestions?.[0]?.data?.image;
        if (p) setImg(p.startsWith("http") ? p : `https://wger.de${p}`);
      }).catch(() => {});
  }, [ex.name]);

  return (
    <div className="card">
      <div className="ctop">
        <div className="cimg">
          {img ? <img src={img} alt={ex.name} onError={() => setImg(null)} /> : <PlaceholderSVG />}
        </div>
        <div className="cbody">
          <div>
            <div className="cn"><span className="numex">{idx + 1}</span>{ex.nameEs || ex.name}</div>
            <div className="cne">{ex.name}</div>
            <span className="mscl">{ex.muscle || "—"}</span>
          </div>
          <div className="cm">
            <div className="ms"><b>{ex.sets}</b> series</div>
            <div className="ms"><b>{ex.reps}</b> reps</div>
            <div className="ms"><b>{ex.rest || 60}"</b> desc.</div>
          </div>
        </div>
      </div>
      <div className="cdet">
        <div className="inst">{ex.instructions}</div>
        {ex.tip && <div className="tip"><b style={{ color: "#FF7A2A" }}>PRO: </b>{ex.tip}</div>}
      </div>
    </div>
  );
}

export default function IronAI() {
  const [st, setSt] = useState({ goal: "hypertrophy", level: "intermediate", muscles: [], equip: ["Dumbbells"], dur: 45 });
  const [screen, setScreen] = useState("form");
  const [workout, setWorkout] = useState(null);
  const [err, setErr] = useState("");
  const [loading, setLoading] = useState(false);
  const [qi, setQi] = useState(0);

  useEffect(() => {
    const t = setInterval(() => setQi(i => (i + 1) % QUOTES.length), 2500);
    return () => clearInterval(t);
  }, []);

  const togM = v => setSt(s => ({ ...s, muscles: s.muscles.includes(v) ? s.muscles.filter(x => x !== v) : [...s.muscles, v] }));
  const togE = v => setSt(s => ({ ...s, equip: s.equip.includes(v) ? s.equip.filter(x => x !== v) : [...s.equip, v] }));

  function extractJSON(text) {
    const c = text.replace(/```json\s*/gi, "").replace(/```\s*/g, "").trim();
    const s = c.indexOf("{"), e = c.lastIndexOf("}");
    if (s < 0 || e < 0) throw new Error("No JSON en la respuesta");
    return c.slice(s, e + 1);
  }

  async function generate() {
    if (!st.muscles.length) { setErr("Seleccioná al menos un grupo muscular."); return; }
    if (!st.equip.length) { setErr("Seleccioná al menos un equipamiento."); return; }
    setErr(""); setLoading(true); setScreen("load");
    const n = st.level === "beginner" ? 5 : st.level === "advanced" ? 7 : 6;
    const prompt = `You are a certified personal trainer. Respond ONLY with a valid JSON object. No markdown, no explanation.\n\nCreate a ${n}-exercise gym workout:\n- Goal: ${GMAP[st.goal]}\n- Level: ${LMAP[st.level]}\n- Target muscles: ${st.muscles.join(", ")}\n- Equipment: ${st.equip.join(", ")}\n- Duration: ${st.dur} min\n\nJSON format:\n{"title":"WORKOUT TITLE IN CAPS","tagline":"frase motivacional breve en español","totalTime":${st.dur},"exercises":[{"name":"English exercise name","nameEs":"Nombre en español","muscle":"Primary muscle","sets":3,"reps":"10-12","rest":60,"instructions":"2-3 oraciones técnicas en español sobre ejecución correcta.","tip":"Consejo pro breve en español, máximo 12 palabras"}]}\n\nOutput ONLY the raw JSON. No markdown fences.`;

    try {
      const res = await fetch('/api/generate', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ prompt })
      });
      
      if (!res.ok) {
        let errorMsg = "Error al comunicarse con el servidor";
        try {
          const errorData = await res.json();
          errorMsg = errorData.error;
        } catch(e) {}
        throw new Error(errorMsg);
      }
      
      const data = await res.json();
      const w = JSON.parse(extractJSON(data.textoGenerado));
      if (!w.exercises?.length) throw new Error("La rutina no tiene ejercicios");
      setWorkout(w);
      setScreen("work");
    } catch (e) {
      setErr(e.message);
      setScreen("form");
    } finally {
      setLoading(false);
    }
  }

  return (
    <>
      <style>{css}</style>
      <div style={{ padding: "1rem", background: "#111", minHeight: "100vh" }}>
        <div className="box">
          {screen === "form" && (
            <>
              <div className="hdr">
                <div className="logo">IRON AI</div>
                <div className="sub">Entrenador personal inteligente</div>
              </div>
              <div className="body">
                <div className="sec">
                  <span className="lbl">Objetivo principal</span>
                  <div className="tiles">
                    {GOALS.map(g => (
                      <button key={g.v} className={`tile${st.goal === g.v ? " on" : ""}`} onClick={() => setSt(s => ({ ...s, goal: g.v }))}>{g.l}</button>
                    ))}
                  </div>
                </div>
                <div className="sec">
                  <span className="lbl">Nivel de experiencia</span>
                  <div className="lvls">
                    {LEVELS.map(l => (
                      <button key={l.v} className={`lvl${st.level === l.v ? " on" : ""}`} onClick={() => setSt(s => ({ ...s, level: l.v }))}>{l.l}</button>
                    ))}
                  </div>
                </div>
                <div className="sec">
                  <span className="lbl">Grupos musculares <span style={{ color: "#FF5C00" }}>({st.muscles.length} sel.)</span></span>
                  <div className="chips">
                    {MUSCLES.map(m => (
                      <button key={m.v} className={`chip${st.muscles.includes(m.v) ? " on" : ""}`} onClick={() => togM(m.v)}>{m.l}</button>
                    ))}
                  </div>
                </div>
                <div className="sec">
                  <span className="lbl">Equipamiento disponible</span>
                  <div className="chips">
                    {EQUIP.map(e => (
                      <button key={e.v} className={`chip${st.equip.includes(e.v) ? " on" : ""}`} onClick={() => togE(e.v)}>{e.l}</button>
                    ))}
                  </div>
                </div>
                <div className="sec">
                  <span className="lbl">Duración de la sesión</span>
                  <div className="srow">
                    <input type="range" min="20" max="90" step="5" value={st.dur}
                      style={{ accentColor: "#FF5C00" }}
                      onChange={e => setSt(s => ({ ...s, dur: +e.target.value }))} />
                    <div className="sval">{st.dur} min</div>
                  </div>
                </div>
                {err && <div className="err">{err}</div>}
                <button className="gbtn" disabled={loading} onClick={generate}>GENERAR MI RUTINA</button>
              </div>
            </>
          )}

          {screen === "load" && (
            <div className="load">
              <div className="spin" />
              <div className="ltxt">Generando tu rutina personalizada...</div>
              <div className="qt">{QUOTES[qi]}</div>
            </div>
          )}

          {screen === "work" && workout && (
            <>
              <div className="wh">
                <div className="wt">{workout.title}</div>
                <div className="wtag">{workout.tagline}</div>
                <div className="wstats">
                  <div><div className="wsv">{workout.totalTime} min</div><div className="wsl">Duración</div></div>
                  <div><div className="wsv">{workout.exercises.length} ej.</div><div className="wsl">Ejercicios</div></div>
                  <div><div className="wsv">{LMAP[st.level]}</div><div className="wsl">Nivel</div></div>
                </div>
              </div>
              <div className="exs">
                {workout.exercises.map((ex, i) => <ExCard key={i} ex={ex} idx={i} />)}
              </div>
              <div className="rbar">
                <button className="rbtn" onClick={() => { setWorkout(null); setScreen("form"); }}>← NUEVA RUTINA</button>
              </div>
            </>
          )}
        </div>
      </div>
    </>
  );
}
