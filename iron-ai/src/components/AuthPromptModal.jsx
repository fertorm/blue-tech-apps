export default function AuthPromptModal({ isOpen, onClose, onLogin }) {
  if (!isOpen) return null;

  return (
    <div
      className="auth-overlay"
      role="dialog"
      aria-modal="true"
      aria-labelledby="auth-modal-title"
      onClick={onClose}
    >
      <div className="auth-modal" onClick={(event) => event.stopPropagation()}>
        <h2 id="auth-modal-title" className="auth-modal-title">
          GUARDÁ TU PROGRESO
        </h2>
        <p className="auth-modal-sub">
          Iniciá sesión con tu email para guardar esta sesión y ver tu historial
          de entrenamientos. Es gratis y no necesitás contraseña.
        </p>
        <div className="auth-modal-btns">
          <button className="auth-modal-main" onClick={onLogin}>
            INICIAR SESIÓN
          </button>
          <button className="auth-modal-skip" onClick={onClose}>
            Continuar sin guardar
          </button>
        </div>
      </div>
    </div>
  );
}
