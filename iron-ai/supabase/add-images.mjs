import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = process.env.SUPABASE_URL || process.env.VITE_SUPABASE_URL;
const SERVICE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;
const IMG_BASE = 'https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises';

if (!SUPABASE_URL || !SERVICE_KEY) {
  console.error(
    'Faltan SUPABASE_URL/VITE_SUPABASE_URL o SUPABASE_SERVICE_ROLE_KEY para ejecutar add-images.mjs',
  );
  process.exit(1);
}

const supabase = createClient(SUPABASE_URL, SERVICE_KEY);

// Palabras clave de equipamiento — si hay mismatch entre ejercicio y candidato, se descarta
const EQUIP_KEYWORDS = ['dumbbell', 'barbell', 'cable', 'machine', 'kettlebell', 'band', 'smith', 'ez bar', 'trap bar'];

// Normalize a string for fuzzy matching
function normalize(str) {
  return str.toLowerCase()
    .replace(/[^a-z0-9 ]/g, '')
    .replace(/\s+/g, ' ')
    .trim();
}

// Score how well two exercise names match (0-1)
function matchScore(ourName, dbName) {
  const a = normalize(ourName);
  const b = normalize(dbName);
  if (a === b) return 1;
  if (b.includes(a) || a.includes(b)) return 0.9;

  // Penalizar mismatch de equipo: si ambos tienen keywords de equipo distintos → score 0
  const ourEquip = EQUIP_KEYWORDS.filter(kw => a.includes(kw));
  const dbEquip  = EQUIP_KEYWORDS.filter(kw => b.includes(kw));
  if (ourEquip.length > 0 && dbEquip.length > 0) {
    const equipMatch = ourEquip.some(kw => dbEquip.includes(kw));
    if (!equipMatch) return 0;
  }

  const wordsA = new Set(a.split(' ').filter(w => w.length > 2));
  const wordsB = new Set(b.split(' ').filter(w => w.length > 2));
  const intersection = [...wordsA].filter(w => wordsB.has(w));
  return intersection.length / Math.max(wordsA.size, wordsB.size);
}

// Find best image match for an exercise name
function findImage(exerciseName, exerciseDb) {
  let best = null;
  let bestScore = 0.45; // threshold aumentado para evitar matches débiles

  for (const ex of exerciseDb) {
    const score = matchScore(exerciseName, ex.name);
    if (score > bestScore) {
      bestScore = score;
      best = ex;
    }
  }

  if (!best) return null;
  // Return two image URLs: main + secondary (for animation effect if needed)
  const img0 = `${IMG_BASE}/${best.id}/0.jpg`;
  const img1 = best.images.length > 1 ? `${IMG_BASE}/${best.id}/1.jpg` : img0;
  return { imageUrl: img0, imageUrl2: img1, matchedName: best.name, score: bestScore };
}

async function main() {
  console.log('📥 Descargando base de datos de ejercicios...');
  const res = await fetch('https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/dist/exercises.json');
  const exerciseDb = await res.json();
  console.log(`✅ ${exerciseDb.length} ejercicios cargados\n`);

  console.log('📋 Obteniendo rutinas de Supabase...');
  const { data: workouts, error } = await supabase.from('workouts').select('id, workout_data');
  if (error) { console.error(error); process.exit(1); }
  console.log(`✅ ${workouts.length} rutinas obtenidas\n`);

  let totalExercises = 0;
  let matched = 0;
  let unmatched = [];

  for (const workout of workouts) {
    const exercises = workout.workout_data.exercises.map(ex => {
      totalExercises++;
      const result = findImage(ex.name, exerciseDb);
      if (result) {
        matched++;
        console.log(`  ✓ "${ex.name}" → "${result.matchedName}" (score: ${result.score.toFixed(2)})`);
        return { ...ex, imageUrl: result.imageUrl, imageUrl2: result.imageUrl2 };
      } else {
        unmatched.push(ex.name);
        console.log(`  ✗ "${ex.name}" — sin coincidencia`);
        return ex;
      }
    });

    const updatedData = { ...workout.workout_data, exercises };
    const { error: updateError } = await supabase
      .from('workouts')
      .update({ workout_data: updatedData })
      .eq('id', workout.id);

    if (updateError) console.error(`Error updating workout ${workout.id}:`, updateError.message);
  }

  console.log(`\n📊 Resultado:`);
  console.log(`  Total ejercicios: ${totalExercises}`);
  console.log(`  Con imagen: ${matched} (${Math.round(matched/totalExercises*100)}%)`);
  console.log(`  Sin imagen: ${totalExercises - matched}`);
  if (unmatched.length) {
    console.log(`\n  ⚠️  Sin match:`);
    unmatched.forEach(n => console.log(`    - ${n}`));
  }
}

main();
