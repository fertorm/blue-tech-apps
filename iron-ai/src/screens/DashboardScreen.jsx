import { GOAL_LABELS, LEVEL_LABELS } from "../shared/constants.js";
import { calcStreak } from "../shared/fitness.js";
import LoadingScreen from "./LoadingScreen.jsx";

export default function DashboardScreen({
  dashLoading,
  getWeekBars,
  onBack,
  sessions,
}) {
  if (dashLoading) {
    return <LoadingScreen label="Cargando tu progreso..." quote="IRON NEVER LIES" />;
  }

  return (
    <>
      <header className="dash-hdr">
        <h1 className="dash-title">MI PROGRESO</h1>
        <button className="hdr-auth-btn" onClick={onBack}>
          ← Volver
        </button>
      </header>

      <section className="dash-body">
        <section className="dash-stats" aria-label="Métricas generales">
          <article className="stat-card">
            <div className="stat-num">{sessions.length}</div>
            <div className="stat-lbl">Sesiones totales</div>
          </article>
          <article className="stat-card">
            <div className="stat-num">{calcStreak(sessions)}</div>
            <div className="stat-lbl">Días seguidos</div>
          </article>
          <article className="stat-card">
            <div className="stat-num">
              {
                new Set(
                  sessions.map((session) =>
                    new Date(session.completed_at).toLocaleDateString("sv-SE"),
                  ),
                ).size
              }
            </div>
            <div className="stat-lbl">Días entrenados</div>
          </article>
        </section>

        <section>
          <h2 className="week-lbl">Últimos 7 días</h2>
          <div className="week-grid">
            {getWeekBars(sessions).map((day) => (
              <div key={day.key} className="week-bar-wrap">
                <div className="week-bar-outer">
                  <div
                    className="week-bar-inner"
                    style={{ height: `${Math.round(day.pct * 100)}%` }}
                  />
                </div>
                <div className="week-day">{day.label}</div>
              </div>
            ))}
          </div>
        </section>

        <section>
          <h2 className="week-lbl">Historial reciente</h2>
          {sessions.length === 0 ? (
            <div className="dash-empty">
              Todavía no completaste ninguna sesión.
              <br />
              ¡Generá una rutina y marcala como completada!
            </div>
          ) : (
            <div className="hist-list">
              {sessions.slice(0, 15).map((session) => (
                <article key={session.id} className="hist-item">
                  <div
                    className="hist-dot"
                    style={
                      session.goal === "cardio"
                        ? { background: "#00bcd4" }
                        : session.goal === "calisthenics"
                        ? { background: "#9c27b0" }
                        : undefined
                    }
                  />
                  <div className="hist-info">
                    <div className="hist-title">
                      {session.title || "Rutina completada"}
                    </div>
                    <div className="hist-meta">
                      {GOAL_LABELS[session.goal] || session.goal} ·{" "}
                      {LEVEL_LABELS[session.level] || session.level} ·{" "}
                      {new Date(session.completed_at).toLocaleDateString("es-AR", {
                        day: "numeric",
                        month: "short",
                      })}
                    </div>
                  </div>
                </article>
              ))}
            </div>
          )}
        </section>
      </section>
    </>
  );
}
