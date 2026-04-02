# Perfil de Usuario + Métricas Corporales — Diseño

## Objetivo
Agregar una pantalla de perfil físico (edad, sexo, peso, altura) que calcule métricas corporales (IMC, TMB, TDEE, peso ideal) y muestre una sugerencia de objetivo en el formulario principal, respetando siempre la decisión final del usuario.

## Principios
- El perfil es **opt-in**, nunca un gate — la app funciona sin él
- Los datos persisten en **localStorage** para todos, y en **Supabase** si hay cuenta
- La recomendación es **sugerida**, nunca pre-seleccionada

---

## 1. Datos del Perfil

```js
{
  age:    number,   // años, 10–100
  sex:    "male" | "female",
  weight: number,   // kg, 30–200
  height: number,   // cm, 100–250
}
```

**Storage:**
- `localStorage["ironai_profile"]` — siempre disponible
- Tabla `user_profiles` en Supabase — solo si hay cuenta activa

**Sincronización:**
- Guardar perfil → localStorage + upsert Supabase (si hay user)
- Login exitoso → leer Supabase → actualizar localStorage
- Sin cuenta → solo localStorage

**SQL (ya ejecutado en Supabase):**
```sql
CREATE TABLE user_profiles (
  user_id   uuid REFERENCES auth.users(id) ON DELETE CASCADE PRIMARY KEY,
  age       integer,
  sex       text,
  weight    numeric,
  height    numeric,
  updated_at timestamp DEFAULT now()
);
ALTER TABLE user_profiles ENABLE ROW LEVEL SECURITY;
CREATE POLICY "read_own"   ON user_profiles FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "insert_own" ON user_profiles FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "update_own" ON user_profiles FOR UPDATE USING (auth.uid() = user_id);
```

---

## 2. Pantalla `"profile"`

**Header:** "MI PERFIL" + botón ← Volver

**Zona 1 — Formulario (siempre visible):**
- Sexo: toggle Hombre / Mujer (estilo `.lvl`)
- Edad: input numérico (10–100)
- Peso: input numérico en kg (30–200)
- Altura: input numérico en cm (100–250)
- Botón "GUARDAR PERFIL" (`.gbtn` naranja)

**Zona 2 — Métricas (solo si perfil completo):**

| Métrica | Fórmula | Display |
|---|---|---|
| IMC | `peso / (altura/100)²` | Número + categoría + barra de color |
| TMB | Mifflin-St Jeor | "~X kcal/día en reposo" |
| TDEE | `TMB × 1.55` | "~X kcal/día activo" + nota |
| Peso ideal | IMC 18.5–24.9 para altura | "X – Y kg para tu altura" |

**Barra IMC:**
- Azul → Bajo peso (< 18.5)
- Verde → Normal (18.5–24.9)
- Amarillo → Sobrepeso (25–29.9)
- Rojo → Obesidad (≥ 30)

---

## 3. Fórmulas

```js
// IMC
const bmi = weight / Math.pow(height / 100, 2);

// TMB Mifflin-St Jeor
const bmr = sex === "male"
  ? 10 * weight + 6.25 * height - 5 * age + 5
  : 10 * weight + 6.25 * height - 5 * age - 161;

// TDEE (factor actividad moderada)
const tdee = Math.round(bmr * 1.55);

// Rango peso ideal
const idealMin = Math.round(18.5 * Math.pow(height / 100, 2));
const idealMax = Math.round(24.9 * Math.pow(height / 100, 2));
```

---

## 4. Algoritmo de Recomendación

| IMC | Objetivo recomendado |
|---|---|
| < 18.5 | `hypertrophy` — Ganar músculo |
| 18.5 – 24.9 | `strength` — Fuerza máxima |
| 25 – 29.9 | `fat_loss` — Quemar grasa |
| ≥ 30 | `fat_loss` — Quemar grasa |
| Sin perfil | `null` — sin sugerencia |

```js
function getRecommendedGoal(profile) {
  if (!profile?.weight || !profile?.height) return null;
  const bmi = profile.weight / Math.pow(profile.height / 100, 2);
  if (bmi < 18.5) return "hypertrophy";
  if (bmi < 25)   return "strength";
  return "fat_loss";
}
```

---

## 5. Cambios en el Formulario

**Badge "✦ RECOMENDADO"** sobre el objetivo sugerido:
- Aparece solo si hay perfil con peso y altura completos
- No pre-selecciona ningún botón
- Estilo: texto naranja pequeño encima del `.tile` correspondiente

**Nuevo botón en el header** (junto a "Mi progreso" si hay cuenta, o solo visible si hay perfil en localStorage):
- "Mi perfil" → navega a screen `"profile"`

---

## 6. Nuevas Variables de Estado

```js
const [profile, setProfile] = useState(null)        // { age, sex, weight, height }
const [profileDraft, setProfileDraft] = useState({}) // edición en curso
const [profileSaved, setProfileSaved] = useState(false) // feedback al guardar
```

---

## 7. Acceso desde Header

- **Con cuenta**: header muestra "Mi perfil" + "Mi progreso" + email + Salir
- **Sin cuenta**: header muestra "Mi perfil" (si hay datos en localStorage) + "Iniciar sesión"
- Siempre visible el botón "Mi perfil" para incentivar llenarlo

---

## Verificación

1. Sin cuenta: llenar perfil → guardar → ver métricas → badge aparece en formulario → cerrar browser → reabrir → datos persisten (localStorage)
2. Con cuenta: llenar perfil → guardar → verificar fila en Supabase `user_profiles` → cerrar sesión → iniciar sesión → datos se recuperan de Supabase
3. Badge: IMC > 25 → badge "✦ RECOMENDADO" en "Quemar grasa"; IMC < 18.5 → badge en "Ganar músculo"
4. Sin perfil: ningún badge visible, todo funciona igual que antes
