export default function ProgressionBar({ totalSteps, currentStep }) {
  return (
    <div className="prog-bar" role="progressbar" aria-valuenow={currentStep} aria-valuemax={totalSteps}>
      {Array.from({ length: totalSteps }, (_, i) => {
        const stepNum = i + 1;
        const cls =
          stepNum < currentStep
            ? "prog-step done"
            : stepNum === currentStep
            ? "prog-step current"
            : "prog-step";
        return <div key={i} className={cls} />;
      })}
    </div>
  );
}
