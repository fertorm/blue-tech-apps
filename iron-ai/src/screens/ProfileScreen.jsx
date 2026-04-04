export default function ProfileScreen({
  calcMetrics,
  isPremium,
  onBack,
  profile,
  profileDraft,
  profileSaved,
  saveProfile,
  setProfileDraft,
  setShowUpgrade,
}) {
  const metrics = calcMetrics(profile);

  return (
    <>
      <header className="prof-hdr">
        <h1 className="prof-title">MI PERFIL</h1>
        <button className="hdr-auth-btn" onClick={onBack}>
          ← Volver
        </button>
      </header>

      <section className="prof-wrap">
        <section>
          <h2 className="lbl">Sexo</h2>
          <div className="lvls">
            <button
              className={`lvl${profileDraft.sex === "male" ? " on" : ""}`}
              aria-pressed={profileDraft.sex === "male"}
              onClick={() => setProfileDraft((draft) => ({ ...draft, sex: "male" }))}
            >
              Hombre
            </button>
            <button
              className={`lvl${profileDraft.sex === "female" ? " on" : ""}`}
              aria-pressed={profileDraft.sex === "female"}
              onClick={() => setProfileDraft((draft) => ({ ...draft, sex: "female" }))}
            >
              Mujer
            </button>
          </div>
        </section>

        <label className="prof-input-wrap">
          <span className="lbl">Edad (años)</span>
          <input
            className="prof-input"
            type="number"
            min="10"
            max="100"
            placeholder="25"
            value={profileDraft.age}
            onChange={(event) =>
              setProfileDraft((draft) => ({ ...draft, age: event.target.value }))
            }
          />
        </label>

        <label className="prof-input-wrap">
          <span className="lbl">Peso (kg)</span>
          <input
            className="prof-input"
            type="number"
            min="30"
            max="200"
            placeholder="75"
            value={profileDraft.weight}
            onChange={(event) =>
              setProfileDraft((draft) => ({ ...draft, weight: event.target.value }))
            }
          />
        </label>

        <label className="prof-input-wrap">
          <span className="lbl">Altura (cm)</span>
          <input
            className="prof-input"
            type="number"
            min="100"
            max="250"
            placeholder="175"
            value={profileDraft.height}
            onChange={(event) =>
              setProfileDraft((draft) => ({ ...draft, height: event.target.value }))
            }
          />
        </label>

        {profileSaved ? (
          <div className="prof-saved">✓ PERFIL GUARDADO</div>
        ) : (
          <button
            className="gbtn"
            disabled={
              !profileDraft.age || !profileDraft.weight || !profileDraft.height
            }
            onClick={saveProfile}
          >
            GUARDAR PERFIL
          </button>
        )}

        {metrics && (
          <>
            <hr className="prof-divider" />
            <h2 className="lbl">Tus métricas</h2>
            <section className="metrics-grid" aria-label="Métricas físicas">

              {/* IMC — gratis */}
              <BmiCard metrics={metrics} />

              {/* TMB — premium */}
              {isPremium ? (
                <article className="metric-card">
                  <div className="metric-val metric-val-small">{metrics.bmr.toLocaleString()}</div>
                  <div className="metric-lbl">TMB kcal/día</div>
                  <div className="metric-sub">Calorías en reposo</div>
                </article>
              ) : (
                <button className="metric-card metric-card-lock" onClick={() => setShowUpgrade(true)} type="button" aria-label="Desbloquear TMB premium">
                  <span className="lock-icon">🔒</span>
                  <div className="metric-lbl">TMB kcal/día</div>
                  <div className="metric-sub">Premium</div>
                </button>
              )}

              {/* TDEE — premium */}
              {isPremium ? (
                <article className="metric-card">
                  <div className="metric-val metric-val-small">{metrics.tdee.toLocaleString()}</div>
                  <div className="metric-lbl">TDEE kcal/día</div>
                  <div className="metric-sub">Actividad moderada</div>
                </article>
              ) : (
                <button className="metric-card metric-card-lock" onClick={() => setShowUpgrade(true)} type="button" aria-label="Desbloquear TDEE premium">
                  <span className="lock-icon">🔒</span>
                  <div className="metric-lbl">TDEE kcal/día</div>
                  <div className="metric-sub">Premium</div>
                </button>
              )}

              {/* Peso ideal — premium */}
              {isPremium ? (
                <article className="metric-card metric-card-full">
                  <div className="metric-val metric-val-green">{metrics.idealMin} - {metrics.idealMax} kg</div>
                  <div className="metric-lbl">Peso saludable para tu altura</div>
                  <div className="metric-sub">Rango IMC 18.5 - 24.9</div>
                </article>
              ) : (
                <button className="metric-card metric-card-full metric-card-lock" onClick={() => setShowUpgrade(true)} type="button" aria-label="Desbloquear peso saludable premium">
                  <span className="lock-icon">🔒</span>
                  <div className="metric-lbl">Peso saludable para tu altura</div>
                  <div className="metric-sub">Premium</div>
                </button>
              )}

            </section>
          </>
        )}
      </section>
    </>
  );
}

function BmiCard({ metrics }) {
  const bmiNum = parseFloat(metrics.bmi);
  const markerPct = Math.min(95, Math.max(2, ((bmiNum - 10) / 30) * 100));

  return (
    <article className="metric-card metric-card-full">
      <div className="metric-row">
        <div>
          <div className="metric-val" style={{ color: metrics.bmiColor }}>
            {metrics.bmi}
          </div>
          <div className="metric-lbl">Índice de Masa Corporal</div>
        </div>
        <div
          className="metric-badge"
          style={{
            background: `${metrics.bmiColor}22`,
            borderColor: `${metrics.bmiColor}55`,
            color: metrics.bmiColor,
          }}
        >
          {metrics.bmiCategory}
        </div>
      </div>
      <div className="imc-bar-wrap">
        <div className="imc-bar">
          <div
            className="imc-marker"
            style={{ left: `${markerPct}%`, background: metrics.bmiColor }}
          />
        </div>
        <div className="imc-labels">
          <span>Bajo peso</span>
          <span>Normal</span>
          <span>Sobrepeso</span>
          <span>Obesidad</span>
        </div>
      </div>
    </article>
  );
}
