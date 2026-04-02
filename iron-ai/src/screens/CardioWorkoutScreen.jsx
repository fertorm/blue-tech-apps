import CardioExerciseCard from "../components/CardioExerciseCard.jsx";
import { CARDIO_INTENSITY_LABELS, CARDIO_TYPE_LABELS } from "../shared/cardioConstants.js";

export default function CardioWorkoutScreen({
  cardioWorkout,
  cardioSt,
  completed,
  loadDashboard,
  onBack,
  saveCardioSession,
  user,
}) {
  return (
    <>
      <header className="wh">
        <h1 className="wt">{cardioWorkout.title}</h1>
        <p className="wtag">{cardioWorkout.tagline}</p>
        <div className="wstats" aria-label="Resumen del entrenamiento">
          <div>
            <div className="wsv">{cardioWorkout.totalMinutes} min</div>
            <div className="wsl">Duración</div>
          </div>
          <div>
            <div className="wsv">{cardioWorkout.exercises.length} ej.</div>
            <div className="wsl">Ejercicios</div>
          </div>
          <div>
            <div className="wsv">
              {CARDIO_INTENSITY_LABELS[cardioSt.intensity]}
            </div>
            <div className="wsl">Intensidad</div>
          </div>
        </div>
      </header>

      <section className="exs" aria-label="Lista de ejercicios de cardio">
        {cardioWorkout.exercises.map((exercise, index) => (
          <CardioExerciseCard
            key={exercise.name ?? index}
            ex={exercise}
            idx={index}
          />
        ))}
      </section>

      <div className="rbar">
        {completed ? (
          <div className="compl-badge">✓ SESIÓN GUARDADA</div>
        ) : (
          <button className="compl-btn" onClick={saveCardioSession}>
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
