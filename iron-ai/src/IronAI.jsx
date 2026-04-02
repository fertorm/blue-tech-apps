import { lazy, Suspense, useEffect, useState } from "react";
import { createClient } from "@supabase/supabase-js";
import AuthPromptModal from "./components/AuthPromptModal.jsx";
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

const supabase = createClient(
  import.meta.env.VITE_SUPABASE_URL,
  import.meta.env.VITE_SUPABASE_ANON_KEY,
);

const DashboardScreen = lazy(() => import("./screens/DashboardScreen.jsx"));
const LoginScreen = lazy(() => import("./screens/LoginScreen.jsx"));
const ProfileScreen = lazy(() => import("./screens/ProfileScreen.jsx"));
const WorkoutScreen = lazy(() => import("./screens/WorkoutScreen.jsx"));

function ScreenFallback() {
  return <LoadingScreen quote={QUOTES[0]} label="Cargando pantalla..." />;
}

export default function IronAI() {
  const [st, setSt] = useState(DEFAULT_WORKOUT_STATE);
  const [screen, setScreen] = useState("form");
  const [workout, setWorkout] = useState(null);
  const [err, setErr] = useState("");
  const [loading, setLoading] = useState(false);
  const [qi, setQi] = useState(0);

  const [user, setUser] = useState(null);
  const [authEmail, setAuthEmail] = useState("");
  const [authSent, setAuthSent] = useState(false);
  const [authLoading, setAuthLoading] = useState(false);
  const [showAuthPrompt, setShowAuthPrompt] = useState(false);
  const [completed, setCompleted] = useState(false);
  const [sessions, setSessions] = useState([]);
  const [dashLoading, setDashLoading] = useState(false);
  const [loginReturnTo, setLoginReturnTo] = useState("form");

  const [profile, setProfile] = useState(null);
  const [profileDraft, setProfileDraft] = useState(DEFAULT_PROFILE_DRAFT);
  const [profileSaved, setProfileSaved] = useState(false);

  useEffect(() => {
    const t = setInterval(() => setQi((i) => (i + 1) % QUOTES.length), 2500);

    try {
      const saved = localStorage.getItem("ironai_profile");
      if (saved) {
        const parsed = JSON.parse(saved);
        setProfile(parsed);
        setProfileDraft(parsed);
      }
    } catch {}

    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user ?? null);
    });

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(async (_event, session) => {
      setUser(session?.user ?? null);
      if (session?.user && showAuthPrompt) setShowAuthPrompt(false);

      if (session?.user) {
        const { data } = await supabase
          .from("user_profiles")
          .select("age, sex, weight, height")
          .eq("user_id", session.user.id)
          .single();

        if (data) {
          const syncedProfile = {
            age: data.age,
            sex: data.sex,
            weight: data.weight,
            height: data.height,
          };
          localStorage.setItem("ironai_profile", JSON.stringify(syncedProfile));
          setProfile(syncedProfile);
          setProfileDraft(syncedProfile);
        }
      }
    });

    return () => {
      clearInterval(t);
      subscription.unsubscribe();
    };
  }, [showAuthPrompt]);

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

  async function sendMagicLink() {
    if (!authEmail.trim()) return;

    setAuthLoading(true);
    const { error } = await supabase.auth.signInWithOtp({
      email: authEmail.trim(),
      options: { emailRedirectTo: window.location.href },
    });
    setAuthLoading(false);

    if (!error) setAuthSent(true);
  }

  async function signOut() {
    await supabase.auth.signOut();
  }

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

  return (
    <div className="app-shell">
      <div className="box">
        <AuthPromptModal
          isOpen={showAuthPrompt}
          onClose={() => setShowAuthPrompt(false)}
          onLogin={() => {
            setShowAuthPrompt(false);
            setLoginReturnTo("work");
            setScreen("login");
            setAuthSent(false);
            setAuthEmail("");
          }}
        />

        {screen === "form" && (
          <main role="main">
            <FormScreen
              err={err}
              generate={generate}
              getRecommendedGoal={getRecommendedGoal}
              loadDashboard={loadDashboard}
              profile={profile}
              setAuthEmail={setAuthEmail}
              setAuthSent={setAuthSent}
              setLoginReturnTo={setLoginReturnTo}
              setProfileDraft={setProfileDraft}
              setProfileSaved={setProfileSaved}
              setScreen={setScreen}
              setSt={setSt}
              signOut={signOut}
              st={st}
              togE={togE}
              togM={togM}
              user={user}
            />
          </main>
        )}

        {screen === "load" && (
          <main role="main">
            <LoadingScreen
              label="Generando tu rutina personalizada..."
              quote={QUOTES[qi]}
            />
          </main>
        )}

        {(screen === "login" ||
          screen === "work" ||
          screen === "dashboard" ||
          screen === "profile") && (
          <Suspense fallback={<ScreenFallback />}>
            {screen === "login" && (
              <main role="main">
                <LoginScreen
                  authEmail={authEmail}
                  authLoading={authLoading}
                  authSent={authSent}
                  loginReturnTo={loginReturnTo}
                  sendMagicLink={sendMagicLink}
                  setAuthEmail={setAuthEmail}
                  setScreen={setScreen}
                />
              </main>
            )}

            {screen === "work" && workout && (
              <main role="main">
                <WorkoutScreen
                  completed={completed}
                  level={st.level}
                  loadDashboard={loadDashboard}
                  onBack={() => {
                    setWorkout(null);
                    setScreen("form");
                  }}
                  saveSession={saveSession}
                  user={user}
                  workout={workout}
                />
              </main>
            )}

            {screen === "dashboard" && (
              <main role="main">
                <DashboardScreen
                  dashLoading={dashLoading}
                  getWeekBars={getWeekBars}
                  onBack={() => setScreen(workout ? "work" : "form")}
                  sessions={sessions}
                />
              </main>
            )}

            {screen === "profile" && (
              <main role="main">
                <ProfileScreen
                  calcMetrics={calcMetrics}
                  onBack={() => setScreen(workout ? "work" : "form")}
                  profile={profile}
                  profileDraft={profileDraft}
                  profileSaved={profileSaved}
                  saveProfile={saveProfile}
                  setProfileDraft={setProfileDraft}
                />
              </main>
            )}
          </Suspense>
        )}
      </div>
    </div>
  );
}
