export default function LoadingScreen({ label, quote }) {
  return (
    <section className="load" aria-live="polite" aria-label={label}>
      <div className="spin" />
      <div className="ltxt">{label}</div>
      <div className="qt">{quote}</div>
    </section>
  );
}
