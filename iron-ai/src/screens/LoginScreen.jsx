export default function LoginScreen({
  authEmail,
  authLoading,
  authSent,
  loginReturnTo,
  sendMagicLink,
  setAuthEmail,
  setScreen,
}) {
  return (
    <section className="auth-wrap">
      <header className="auth-header">
        <p className="eyebrow">Entrenador personal inteligente</p>
        <h1 className="logo">IRON AI</h1>
      </header>

      <h2 className="auth-title">TU PROGRESO, TU HISTORIAL</h2>
      <p className="auth-sub">
        Ingresá tu email para recibir un enlace de acceso. Sin contraseña, sin
        registro.
      </p>

      <div className="auth-form">
        {authSent ? (
          <div className="auth-sent">
            ✓ Enlace enviado a <b>{authEmail}</b>
            <br />
            Revisá tu bandeja de entrada y hacé click en el enlace para ingresar.
          </div>
        ) : (
          <>
            <input
              className="auth-input"
              type="email"
              aria-label="Tu dirección de email"
              placeholder="tu@email.com"
              value={authEmail}
              onChange={(event) => setAuthEmail(event.target.value)}
              onKeyDown={(event) => event.key === "Enter" && sendMagicLink()}
            />
            <button
              className="gbtn"
              disabled={authLoading || !authEmail.trim()}
              onClick={sendMagicLink}
            >
              {authLoading ? "ENVIANDO..." : "ENVIAR ENLACE"}
            </button>
          </>
        )}

        <button className="auth-skip" onClick={() => setScreen(loginReturnTo)}>
          Continuar sin cuenta
        </button>
      </div>
    </section>
  );
}
