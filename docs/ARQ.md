# Angular Code Assessment - Arquitectura y Reglas de Diseño

## 📋 Contexto del Proyecto

Este documento define las reglas de arquitectura, diseño y desarrollo para el módulo **Code Assessment** de la aplicación Angular. El objetivo es mantener un código **simple, escalable y mantenible** usando componentes reutilizables con Tailwind CSS.

---

## 🏗️ Arquitectura General

### Estructura de Directorios

```
code-assessment/
├── code-assessment.module.ts              # Módulo principal
├── code-assessment-routing.module.ts      # Configuración de rutas
│
├── pages/                                 # Smart Components (Páginas)
│   └── assessment-page/
│       ├── assessment-page.component.ts
│       └── assessment-page.component.html
│
├── components/                            # Dumb Components (Presentación)
│   ├── assessment-header/
│   ├── assessment-sidebar/
│   ├── assessment-hero/
│   ├── assessment-upload/
│   ├── assessment-metrics/
│   └── assessment-explorer/
│
├── services/                              # Servicios del módulo
│   └── code-assessment.service.ts
│
└── models/                                # Interfaces y tipos
    └── assessment.models.ts
```

### Principios Fundamentales

1. **Solo 2 niveles de componentes**: `pages/` (smart) y `components/` (dumb)
2. **Sin CSS dedicado**: Todo Tailwind en templates HTML
3. **Sin archivos de test**: Eliminar todos los `.spec.ts`
4. **Componentes pequeños**: Una responsabilidad por componente
5. **Reutilización**: Componer con componentes simples

---

## 🧩 Tipos de Componentes

### 1. Smart Components (Páginas)

**Ubicación**: `pages/`

**Responsabilidades**:
- Inyectar y usar servicios
- Manejar estado de la aplicación
- Coordinar múltiples componentes dumb
- Manejar lógica de negocio

**Características**:
```typescript
@Component({
  selector: 'app-assessment-page',
  template: `...`,  // Template inline o archivo HTML
  standalone: false
})
export class AssessmentPageComponent implements OnInit {
  // Observables del servicio
  files$ = this.assessmentService.files$;
  metrics$ = this.assessmentService.metrics$;
  
  constructor(
    private assessmentService: CodeAssessmentService
  ) {}
  
  // Métodos que coordinan acciones
  onAnalyze(): void {
    this.assessmentService.runAnalysis().subscribe();
  }
}
```

**Reglas**:
- ✅ Pueden inyectar servicios
- ✅ Manejan estado y lógica
- ✅ Coordinan componentes hijos
- ❌ NO tienen estilos complejos
- ❌ NO tienen lógica de presentación

### 2. Dumb Components (Presentación)

**Ubicación**: `components/`

**Responsabilidades**:
- Solo presentación visual
- Recibir datos vía `@Input()`
- Emitir eventos vía `@Output()`

**Características**:
```typescript
@Component({
  selector: 'app-assessment-header',
  template: `
    <header class="bg-white border-b px-6 py-4 flex justify-between items-center">
      <h1 class="text-xl font-semibold text-gray-900">{{ title }}</h1>
      
      <button 
        [disabled]="!canAnalyze"
        (click)="analyze.emit()"
        class="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 
               disabled:bg-gray-300 disabled:cursor-not-allowed">
        <lucide-icon name="play" class="w-4 h-4 inline mr-2"></lucide-icon>
        {{ buttonText }}
      </button>
    </header>
  `,
  standalone: false
})
export class AssessmentHeaderComponent {
  @Input() title = 'Code Assessment';
  @Input() canAnalyze = false;
  @Input() buttonText = 'Run Analysis';
  @Output() analyze = new EventEmitter<void>();
}
```

**Reglas**:
- ✅ Solo `@Input()` y `@Output()`
- ✅ Tailwind directo en template
- ✅ Sin lógica de negocio
- ❌ NO inyectan servicios (excepto muy específicos)
- ❌ NO tienen archivos `.css`
- ❌ NO tienen archivos `.spec.ts`

---

## 📝 Convenciones de Nombres

### Archivos y Componentes

```typescript
// ✅ CORRECTO - Nombre descriptivo con prefijo del módulo
assessment-header.component.ts
assessment-sidebar.component.ts
assessment-hero.component.ts

// ❌ INCORRECTO - Nombres genéricos sin contexto
header.component.ts
sidebar.component.ts
hero.component.ts
```

### Selectores

```typescript
// ✅ CORRECTO - Prefijo 'app-' + nombre descriptivo
selector: 'app-assessment-header'
selector: 'app-assessment-sidebar'

// ❌ INCORRECTO - Sin prefijo o muy genérico
selector: 'header'
selector: 'ca-header'  // Siglas difíciles de entender
```

### Clases y Variables

```typescript
// ✅ CORRECTO - Nombres claros y descriptivos
export class AssessmentHeaderComponent {}
canAnalyze: boolean
selectedFile: File | null

// ❌ INCORRECTO - Nombres ambiguos o abreviados
export class CAHeaderComponent {}
ca: boolean
sel: File
```

---

## 🎨 Reglas de Tailwind CSS

### 1. Sin Archivos CSS Dedicados

**NUNCA crear archivos `.css` para componentes**. Todo el estilo va directamente en el template HTML usando Tailwind.

```html
<!-- ✅ CORRECTO - Tailwind en template -->
<div class="flex items-center gap-3 px-4 py-3 bg-white rounded-lg border hover:bg-gray-50">
  <lucide-icon name="file" class="w-5 h-5 text-blue-600"></lucide-icon>
  <span class="text-sm font-medium text-gray-900">{{ filename }}</span>
</div>
```

```css
/* ❌ INCORRECTO - NO crear archivos CSS */
/* assessment-header.component.css */
.header {
  background: white;
  padding: 1rem;
}
```

### 2. Composición de Clases

Usar composición directa en lugar de clases custom:

```html
<!-- ✅ CORRECTO - Composición directa -->
<button class="px-4 py-2 bg-blue-600 text-white rounded-lg 
               hover:bg-blue-700 active:bg-blue-800 
               disabled:bg-gray-300 disabled:cursor-not-allowed
               transition-colors duration-200">
  Click me
</button>

<!-- ❌ INCORRECTO - Clases custom innecesarias -->
<button class="btn btn-primary">Click me</button>
```

### 3. Responsive Design

```html
<!-- ✅ CORRECTO - Mobile-first con breakpoints -->
<div class="flex flex-col md:flex-row gap-4 p-4 md:p-6">
  <aside class="w-full md:w-64">Sidebar</aside>
  <main class="flex-1">Content</main>
</div>
```

### 4. Estados Interactivos

Siempre incluir estados hover, focus, active y disabled:

```html
<!-- ✅ COMPLETO - Todos los estados -->
<button class="px-4 py-2 bg-blue-600 text-white rounded
               hover:bg-blue-700 
               focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2
               active:bg-blue-800
               disabled:bg-gray-300 disabled:cursor-not-allowed
               transition-all duration-200">
  Button
</button>
```

### 5. Paleta de Colores del Proyecto

**Colores principales**:
```typescript
// Usar estas clases de Tailwind consistentemente:

// Backgrounds
bg-white         // Fondo principal
bg-gray-50       // Fondo secundario
bg-gray-100      // Fondo hover suave

// Borders
border-gray-200  // Bordes suaves
border-gray-300  // Bordes más definidos

// Text
text-gray-900    // Texto principal
text-gray-600    // Texto secundario
text-gray-500    // Texto terciario

// Primary (Acciones principales)
bg-blue-600      // Botones primarios
text-blue-600    // Links y acentos
border-blue-500  // Focus rings

// Success
bg-green-600     // Éxito
text-green-700

// Warning
bg-yellow-500    // Advertencias
text-yellow-700

// Error
bg-red-600       // Errores
text-red-700
```

---

## 🔧 Patrones de Implementación

### 1. Comunicación Padre-Hijo

```typescript
// ============================================
// PADRE (Smart Component)
// ============================================
@Component({
  selector: 'app-assessment-page',
  template: `
    <app-assessment-header
      [title]="pageTitle"
      [canAnalyze]="hasFiles"
      (analyze)="onRunAnalysis()">
    </app-assessment-header>
    
    <app-assessment-sidebar
      [files]="files$ | async"
      [selectedFile]="selectedFile"
      (fileSelected)="onFileSelect($event)">
    </app-assessment-sidebar>
  `
})
export class AssessmentPageComponent {
  pageTitle = 'Code Assessment';
  hasFiles = false;
  selectedFile: File | null = null;
  files$ = this.service.getFiles();
  
  constructor(private service: CodeAssessmentService) {}
  
  onRunAnalysis(): void {
    this.service.runAnalysis().subscribe();
  }
  
  onFileSelect(file: File): void {
    this.selectedFile = file;
  }
}

// ============================================
// HIJO (Dumb Component)
// ============================================
@Component({
  selector: 'app-assessment-header',
  template: `
    <header class="bg-white border-b px-6 py-4">
      <h1>{{ title }}</h1>
      <button 
        [disabled]="!canAnalyze"
        (click)="analyze.emit()">
        Run Analysis
      </button>
    </header>
  `
})
export class AssessmentHeaderComponent {
  @Input() title!: string;
  @Input() canAnalyze = false;
  @Output() analyze = new EventEmitter<void>();
}
```

### 2. Manejo de Estado con Observables

```typescript
// ============================================
// SERVICE
// ============================================
@Injectable({ providedIn: 'root' })
export class CodeAssessmentService {
  private filesSubject = new BehaviorSubject<File[]>([]);
  files$ = this.filesSubject.asObservable();
  
  uploadFiles(files: File[]): void {
    this.filesSubject.next(files);
  }
  
  runAnalysis(): Observable<AnalysisResult> {
    return this.http.post<AnalysisResult>('/api/analyze', {});
  }
}

// ============================================
// COMPONENT
// ============================================
@Component({
  selector: 'app-assessment-page',
  template: `
    <app-assessment-explorer
      [files]="files$ | async">
    </app-assessment-explorer>
  `
})
export class AssessmentPageComponent {
  files$ = this.service.files$;
  
  constructor(private service: CodeAssessmentService) {}
}
```

### 3. Conditional Rendering

```html
<!-- ✅ CORRECTO - Estados claros con *ngIf -->
<app-assessment-hero 
  *ngIf="!hasFiles"
  (upload)="onUpload($event)">
</app-assessment-hero>

<app-assessment-metrics 
  *ngIf="hasFiles && metrics"
  [metrics]="metrics">
</app-assessment-metrics>

<app-assessment-loading 
  *ngIf="isLoading">
</app-assessment-loading>

<app-assessment-error 
  *ngIf="error"
  [message]="error">
</app-assessment-error>
```

---

## 🎯 Integración de Lucide Icons

### Instalación

```bash
npm install lucide-angular
```

### Configuración en Módulo

```typescript
import { LucideAngularModule, FileText, Play, Upload, Check } from 'lucide-angular';

@NgModule({
  imports: [
    LucideAngularModule.pick({ FileText, Play, Upload, Check })
  ]
})
export class CodeAssessmentModule {}
```

### Uso en Templates

```html
<!-- ✅ CORRECTO - Iconos con clases Tailwind -->
<lucide-icon 
  name="play" 
  class="w-5 h-5 text-blue-600">
</lucide-icon>

<button class="flex items-center gap-2">
  <lucide-icon name="upload" class="w-4 h-4"></lucide-icon>
  <span>Upload Files</span>
</button>
```

### Iconos Comunes del Proyecto

```typescript
// Usar estos iconos consistentemente:
'play'           // Run/Execute
'upload'         // Upload files
'file-text'      // Document/File
'folder'         // Directory
'check'          // Success/Complete
'x'              // Close/Error
'alert-circle'   // Warning
'info'           // Information
'chevron-right'  // Navigation
'chevron-down'   // Expand
'search'         // Search
'settings'       // Configuration
```

---

## 📦 Estructura de Módulos

### Módulo Principal

```typescript
import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { LucideAngularModule, FileText, Play, Upload } from 'lucide-angular';

import { CodeAssessmentRoutingModule } from './code-assessment-routing.module';

// Pages
import { AssessmentPageComponent } from './pages/assessment-page/assessment-page.component';

// Components
import { AssessmentHeaderComponent } from './components/assessment-header/assessment-header.component';
import { AssessmentSidebarComponent } from './components/assessment-sidebar/assessment-sidebar.component';
import { AssessmentHeroComponent } from './components/assessment-hero/assessment-hero.component';

@NgModule({
  declarations: [
    // Pages
    AssessmentPageComponent,
    // Components
    AssessmentHeaderComponent,
    AssessmentSidebarComponent,
    AssessmentHeroComponent
  ],
  imports: [
    CommonModule,
    CodeAssessmentRoutingModule,
    LucideAngularModule.pick({ FileText, Play, Upload })
  ]
})
export class CodeAssessmentModule {}
```

### Routing Module

```typescript
import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { AssessmentPageComponent } from './pages/assessment-page/assessment-page.component';

const routes: Routes = [
  {
    path: '',
    component: AssessmentPageComponent
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class CodeAssessmentRoutingModule {}
```

---

## ⚠️ Prohibiciones y Anti-patrones

### ❌ NO HACER

```typescript
// ❌ NO crear archivos CSS
// assessment-header.component.css

// ❌ NO crear archivos de test
// assessment-header.component.spec.ts

// ❌ NO usar clases CSS custom innecesarias
<div class="custom-card"></div>

// ❌ NO inyectar servicios en componentes dumb
@Component({...})
export class AssessmentHeaderComponent {
  constructor(private service: SomeService) {} // ❌ MAL
}

// ❌ NO usar subcarpetas innecesarias
components/
  ├── layout/     // ❌ NO
  ├── ui/         // ❌ NO
  └── features/   // ❌ NO

// ❌ NO usar prefijos crípticos
selector: 'ca-header'  // ❌ ¿Qué es "ca"?
```

### ✅ SÍ HACER

```typescript
// ✅ Tailwind directo en templates
<div class="bg-white p-4 rounded-lg shadow"></div>

// ✅ Solo @Input/@Output en componentes dumb
@Component({...})
export class AssessmentHeaderComponent {
  @Input() title!: string;
  @Output() analyze = new EventEmitter<void>();
}

// ✅ Estructura plana y clara
components/
  ├── assessment-header/
  ├── assessment-sidebar/
  └── assessment-hero/

// ✅ Nombres descriptivos
selector: 'app-assessment-header'  // ✅ Claro y descriptivo
```

---

## 🚀 Checklist de Componente Nuevo

Cuando crees un componente nuevo, verifica:

- [ ] ¿Está en `pages/` (smart) o `components/` (dumb)?
- [ ] ¿Tiene nombre descriptivo con prefijo `assessment-`?
- [ ] ¿Usa selector con prefijo `app-`?
- [ ] ¿NO tiene archivo `.css`?
- [ ] ¿NO tiene archivo `.spec.ts`?
- [ ] ¿Usa solo Tailwind en el template?
- [ ] ¿Componentes dumb solo usan @Input/@Output?
- [ ] ¿Iconos de Lucide están configurados?
- [ ] ¿Colores siguen la paleta del proyecto?
- [ ] ¿Tiene todos los estados (hover, focus, disabled)?

---

## 📚 Ejemplos Completos

### Ejemplo 1: Header Component

```typescript
// assessment-header.component.ts
import { Component, Input, Output, EventEmitter } from '@angular/core';

@Component({
  selector: 'app-assessment-header',
  template: `
    <header class="bg-white border-b border-gray-200 px-6 py-4 flex justify-between items-center">
      <div class="flex items-center gap-3">
        <lucide-icon name="file-text" class="w-6 h-6 text-blue-600"></lucide-icon>
        <h1 class="text-xl font-semibold text-gray-900">{{ title }}</h1>
      </div>
      
      <div class="flex items-center gap-3">
        <button
          *ngIf="showAnalyze"
          [disabled]="!canAnalyze"
          (click)="analyze.emit()"
          class="flex items-center gap-2 px-4 py-2 
                 bg-blue-600 text-white text-sm font-medium rounded-lg
                 hover:bg-blue-700 active:bg-blue-800
                 disabled:bg-gray-300 disabled:cursor-not-allowed
                 transition-colors duration-200">
          <lucide-icon name="play" class="w-4 h-4"></lucide-icon>
          <span>{{ analyzeText }}</span>
        </button>
      </div>
    </header>
  `,
  standalone: false
})
export class AssessmentHeaderComponent {
  @Input() title = 'Code Assessment';
  @Input() showAnalyze = true;
  @Input() canAnalyze = false;
  @Input() analyzeText = 'Run Analysis';
  @Output() analyze = new EventEmitter<void>();
}
```

### Ejemplo 2: Sidebar Component

```typescript
// assessment-sidebar.component.ts
import { Component, Input, Output, EventEmitter } from '@angular/core';

interface FileNode {
  name: string;
  path: string;
  type: 'file' | 'folder';
  children?: FileNode[];
}

@Component({
  selector: 'app-assessment-sidebar',
  template: `
    <aside class="w-64 bg-white border-r border-gray-200 flex flex-col">
      <!-- Header -->
      <div class="px-4 py-3 border-b border-gray-200">
        <h2 class="text-sm font-semibold text-gray-900">Files</h2>
      </div>
      
      <!-- File List -->
      <div class="flex-1 overflow-y-auto p-2">
        <div *ngIf="!files || files.length === 0" 
             class="text-center py-8 text-gray-500 text-sm">
          No files uploaded
        </div>
        
        <div *ngFor="let file of files" 
             (click)="fileSelected.emit(file)"
             [class.bg-blue-50]="file.path === selectedPath"
             class="flex items-center gap-2 px-3 py-2 rounded-lg
                    hover:bg-gray-100 cursor-pointer
                    transition-colors duration-150">
          <lucide-icon 
            [name]="file.type === 'folder' ? 'folder' : 'file-text'" 
            class="w-4 h-4"
            [class.text-yellow-600]="file.type === 'folder'"
            [class.text-gray-600]="file.type === 'file'">
          </lucide-icon>
          <span class="text-sm text-gray-900 truncate">{{ file.name }}</span>
        </div>
      </div>
    </aside>
  `,
  standalone: false
})
export class AssessmentSidebarComponent {
  @Input() files: FileNode[] = [];
  @Input() selectedPath: string | null = null;
  @Output() fileSelected = new EventEmitter<FileNode>();
}
```

### Ejemplo 3: Hero Component

```typescript
// assessment-hero.component.ts
import { Component, Output, EventEmitter } from '@angular/core';

@Component({
  selector: 'app-assessment-hero',
  template: `
    <div class="flex-1 flex items-center justify-center p-8">
      <div class="max-w-md text-center">
        <!-- Icon -->
        <div class="mb-6 flex justify-center">
          <div class="w-20 h-20 bg-blue-100 rounded-full flex items-center justify-center">
            <lucide-icon name="upload" class="w-10 h-10 text-blue-600"></lucide-icon>
          </div>
        </div>
        
        <!-- Title -->
        <h2 class="text-2xl font-bold text-gray-900 mb-2">
          Upload Your Code
        </h2>
        
        <!-- Description -->
        <p class="text-gray-600 mb-8">
          Drag and drop your project files or click below to select files for analysis
        </p>
        
        <!-- Upload Button -->
        <button
          (click)="fileInput.click()"
          class="px-6 py-3 bg-blue-600 text-white font-medium rounded-lg
                 hover:bg-blue-700 active:bg-blue-800
                 transition-colors duration-200">
          Select Files
        </button>
        
        <!-- Hidden Input -->
        <input
          #fileInput
          type="file"
          multiple
          (change)="onFileChange($event)"
          class="hidden">
      </div>
    </div>
  `,
  standalone: false
})
export class AssessmentHeroComponent {
  @Output() filesSelected = new EventEmitter<FileList>();
  
  onFileChange(event: Event): void {
    const input = event.target as HTMLInputElement;
    if (input.files) {
      this.filesSelected.emit(input.files);
    }
  }
}
```

### Ejemplo 4: Page Component (Smart)

```typescript
// assessment-page.component.ts
import { Component, OnInit } from '@angular/core';
import { CodeAssessmentService } from '../../services/code-assessment.service';

@Component({
  selector: 'app-assessment-page',
  template: `
    <div class="flex h-screen bg-gray-50">
      <!-- Sidebar -->
      <app-assessment-sidebar
        [files]="files$ | async"
        [selectedPath]="selectedPath"
        (fileSelected)="onFileSelect($event)">
      </app-assessment-sidebar>
      
      <!-- Main Content -->
      <div class="flex-1 flex flex-col overflow-hidden">
        <!-- Header -->
        <app-assessment-header
          [canAnalyze]="hasFiles"
          (analyze)="onAnalyze()">
        </app-assessment-header>
        
        <!-- Content Area -->
        <main class="flex-1 overflow-y-auto">
          <!-- Hero (Empty State) -->
          <app-assessment-hero
            *ngIf="!hasFiles"
            (filesSelected)="onFilesUploaded($event)">
          </app-assessment-hero>
          
          <!-- Metrics (After Upload) -->
          <app-assessment-metrics
            *ngIf="hasFiles && (metrics$ | async) as metrics"
            [metrics]="metrics">
          </app-assessment-metrics>
          
          <!-- Loading -->
          <div *ngIf="isAnalyzing" 
               class="flex items-center justify-center py-12">
            <div class="text-center">
              <div class="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
              <p class="text-gray-600">Analyzing code...</p>
            </div>
          </div>
        </main>
      </div>
    </div>
  `,
  standalone: false
})
export class AssessmentPageComponent implements OnInit {
  files$ = this.service.files$;
  metrics$ = this.service.metrics$;
  
  hasFiles = false;
  selectedPath: string | null = null;
  isAnalyzing = false;
  
  constructor(private service: CodeAssessmentService) {}
  
  ngOnInit(): void {
    this.files$.subscribe(files => {
      this.hasFiles = files.length > 0;
    });
  }
  
  onFilesUploaded(fileList: FileList): void {
    const files = Array.from(fileList);
    this.service.uploadFiles(files).subscribe({
      next: () => console.log('Files uploaded'),
      error: (err) => console.error('Upload failed', err)
    });
  }
  
  onFileSelect(file: any): void {
    this.selectedPath = file.path;
  }
  
  onAnalyze(): void {
    this.isAnalyzing = true;
    this.service.runAnalysis().subscribe({
      next: () => this.isAnalyzing = false,
      error: () => this.isAnalyzing = false
    });
  }
}
```

---

## 🎓 Resumen Final

### Arquitectura

- **2 niveles**: `pages/` (smart) + `components/` (dumb)
- **Sin CSS**: Solo Tailwind en templates
- **Sin tests**: Eliminar `.spec.ts`

### Componentes

- **Smart**: Servicios, estado, coordinación
- **Dumb**: Solo presentación, @Input/@Output
- **Nombres**: Descriptivos con prefijo `assessment-`

### Estilos

- **Tailwind directo** en HTML
- **Paleta consistente**: gray-50/100/200, blue-600, etc.
- **Estados completos**: hover, focus, active, disabled

### Iconos

- **Lucide Angular** para todos los iconos
- **Configurar** en el módulo con `.pick()`
- **Clases Tailwind** para tamaño y color

---

**Este documento debe ser la referencia principal para todo el desarrollo del módulo Code Assessment. Cualquier desviación debe ser justificada y documentada.**