# Componentes Compartidos - MLS Toolbox

## 📦 Componentes Creados

### 1. **Header Component** (`shared/components/header`)

**Ubicación**: `/src/app/shared/components/header/`

**Propósito**: Navbar principal de la aplicación con logo y navegación.

**Características**:
- Logo con gradiente azul-morado
- Navegación a Home
- Botón "About Us" que redirige a: `https://github.com/MLSToolbox/.github/wiki`
- Sticky header (permanece visible al hacer scroll)
- Responsive design
- Usa estilos de Tailwind CSS

**Uso**:
```html
<app-header></app-header>
```

---

### 2. **Hero Component** (`shared/components/hero`)

**Ubicación**: `/src/app/shared/components/hero/`

**Propósito**: Sección de bienvenida con gradiente y título destacado.

**Props**:
- `@Input() title`: Título principal (default: 'Welcome to MLS Toolbox')
- `@Input() subtitle`: Subtítulo descriptivo
- `@Input() showGradient`: Mostrar gradiente de fondo (default: true)

**Características**:
- Gradiente azul-morado de fondo
- Texto centrado y responsivo
- Padding vertical amplio

**Uso**:
```html
<app-hero
  title="Welcome to MLS Toolbox"
  subtitle="A collection of tools for MLOps">
</app-hero>
```

---

### 3. **Tool Card Component** (`shared/components/tool-card`)

**Ubicación**: `/src/app/shared/components/tool-card/`

**Propósito**: Tarjeta interactiva para mostrar herramientas de la aplicación.

**Props**:
- `@Input() title`: Título de la herramienta
- `@Input() description`: Descripción breve
- `@Input() features`: Array de características (string[])
- `@Input() routerLink`: Ruta de navegación
- `@Input() iconPath`: Path SVG del icono

**Características**:
- Efecto hover con elevación
- Icono con gradiente en círculo
- Lista de features con checkmarks
- Call-to-action "Get Started"
- Navegación automática al hacer click
- Efecto glass (fondo translúcido)

**Uso**:
```html
<app-tool-card
  title="Code Assessment"
  description="Automated code quality analysis"
  [features]="['Feature 1', 'Feature 2']"
  routerLink="/assess"
  iconPath="M9 5H7a2 2 0 00-2 2v12...">
</app-tool-card>
```

---

## 🏠 Home Component Actualizado

**Ubicación**: `/src/app/features/home/`

**Cambios realizados**:

1. **Nuevo diseño** basado en REFERENCIA.html
2. **Estructura modernizada**:
   - Hero section con gradiente
   - Grid de 2 columnas para tool cards
   - Sección de estadísticas rápidas

3. **Data en el componente**:
   - Array `tools` con información de cada herramienta
   - Array `stats` con estadísticas de la plataforma

4. **Layout responsivo**:
   - Mobile-first approach
   - Grid adaptable (1 col mobile, 2 cols desktop)

---

## 🎨 Estilos y Diseño

### Paleta de Colores
- **Gradiente Principal**: `from-blue-600 to-purple-600`
- **Fondo**: `bg-gray-50` (gris claro)
- **Tarjetas**: `bg-white` con sombras
- **Texto**: Escalas de gray (900, 600, 700)
- **Acentos**: blue-600, green-500

### Tokens Usados
Los componentes usan las variables CSS definidas en `design-tokens.css`:
- `--color-primary`
- `--color-accent-purple`
- `--spacing-*`
- `--font-size-*`

### Tailwind Classes Principales
- **Layout**: `max-w-7xl`, `mx-auto`, `px-4`, `grid`, `flex`
- **Spacing**: `gap-*`, `p-*`, `m-*`
- **Effects**: `hover:`, `transition-*`, `shadow-*`
- **Responsive**: `md:`, `sm:`, `lg:`

---

## 📂 Estructura de Archivos

```
shared/
├── components/
│   ├── header/
│   │   ├── header.component.ts
│   │   └── header.component.html
│   ├── hero/
│   │   ├── hero.component.ts
│   │   └── hero.component.html
│   ├── tool-card/
│   │   ├── tool-card.component.ts
│   │   └── tool-card.component.html
│   └── index.ts
├── shared.module.ts
└── utils.ts
```

---

## ✅ Siguientes Pasos

### Para Code Assessment:
Los mismos componentes pueden ser reutilizados:
- ✅ **Header**: Ya listo, se usa globalmente
- ✅ **Hero**: Puede personalizarse con props
- ⚠️ **Tool Card**: No aplica para Code Assessment

### Componentes específicos de Code Assessment:
Según ARQ.md, se necesitarán:
- `assessment-upload` (zona de carga de archivos)
- `assessment-metrics` (selector de métricas)
- `assessment-results` (visualización de resultados)
- `assessment-explorer` (explorador de archivos)
- `assessment-sidebar` (navegación lateral)

Estos seguirán las mismas reglas:
- Tailwind directo en templates
- Sin archivos CSS
- Componentes dumb con @Input/@Output
- Nombres descriptivos con prefijo

---

## 🔧 Configuración

### SharedModule
Los componentes están declarados y exportados en `SharedModule`:
```typescript
@NgModule({
  declarations: [HeaderComponent, HeroComponent, ToolCardComponent],
  exports: [HeaderComponent, HeroComponent, ToolCardComponent]
})
```

### Importación en módulos
```typescript
import { SharedModule } from '@shared/shared.module';

@NgModule({
  imports: [SharedModule, ...]
})
```

---

## 📋 Checklist de Implementación

- ✅ Header Component creado
- ✅ Hero Component creado  
- ✅ Tool Card Component creado
- ✅ SharedModule configurado
- ✅ Home rediseñado con nuevo layout
- ✅ Navegación a Wiki configurada
- ✅ Responsive design implementado
- ✅ Tailwind CSS integrado
- ✅ Sin archivos CSS dedicados (siguiendo ARQ.md)
- ✅ Tokens de diseño utilizados

---

## 🎯 Principios Aplicados (según ARQ.md)

1. ✅ **Solo Tailwind**: No se crearon archivos .css
2. ✅ **Componentes pequeños**: Una responsabilidad por componente
3. ✅ **Nombres descriptivos**: Prefijo y contexto claro
4. ✅ **Reutilización**: Componentes configurables con @Input
5. ✅ **Standalone: false**: Declarados en módulos
6. ✅ **Sin archivos .spec.ts**: No se generaron tests

---

**Última actualización**: Noviembre 8, 2025
