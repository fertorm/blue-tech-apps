import {
  CARDIO_DURATIONS,
  CARDIO_INTENSITIES,
  CARDIO_TYPES,
} from "../shared/cardioConstants.js";
import { GOAL_LABELS, LEVEL_LABELS } from "../shared/constants.js";

export default function CardioFormScreen({
  cardioSt,
  err,
  generateCardio,
  loadDashboard,
  profile,
  setAuthEmail,
  setAuthSent,
  setCardioSt,
  setLoginReturnTo,
  setScreen,
  signOut,
  user,
}) {
  return (
    <>
      <header className="hdr">
        <div className="logo">IRON AI</div>
        <div className="sub">CARDIO PERSONALIZADO</div>
        <div className="hdr-row">
          <div className="hdr-actions">
            {user ? (
              <div className="hdr-user">
                <span>{user.email?.split("@")[0]}</span>
                <button className="hdr-signout" onClick={signOut}>
                  Salir
                </button>
                {loadDashboard && (
                  <button
                    className="hdr-auth-btn"
                    onClick={loadDashboard}
                  >
                    Mi progreso
                  </button>
                )}
              </div>
            ) : (
              <div className="hdr-auth">
                <button
                  className="hdr-auth-btn"
                  onClick={() => {
                    setLoginReturnTo("form");
                    setAuthEmail("");
                    setAuthSent(false);
                    setScreen("login");
                  }}
                >
                  Iniciar sesión
                </button>
              </div>
            )}
            <button
              className="hdr-auth-btn"
              onClick={() => setScreen("profile")}
            >
              {profile ? "Mi perfil" : "Configurar perfil"}
            </button>
          </div>
        </div>
      </header>

      <div className="body">
        <div className="sec">
          <span className="lbl">Tipo de entrenamiento</span>
          <div className="tiles">
            {CARDIO_TYPES.map(({ v, l }) => (
              <button
                key={v}
                className={`tile${cardioSt.type === v ? " on" : ""}`}
                onClick={() => setCardioSt((s) => ({ ...s, type: v }))}
              >
                {l}
              </button>
            ))}
          </div>
        </div>

        <div className="sec">
          <span className="lbl">Intensidad</span>
          <div className="lvls">
            {CARDIO_INTENSITIES.map(({ v, l }) => (
              <button
                key={v}
                className={`lvl${cardioSt.intensity === v ? " on" : ""}`}
                onClick={() => setCardioSt((s) => ({ ...s, intensity: v }))}
              >
                {l}
              </button>
            ))}
          </div>
        </div>

        <div className="sec">
          <span className="lbl">
            Duración —{" "}
            <span className="lbl-accent">{cardioSt.dur} min</span>
          </span>
          <div className="chips">
            {CARDIO_DURATIONS.map((d) => (
              <button
                key={d}
                className={`chip${cardioSt.dur === d ? " on" : ""}`}
                onClick={() => setCardioSt((s) => ({ ...s, dur: d }))}
              >
                {d} min
              </button>
            ))}
          </div>
        </div>

        {err && <div className="err">{err}</div>}

        <button className="gbtn" onClick={generateCardio}>
          GENERAR RUTINA DE CARDIO
        </button>
      </div>
    </>
  );
}
