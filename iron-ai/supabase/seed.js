import { createClient } from '@supabase/supabase-js';
import { readFileSync } from 'fs';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __dirname = dirname(fileURLToPath(import.meta.url));

const SUPABASE_URL = process.env.SUPABASE_URL || process.env.VITE_SUPABASE_URL;
const SUPABASE_KEY =
  process.env.SUPABASE_SERVICE_ROLE_KEY ||
  process.env.VITE_SUPABASE_ANON_KEY;

if (!SUPABASE_URL || !SUPABASE_KEY) {
  console.error(
    'Faltan SUPABASE_URL/VITE_SUPABASE_URL y SUPABASE_SERVICE_ROLE_KEY o VITE_SUPABASE_ANON_KEY para ejecutar seed.js',
  );
  process.exit(1);
}

const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);

const routines = JSON.parse(readFileSync(join(__dirname, 'seed.json'), 'utf-8'));

async function seed() {
  console.log(`Insertando ${routines.length} rutinas...`);

  const { data, error } = await supabase
    .from('workouts')
    .insert(routines)
    .select('id, goal, level');

  if (error) {
    console.error('Error:', error.message);
    process.exit(1);
  }

  console.log(`✅ ${data.length} rutinas insertadas exitosamente:`);
  data.forEach(r => console.log(`  - ${r.goal} / ${r.level} (${r.id})`));
}

seed();
