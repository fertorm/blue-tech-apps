import { lazy, Suspense, useEffect, useState } from "react";
import { createClient } from "@supabase/supabase-js";
import AuthPromptModal from "./components/AuthPromptModal.jsx";
import UpgradeModal from "./components/UpgradeModal.jsx";
import FormScreen from "./screens/FormScreen.jsx";
import LoadingScreen from "./screens/LoadingScreen.jsx";
import {
  DEFAULT_PROFILE_DRAFT,
  DEFAULT_WORKOUT_STATE,
  QUOTES,
} from "./shared/constants.js";
import {
  calcMetrics,
  getRecommendedGoal,
  getWeekBars,
} from "./shared/fitness.js";
import { DEFAULT_CARDIO_STATE } from "./shared/cardioConstants.js";
import { DEFAULT_CALI_STATE } from "./shared/caliConstants.js";

const supabase = createClient(
  import.meta.env.VITE_SUPABASE_URL,
  import.meta.env.VITE_SUPABASE_ANON_KEY,
);

const DashboardScreen = lazy(() => import("./screens/DashboardScreen.jsx"));
const LoginScreen = lazy(() => import("./screens/LoginScreen.jsx"));
const ProfileScreen = lazy(() => import("./screens/ProfileScreen.jsx"));
const WorkoutScreen = lazy(() => import("./screens/WorkoutScreen.jsx"));
const CardioFormScreen = lazy(() => import("./screens/CardioFormScreen.jsx"));
const CardioWorkoutScreen = lazy(() => import("./screens/CardioWorkoutScreen.jsx"));
const CaliFormScreen = lazy(() => import("./screens/CaliFormScreen.jsx"));
const CaliWorkoutScreen = lazy(() => import("./screens/CaliWorkoutScreen.jsx"));
const WeightTrackingScreen = lazy(() => import("./screens/WeightTrackingScreen.jsx"));

function ScreenFallback() {
  return <LoadingScreen quote={QUOTES[0]} label="Cargando pantalla..." />;
}

export default function IronAI() {
  // ── Módulo activo ──────────────────────────────────────────────────────────
  const [module, setModule] = useState("weights");

  // ── Weights (estado existente) ─────────────────────────────────────────────
  const [st, setSt] = useState(DEFAULT_WORKOUT_STATE);
  const [screen, setScreen] = useState("form");
  const [workout, setWorkout] = useState(null);
  const [err, setErr] = useState("");
  const [loading, setLoading] = useState(false);
  const [qi, setQi] = useState(0);
  const [completed, setCompleted] = useState(false);

  // ── Cardio ─────────────────────────────────────────────────────────────────
  const [cardioSt, setCardioSt] = useState(DEFAULT_CARDIO_STATE);
  const [cardioWorkout, setCardioWorkout] = useState(null);
  const [cardioErr, setCardioErr] = useState("");
  const [cardioCompleted, setCardioCompleted] = useState(false);

  // ── Calistenia ─────────────────────────────────────────────────────────────
  const [caliSt, setCaliSt] = useState(DEFAULT_CALI_STATE);
  const [caliSkills, setCaliSkills] = useState(null);
  const [caliProgress, setCaliProgress] = useState({});
  const [caliErr, setCaliErr] = useState("");
  const [caliCompleted, setCaliCompleted] = useState(false);

  // ── Auth / User ────────────────────────────────────────────────────────────
  const [user, setUser] = useState(null);
  const [authEmail, setAuthEmail] = useState("");
  const [authSent, setAuthSent] = useState(false);
  const [authLoading, setAuthLoading] = useState(false);
  const [authCode, setAuthCode] = useState("");
  const [authError, setAuthError] = useState("");
  const [showAuthPrompt, setShowAuthPrompt] = useState(false);
  const [loginReturnTo, setLoginReturnTo] = useState("form");

  // ── Premium ────────────────────────────────────────────────────────────────
  const [isPremium, setIsPremium]         = useState(false);
  const [showUpgrade, setShowUpgrade]     = useState(false);

  // ── Sesiones / Dashboard ───────────────────────────────────────────────────
  const [sessions, setSessions] = useState([]);
  const [dashLoading, setDashLoading] = useState(false);

  // ── Perfil ─────────────────────────────────────────────────────────────────
  const [profile, setProfile] = useState(null);
  const [profileDraft, setProfileDraft] = useState(DEFAULT_PROFILE_DRAFT);
  const [profileSaved, setProfileSaved] = useState(false);

  async function checkPremium(userId) {
    try {
      const { data, error } = await supabase
        .from("premium_users")
        .select("purchased_at")
        .eq("user_id", userId)
        .maybeSingle()
      if (error) {
        console.error("[checkPremium]", error.message)
        return
      }
      setIsPremium(!!data)
    } catch (err) {
      console.error("[checkPremium] unexpected error", err)
    }
  }

  // ── Effects ────────────────────────────────────────────────────────────────
  useEffect(() => {
    const t = setInterval(() => setQi((i) => (i + 1) % QUOTES.length), 2500);

    // Perfil local
    try {
      const saved = localStorage.getItem("ironai_profile");
      if (saved) {
        const parsed = JSON.parse(saved);
        setProfile(parsed);
        setProfileDraft(parsed);
      }
    } catch {}

    // Progreso calistenia local
    try {
      const savedCali = localStorage.getItem("ironai_cali_progress");
      if (savedCali) setCaliProgress(JSON.parse(savedCali));
    } catch {}

    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user ?? null);
      if (session?.user) checkPremium(session.user.id)
    });

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(async (_event, session) => {
      setUser(session?.user ?? null);
      if (session?.user && showAuthPrompt) setShowAuthPrompt(false);
      if (!session) setIsPremium(false);

      if (session?.user) {
        checkPremium(session.user.id);
        // Sincronizar perfil
        const { data: profileData } = await supabase
          .from("user_profiles")
          .select("age, sex, weight, height")
          .eq("user_id", session.user.id)
          .single();

        if (profileData) {
          const syncedProfile = {
            age: profileData.age,
            sex: profileData.sex,
            weight: profileData.weight,
            height: profileData.height,
          };
          localStorage.setItem("ironai_profile", JSON.stringify(syncedProfile));
          setProfile(syncedProfile);
          setProfileDraft(syncedProfile);
        }

        // Sincronizar progreso calistenia
        const { data: caliData } = await supabase
          .from("user_calisthenics_progress")
          .select("skill_id, current_step")
          .eq("user_id", session.user.id);

        if (caliData?.length) {
          const merged = {};
          caliData.forEach(({ skill_id, current_step }) => {
            merged[skill_id] = current_step;
          });
          // Merge: Supabase tiene prioridad sobre localStorage
          setCaliProgress((prev) => ({ ...prev, ...merged }));
          localStorage.setItem("ironai_cali_progress", JSON.stringify({ ...caliProgress, ...merged }));
        }
      }
    });

    return () => {
      clearInterval(t);
      subscription.unsubscribe();
    };
  }, [showAuthPrompt]);

  // ── Helpers de módulo ──────────────────────────────────────────────────────
  function switchModule(mod) {
    setModule(mod);
    setScreen("form");
    setErr("");
    setCardioErr("");
    setCaliErr("");
  }

  // ── Weights ────────────────────────────────────────────────────────────────
  const togM = (value) =>
    setSt((current) => ({
      ...current,
      muscles: current.muscles.includes(value)
        ? current.muscles.filter((item) => item !== value)
        : [...current.muscles, value],
    }));

  const togE = (value) =>
    setSt((current) => ({
      ...current,
      equip: current.equip.includes(value)
        ? current.equip.filter((item) => item !== value)
        : [...current.equip, value],
    }));

  function scoreWorkout(candidate) {
    const muscleMatch = st.muscles.filter((muscle) =>
      candidate.muscles.includes(muscle),
    ).length;
    const muscleScore =
      st.muscles.length > 0 ? muscleMatch / st.muscles.length : 0;
    const missingEquip = candidate.equip.filter(
      (equip) => !st.equip.includes(equip),
    ).length;
    const equipScore =
      candidate.equip.length > 0 ? 1 - missingEquip / candidate.equip.length : 1;
    return muscleScore * 0.7 + equipScore * 0.3;
  }

  async function generate() {
    if (!st.muscles.length) {
      setErr("Seleccioná al menos un grupo muscular.");
      return;
    }
    if (!st.equip.length) {
      setErr("Seleccioná al menos un equipamiento.");
      return;
    }

    setErr("");
    setLoading(true);
    setScreen("load");
    setCompleted(false);

    try {
      const { data, error } = await supabase
        .from("workouts")
        .select("*")
        .eq("goal", st.goal)
        .eq("level", st.level);

      if (error) throw new Error("Error al conectar con la base de datos.");
      if (!data?.length) {
        throw new Error("No hay rutinas disponibles para esta combinación.");
      }

      const scored = data
        .map((candidate) => ({ ...candidate, score: scoreWorkout(candidate) }))
        .sort((a, b) => b.score - a.score);

      const threshold = scored[0].score * 0.8;
      const candidates = scored.filter((item) => item.score >= threshold).slice(0, 3);
      const best = candidates[Math.floor(Math.random() * candidates.length)];

      if (best.score < 0.2) {
        throw new Error(
          "No encontramos una rutina para los músculos seleccionados. Probá otra combinación.",
        );
      }

      setWorkout(best.workout_data);
      setScreen("work");
    } catch (error) {
      setErr(error.message);
      setScreen("form");
    } finally {
      setLoading(false);
    }
  }

  // ── Cardio ─────────────────────────────────────────────────────────────────
  async function generateCardio() {
    setCardioErr("");
    setLoading(true);
    setScreen("load");
    setCardioCompleted(false);

    try {
      const { data, error } = await supabase
        .from("cardio_exercises")
        .select("*")
        .eq("type", cardioSt.type)
        .eq("intensity", cardioSt.intensity);

      if (error) throw new Error("Error al conectar con la base de datos.");
      if (!data?.length) {
        throw new Error("No hay ejercicios para este tipo e intensidad. Probá otra combinación.");
      }

      // Shuffle
      const shuffled = [...data].sort(() => Math.random() - 0.5);

      // Acumular ejercicios hasta completar la duración deseada
      const exercises = [];
      let totalMin = 0;
      for (const ex of shuffled) {
        if (totalMin >= cardioSt.dur) break;
        exercises.push({
          name: ex.name,
          nameEs: ex.name_es,
          workTime: ex.work_time,
          restTime: ex.rest_time,
          rounds: ex.rounds,
          totalMinutes: Number(ex.total_minutes),
          instructions: ex.instructions,
          tip: ex.tip,
          imageUrl: ex.image_url,
        });
        totalMin += Number(ex.total_minutes);
      }

      if (!exercises.length) {
        throw new Error("No se encontraron ejercicios. Intentá de nuevo.");
      }

      const typeLabel = { hiit: "HIIT", steady_state: "STEADY STATE", tabata: "TABATA", circuit: "CIRCUITO" }[cardioSt.type] || cardioSt.type.toUpperCase();
      const intensityLabel = { low: "BAJA", medium: "MEDIA", high: "ALTA" }[cardioSt.intensity] || "";

      setCardioWorkout({
        title: `${typeLabel} — INTENSIDAD ${intensityLabel}`,
        tagline: `${Math.round(totalMin)} min · ${exercises.length} ejercicios`,
        totalMinutes: Math.round(totalMin),
        exercises,
      });
      setScreen("cardio-work");
    } catch (error) {
      setCardioErr(error.message);
      setScreen("form");
    } finally {
      setLoading(false);
    }
  }

  // ── Calistenia ─────────────────────────────────────────────────────────────
  async function loadCali() {
    setCaliErr("");
    setLoading(true);
    setScreen("load");
    setCaliCompleted(false);

    try {
      const { data, error } = await supabase
        .from("calisthenics_skills")
        .select("*")
        .eq("category", caliSt.category)
        .order("sort_order", { ascending: true });

      if (error) throw new Error("Error al conectar con la base de datos.");
      if (!data?.length) {
        throw new Error("No hay progresiones para esta categoría todavía.");
      }

      setCaliSkills(data);
      setScreen("cali-work");
    } catch (error) {
      setCaliErr(error.message);
      setScreen("form");
    } finally {
      setLoading(false);
    }
  }

  async function advanceCaliStep(skillId) {
    const currentStep = caliProgress[skillId] ?? 1;
    const skill = caliSkills?.find((s) => s.id === skillId);
    if (!skill) return;
    const maxStep = skill.steps?.length ?? 1;
    if (currentStep >= maxStep) return;

    const nextStep = currentStep + 1;
    const updated = { ...caliProgress, [skillId]: nextStep };
    setCaliProgress(updated);
    localStorage.setItem("ironai_cali_progress", JSON.stringify(updated));

    if (user) {
      await supabase.from("user_calisthenics_progress").upsert({
        user_id: user.id,
        skill_id: skillId,
        current_step: nextStep,
        updated_at: new Date().toISOString(),
      });
    }
  }

  // ── Auth ───────────────────────────────────────────────────────────────────
  async function sendMagicLink() {
    if (!authEmail.trim()) return;
    setAuthLoading(true);
    setAuthError("");
    const { error } = await supabase.auth.signInWithOtp({
      email: authEmail.trim(),
      options: { emailRedirectTo: window.location.origin },
    });
    setAuthLoading(false);
    if (!error) {
      setAuthSent(true);
      setAuthCode("");
    } else {
      setAuthError("No se pudo enviar el email. Intentá de nuevo.");
    }
  }

  async function verifyOtp() {
    if (!authCode.trim()) return;
    setAuthLoading(true);
    setAuthError("");
    const { error } = await supabase.auth.verifyOtp({
      email: authEmail.trim(),
      token: authCode.trim(),
      type: "email",
    });
    setAuthLoading(false);
    if (error) setAuthError("Código incorrecto o expirado. Pedí un nuevo código.");
  }

  async function signOut() {
    await supabase.auth.signOut();
  }

  // ── Guardar sesiones ───────────────────────────────────────────────────────
  async function saveSession() {
    if (!user) {
      setShowAuthPrompt(true);
      return;
    }
    const { error } = await supabase.from("workout_sessions").insert({
      user_id: user.id,
      goal: st.goal,
      level: st.level,
      title: workout?.title || "",
      muscles: st.muscles,
      completed_at: new Date().toISOString(),
    });
    if (!error) setCompleted(true);
  }

  async function saveCardioSession() {
    if (!user) {
      setShowAuthPrompt(true);
      return;
    }
    const { error } = await supabase.from("workout_sessions").insert({
      user_id: user.id,
      goal: "cardio",
      level: cardioSt.intensity,
      title: cardioWorkout?.title || "Cardio",
      muscles: [],
      completed_at: new Date().toISOString(),
    });
    if (!error) setCardioCompleted(true);
  }

  async function saveCaliSession() {
    if (!user) {
      setShowAuthPrompt(true);
      return;
    }
    const { error } = await supabase.from("workout_sessions").insert({
      user_id: user.id,
      goal: "calisthenics",
      level: caliSt.category,
      title: `Calistenia — ${caliSt.category}`,
      muscles: [],
      completed_at: new Date().toISOString(),
    });
    if (!error) setCaliCompleted(true);
  }

  // ── Weight Tracking ────────────────────────────────────────────────────────
  function goToWeight() {
    if (!user) {
      setLoginReturnTo("form")
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

  // ── Dashboard ──────────────────────────────────────────────────────────────
  async function loadDashboard() {
    setDashLoading(true);
    const { data } = await supabase
      .from("workout_sessions")
      .select("*")
      .order("completed_at", { ascending: false })
      .limit(60);
    setSessions(data || []);
    setDashLoading(false);
    setScreen("dashboard");
  }

  // ── Perfil ─────────────────────────────────────────────────────────────────
  async function saveProfile() {
    const nextProfile = {
      age: +profileDraft.age,
      sex: profileDraft.sex,
      weight: +profileDraft.weight,
      height: +profileDraft.height,
    };
    localStorage.setItem("ironai_profile", JSON.stringify(nextProfile));
    setProfile(nextProfile);
    setProfileSaved(true);
    setTimeout(() => setProfileSaved(false), 2500);
    if (user) {
      await supabase.from("user_profiles").upsert({
        user_id: user.id,
        ...nextProfile,
        updated_at: new Date().toISOString(),
      });
    }
  }

  // ── Props compartidas de navegación/auth ──────────────────────────────────
  const sharedNavProps = {
    goToWeight,
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
  };

  // ── Pantallas de retorno según módulo activo ───────────────────────────────
  function backFromResult() {
    if (module === "cardio") { setCardioWorkout(null); setScreen("form"); }
    else if (module === "calisthenics") { setCaliSkills(null); setScreen("form"); }
    else { setWorkout(null); setScreen("form"); }
  }

  function backFromDashOrProfile() {
    if (module === "cardio" && cardioWorkout) setScreen("cardio-work");
    else if (module === "calisthenics" && caliSkills) setScreen("cali-work");
    else if (workout) setScreen("work");
    else setScreen("form");
  }

  // ── Render ─────────────────────────────────────────────────────────────────
  return (
    <div className="app-shell">
      <div className="box">
        <AuthPromptModal
          isOpen={showAuthPrompt}
          onClose={() => setShowAuthPrompt(false)}
          onLogin={() => {
            setShowAuthPrompt(false);
            setLoginReturnTo(screen === "cardio-work" ? "cardio-work" : screen === "cali-work" ? "cali-work" : "work");
            setScreen("login");
            setAuthSent(false);
            setAuthEmail("");
          }}
        />
        <UpgradeModal
          isOpen={showUpgrade}
          onClose={() => setShowUpgrade(false)}
          userId={user?.id}
        />

        {/* Tabs de módulo (visibles en form, load y resultados) */}
        {["form", "load", "work", "cardio-work", "cali-work"].includes(screen) && (
          <nav className="module-tabs" aria-label="Módulo de entrenamiento">
            <button
              className={`module-tab${module === "weights" ? " on" : ""}`}
              onClick={() => switchModule("weights")}
            >
              PESAS
            </button>
            <button
              className={`module-tab${module === "cardio" ? " on" : ""}`}
              onClick={() => switchModule("cardio")}
            >
              CARDIO
            </button>
            <button
              className={`module-tab${module === "calisthenics" ? " on" : ""}`}
              onClick={() => switchModule("calisthenics")}
            >
              CALISTENIA
            </button>
          </nav>
        )}

        {/* FORM — según módulo activo */}
        {screen === "form" && module === "weights" && (
          <main role="main">
            <FormScreen
              err={err}
              generate={generate}
              getRecommendedGoal={getRecommendedGoal}
              setSt={setSt}
              st={st}
              togE={togE}
              togM={togM}
              {...sharedNavProps}
            />
          </main>
        )}

        {screen === "form" && module === "cardio" && (
          <main role="main">
            <Suspense fallback={<ScreenFallback />}>
              <CardioFormScreen
                cardioSt={cardioSt}
                err={cardioErr}
                generateCardio={generateCardio}
                setCardioSt={setCardioSt}
                {...sharedNavProps}
              />
            </Suspense>
          </main>
        )}

        {screen === "form" && module === "calisthenics" && (
          <main role="main">
            <Suspense fallback={<ScreenFallback />}>
              <CaliFormScreen
                caliSt={caliSt}
                err={caliErr}
                loadCali={loadCali}
                setCaliSt={setCaliSt}
                {...sharedNavProps}
              />
            </Suspense>
          </main>
        )}

        {/* LOADING */}
        {screen === "load" && (
          <main role="main">
            <LoadingScreen
              label={
                module === "cardio"
                  ? "Armando tu rutina de cardio..."
                  : module === "calisthenics"
                  ? "Cargando tus progresiones..."
                  : "Generando tu rutina personalizada..."
              }
              quote={QUOTES[qi]}
            />
          </main>
        )}

        {/* RESULTS */}
        <Suspense fallback={<ScreenFallback />}>
          {screen === "work" && workout && (
            <main role="main">
              <WorkoutScreen
                completed={completed}
                level={st.level}
                loadDashboard={loadDashboard}
                onBack={backFromResult}
                saveSession={saveSession}
                user={user}
                workout={workout}
              />
            </main>
          )}

          {screen === "cardio-work" && cardioWorkout && (
            <main role="main">
              <CardioWorkoutScreen
                cardioWorkout={cardioWorkout}
                cardioSt={cardioSt}
                completed={cardioCompleted}
                loadDashboard={loadDashboard}
                onBack={backFromResult}
                saveCardioSession={saveCardioSession}
                user={user}
              />
            </main>
          )}

          {screen === "cali-work" && caliSkills && (
            <main role="main">
              <CaliWorkoutScreen
                caliSkills={caliSkills}
                caliProgress={caliProgress}
                caliSt={caliSt}
                completed={caliCompleted}
                loadDashboard={loadDashboard}
                onAdvance={advanceCaliStep}
                onBack={backFromResult}
                saveCaliSession={saveCaliSession}
                user={user}
              />
            </main>
          )}

          {screen === "login" && (
            <main role="main">
              <LoginScreen
                authCode={authCode}
                authEmail={authEmail}
                authError={authError}
                authLoading={authLoading}
                authSent={authSent}
                loginReturnTo={loginReturnTo}
                sendMagicLink={sendMagicLink}
                setAuthCode={setAuthCode}
                setAuthEmail={setAuthEmail}
                setAuthSent={setAuthSent}
                setScreen={setScreen}
                verifyOtp={verifyOtp}
              />
            </main>
          )}

          {screen === "dashboard" && (
            <main role="main">
              <DashboardScreen
                dashLoading={dashLoading}
                getWeekBars={getWeekBars}
                goToWeight={goToWeight}
                isPremium={isPremium}
                onBack={backFromDashOrProfile}
                sessions={sessions}
              />
            </main>
          )}

          {screen === "weight" && user && isPremium && (
            <main role="main">
              <WeightTrackingScreen
                supabase={supabase}
                user={user}
                onBack={backFromDashOrProfile}
              />
            </main>
          )}

          {screen === "profile" && (
            <main role="main">
              <ProfileScreen
                calcMetrics={calcMetrics}
                isPremium={isPremium}
                setShowUpgrade={setShowUpgrade}
                onBack={backFromDashOrProfile}
                profile={profile}
                profileDraft={profileDraft}
                profileSaved={profileSaved}
                saveProfile={saveProfile}
                setProfileDraft={setProfileDraft}
              />
            </main>
          )}
        </Suspense>
      </div>
    </div>
  );
}
