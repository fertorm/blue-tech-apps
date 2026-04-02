import { CALI_CATEGORIES } from "../shared/caliConstants.js";

export default function CaliFormScreen({
  caliSt,
  err,
  loadCali,
  loadDashboard,
  profile,
  setAuthEmail,
  setAuthSent,
  setCaliSt,
  setLoginReturnTo,
  setScreen,
  signOut,
  user,
}) {
  return (
    <>
      <header className="hdr">
        <div className="logo">IRON AI</div>
        <div className="sub">PROGRESIONES CALISTÉNICAS</div>
        <div className="hdr-row">
          <div className="hdr-actions">
            {user ? (
              <div className="hdr-user">
                <span>{user.email?.split("@")[0]}</span>
                <button className="hdr-signout" onClick={signOut}>
                  Salir
                </button>
                {loadDashboard && (
                  <button className="hdr-auth-btn" onClick={loadDashboard}>
                    Mi progreso
                  </button>
                )}
              </div>
            ) : (
              <div className="hdr-auth">
                <button
                  className="hdr-auth-btn"
                  onClick={() => {
                    setLoginReturnTo("form");
                    setAuthEmail("");
                    setAuthSent(false);
                    setScreen("login");
                  }}
                >
                  Iniciar sesión
                </button>
              </div>
            )}
            <button
              className="hdr-auth-btn"
              onClick={() => setScreen("profile")}
            >
              {profile ? "Mi perfil" : "Configurar perfil"}
            </button>
          </div>
        </div>
      </header>

      <div className="body">
        <div className="sec">
          <span className="lbl">Categoría de habilidad</span>
          <div className="tiles">
            {CALI_CATEGORIES.map(({ v, l }) => (
              <button
                key={v}
                className={`tile${caliSt.category === v ? " on" : ""}`}
                onClick={() => setCaliSt((s) => ({ ...s, category: v }))}
              >
                {l}
              </button>
            ))}
          </div>
        </div>

        <div className="sec" style={{ color: "#666", fontSize: ".72rem", lineHeight: 1.7 }}>
          Seleccioná una categoría y cargá tus progresiones. Tu avance se guarda
          automáticamente — iniciá sesión para sincronizarlo entre dispositivos.
        </div>

        {err && <div className="err">{err}</div>}

        <button className="gbtn" onClick={loadCali}>
          VER MIS PROGRESIONES
        </button>
      </div>
    </>
  );
}
