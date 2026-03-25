# 🤝 Guía de Contribución

¡Gracias por tu interés en contribuir a **Chroma y sus Amigos**! 

Este documento proporciona lineamientos para contribuir al proyecto.

## 📋 Tabla de Contenidos

- [Código de Conducta](#código-de-conducta)
- [¿Cómo puedo contribuir?](#cómo-puedo-contribuir)
- [Proceso de Desarrollo](#proceso-de-desarrollo)
- [Estilo de Código](#estilo-de-código)
- [Commits](#commits)
- [Pull Requests](#pull-requests)

## 🤝 Código de Conducta

Este proyecto se adhiere a un código de conducta básico:
- Sé respetuoso y constructivo
- Acepta las críticas constructivas
- Enfócate en lo mejor para la comunidad
- Muestra empatía hacia otros miembros

## 🎯 ¿Cómo puedo contribuir?

### Reportar Bugs 🐛

Si encuentras un bug:

1. **Verifica** que no haya sido reportado antes en [Issues](https://github.com/fertorm/Juegos/issues)
2. **Crea un nuevo issue** con:
   - Título descriptivo
   - Pasos para reproducir el bug
   - Comportamiento esperado vs actual
   - Screenshots si aplica
   - Información del sistema (navegador, OS, etc.)

### Sugerir Mejoras 💡

Para sugerir nuevas features:

1. **Verifica** que no exista ya como issue
2. **Crea un issue** describiendo:
   - El problema que resuelve
   - La solución propuesta
   - Alternativas consideradas
   - Impacto en usuarios

### Contribuir con Código 💻

1. **Fork** el repositorio
2. **Crea una rama** desde `main`:
   ```bash
   git checkout -b feature/nombre-descriptivo
   ```
3. **Desarrolla** tu feature o fix
4. **Testea** tus cambios
5. **Commit** siguiendo las convenciones
6. **Push** a tu fork
7. **Abre un Pull Request**

## 🔄 Proceso de Desarrollo

### Configuración del Entorno

```bash
# Clona tu fork
git clone https://github.com/TU_USUARIO/Juegos.git
cd Juegos

# Añade el repositorio original como upstream
git remote add upstream https://github.com/fertorm/Juegos.git

# Instala dependencias
npm install

# Crea tu rama
git checkout -b feature/mi-feature
```

### Durante el Desarrollo

```bash
# Mantén tu rama actualizada
git fetch upstream
git rebase upstream/main

# Desarrolla y testea
npm run dev
npm run build
npm test  # (cuando estén disponibles)
```

## 📝 Estilo de Código

### TypeScript/React

- Usa **TypeScript** para todo el código
- Sigue las convenciones de **ESLint** (próximamente configurado)
- Usa **functional components** con hooks
- Añade **tipos explícitos** cuando sea necesario

```typescript
// ✅ Bueno
interface ColorMixerProps {
  primaryColor: string;
  secondaryColor: string;
  onMix: (result: string) => void;
}

const ColorMixer: React.FC<ColorMixerProps> = ({ primaryColor, secondaryColor, onMix }) => {
  // ...
};

// ❌ Evita
const ColorMixer = (props: any) => {
  // ...
};
```

### Nombres

- **Componentes**: PascalCase (`ColorMixer.tsx`)
- **Funciones/variables**: camelCase (`mixColors`, `resultColor`)
- **Constantes**: UPPER_SNAKE_CASE (`MAX_COLOR_VALUE`)
- **Tipos/Interfaces**: PascalCase (`ColorData`, `FractionProps`)

### Estructura de Archivos

```typescript
// Orden de imports
import React from 'react'; // Externos primero
import { useState } from 'react';

import { ColorService } from '../services'; // Internos después
import { COLOR_CONSTANTS } from '../constants';

import type { ColorType } from '../types'; // Tipos al final

// Orden en componentes:
// 1. Types/Interfaces
// 2. Component
// 3. Helpers internos
// 4. Export
```

## 💬 Commits

Usa el formato de [Conventional Commits](https://www.conventionalcommits.org/):

```
tipo(scope): descripción corta

[cuerpo opcional]

[footer opcional]
```

### Tipos de Commits

- `feat`: Nueva funcionalidad
- `fix`: Corrección de bug
- `docs`: Cambios en documentación
- `style`: Formato, sin cambios de código
- `refactor`: Refactorización sin cambiar funcionalidad
- `test`: Añadir o modificar tests
- `chore`: Tareas de mantenimiento

### Ejemplos

```bash
feat(color-mixer): añadir selector de colores primarios

fix(fractions): corregir cálculo de proporciones
Corrige el bug donde las fracciones no sumaban correctamente.
Closes #23

docs(readme): actualizar instrucciones de instalación

refactor(services): extraer lógica de mezcla a colorService

test(color-mixer): añadir tests unitarios para mezcla RGB
```

## 🔀 Pull Requests

### Antes de Abrir el PR

- [ ] El código compila sin errores
- [ ] Todos los tests pasan (cuando estén disponibles)
- [ ] Has añadido tests para el nuevo código
- [ ] La documentación está actualizada
- [ ] Los commits siguen las convenciones

### Template del PR

```markdown
## Descripción
Breve descripción de los cambios

## Tipo de Cambio
- [ ] Bug fix
- [ ] Nueva feature
- [ ] Breaking change
- [ ] Documentación

## ¿Cómo se ha testeado?
Describe las pruebas realizadas

## Checklist
- [ ] Mi código sigue el estilo del proyecto
- [ ] He revisado mi propio código
- [ ] He comentado código complejo
- [ ] He actualizado la documentación
- [ ] Mis cambios no generan warnings
- [ ] He añadido tests

## Screenshots (si aplica)
```

### Revisión del PR

- El mantenedor revisará tu PR lo antes posible
- Puede haber comentarios o solicitudes de cambios
- Una vez aprobado, se hará merge a `main`

## 🎓 Recursos para Nuevos Contribuidores

- [Introducción a Git y GitHub](https://docs.github.com/es/get-started)
- [React Documentation](https://react.dev/)
- [TypeScript Handbook](https://www.typescriptlang.org/docs/)
- [Conventional Commits](https://www.conventionalcommits.org/)

## ❓ ¿Preguntas?

Si tienes dudas:
1. Revisa los [Issues existentes](https://github.com/fertorm/Juegos/issues)
2. Crea un nuevo issue con la etiqueta `question`
3. Contacta al mantenedor

---

¡Gracias por contribuir a hacer el aprendizaje más divertido! 🎨📚
