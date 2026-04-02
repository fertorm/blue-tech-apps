import {
  DEFAULT_PROFILE_DRAFT,
  EQUIP,
  GOALS,
  LEVELS,
  MUSCLES,
} from "../shared/constants.js";

export default function FormScreen({
  err,
  generate,
  getRecommendedGoal,
  loadDashboard,
  profile,
  setAuthEmail,
  setAuthSent,
  setLoginReturnTo,
  setProfileDraft,
  setProfileSaved,
  setScreen,
  setSt,
  signOut,
  st,
  togE,
  togM,
  user,
}) {
  const recommendedGoal = getRecommendedGoal(profile);

  return (
    <>
      <header className="hdr">
        <p className="eyebrow">Entrenador personal inteligente</p>
        <h1 className="logo">IRON AI</h1>
        <div className="sub">Rutinas personalizadas según tu objetivo físico</div>
        <div className="hdr-row">
          {user ? (
            <div className="hdr-user">
              <span>{user.email}</span>
              <button className="hdr-signout" onClick={signOut}>
                Salir
              </button>
            </div>
          ) : (
            <div className="hdr-auth">
              <button
                className="hdr-auth-btn"
                onClick={() => {
                  setLoginReturnTo("form");
                  setAuthSent(false);
                  setAuthEmail("");
                  setScreen("login");
                }}
              >
                Iniciar sesión
              </button>
            </div>
          )}
          <div className="hdr-actions">
            <button
              className="hdr-auth-btn"
              onClick={() => {
                setProfileDraft(profile || DEFAULT_PROFILE_DRAFT);
                setProfileSaved(false);
                setScreen("profile");
              }}
            >
              Mi perfil
            </button>
            {user && (
              <button className="hdr-auth-btn" onClick={loadDashboard}>
                Mi progreso
              </button>
            )}
          </div>
        </div>
      </header>

      <section className="body" aria-label="Configuración de rutina">
        <section className="sec">
          <h2 className="lbl">Objetivo principal</h2>
          <div className="tiles">
            {GOALS.map((goal) => (
              <div key={goal.v} className="goal-option">
                {recommendedGoal === goal.v ? (
                  <span className="rec-badge">✦ RECOMENDADO PARA TI</span>
                ) : (
                  <span className="rec-spacer" aria-hidden="true" />
                )}
                <button
                  className={`tile${st.goal === goal.v ? " on" : ""}`}
                  aria-pressed={st.goal === goal.v}
                  onClick={() => setSt((current) => ({ ...current, goal: goal.v }))}
                >
                  {goal.l}
                </button>
              </div>
            ))}
          </div>
        </section>

        <section className="sec">
          <h2 className="lbl">Nivel de experiencia</h2>
          <div className="lvls">
            {LEVELS.map((level) => (
              <button
                key={level.v}
                className={`lvl${st.level === level.v ? " on" : ""}`}
                aria-pressed={st.level === level.v}
                onClick={() => setSt((current) => ({ ...current, level: level.v }))}
              >
                {level.l}
              </button>
            ))}
          </div>
        </section>

        <section className="sec">
          <h2 className="lbl">
            Grupos musculares <span className="lbl-accent">({st.muscles.length} sel.)</span>
          </h2>
          <div className="chips">
            {MUSCLES.map((muscle) => (
              <button
                key={muscle.v}
                className={`chip${st.muscles.includes(muscle.v) ? " on" : ""}`}
                aria-pressed={st.muscles.includes(muscle.v)}
                onClick={() => togM(muscle.v)}
              >
                {muscle.l}
              </button>
            ))}
          </div>
        </section>

        <section className="sec">
          <h2 className="lbl">Equipamiento disponible</h2>
          <div className="chips">
            {EQUIP.map((equip) => (
              <button
                key={equip.v}
                className={`chip${st.equip.includes(equip.v) ? " on" : ""}`}
                aria-pressed={st.equip.includes(equip.v)}
                onClick={() => togE(equip.v)}
              >
                {equip.l}
              </button>
            ))}
          </div>
        </section>

        <section className="sec">
          <h2 className="lbl">Duración de la sesión</h2>
          <div className="srow">
            <input
              type="range"
              min="20"
              max="90"
              step="5"
              value={st.dur}
              aria-label="Duración de la sesión en minutos"
              style={{ accentColor: "#FF5C00" }}
              onChange={(event) =>
                setSt((current) => ({ ...current, dur: +event.target.value }))
              }
            />
            <div className="sval">{st.dur} min</div>
          </div>
        </section>

        {err && <div className="err" role="alert">{err}</div>}

        <button className="gbtn" onClick={generate}>
          GENERAR MI RUTINA
        </button>
      </section>
    </>
  );
}
