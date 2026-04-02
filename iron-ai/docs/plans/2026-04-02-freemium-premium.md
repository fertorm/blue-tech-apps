# Iron AI Freemium + Premium — Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Implementar modelo freemium con pago único de $5 vía Lemon Squeezy que desbloquea historial en la nube, métricas corporales y seguimiento de peso con gráfica.

**Architecture:** Estado `isPremium` central en `IronAI.jsx` consultado al login desde tabla `premium_users` en Supabase. Features premium muestran `UpgradeModal` si el usuario no pagó. El webhook de Lemon Squeezy inserta la fila en `premium_users` usando la service role key de Supabase (bypassa RLS).

**Tech Stack:** React 18, Vite, Supabase, Vercel Serverless Functions, Lemon Squeezy (pagos), Recharts (gráfica de peso)

---

## Task 1: Crear tablas en Supabase

**Files:**
- Create: `supabase/schema_premium.sql`

**Step 1: Escribir el SQL**

```sql
-- supabase/schema_premium.sql

-- Usuarios premium (pago único)
CREATE TABLE IF NOT EXISTS premium_users (
  user_id        uuid REFERENCES auth.users(id) ON DELETE CASCADE PRIMARY KEY,
  purchased_at   timestamp DEFAULT now(),
  payment_ref    text
);
ALTER TABLE premium_users ENABLE ROW LEVEL SECURITY;
CREATE POLICY "read_own" ON premium_users
  FOR SELECT USING (auth.uid() = user_id);

-- Seguimiento de peso
CREATE TABLE IF NOT EXISTS weight_logs (
  id         uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id    uuid REFERENCES auth.users(id) ON DELETE CASCADE,
  logged_at  date NOT NULL DEFAULT CURRENT_DATE,
  weight_kg  numeric(5,2) NOT NULL,
  note       text
);
ALTER TABLE weight_logs ENABLE ROW LEVEL SECURITY;
CREATE POLICY "crud_own" ON weight_logs
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- Índice para queries por usuario ordenadas por fecha
CREATE INDEX IF NOT EXISTS weight_logs_user_date
  ON weight_logs (user_id, logged_at DESC);
```

**Step 2: Ejecutar en Supabase Dashboard**

1. Ir a `https://supabase.com/dashboard/project/afukfanypnnsauxhfdmj/sql/new`
2. Pegar el contenido del archivo
3. Click "Run"
4. Verificar que aparecen las tablas `premium_users` y `weight_logs` en Table Editor

**Step 3: Verificar**

En Supabase → Table Editor → confirmar:
- `premium_users`: columnas `user_id`, `purchased_at`, `payment_ref`
- `weight_logs`: columnas `id`, `user_id`, `logged_at`, `weight_kg`, `note`
- RLS habilitado en ambas (ícono de candado)

**Step 4: Commit**

```bash
git add iron-ai/supabase/schema_premium.sql
git commit -m "feat: agregar tablas premium_users y weight_logs en Supabase"
```

---

## Task 2: Estado `isPremium` en IronAI.jsx

**Files:**
- Modify: `src/IronAI.jsx`

**Step 1: Agregar estado**

En `IronAI.jsx`, en la sección `// ── Auth / User ──`, agregar debajo de `loginReturnTo`:

```js
// ── Premium ────────────────────────────────────────────────────────────────
const [isPremium, setIsPremium]         = useState(false)
const [showUpgrade, setShowUpgrade]     = useState(false)
```

**Step 2: Agregar función de verificación**

Agregar esta función antes de `// ── Effects ──`:

```js
async function checkPremium(userId) {
  const { data } = await supabase
    .from("premium_users")
    .select("purchased_at")
    .eq("user_id", userId)
    .maybeSingle()
  setIsPremium(!!data)
}
```

**Step 3: Llamar al verificar sesión**

Dentro del `useEffect`, en la línea donde se hace `setUser(session?.user ?? null)` del `getSession`:

```js
supabase.auth.getSession().then(({ data: { session } }) => {
  setUser(session?.user ?? null)
  if (session?.user) checkPremium(session.user.id)  // ← agregar esta línea
})
```

**Step 4: Llamar en `onAuthStateChange`**

Dentro del callback de `onAuthStateChange`, después de `setUser(session?.user ?? null)`:

```js
if (session?.user) {
  checkPremium(session.user.id)  // ← agregar esta línea
  // ... resto del código existente
}
```

Y cuando el usuario hace logout (cuando `session` es null), resetear:

```js
if (!session) setIsPremium(false)  // ← agregar antes del if (session?.user)
```

**Step 5: Agregar `isPremium` y `setShowUpgrade` a `sharedNavProps`**

```js
const sharedNavProps = {
  isPremium,          // ← nuevo
  setShowUpgrade,     // ← nuevo
  loadDashboard,
  profile,
  setAuthEmail,
  setAuthSent,
  setLoginReturnTo,
  setScreen,
  signOut,
  user,
}
```

**Step 6: Verificar manualmente**

1. `npm run dev` (o `netlify dev`)
2. Login con magic link
3. Abrir DevTools → Console
4. Verificar que no hay errores

**Step 7: Commit**

```bash
git add iron-ai/src/IronAI.jsx
git commit -m "feat: agregar estado isPremium con verificación desde Supabase"
```

---

## Task 3: Componente `UpgradeModal`

**Files:**
- Create: `src/components/UpgradeModal.jsx`

**Step 1: Crear el componente**

```jsx
// src/components/UpgradeModal.jsx
export default function UpgradeModal({ isOpen, onClose, onUpgrade }) {
  if (!isOpen) return null

  return (
    <div className="modal-overlay" role="dialog" aria-modal="true" aria-label="Acceso Premium">
      <div className="modal-box">
        <div className="modal-icon">🔒</div>
        <h2 className="modal-title">FEATURE PREMIUM</h2>
        <p className="modal-sub">
          Registrá tu progreso y medí tu evolución real.
        </p>
        <ul className="modal-perks">
          <li>✦ Historial de rutinas en la nube</li>
          <li>✦ Perfil físico + métricas corporales</li>
          <li>✦ Seguimiento de peso con gráfica</li>
        </ul>
        <button className="gbtn" onClick={onUpgrade}>
          OBTENER ACCESO — $5
        </button>
        <button className="auth-skip" onClick={onClose}>
          Ahora no
        </button>
      </div>
    </div>
  )
}
```

**Step 2: Agregar estilos en `styles.css`**

Buscar la sección de `.modal-overlay` (usada por `AuthPromptModal`) y agregar si no existen:

```css
/* ── Upgrade Modal ──────────────────────────────────────────────────── */
.modal-icon   { font-size: 2.5rem; margin-bottom: .5rem; }
.modal-title  { font-size: 1.3rem; font-weight: 900; letter-spacing: .12em; margin: 0 0 .5rem; }
.modal-sub    { color: var(--muted); font-size: .9rem; margin: 0 0 1rem; }
.modal-perks  { list-style: none; padding: 0; margin: 0 0 1.5rem; text-align: left; display: flex; flex-direction: column; gap: .4rem; }
.modal-perks li { font-size: .9rem; color: var(--orange); font-weight: 700; }
```

**Step 3: Montar en `IronAI.jsx`**

Importar el componente:
```js
import UpgradeModal from "./components/UpgradeModal.jsx"
```

Agregar en el render, junto a `AuthPromptModal`:
```jsx
<UpgradeModal
  isOpen={showUpgrade}
  onClose={() => setShowUpgrade(false)}
  onUpgrade={() => {
    setShowUpgrade(false)
    // Lemon Squeezy checkout — se implementa en Task 7
    alert("Checkout próximamente")
  }}
/>
```

**Step 4: Verificar visualmente**

En DevTools Console: `document.querySelector('.modal-overlay')` — no debe existir.
Temporalmente cambiar `showUpgrade` a `true` en el estado inicial → modal visible → cambiar de vuelta a `false`.

**Step 5: Commit**

```bash
git add iron-ai/src/components/UpgradeModal.jsx iron-ai/src/styles.css iron-ai/src/IronAI.jsx
git commit -m "feat: agregar UpgradeModal para features premium"
```

---

## Task 4: Gate en `ProfileScreen`

**Files:**
- Modify: `src/screens/ProfileScreen.jsx`
- Modify: `src/IronAI.jsx`

**Step 1: Leer `ProfileScreen.jsx` completo para entender estructura actual**

```bash
cat iron-ai/src/screens/ProfileScreen.jsx
```

**Step 2: Pasar `isPremium` y `setShowUpgrade` como props**

En `IronAI.jsx`, el screen `"profile"` ya recibe props. Agregar:
```jsx
{screen === "profile" && (
  <main role="main">
    <ProfileScreen
      calcMetrics={calcMetrics}
      isPremium={isPremium}          // ← nuevo
      setShowUpgrade={setShowUpgrade} // ← nuevo
      onBack={backFromDashOrProfile}
      profile={profile}
      profileDraft={profileDraft}
      profileSaved={profileSaved}
      saveProfile={saveProfile}
      setProfileDraft={setProfileDraft}
    />
  </main>
)}
```

**Step 3: En `ProfileScreen.jsx`, gatear la Zona 2 (métricas)**

Agregar los dos nuevos props a la firma de la función:
```js
export default function ProfileScreen({
  calcMetrics,
  isPremium,        // ← nuevo
  setShowUpgrade,   // ← nuevo
  onBack,
  profile,
  profileDraft,
  profileSaved,
  saveProfile,
  setProfileDraft,
})
```

Encontrar la sección donde se muestran las métricas (IMC, TMB, TDEE). Envolverla:

```jsx
{/* Zona 2 — Métricas */}
{profile?.weight && profile?.height && (
  isPremium ? (
    <section className="metrics-section">
      {/* ... contenido actual de métricas ... */}
    </section>
  ) : (
    <div className="premium-teaser" onClick={() => setShowUpgrade(true)}>
      <span>🔒</span>
      <p>Desbloqueá tus métricas corporales</p>
      <small>IMC · TMB · TDEE · Peso ideal</small>
    </div>
  )
)}
```

**Step 4: Agregar estilos del teaser en `styles.css`**

```css
/* ── Premium teaser ─────────────────────────────────────────────────── */
.premium-teaser {
  border: 1.5px dashed var(--orange);
  border-radius: 10px;
  padding: 1.5rem;
  text-align: center;
  cursor: pointer;
  margin-top: 1rem;
  transition: background .15s;
}
.premium-teaser:hover { background: rgba(255,100,0,.06); }
.premium-teaser span  { font-size: 1.8rem; }
.premium-teaser p     { font-weight: 700; margin: .4rem 0 .2rem; }
.premium-teaser small { color: var(--muted); font-size: .8rem; }
```

**Step 5: Verificar**

1. Login con cuenta sin premium → ir a Perfil → métricas muestran teaser naranja
2. Click en teaser → abre UpgradeModal
3. Simular premium: en DevTools, `setIsPremium(true)` no es accesible desde consola, pero podés insertar manualmente una fila en `premium_users` para tu user_id en Supabase Dashboard → refrescar → métricas visibles

**Step 6: Commit**

```bash
git add iron-ai/src/screens/ProfileScreen.jsx iron-ai/src/IronAI.jsx iron-ai/src/styles.css
git commit -m "feat: gate premium en métricas de ProfileScreen"
```

---

## Task 5: Instalar Recharts + crear `WeightTrackingScreen`

**Files:**
- Create: `src/screens/WeightTrackingScreen.jsx`

**Step 1: Instalar Recharts**

```bash
cd iron-ai && npm install recharts
```

Verificar que se agregó a `package.json` en `dependencies`.

**Step 2: Crear la pantalla**

```jsx
// src/screens/WeightTrackingScreen.jsx
import { useState, useEffect } from "react"
import {
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer
} from "recharts"

export default function WeightTrackingScreen({ supabase, user, onBack }) {
  const [logs, setLogs]         = useState([])
  const [weightInput, setWeightInput] = useState("")
  const [noteInput, setNoteInput]     = useState("")
  const [saving, setSaving]     = useState(false)
  const [loading, setLoading]   = useState(true)
  const [saved, setSaved]       = useState(false)

  useEffect(() => {
    loadLogs()
  }, [])

  async function loadLogs() {
    setLoading(true)
    const { data } = await supabase
      .from("weight_logs")
      .select("id, logged_at, weight_kg, note")
      .eq("user_id", user.id)
      .order("logged_at", { ascending: true })
      .limit(90)
    setLogs(data || [])
    setLoading(false)
  }

  async function saveWeight() {
    const kg = parseFloat(weightInput)
    if (!kg || kg < 20 || kg > 300) return
    setSaving(true)
    const today = new Date().toISOString().slice(0, 10) // YYYY-MM-DD
    await supabase.from("weight_logs").upsert({
      user_id: user.id,
      logged_at: today,
      weight_kg: kg,
      note: noteInput.trim() || null,
    }, { onConflict: "user_id,logged_at" })
    setWeightInput("")
    setNoteInput("")
    setSaved(true)
    setTimeout(() => setSaved(false), 2000)
    await loadLogs()
    setSaving(false)
  }

  async function deleteLog(id) {
    await supabase.from("weight_logs").delete().eq("id", id)
    setLogs(prev => prev.filter(l => l.id !== id))
  }

  // Formatear fecha para el eje X del gráfico
  const chartData = logs.map(l => ({
    fecha: new Date(l.logged_at + "T00:00:00").toLocaleDateString("es-AR", {
      day: "numeric", month: "short"
    }),
    kg: parseFloat(l.weight_kg),
  }))

  return (
    <>
      <header className="dash-hdr">
        <h1 className="dash-title">MI PESO</h1>
        <button className="hdr-auth-btn" onClick={onBack}>← Volver</button>
      </header>

      <section className="dash-body">
        {/* Formulario */}
        <section className="weight-form">
          <h2 className="week-lbl">Registrar hoy</h2>
          <div className="weight-inputs">
            <input
              className="auth-input"
              type="number"
              min="20"
              max="300"
              step="0.1"
              placeholder="75.5"
              value={weightInput}
              onChange={e => setWeightInput(e.target.value)}
              aria-label="Peso en kg"
            />
            <span className="weight-unit">kg</span>
          </div>
          <input
            className="auth-input weight-note"
            type="text"
            placeholder="Nota opcional (ej: en ayunas)"
            value={noteInput}
            onChange={e => setNoteInput(e.target.value)}
            maxLength={80}
          />
          <button
            className="gbtn"
            onClick={saveWeight}
            disabled={saving || !weightInput}
          >
            {saved ? "✓ GUARDADO" : saving ? "GUARDANDO..." : "GUARDAR"}
          </button>
        </section>

        {/* Gráfica */}
        {logs.length >= 2 && (
          <section>
            <h2 className="week-lbl">Tu evolución</h2>
            <ResponsiveContainer width="100%" height={180}>
              <LineChart data={chartData} margin={{ top: 5, right: 10, left: -20, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#333" />
                <XAxis dataKey="fecha" tick={{ fontSize: 10, fill: "#888" }} />
                <YAxis domain={["auto", "auto"]} tick={{ fontSize: 10, fill: "#888" }} />
                <Tooltip
                  contentStyle={{ background: "#1a1a1a", border: "1px solid #444", borderRadius: 6 }}
                  labelStyle={{ color: "#fff" }}
                  itemStyle={{ color: "#ff6400" }}
                />
                <Line
                  type="monotone"
                  dataKey="kg"
                  stroke="#ff6400"
                  strokeWidth={2}
                  dot={{ r: 3, fill: "#ff6400" }}
                  activeDot={{ r: 5 }}
                />
              </LineChart>
            </ResponsiveContainer>
          </section>
        )}

        {/* Historial */}
        <section>
          <h2 className="week-lbl">Historial</h2>
          {loading ? (
            <p className="dash-empty">Cargando...</p>
          ) : logs.length === 0 ? (
            <p className="dash-empty">Todavía no registraste ningún peso.</p>
          ) : (
            <div className="hist-list">
              {[...logs].reverse().map(log => (
                <article key={log.id} className="hist-item">
                  <div className="hist-dot" style={{ background: "#ff6400" }} />
                  <div className="hist-info">
                    <div className="hist-title">
                      {parseFloat(log.weight_kg)} kg
                      {log.note && <span className="weight-log-note"> — {log.note}</span>}
                    </div>
                    <div className="hist-meta">
                      {new Date(log.logged_at + "T00:00:00").toLocaleDateString("es-AR", {
                        day: "numeric", month: "long", year: "numeric"
                      })}
                    </div>
                  </div>
                  <button
                    className="weight-del-btn"
                    onClick={() => deleteLog(log.id)}
                    aria-label="Eliminar registro"
                  >
                    🗑
                  </button>
                </article>
              ))}
            </div>
          )}
        </section>
      </section>
    </>
  )
}
```

**Step 3: Agregar estilos en `styles.css`**

```css
/* ── Weight Tracking ────────────────────────────────────────────────── */
.weight-form       { display: flex; flex-direction: column; gap: .7rem; margin-bottom: 1.5rem; }
.weight-inputs     { display: flex; align-items: center; gap: .5rem; }
.weight-unit       { font-weight: 900; color: var(--orange); font-size: 1.1rem; }
.weight-note       { font-size: .85rem; }
.weight-del-btn    { background: none; border: none; cursor: pointer; font-size: 1rem; margin-left: auto; opacity: .5; }
.weight-del-btn:hover { opacity: 1; }
.weight-log-note   { color: var(--muted); font-weight: 400; font-size: .85rem; }
```

**Step 4: Verificar compilación**

```bash
cd iron-ai && npm run build
```

Esperado: build exitoso sin errores.

**Step 5: Commit**

```bash
git add iron-ai/src/screens/WeightTrackingScreen.jsx iron-ai/src/styles.css iron-ai/package.json iron-ai/package-lock.json
git commit -m "feat: agregar WeightTrackingScreen con gráfica Recharts"
```

---

## Task 6: Integrar `WeightTrackingScreen` en `IronAI.jsx` + botón "Mi Peso"

**Files:**
- Modify: `src/IronAI.jsx`
- Modify: `src/screens/DashboardScreen.jsx`

**Step 1: Importar y registrar la pantalla en `IronAI.jsx`**

Agregar import lazy:
```js
const WeightTrackingScreen = lazy(() => import("./screens/WeightTrackingScreen.jsx"))
```

Agregar función de navegación:
```js
function goToWeight() {
  if (!user) {
    setLoginReturnTo("weight")
    setScreen("login")
    setAuthSent(false)
    setAuthEmail("")
    return
  }
  if (!isPremium) {
    setShowUpgrade(true)
    return
  }
  setScreen("weight")
}
```

Agregar el render de la pantalla (dentro del `<Suspense>`):
```jsx
{screen === "weight" && user && isPremium && (
  <main role="main">
    <WeightTrackingScreen
      supabase={supabase}
      user={user}
      onBack={backFromDashOrProfile}
    />
  </main>
)}
```

**Step 2: Pasar `goToWeight` a `sharedNavProps`**

```js
const sharedNavProps = {
  goToWeight,     // ← nuevo
  isPremium,
  setShowUpgrade,
  loadDashboard,
  profile,
  setAuthEmail,
  setAuthSent,
  setLoginReturnTo,
  setScreen,
  signOut,
  user,
}
```

**Step 3: Agregar botón "Mi Peso" en `DashboardScreen.jsx`**

Agregar los props a la firma:
```js
export default function DashboardScreen({
  dashLoading,
  getWeekBars,
  goToWeight,      // ← nuevo
  isPremium,       // ← nuevo
  onBack,
  sessions,
})
```

En el `<header className="dash-hdr">`, agregar el botón junto a "← Volver":
```jsx
<header className="dash-hdr">
  <h1 className="dash-title">MI PROGRESO</h1>
  <div className="dash-hdr-actions">
    <button className="hdr-auth-btn" onClick={goToWeight}>
      {isPremium ? "⚖ Mi Peso" : "🔒 Mi Peso"}
    </button>
    <button className="hdr-auth-btn" onClick={onBack}>
      ← Volver
    </button>
  </div>
</header>
```

Agregar estilos si el header los necesita:
```css
.dash-hdr-actions { display: flex; gap: .5rem; align-items: center; }
```

**Step 4: Pasar los props al render de `DashboardScreen` en `IronAI.jsx`**

```jsx
{screen === "dashboard" && (
  <main role="main">
    <DashboardScreen
      dashLoading={dashLoading}
      getWeekBars={getWeekBars}
      goToWeight={goToWeight}    // ← nuevo
      isPremium={isPremium}      // ← nuevo
      onBack={backFromDashOrProfile}
      sessions={sessions}
    />
  </main>
)}
```

**Step 5: Verificar flujo completo**

1. Usuario sin login → click "Mi Peso" → va a Login
2. Usuario logueado sin premium → click "Mi Peso" → abre UpgradeModal
3. Insertar fila en `premium_users` manualmente en Supabase Dashboard → refrescar app → click "Mi Peso" → abre WeightTrackingScreen
4. Registrar un peso → aparece en historial
5. Registrar 2+ pesos → aparece la gráfica

**Step 6: Commit**

```bash
git add iron-ai/src/IronAI.jsx iron-ai/src/screens/DashboardScreen.jsx iron-ai/src/styles.css
git commit -m "feat: integrar WeightTrackingScreen y botón Mi Peso con gate premium"
```

---

## Task 7: Lemon Squeezy — checkout

> ⚠️ Este task requiere una cuenta en https://app.lemonsqueezy.com

**Step 1: Configurar cuenta y producto (fuera del código)**

1. Crear cuenta en Lemon Squeezy
2. Crear una tienda (Store)
3. Crear un producto → tipo "One-time purchase" → precio $5 USD
4. En el producto → Settings → "Checkout" → habilitar **Overlay Checkout**
5. Anotar el **Checkout URL** del producto (formato: `https://[store].lemonsqueezy.com/buy/[uuid]`)
6. En Settings → Webhooks → crear webhook:
   - URL: `https://iron-ai-ecru.vercel.app/api/premium`
   - Events: `order_created`
   - Anotar el **Signing Secret**

**Step 2: Agregar script de Lemon Squeezy en `index.html`**

```html
<!-- En el <head> de iron-ai/index.html -->
<script src="https://app.lemonsqueezy.com/js/lemon.js" defer></script>
```

**Step 3: Variable de entorno con el Checkout URL**

En `iron-ai/.env.local` (solo local, NO commitear):
```
VITE_LEMONSQUEEZY_CHECKOUT_URL=https://[tu-tienda].lemonsqueezy.com/buy/[uuid]
```

En Vercel Dashboard → Settings → Environment Variables → agregar `VITE_LEMONSQUEEZY_CHECKOUT_URL`.

**Step 4: Actualizar `UpgradeModal` para abrir el checkout con `user_id`**

```jsx
// src/components/UpgradeModal.jsx
export default function UpgradeModal({ isOpen, onClose, userId }) {
  if (!isOpen) return null

  function handleUpgrade() {
    const baseUrl = import.meta.env.VITE_LEMONSQUEEZY_CHECKOUT_URL
    // Pasar user_id como custom data para el webhook
    const url = `${baseUrl}?checkout[custom][user_id]=${userId}`
    // Lemon Squeezy detecta el link y abre el overlay
    window.LemonSqueezy?.Url?.Open(url)
  }

  return (
    <div className="modal-overlay" role="dialog" aria-modal="true">
      <div className="modal-box">
        <div className="modal-icon">🔒</div>
        <h2 className="modal-title">FEATURE PREMIUM</h2>
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
```

**Step 5: Actualizar el render en `IronAI.jsx`**

```jsx
<UpgradeModal
  isOpen={showUpgrade}
  onClose={() => setShowUpgrade(false)}
  userId={user?.id}
/>
```

**Step 6: Verificar en staging**

1. Deploy a Vercel: `vercel --prod` (o push a rama)
2. Abrir la app → login → click feature premium → modal aparece → click "OBTENER ACCESO — $5"
3. Verificar que abre el overlay de Lemon Squeezy
4. Usar tarjeta de prueba de Lemon Squeezy (modo test)

**Step 7: Commit**

```bash
git add iron-ai/index.html iron-ai/src/components/UpgradeModal.jsx iron-ai/src/IronAI.jsx
git commit -m "feat: integrar checkout Lemon Squeezy con overlay y custom user_id"
```

---

## Task 8: Webhook `/api/premium.js`

**Files:**
- Create: `api/premium.js`

**Step 1: Agregar variables de entorno en Vercel**

En Vercel Dashboard → Settings → Environment Variables:
- `LEMONSQUEEZY_WEBHOOK_SECRET` → el Signing Secret del webhook
- `SUPABASE_SERVICE_ROLE_KEY` → en Supabase Dashboard → Settings → API → `service_role` key

En `.env.local` (para desarrollo local, NO commitear):
```
LEMONSQUEEZY_WEBHOOK_SECRET=...
SUPABASE_SERVICE_ROLE_KEY=...
```

**Step 2: Crear la función**

```js
// api/premium.js
import crypto from "crypto"
import { createClient } from "@supabase/supabase-js"

// Cliente admin (bypassa RLS) — solo server-side
const supabaseAdmin = createClient(
  process.env.VITE_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
)

export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" })
  }

  // 1. Leer body raw para verificar firma
  const rawBody = JSON.stringify(req.body)
  const signature = req.headers["x-signature"]
  const secret = process.env.LEMONSQUEEZY_WEBHOOK_SECRET

  const expected = crypto
    .createHmac("sha256", secret)
    .update(rawBody)
    .digest("hex")

  if (signature !== expected) {
    console.error("Webhook signature inválida")
    return res.status(401).json({ error: "Invalid signature" })
  }

  // 2. Verificar que es un order_created exitoso
  const { meta, data } = req.body
  if (meta?.event_name !== "order_created") {
    return res.status(200).json({ received: true })
  }

  const status = data?.attributes?.status
  if (status !== "paid") {
    return res.status(200).json({ received: true })
  }

  // 3. Extraer user_id del custom data
  const userId = data?.attributes?.first_order_item?.checkout_custom?.user_id
    || meta?.custom_data?.user_id

  if (!userId) {
    console.error("No se encontró user_id en el webhook")
    return res.status(400).json({ error: "Missing user_id" })
  }

  // 4. Insertar en premium_users
  const paymentRef = data?.id?.toString() || ""
  const { error } = await supabaseAdmin
    .from("premium_users")
    .upsert({ user_id: userId, payment_ref: paymentRef })

  if (error) {
    console.error("Error insertando premium_users:", error)
    return res.status(500).json({ error: "DB error" })
  }

  console.log(`✓ Usuario ${userId} activado como premium (ref: ${paymentRef})`)
  return res.status(200).json({ success: true })
}
```

**Step 3: Verificar estructura del payload de Lemon Squeezy**

> Nota: Lemon Squeezy puede variar el campo exacto donde está `user_id` en el custom data. Después del primer pago real, revisar los logs de Vercel para confirmar la ruta exacta. Si el campo no se encuentra, buscar en `meta.custom_data` o en `data.attributes.first_order_item`.

**Step 4: Agregar `SUPABASE_SERVICE_ROLE_KEY` al `.gitignore` check**

Verificar que `.env.local` está en `.gitignore` (ya debería estarlo).

**Step 5: Deploy y probar con webhook test**

1. `vercel --prod`
2. En Lemon Squeezy → Settings → Webhooks → tu webhook → "Send test" con event `order_created`
3. Verificar en Vercel → Functions → Logs que llegó el request y se procesó sin error

**Step 6: Commit**

```bash
git add iron-ai/api/premium.js
git commit -m "feat: agregar webhook /api/premium para activar usuarios premium"
```

---

## Task 9: QA — Verificación integral

**Flujo 1: Usuario free**
- [ ] Rutinas funcionan sin ninguna restricción
- [ ] Botón "Mi Peso" en Dashboard → abre UpgradeModal
- [ ] Sección métricas en Perfil → muestra teaser, click → abre UpgradeModal
- [ ] Modal muestra $5 y lista de features

**Flujo 2: Pago y activación**
- [ ] Click "OBTENER ACCESO — $5" → abre overlay de Lemon Squeezy
- [ ] Pagar con tarjeta de prueba
- [ ] Webhook llega a `/api/premium`
- [ ] Fila insertada en `premium_users` en Supabase Dashboard
- [ ] Refrescar app → `isPremium` es `true`

**Flujo 3: Usuario premium**
- [ ] Botón "Mi Peso" → abre WeightTrackingScreen directamente
- [ ] Registrar peso → aparece en historial
- [ ] Registrar 2+ pesos → gráfica visible
- [ ] Perfil → métricas visibles (IMC, TMB, TDEE)
- [ ] Logout → login → sigue siendo premium

**Flujo 4: Edge cases**
- [ ] Sin usuario logueado → click "Mi Peso" → va a Login
- [ ] Login desde "Mi Peso" → vuelve a WeightTrackingScreen (no a form)
- [ ] Registrar peso del mismo día dos veces → upsert, no duplicado
- [ ] Eliminar registro de peso → desaparece del historial y la gráfica se actualiza

**Step final: Commit de QA**

```bash
git add -A
git commit -m "chore: QA completo freemium premium — todos los flujos verificados"
```

---

## Variables de entorno — resumen

| Variable | Dónde | Para qué |
|---|---|---|
| `VITE_SUPABASE_URL` | Ya existe | Supabase URL |
| `VITE_SUPABASE_ANON_KEY` | Ya existe | Supabase cliente público |
| `SUPABASE_SERVICE_ROLE_KEY` | Vercel (secret) | Webhook bypassa RLS |
| `VITE_LEMONSQUEEZY_CHECKOUT_URL` | Vercel + .env.local | URL del producto $5 |
| `LEMONSQUEEZY_WEBHOOK_SECRET` | Vercel (secret) | Verificar firma webhook |

---

## Orden de deploy

1. Ejecutar SQL en Supabase (Task 1)
2. Tasks 2-6 → commits locales
3. Configurar Lemon Squeezy (Task 7 Step 1)
4. Agregar todas las env vars en Vercel
5. Deploy: `vercel --prod`
6. Configurar webhook URL en Lemon Squeezy apuntando a producción
7. Probar con pago real de $1 (o modo test)
