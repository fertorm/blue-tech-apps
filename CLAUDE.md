# Blue Tech Juegos — Workspace

Colección de mini-apps web desarrolladas con React + Vite. Cada proyecto es independiente.

## Proyectos

| Carpeta | Nombre | Stack principal | Deploy |
|---|---|---|---|
| `iron-ai/` | Iron AI | React 18, Vite, Gemini API (Netlify Functions) | Netlify |
| `Chroma y sus amigos/` | Chroma y sus amigos | React 19, Vite, TypeScript, Google Genai, Recharts | Netlify / Vercel |
| `katarsis/` | Katarsis Engine | React 19, Vite, TypeScript, Google Genai | Netlify / Vercel |
| `Arbol genealogico/` | Árbol Genealógico (v1) | React 19, Vite, Supabase, D3, html2canvas, jsPDF | Netlify / Vercel |
| `arbol-nuevo/` | Árbol Genealógico (v2) | React 19, Vite, Supabase, D3, html2canvas, jsPDF | Netlify / Vercel |

## Comandos (dentro de cada carpeta de proyecto)

```bash
npm install      # instalar dependencias
npm run dev      # servidor de desarrollo (Vite, puerto 5173)
npm run build    # build de producción → dist/
npm run preview  # previsualizar build local
npm run lint     # verificar tipos TS (solo en proyectos con tsconfig)
```

## Variables de entorno

- `GEMINI_API_KEY` — requerida en **iron-ai** (configurar en Netlify dashboard, no en `.env` del repo)
- Proyectos con Supabase necesitan `VITE_SUPABASE_URL` y `VITE_SUPABASE_ANON_KEY`

## iron-ai — Particularidades

- La API de Gemini **no se llama desde el frontend**: pasa por una Netlify Function en `netlify/functions/generate.js`
- El proxy local se configura en `netlify.toml`: `/api/*` → `/.netlify/functions/:splat`
- Para probar las funciones en local usar **Netlify CLI**: `netlify dev` (no `npm run dev`)
- El modelo usado es `gemini-1.5-flash`

## Árbol Genealógico — Particularidades

- `Arbol genealogico/` es la versión original; `arbol-nuevo/` es la versión refactorizada con el mismo `package.json`
- Usa **Supabase** como backend; requiere proyecto Supabase configurado y sus vars de entorno
- D3 se usa para renderizar el árbol SVG; html2canvas + jsPDF para exportar

## Gotchas

- Carpetas con espacios en el nombre (`Chroma y sus amigos`, `Arbol genealogico`) — escapar o usar comillas en la terminal
- Cada proyecto tiene su propio `node_modules`; no hay monorepo root con workspaces
- `vercel.json` y `netlify.toml` coexisten en algunos proyectos — el deploy target activo depende de cuál plataforma esté vinculada
