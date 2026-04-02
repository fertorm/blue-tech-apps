export function calcStreak(sessions) {
  if (!sessions.length) return 0;

  const days = [...new Set(sessions.map((session) =>
    new Date(session.completed_at).toLocaleDateString("sv-SE"),
  ))]
    .sort()
    .reverse();

  const today = new Date().toLocaleDateString("sv-SE");
  const yesterday = new Date(Date.now() - 86400000).toLocaleDateString("sv-SE");

  if (days[0] !== today && days[0] !== yesterday) return 0;

  let streak = 0;
  let check = days[0] === today ? today : yesterday;

  for (const day of days) {
    if (day === check) {
      streak++;
      const previous = new Date(new Date(check).getTime() - 86400000);
      check = previous.toLocaleDateString("sv-SE");
    } else {
      break;
    }
  }

  return streak;
}

export function getWeekBars(sessions) {
  const days = [];
  const counts = {};

  for (let i = 6; i >= 0; i--) {
    const date = new Date(Date.now() - i * 86400000);
    const key = date.toLocaleDateString("sv-SE");
    const label = date.toLocaleDateString("es-AR", { weekday: "short" }).slice(0, 2);
    days.push({ key, label });
    counts[key] = 0;
  }

  sessions.forEach((session) => {
    const key = new Date(session.completed_at).toLocaleDateString("sv-SE");
    if (counts[key] !== undefined) counts[key]++;
  });

  const max = Math.max(...Object.values(counts), 1);
  return days.map((day) => ({
    ...day,
    count: counts[day.key],
    pct: counts[day.key] / max,
  }));
}

export function calcMetrics(profile) {
  if (!profile?.weight || !profile?.height || !profile?.age || !profile?.sex) {
    return null;
  }

  const heightInMeters = profile.height / 100;
  const bmi = profile.weight / (heightInMeters * heightInMeters);
  const bmr =
    profile.sex === "male"
      ? 10 * profile.weight + 6.25 * profile.height - 5 * profile.age + 5
      : 10 * profile.weight + 6.25 * profile.height - 5 * profile.age - 161;
  const tdee = Math.round(bmr * 1.55);
  const idealMin = Math.round(18.5 * heightInMeters * heightInMeters);
  const idealMax = Math.round(24.9 * heightInMeters * heightInMeters);

  let bmiCategory;
  let bmiColor;

  if (bmi < 18.5) {
    bmiCategory = "Bajo peso";
    bmiColor = "#4a90d9";
  } else if (bmi < 25) {
    bmiCategory = "Normal";
    bmiColor = "#4caf50";
  } else if (bmi < 30) {
    bmiCategory = "Sobrepeso";
    bmiColor = "#ff9800";
  } else {
    bmiCategory = "Obesidad";
    bmiColor = "#f44336";
  }

  return {
    bmi: bmi.toFixed(1),
    bmiCategory,
    bmiColor,
    bmr: Math.round(bmr),
    tdee,
    idealMin,
    idealMax,
  };
}

export function getRecommendedGoal(profile) {
  if (!profile?.weight || !profile?.height) return null;

  const bmi = profile.weight / Math.pow(profile.height / 100, 2);
  if (bmi < 18.5) return "hypertrophy";
  if (bmi < 25) return "strength";
  return "fat_loss";
}
