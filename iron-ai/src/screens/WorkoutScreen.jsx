import ExerciseCard from "../components/ExerciseCard.jsx";
import { LEVEL_LABELS } from "../shared/constants.js";

export default function WorkoutScreen({
  completed,
  level,
  loadDashboard,
  onBack,
  saveSession,
  user,
  workout,
}) {
  return (
    <>
      <header className="wh">
        <h1 className="wt">{workout.title}</h1>
        <p className="wtag">{workout.tagline}</p>
        <div className="wstats" aria-label="Resumen de la rutina">
          <div>
            <div className="wsv">{workout.totalTime} min</div>
            <div className="wsl">Duración</div>
          </div>
          <div>
            <div className="wsv">{workout.exercises.length} ej.</div>
            <div className="wsl">Ejercicios</div>
          </div>
          <div>
            <div className="wsv">{LEVEL_LABELS[level]}</div>
            <div className="wsl">Nivel</div>
          </div>
        </div>
      </header>

      <section className="exs" aria-label="Lista de ejercicios">
        {workout.exercises.map((exercise, index) => (
          <ExerciseCard key={exercise.name ?? index} ex={exercise} idx={index} />
        ))}
      </section>

      <div className="rbar">
        {completed ? (
          <div className="compl-badge">✓ SESIÓN GUARDADA</div>
        ) : (
          <button className="compl-btn" onClick={saveSession}>
            MARCAR COMO COMPLETADO
          </button>
        )}
        {user && !completed && (
          <button className="rbtn" onClick={loadDashboard}>
            VER MI PROGRESO
          </button>
        )}
        <button className="rbtn" onClick={onBack}>
          ← NUEVA RUTINA
        </button>
      </div>
    </>
  );
}
