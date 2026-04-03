// src/components/UpgradeModal.jsx
export default function UpgradeModal({ isOpen, onClose, userId }) {
  if (!isOpen) return null

  function handleUpgrade() {
    const baseUrl = import.meta.env.VITE_LEMONSQUEEZY_CHECKOUT_URL
    if (!baseUrl) return
    const url = `${baseUrl}?checkout[custom][user_id]=${userId}`
    window.LemonSqueezy?.Url?.Open(url)
  }

  return (
    <div className="modal-overlay" role="dialog" aria-modal="true" aria-labelledby="upgrade-modal-title">
      <div className="modal-box">
        <div className="modal-icon">🔒</div>
        <h2 id="upgrade-modal-title" className="modal-title">FEATURE PREMIUM</h2>
        <p className="modal-sub">
          Registrá tu progreso y medí tu evolución real.
        </p>
        <ul className="modal-perks">
          <li>✦ Historial de rutinas en la nube</li>
          <li>✦ Perfil físico + métricas corporales</li>
          <li>✦ Seguimiento de peso con gráfica</li>
        </ul>
        <button className="gbtn" onClick={handleUpgrade}>
          OBTENER ACCESO — $5
        </button>
        <button className="auth-skip" onClick={onClose}>
          Ahora no
        </button>
      </div>
    </div>
  )
}
