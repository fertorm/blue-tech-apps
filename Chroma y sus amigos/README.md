# 🎨 Chroma y sus Amigos

<div align="center">

![Estado: En Desarrollo](https://img.shields.io/badge/Estado-En%20Desarrollo-yellow)
![TypeScript](https://img.shields.io/badge/TypeScript-007ACC?logo=typescript&logoColor=white)
![React](https://img.shields.io/badge/React-61DAFB?logo=react&logoColor=black)
![Vite](https://img.shields.io/badge/Vite-646CFF?logo=vite&logoColor=white)

**Juego educativo interactivo para aprender a mezclar colores y entender fracciones de forma divertida**

[Demo en Vivo](#) • [Reportar Bug](https://github.com/fertorm/Juegos/issues) • [Solicitar Feature](https://github.com/fertorm/Juegos/issues)

</div>

---

## 📖 Sobre el Proyecto

**Chroma y sus Amigos** es un juego educativo innovador que combina dos conceptos fundamentales del aprendizaje:
- 🎨 **Teoría del Color**: Mezcla colores primarios para crear secundarios y terciarios
- 🔢 **Fracciones**: Comprende proporciones visuales mientras juegas

El juego está diseñado para estudiantes, educadores y cualquier persona que quiera aprender de forma interactiva.

### ✨ Características Principales

- 🎯 **Aprendizaje Dual**: Combina arte (colores) y matemáticas (fracciones)
- 🖌️ **Mezcla Interactiva**: Experimenta con diferentes proporciones de colores
- 📊 **Visualización de Fracciones**: Entiende conceptos abstractos de forma concreta
- 🎮 **Interfaz Intuitiva**: Diseño amigable y accesible
- 📱 **Responsive**: Juega en cualquier dispositivo
- 🚀 **Sin instalación**: Funciona directamente en el navegador

---

## 🎮 Cómo Jugar

### Objetivo
Aprende a crear colores específicos mezclando colores primarios en las proporciones correctas.

### Mecánicas
1. **Selecciona colores base** (rojo, azul, amarillo)
2. **Ajusta las proporciones** usando fracciones
3. **Observa el resultado** de tu mezcla
4. **Completa desafíos** de colores objetivo

### Conceptos que Aprenderás
- 🎨 Colores primarios, secundarios y terciarios
- 🔢 Suma y resta de fracciones
- 📐 Proporciones y porcentajes
- 🌈 Teoría del color RGB

---

## 🚀 Instalación y Uso

### Prerrequisitos
- Node.js (v16 o superior)
- npm o yarn

### Instalación Local

```bash
# 1. Clona el repositorio
git clone https://github.com/fertorm/Juegos.git
cd Juegos

# 2. Instala las dependencias
npm install

# 3. Configura tu API key de Gemini (opcional)
# Crea un archivo .env.local y añade:
# GEMINI_API_KEY=tu_api_key_aquí

# 4. Inicia el servidor de desarrollo
npm run dev

# 5. Abre tu navegador en http://localhost:5173
```

### Scripts Disponibles

```bash
npm run dev      # Inicia servidor de desarrollo
npm run build    # Construye para producción
npm run preview  # Preview de la build
npm run lint     # Verifica el código (próximamente)
npm test         # Ejecuta tests (próximamente)
```

---

## 🛠️ Tecnologías Utilizadas

| Tecnología | Propósito |
|-----------|-----------|
| ![React](https://img.shields.io/badge/React-61DAFB?logo=react&logoColor=black) | Biblioteca UI principal |
| ![TypeScript](https://img.shields.io/badge/TypeScript-007ACC?logo=typescript&logoColor=white) | Tipado estático y mejor DX |
| ![Vite](https://img.shields.io/badge/Vite-646CFF?logo=vite&logoColor=white) | Build tool ultrarrápido |
| ![Google Gemini](https://img.shields.io/badge/Gemini%20AI-8E75B2?logo=google&logoColor=white) | Integración de IA (opcional) |

---

## 📂 Estructura del Proyecto

```
Juegos/
├── components/          # Componentes React reutilizables
│   ├── ColorMixer.tsx  # Mezclador de colores principal
│   ├── FractionBar.tsx # Barra visual de fracciones
│   └── ...
├── colorService.ts     # Lógica de mezcla de colores
├── constants.ts        # Constantes del juego
├── types.ts           # Definiciones de tipos TypeScript
├── App.tsx            # Componente raíz
├── index.tsx          # Punto de entrada
├── package.json       # Dependencias del proyecto
└── vite.config.ts     # Configuración de Vite
```

---

## 🎯 Roadmap de Desarrollo

### ✅ Fase 1: MVP (En Progreso)
- [x] Configuración inicial del proyecto
- [x] Sistema de mezcla de colores
- [x] Interfaz básica
- [ ] Sistema de fracciones visuales
- [ ] Tutorial interactivo

### 🔄 Fase 2: Características Core
- [ ] Sistema de niveles/desafíos
- [ ] Guardado de progreso
- [ ] Sistema de puntuación
- [ ] Animaciones y feedback visual

### 🔮 Fase 3: Expansión
- [ ] Modo multijugador
- [ ] Más tipos de desafíos
- [ ] Tabla de clasificación
- [ ] Soporte multiidioma
- [ ] Modo oscuro

---

## 🤝 Contribuir

¡Las contribuciones son bienvenidas! Este es un proyecto en desarrollo activo.

### Cómo Contribuir

1. Fork el proyecto
2. Crea una rama para tu feature (`git checkout -b feature/AmazingFeature`)
3. Commit tus cambios (`git commit -m 'Add: Amazing Feature'`)
4. Push a la rama (`git push origin feature/AmazingFeature`)
5. Abre un Pull Request

### Lineamientos
- Mantén el código limpio y comentado
- Sigue las convenciones de TypeScript
- Añade tests para nuevas funcionalidades
- Actualiza la documentación según necesario

---

## 📝 Licencia

Este proyecto está bajo la Licencia MIT. Ver archivo `LICENSE` para más detalles.

---

## 👤 Autor

**Fernando Torres** (fertorm)
- GitHub: [@fertorm](https://github.com/fertorm)
- Proyecto: [Chroma y sus Amigos](https://github.com/fertorm/Juegos)

---

## 🙏 Agradecimientos

- Inspirado en la necesidad de hacer el aprendizaje más visual e interactivo
- Construido con herramientas open source increíbles
- Basado en el template de [Google Gemini AI Studio](https://ai.studio)

---

## 📬 Contacto y Soporte

¿Preguntas? ¿Sugerencias? ¿Encontraste un bug?

- 🐛 [Reportar un Issue](https://github.com/fertorm/Juegos/issues)
- 💡 [Solicitar una Feature](https://github.com/fertorm/Juegos/issues/new)
- 📧 Contacto directo: [Crear issue en GitHub]

---

<div align="center">

**⭐ Si te gusta el proyecto, dale una estrella en GitHub ⭐**

Hecho con ❤️ y mucho ☕ por Fernando Torres

</div>
