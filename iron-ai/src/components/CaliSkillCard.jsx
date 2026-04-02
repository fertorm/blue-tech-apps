import { useState } from "react";
import PlaceholderSVG from "./PlaceholderSVG.jsx";
import ProgressionBar from "./ProgressionBar.jsx";

function StepExercise({ ex, number }) {
  const [imgError, setImgError] = useState(false);
  const imgSrc = !imgError && ex.imageUrl ? ex.imageUrl : null;
  const repsLabel = ex.hold ? `${ex.hold}s hold` : ex.reps;

  return (
    <article className="card" style={{ marginBottom: 8 }}>
      <div className="ctop">
        <div className="cimg">
          {imgSrc ? (
            <img
              src={imgSrc}
              alt={ex.name}
              loading="lazy"
              onError={() => setImgError(true)}
            />
          ) : (
            <PlaceholderSVG />
          )}
        </div>
        <div className="cbody">
          <div>
            <h3 className="cn">
              <span className="numex">{number}</span>
              {ex.nameEs || ex.name}
            </h3>
            <div className="cne">{ex.name}</div>
          </div>
          <div className="cm">
            <div className="ms">
              <b>{ex.sets}</b> series
            </div>
            <div className="ms">
              <b>{repsLabel}</b>
            </div>
          </div>
        </div>
      </div>
      <div className="cdet">
        <div className="inst">{ex.instructions}</div>
        {ex.tip && (
          <div className="tip">
            <b className="tip-label">PRO: </b>
            {ex.tip}
          </div>
        )}
      </div>
    </article>
  );
}

export default function CaliSkillCard({ skill, currentStep, onAdvance }) {
  const steps = skill.steps || [];
  const totalSteps = steps.length;
  const safeStep = Math.min(Math.max(currentStep, 1), totalSteps);
  const currentStepData = steps.find((s) => s.step === safeStep);
  const nextStepData = steps.find((s) => s.step === safeStep + 1);
  const isMaxStep = safeStep >= totalSteps;

  return (
    <div className="cali-skill-card">
      <div className="cali-skill-hdr">
        <div>
          <div className="cali-skill-name">{skill.nameEs || skill.name}</div>
          <div className="cali-step-label">
            Paso {safeStep} de {totalSteps} —{" "}
            {currentStepData?.nameEs || currentStepData?.name}
          </div>
        </div>
      </div>

      <div style={{ padding: "0 14px" }}>
        <ProgressionBar totalSteps={totalSteps} currentStep={safeStep} />
      </div>

      <div className="cali-skill-body">
        {currentStepData && (
          <StepExercise ex={currentStepData} number={safeStep} />
        )}

        <button
          className="cali-advance-btn"
          onClick={() => onAdvance(skill.id)}
          disabled={isMaxStep}
        >
          {isMaxStep ? "✓ NIVEL MÁXIMO ALCANZADO" : "AVANZAR AL SIGUIENTE NIVEL →"}
        </button>
      </div>

      {nextStepData && (
        <div className="cali-next-preview">
          <b>Siguiente:</b> {nextStepData.nameEs || nextStepData.name}
        </div>
      )}
    </div>
  );
}
