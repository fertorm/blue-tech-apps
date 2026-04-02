import CaliSkillCard from "../components/CaliSkillCard.jsx";
import { CALI_CATEGORY_LABELS } from "../shared/caliConstants.js";

export default function CaliWorkoutScreen({
  caliSkills,
  caliProgress,
  caliSt,
  completed,
  loadDashboard,
  onAdvance,
  onBack,
  saveCaliSession,
  user,
}) {
  const categoryLabel = CALI_CATEGORY_LABELS[caliSt.category] || caliSt.category;

  return (
    <>
      <header className="wh">
        <h1 className="wt">PROGRESIONES — {categoryLabel.toUpperCase()}</h1>
        <p className="wtag">
          Tu ruta de avance personalizada. Avanzá cuando domines cada paso.
        </p>
        <div className="wstats" aria-label="Resumen">
          <div>
            <div className="wsv">{caliSkills.length}</div>
            <div className="wsl">Skills</div>
          </div>
          <div>
            <div className="wsv">
              {caliSkills.reduce((acc, s) => acc + (s.steps?.length || 0), 0)}
            </div>
            <div className="wsl">Pasos totales</div>
          </div>
          <div>
            <div className="wsv">{categoryLabel}</div>
            <div className="wsl">Categoría</div>
          </div>
        </div>
      </header>

      <section className="exs" aria-label="Skills de calistenia">
        {caliSkills.map((skill) => (
          <CaliSkillCard
            key={skill.id}
            skill={skill}
            currentStep={caliProgress[skill.id] ?? 1}
            onAdvance={onAdvance}
          />
        ))}
      </section>

      <div className="rbar">
        {completed ? (
          <div className="compl-badge">✓ SESIÓN GUARDADA</div>
        ) : (
          <button className="compl-btn" onClick={saveCaliSession}>
            MARCAR SESIÓN COMO COMPLETADA
          </button>
        )}
        {user && !completed && (
          <button className="rbtn" onClick={loadDashboard}>
            VER MI PROGRESO
          </button>
        )}
        <button className="rbtn" onClick={onBack}>
          ← VOLVER A CATEGORÍAS
        </button>
      </div>
    </>
  );
}
