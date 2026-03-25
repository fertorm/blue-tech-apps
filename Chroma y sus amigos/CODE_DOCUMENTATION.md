# 📚 Guía de Documentación del Código

Esta guía explica cómo documentar el código en el proyecto **Chroma y sus Amigos**.

## 📝 Principios Generales

1. **Documenta la intención, no lo obvio**
2. **Usa JSDoc para funciones y componentes públicos**
3. **Comenta código complejo o no intuitivo**
4. **Mantén la documentación actualizada**

## 🎯 TypeScript + JSDoc

Usamos TypeScript para tipos y JSDoc para documentación descriptiva.

### Componentes React

```typescript
/**
 * Componente que permite mezclar colores interactivamente.
 * 
 * Este componente es el núcleo de la experiencia educativa, permitiendo
 * a los usuarios experimentar con proporciones de colores primarios
 * para crear colores secundarios y terciarios.
 * 
 * @component
 * @example
 * ```tsx
 * <ColorMixer
 *   primaryColors={['red', 'blue', 'yellow']}
 *   onMixComplete={(color) => console.log('Color creado:', color)}
 * />
 * ```
 */
interface ColorMixerProps {
  /** Lista de colores primarios disponibles para mezclar */
  primaryColors: string[];
  
  /** Callback ejecutado cuando se completa una mezcla exitosa */
  onMixComplete?: (resultColor: string) => void;
  
  /** Proporciones iniciales para cada color (opcional) */
  initialProportions?: Record<string, number>;
  
  /** Si es true, muestra las fracciones en forma simplificada */
  showSimplifiedFractions?: boolean;
}

export const ColorMixer: React.FC<ColorMixerProps> = ({
  primaryColors,
  onMixComplete,
  initialProportions = {},
  showSimplifiedFractions = true,
}) => {
  // Implementación...
};
```

### Funciones y Servicios

```typescript
/**
 * Mezcla dos o más colores según las proporciones especificadas.
 * 
 * Esta función implementa la mezcla aditiva de colores RGB,
 * ponderando cada componente según la proporción especificada.
 * 
 * @param colors - Objeto con colores y sus proporciones
 * @param colors.colorName - Proporción del color (0-1)
 * @returns Color resultante en formato hexadecimal
 * @throws {Error} Si las proporciones no suman 1
 * @throws {Error} Si algún color no es válido
 * 
 * @example
 * ```ts
 * // Mezcla 50% rojo + 50% azul = morado
 * const purple = mixColors({ red: 0.5, blue: 0.5 });
 * console.log(purple); // '#800080'
 * ```
 * 
 * @example
 * ```ts
 * // Mezcla de tres colores
 * const custom = mixColors({ red: 0.5, blue: 0.3, yellow: 0.2 });
 * ```
 */
export function mixColors(colors: Record<string, number>): string {
  // Validación
  const total = Object.values(colors).reduce((sum, prop) => sum + prop, 0);
  if (Math.abs(total - 1) > 0.001) {
    throw new Error(`Las proporciones deben sumar 1, actual: ${total}`);
  }

  // Implementación...
  return resultHex;
}
```

### Tipos y Interfaces

```typescript
/**
 * Representa un color en el espacio RGB.
 * 
 * Cada componente debe estar en el rango [0, 255].
 */
export interface RGBColor {
  /** Componente rojo (0-255) */
  r: number;
  
  /** Componente verde (0-255) */
  g: number;
  
  /** Componente azul (0-255) */
  b: number;
  
  /** Transparencia opcional (0-1) */
  alpha?: number;
}

/**
 * Representa una fracción matemática.
 * 
 * @example
 * ```ts
 * const half: Fraction = { numerator: 1, denominator: 2 };
 * const third: Fraction = { numerator: 1, denominator: 3 };
 * ```
 */
export interface Fraction {
  /** Numerador de la fracción */
  numerator: number;
  
  /** Denominador de la fracción (debe ser > 0) */
  denominator: number;
}

/**
 * Estado del juego durante un desafío.
 */
export type GameState = 
  | 'idle'          // Esperando inicio
  | 'playing'       // Jugando activamente
  | 'checking'      // Validando respuesta
  | 'success'       // Desafío completado
  | 'failed';       // Intento fallido
```

### Constantes

```typescript
/**
 * Colores primarios disponibles en el juego.
 * 
 * Estos colores forman la base de todas las mezclas posibles.
 * Cada color incluye su representación RGB y nombre legible.
 */
export const PRIMARY_COLORS = {
  /** Rojo primario (RGB: 255, 0, 0) */
  RED: { hex: '#FF0000', rgb: { r: 255, g: 0, b: 0 }, name: 'Rojo' },
  
  /** Azul primario (RGB: 0, 0, 255) */
  BLUE: { hex: '#0000FF', rgb: { r: 0, g: 0, b: 255 }, name: 'Azul' },
  
  /** Amarillo primario (RGB: 255, 255, 0) */
  YELLOW: { hex: '#FFFF00', rgb: { r: 255, g: 255, b: 0 }, name: 'Amarillo' },
} as const;

/**
 * Configuración de dificultad del juego.
 * 
 * Cada nivel aumenta la complejidad de las fracciones requeridas.
 */
export const DIFFICULTY_LEVELS = {
  /** Nivel fácil: solo medios y cuartos */
  EASY: {
    allowedDenominators: [2, 4],
    maxColors: 2,
    timeLimit: null, // Sin límite de tiempo
  },
  
  /** Nivel medio: fracciones comunes */
  MEDIUM: {
    allowedDenominators: [2, 3, 4, 6],
    maxColors: 3,
    timeLimit: 120, // 2 minutos
  },
  
  /** Nivel difícil: cualquier fracción */
  HARD: {
    allowedDenominators: [2, 3, 4, 5, 6, 8, 10],
    maxColors: 4,
    timeLimit: 60, // 1 minuto
  },
} as const;
```

### Algoritmos Complejos

```typescript
/**
 * Simplifica una fracción a su forma más reducida.
 * 
 * Utiliza el algoritmo de Euclides para encontrar el máximo común divisor
 * y luego divide tanto el numerador como el denominador por este valor.
 * 
 * **Complejidad temporal:** O(log(min(a,b)))
 * **Complejidad espacial:** O(1)
 * 
 * @param fraction - Fracción a simplificar
 * @returns Nueva fracción simplificada
 * 
 * @example
 * ```ts
 * simplifyFraction({ numerator: 4, denominator: 8 })
 * // Retorna: { numerator: 1, denominator: 2 }
 * ```
 */
export function simplifyFraction(fraction: Fraction): Fraction {
  const { numerator, denominator } = fraction;
  
  // Función auxiliar: Algoritmo de Euclides para MCD
  function gcd(a: number, b: number): number {
    // Caso base: si b es 0, el MCD es a
    if (b === 0) return a;
    
    // Caso recursivo: MCD(a,b) = MCD(b, a mod b)
    return gcd(b, a % b);
  }
  
  const divisor = gcd(Math.abs(numerator), Math.abs(denominator));
  
  return {
    numerator: numerator / divisor,
    denominator: denominator / divisor,
  };
}
```

## 🎨 Comentarios en Componentes

### Props con valores por defecto

```typescript
interface ButtonProps {
  /** Texto del botón */
  label: string;
  
  /** 
   * Variante visual del botón
   * @default 'primary'
   */
  variant?: 'primary' | 'secondary' | 'outline';
  
  /**
   * Si es true, el botón ocupa todo el ancho disponible
   * @default false
   */
  fullWidth?: boolean;
}
```

### Hooks personalizados

```typescript
/**
 * Hook personalizado para manejar la lógica de mezcla de colores.
 * 
 * Proporciona estado y funciones para controlar el proceso de mezcla,
 * incluyendo validación de proporciones y cálculo del color resultante.
 * 
 * @param initialColors - Colores iniciales y sus proporciones
 * @returns Estado y funciones para controlar la mezcla
 * 
 * @example
 * ```tsx
 * function MyComponent() {
 *   const { 
 *     colors, 
 *     resultColor, 
 *     updateProportion,
 *     isValid 
 *   } = useColorMixer({ red: 0.5, blue: 0.5 });
 *   
 *   return <div style={{ backgroundColor: resultColor }}>...</div>;
 * }
 * ```
 */
export function useColorMixer(initialColors: Record<string, number>) {
  // Implementación...
}
```

## ✅ Checklist de Documentación

Antes de hacer commit, verifica:

- [ ] Todos los componentes exportados tienen JSDoc
- [ ] Todos los props tienen descripción
- [ ] Funciones complejas tienen ejemplos
- [ ] Tipos personalizados están documentados
- [ ] Algoritmos complejos explican su lógica
- [ ] Se documentan efectos secundarios
- [ ] Se especifican posibles errores (throws)

## 🚫 Qué NO Documentar

Evita documentar cosas obvias:

```typescript
// ❌ Documentación innecesaria
/**
 * Retorna el nombre
 * @returns el nombre
 */
function getName(): string {
  return this.name;
}

// ✅ Código claro no necesita documentación
function getName(): string {
  return this.name;
}

// ❌ Comentario redundante
// Incrementa el contador en 1
counter++;

// ✅ Si el código no es obvio, SÍ documenta
// Aplicamos un pequeño delay para evitar race condition
// con el estado anterior que aún no se ha propagado
setTimeout(() => updateCounter(counter + 1), 0);
```

## 🔗 Recursos Adicionales

- [JSDoc Official Guide](https://jsdoc.app/)
- [TSDoc Specification](https://tsdoc.org/)
- [React TypeScript Cheatsheet](https://react-typescript-cheatsheet.netlify.app/)

---

**Recuerda:** El mejor código es autoexplicativo. La documentación complementa, no compensa código confuso.
