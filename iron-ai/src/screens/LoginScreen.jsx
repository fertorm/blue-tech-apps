export default function LoginScreen({
  authCode,
  authEmail,
  authError,
  authLoading,
  authSent,
  loginReturnTo,
  sendMagicLink,
  setAuthCode,
  setAuthEmail,
  setAuthSent,
  setScreen,
  verifyOtp,
}) {
  return (
    <section className="auth-wrap">
      <header className="auth-header">
        <p className="eyebrow">Entrenador personal inteligente</p>
        <h1 className="logo">IRON AI</h1>
      </header>

      <h2 className="auth-title">TU PROGRESO, TU HISTORIAL</h2>
      <p className="auth-sub">
        Ingresá tu email para recibir un código de acceso. Sin contraseña, sin
        registro.
      </p>

      <div className="auth-form">
        {authSent ? (
          <>
            <div className="auth-sent">
              ✓ Código enviado a <b>{authEmail}</b>
              <br />
              Revisá tu bandeja de entrada e ingresá el código de acceso.
            </div>
            <input
              className="auth-input"
              type="text"
              inputMode="numeric"
              pattern="[0-9]*"
              maxLength={8}
              aria-label="Código de verificación"
              placeholder="39290832"
              value={authCode}
              onChange={(event) => setAuthCode(event.target.value.replace(/\D/g, ""))}
              onKeyDown={(event) => event.key === "Enter" && verifyOtp()}
              autoFocus
            />
            {authError && <p className="auth-error">{authError}</p>}
            <button
              className="gbtn"
              disabled={authLoading || authCode.length < 6 || authCode.length > 8}
              onClick={verifyOtp}
            >
              {authLoading ? "VERIFICANDO..." : "VERIFICAR CÓDIGO"}
            </button>
            <button
              className="auth-skip"
              onClick={() => setAuthSent(false)}
            >
              Reenviar código
            </button>
          </>
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
            {authError && <p className="auth-error">{authError}</p>}
            <button
              className="gbtn"
              disabled={authLoading || !authEmail.trim()}
              onClick={sendMagicLink}
            >
              {authLoading ? "ENVIANDO..." : "ENVIAR CÓDIGO"}
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
