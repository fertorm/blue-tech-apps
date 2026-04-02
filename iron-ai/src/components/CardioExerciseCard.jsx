import { useState } from "react";
import PlaceholderSVG from "./PlaceholderSVG.jsx";

export default function CardioExerciseCard({ ex, idx }) {
  const [imgError, setImgError] = useState(false);
  const imgSrc = !imgError && ex.imageUrl ? ex.imageUrl : null;

  const totalSec = (ex.workTime + ex.restTime) * ex.rounds;
  const totalMin = Math.round(totalSec / 60);

  return (
    <article className="card">
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
              <span className="numex">{idx + 1}</span>
              {ex.nameEs || ex.name}
            </h3>
            <div className="cne">{ex.name}</div>
          </div>
          <div className="cm-cardio">
            <div className="ms-work">
              <b>{ex.workTime}"</b>
              <span className="sep">/</span>
              <b>{ex.restTime}"</b>
              <span style={{ color: "#666", marginLeft: 4 }}>×</span>
              <b style={{ marginLeft: 4 }}>{ex.rounds}</b>
              <span style={{ color: "#666", marginLeft: 4 }}>rondas</span>
            </div>
            <div className="ms-work" style={{ color: "#555" }}>
              ~{totalMin} min
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
