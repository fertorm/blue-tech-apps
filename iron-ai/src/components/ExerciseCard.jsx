import { useState } from "react";
import PlaceholderSVG from "./PlaceholderSVG.jsx";

export default function ExerciseCard({ ex, idx }) {
  const [imgError, setImgError] = useState(false);
  const imgSrc = !imgError && ex.imageUrl ? ex.imageUrl : null;

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
            <span className="mscl">{ex.muscle || "—"}</span>
          </div>
          <div className="cm">
            <div className="ms">
              <b>{ex.sets}</b> series
            </div>
            <div className="ms">
              <b>{ex.reps}</b> reps
            </div>
            <div className="ms">
              <b>{ex.rest || 60}"</b> desc.
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
