/**
 * Sube las 44 rutinas de seed_extra.json a Supabase.
 * Uso: node supabase/upload-seed.mjs
 */
import { createClient } from '@supabase/supabase-js';
import { readFileSync } from 'fs';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __dirname = dirname(fileURLToPath(import.meta.url));

const SUPABASE_URL = 'https://afukfanypnnsauxhfdmj.supabase.co';
const SERVICE_KEY  = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImFmdWtmYW55cG5uc2F1eGhmZG1qIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc3NDg5NTA2MiwiZXhwIjoyMDkwNDcxMDYyfQ.GllF9VB1eqt8xiJYvkP4JcjiKxLIRx0NKEX8lAOdzus';

const supabase = createClient(SUPABASE_URL, SERVICE_KEY);

const routines = JSON.parse(readFileSync(join(__dirname, 'seed_extra.json'), 'utf8'));
console.log(`📦 Insertando ${routines.length} rutinas...`);

const { error } = await supabase.from('workouts').insert(routines);

if (error) {
  console.error('❌ Error al insertar:', error.message);
  process.exit(1);
} else {
  console.log(`✅ ${routines.length} rutinas insertadas correctamente`);
  console.log('\n▶  Siguiente paso: node supabase/add-images.mjs');
}
