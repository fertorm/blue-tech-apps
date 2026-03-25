# 🚀 Guía de Deployment

Esta guía explica cómo deployar **Chroma y sus Amigos** en diferentes plataformas.

## 📋 Tabla de Contenidos

- [GitHub Pages (Recomendado)](#github-pages)
- [Vercel](#vercel)
- [Netlify](#netlify)
- [Configuración General](#configuración-general)

---

## 🌐 GitHub Pages

GitHub Pages es ideal para proyectos open source y es **gratis**.

### Opción 1: Deployment Automático con GitHub Actions

Ya incluimos un workflow de CI/CD que deploya automáticamente a GitHub Pages.

#### Pasos:

1. **Habilita GitHub Pages en tu repositorio:**
   ```
   Settings → Pages → Source: GitHub Actions
   ```

2. **Configura el base path en `vite.config.ts`:**
   ```typescript
   export default defineConfig({
     base: '/Juegos/', // Usa el nombre de tu repo
     plugins: [react()],
   });
   ```

3. **Push a la rama main:**
   ```bash
   git add .
   git commit -m "chore: configurar deployment"
   git push origin main
   ```

4. **El workflow se ejecutará automáticamente** y tu sitio estará disponible en:
   ```
   https://fertorm.github.io/Juegos/
   ```

### Opción 2: Deployment Manual

```bash
# 1. Instala gh-pages
npm install --save-dev gh-pages

# 2. Añade scripts a package.json
{
  "scripts": {
    "predeploy": "npm run build",
    "deploy": "gh-pages -d dist"
  }
}

# 3. Deploy
npm run deploy
```

---

## ⚡ Vercel

Vercel ofrece deployment súper rápido con preview automático de PRs.

### Setup:

1. **Crea cuenta en [vercel.com](https://vercel.com)**

2. **Importa tu repositorio de GitHub**

3. **Configura el proyecto:**
   - Framework Preset: `Vite`
   - Build Command: `npm run build`
   - Output Directory: `dist`
   - Install Command: `npm install`

4. **Variables de entorno (si las necesitas):**
   ```
   VITE_API_KEY=tu_api_key
   ```

5. **Deploy:**
   - Cada push a `main` deploya automáticamente
   - Cada PR crea un preview deployment

### CLI de Vercel

```bash
# Instala CLI
npm i -g vercel

# Login
vercel login

# Deploy
vercel

# Deploy a producción
vercel --prod
```

---

## 🎯 Netlify

Netlify es otra excelente opción con funciones serverless.

### Setup vía UI:

1. **Crea cuenta en [netlify.com](https://netlify.com)**

2. **New site from Git → Conecta GitHub**

3. **Configuración:**
   - Build command: `npm run build`
   - Publish directory: `dist`
   - Branch: `main`

4. **Deploy**

### Setup vía CLI:

```bash
# Instala CLI
npm install -g netlify-cli

# Login
netlify login

# Inicializa
netlify init

# Build y deploy
netlify build
netlify deploy --prod
```

### Archivo de configuración `netlify.toml`:

```toml
[build]
  command = "npm run build"
  publish = "dist"

[[redirects]]
  from = "/*"
  to = "/index.html"
  status = 200

[build.environment]
  NODE_VERSION = "18"
```

---

## ⚙️ Configuración General

### Variables de Entorno

Crea archivos para diferentes entornos:

**.env.development**
```bash
VITE_API_URL=http://localhost:3000
VITE_ENV=development
```

**.env.production**
```bash
VITE_API_URL=https://api.production.com
VITE_ENV=production
```

**.env.local** (no commitear)
```bash
VITE_GEMINI_API_KEY=tu_key_secreta
```

### Configuración de Vite

**vite.config.ts** completo para deployment:

```typescript
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import path from 'path';

export default defineConfig(({ mode }) => ({
  base: mode === 'production' ? '/Juegos/' : '/',
  plugins: [react()],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
  build: {
    outDir: 'dist',
    sourcemap: mode !== 'production',
    rollupOptions: {
      output: {
        manualChunks: {
          'react-vendor': ['react', 'react-dom'],
        },
      },
    },
  },
  server: {
    port: 5173,
    open: true,
  },
}));
```

### Optimizaciones de Build

Para mejorar el performance:

```typescript
// vite.config.ts
export default defineConfig({
  build: {
    // Minificación
    minify: 'terser',
    terserOptions: {
      compress: {
        drop_console: true, // Remueve console.logs
      },
    },
    
    // Optimización de chunks
    rollupOptions: {
      output: {
        manualChunks(id) {
          if (id.includes('node_modules')) {
            return 'vendor';
          }
        },
      },
    },
    
    // Límite de advertencia de tamaño
    chunkSizeWarningLimit: 600,
  },
});
```

---

## 🔍 Verificación Post-Deployment

Después de deployar, verifica:

- [ ] El sitio carga correctamente
- [ ] Todas las rutas funcionan
- [ ] Assets (imágenes, fuentes) cargan
- [ ] No hay errores en la consola
- [ ] Meta tags correctos (SEO)
- [ ] Performance es aceptable (Lighthouse)
- [ ] Responsive en diferentes dispositivos

### Herramientas de Verificación:

```bash
# Lighthouse CI
npm install -g @lhci/cli
lhci autorun --upload.target=temporary-public-storage

# Verifica links rotos
npm install -g broken-link-checker
blc https://tu-sitio.com -ro
```

---

## 🐛 Troubleshooting

### Problema: 404 en rutas al refrescar

**Solución para GitHub Pages:**

Crea `public/404.html` que redirija a `index.html`:

```html
<!DOCTYPE html>
<html>
  <head>
    <meta charset="utf-8">
    <title>Redirecting...</title>
    <script>
      sessionStorage.redirect = location.href;
      location.replace(location.origin + location.pathname.split('/').slice(0, 2).join('/'));
    </script>
  </head>
</html>
```

### Problema: Assets no cargan

Verifica que `base` en `vite.config.ts` esté correcto:

```typescript
base: '/nombre-de-tu-repo/' // Para GitHub Pages
base: '/' // Para Vercel/Netlify
```

### Problema: Variables de entorno no funcionan

Asegúrate de:
- Usar prefijo `VITE_` en las variables
- Configurarlas en la plataforma de deployment
- Referenciarlas correctamente: `import.meta.env.VITE_API_KEY`

---

## 📊 Monitoreo Post-Deployment

### Analytics (opcional)

**Google Analytics:**

```typescript
// En main.tsx o App.tsx
import ReactGA from 'react-ga4';

ReactGA.initialize('G-XXXXXXXXXX');
```

**Plausible Analytics (más privacy-friendly):**

```html
<!-- En index.html -->
<script defer data-domain="tu-dominio.com" 
  src="https://plausible.io/js/script.js">
</script>
```

---

## 🎉 Conclusión

Tu juego ahora está disponible públicamente! Comparte el link:

```
🎮 Juega ahora: https://fertorm.github.io/Juegos/
```

### Próximos pasos:

- Añade el link al README
- Comparte en redes sociales
- Pide feedback a usuarios
- Itera basándote en uso real

---

## 📚 Recursos Adicionales

- [Vite Deployment Guide](https://vitejs.dev/guide/static-deploy.html)
- [GitHub Pages Documentation](https://docs.github.com/pages)
- [Vercel Documentation](https://vercel.com/docs)
- [Netlify Documentation](https://docs.netlify.com/)
