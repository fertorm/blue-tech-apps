# Iron AI — Freemium + Premium ($5 pago único) — Diseño

## Objetivo

Monetizar Iron AI con un modelo freemium donde el plan gratuito permite uso ilimitado de rutinas y el plan premium ($5 pago único) desbloquea persistencia en la nube, métricas corporales y seguimiento de peso con gráfica.

## Principios

- **Sin trial de 14 días** — el freemium es el trial en sí mismo
- **Sin bloquear el uso diario** — el usuario free puede entrenar sin restricciones
- **El gancho es el historial** — cuanto más usan la app, más quieren no perder su progreso
- **Pago único, sin renovaciones** — adaptado al mercado boliviano/latinoamericano

---

## 1. Modelo Freemium

### Qué incluye cada plan

| Feature | Free | Premium ($5 único) |
|---|---|---|
| Rutinas (Fuerza, Cardio, Calistenia) | ✅ Ilimitadas | ✅ Ilimitadas |
| Historial de rutinas | 🟡 Solo localStorage | ✅ Supabase (multi-device) |
| Perfil físico (edad, peso, altura) | ❌ | ✅ |
| Métricas corporales (IMC, TMB, TDEE) | ❌ | ✅ |
| Seguimiento de peso + gráfica | ❌ | ✅ |

### Cómo funciona el gate

- Usuario free usa la app sin restricciones
- Al tocar una feature premium → aparece `UpgradeModal`
- Modal explica el valor y ofrece el pago de $5
- Pago exitoso → fila en `premium_users` → acceso permanente desbloqueado

---

## 2. Modelo de Datos

### Tabla `premium_users`

```sql
CREATE TABLE premium_users (
  user_id        uuid REFERENCES auth.users(id) ON DELETE CASCADE PRIMARY KEY,
  purchased_at   timestamp DEFAULT now(),
  payment_ref    text  -- ID de transacción (Lemon Squeezy / Binance Pay)
);
ALTER TABLE premium_users ENABLE ROW LEVEL SECURITY;
CREATE POLICY "read_own" ON premium_users FOR SELECT USING (auth.uid() = user_id);
```

> Lógica simple: si existe fila para el user_id → es premium. Sin expiración.

### Tabla `weight_logs`

```sql
CREATE TABLE weight_logs (
  id         uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id    uuid REFERENCES auth.users(id) ON DELETE CASCADE,
  logged_at  date NOT NULL DEFAULT CURRENT_DATE,
  weight_kg  numeric(5,2) NOT NULL,
  note       text
);
ALTER TABLE weight_logs ENABLE ROW LEVEL SECURITY;
CREATE POLICY "crud_own" ON weight_logs USING (auth.uid() = user_id);
```

### Verificación de premium en el frontend

```js
const { data } = await supabase
  .from('premium_users')
  .select('purchased_at')
  .eq('user_id', user.id)
  .maybeSingle()

const isPremium = !!data
```

### Tabla existente `user_profiles`
Sin cambios. El peso en `user_profiles` es de referencia del perfil; el de `weight_logs` es el historial diario.

---

## 3. Pantallas y Componentes

### `UpgradeModal.jsx` (nuevo)

Aparece cuando usuario free toca feature premium.

```
┌─────────────────────────────┐
│  🔒 FEATURE PREMIUM          │
│                             │
│  Registrá tu progreso y     │
│  medí tu evolución real.    │
│                             │
│  ✦ Historial en la nube     │
│  ✦ Perfil + métricas        │
│  ✦ Seguimiento de peso      │
│                             │
│  [ OBTENER ACCESO — $5 ]    │
│  [ Ahora no ]               │
└─────────────────────────────┘
```

### `WeightTrackingScreen.jsx` (nuevo, screen `"weight"`)

```
┌─────────────────────────────┐
│  ← MI PESO                  │
├─────────────────────────────┤
│  Registrar hoy              │
│  [  75.5  ] kg  [GUARDAR]  │
│  Nota (opcional): ________  │
├─────────────────────────────┤
│  Tu evolución               │
│  [gráfica de línea Recharts │
│   eje X: fechas,            │
│   eje Y: kg]                │
├─────────────────────────────┤
│  Historial                  │
│  01/04 — 75.5 kg            │
│  30/03 — 76.0 kg  [🗑]      │
│  28/03 — 76.3 kg  [🗑]      │
└─────────────────────────────┘
```

Librería de gráfica: **Recharts** (ya usada en el workspace en "Chroma y sus amigos").

### Cambios en pantallas existentes

| Pantalla | Cambio |
|---|---|
| `DashboardScreen` | Botón "Mi Peso" en header — si no es premium abre `UpgradeModal` |
| `ProfileScreen` | Métricas (IMC, TMB, TDEE) muestran `UpgradeModal` si no es premium |
| `LoginScreen` | Sin cambios |

### Flujo de usuario

```
Usuario free
  → toca feature premium
  → ve UpgradeModal
  → decide pagar → va a checkout
  → webhook confirma pago → INSERT en premium_users
  → app detecta cambio → acceso desbloqueado permanentemente
```

---

## 4. Pagos

### Estrategia para mercado boliviano/latinoamericano

Tres métodos complementarios:

| Método | Automatizable | Para quién |
|---|---|---|
| Lemon Squeezy (tarjeta / PayPal) | ✅ Webhooks | Quien tenga tarjeta |
| Binance Pay (USDT) | ✅ API | Quien use crypto |
| Takenos / Meru (fintech local) | ❌ Manual | Bolivianos sin tarjeta |

### Lemon Squeezy (método principal)

- Actúa como Merchant of Record — no requiere empresa registrada en USA/EU
- Bolivia soportado como país del vendedor
- Comisión: ~5% + $0.50 (en $5 → recibís ~$4.25)
- Checkout embebido como overlay (sin salir de la app)

### Flujo técnico automatizado

```
[Usuario toca "Obtener Acceso — $5"]
  → Abre checkout Lemon Squeezy con user_id como custom data
  → Usuario paga
  → Lemon Squeezy → POST /api/premium (Vercel function)
  → Verifica firma HMAC del webhook
  → INSERT en premium_users con user_id
  → Frontend detecta → acceso desbloqueado
```

### Flujo semi-manual (Takenos / Meru)

> "Pagá $5 equivalente por Takenos al [número] y mandanos el comprobante por [WhatsApp/email] → activamos tu cuenta en menos de 24hs"

Viable a escala de MVP. No requiere integración técnica.

### Serverless function `/api/premium.js`

```js
export default async function handler(req, res) {
  // 1. Verificar firma HMAC de Lemon Squeezy
  // 2. Extraer user_id del custom data
  // 3. Upsert en premium_users vía Supabase admin client
  // 4. Responder 200
}
```

### Variable de entorno nueva

```
LEMONSQUEEZY_WEBHOOK_SECRET=...
```

---

## 5. Orden de implementación recomendado

1. **SQL** — crear tablas `premium_users` y `weight_logs` en Supabase
2. **Estado** — agregar `isPremium` al estado global de `IronAI.jsx`
3. **UpgradeModal** — componente reutilizable con CTA de pago
4. **Gate en ProfileScreen** — métricas solo para premium
5. **Gate en DashboardScreen** — botón "Mi Peso" con gate
6. **WeightTrackingScreen** — formulario + gráfica Recharts
7. **Lemon Squeezy** — cuenta, producto $5, checkout embebido
8. **Webhook /api/premium.js** — verificación + INSERT en Supabase
9. **Binance Pay** — como método alternativo
10. **QA** — probar flujo completo free → upgrade → premium

---

## Verificación

1. Usuario free: rutinas funcionan sin restricciones
2. Usuario free toca "Mi Peso": aparece UpgradeModal
3. Usuario paga: webhook llega, fila insertada en `premium_users`
4. Usuario premium: accede a perfil, métricas y seguimiento de peso
5. Usuario premium registra peso varios días: gráfica muestra evolución correcta
6. Logout + login: estado premium persiste (viene de Supabase, no localStorage)
