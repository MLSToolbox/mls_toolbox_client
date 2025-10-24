# Code Assessment API Integration

## 📋 Descripción

Esta integración conecta el frontend de Code Assessment con el backend de análisis de código que procesa proyectos Python empaquetados en archivos ZIP.

## 🔌 Endpoint Conectado

### POST `/api/upload-zip`

**URL completa:** `http://0.0.0.0:5060/api/upload-zip`

**Formato:** `multipart/form-data`

**Parámetros:**
- `file`: Archivo ZIP del proyecto (campo requerido con nombre exacto "file")

**Respuesta exitosa (200):**
```json
{
  "success": true,
  "data": {
    "session_id": "uuid-string",
    "tree_structure": {
      "name": "root",
      "type": "directory",
      "path": "/",
      "children": [...]
    },
    "auto_detected_pipeline": {
      "is_valid_pipeline": true,
      "files_analyzed": 92,
      "detected_stages": {
        "data_collection": [...],
        "data_cleaning": [...],
        "feature_engineering": [...],
        "model_training": [...],
        "model_evaluation": [...]
      },
      "missing_stages": []
    }
  }
}
```

## 🏗️ Arquitectura de Componentes

### 1. **CodeAnalysisService** (`services/code-analysis.service.ts`)
- **Responsabilidad:** Comunicación HTTP con el backend
- **Métodos principales:**
  - `uploadProjectZip(file: File): Observable<AnalysisResponse>` - Envía el archivo ZIP al backend
  - `formatFileSize(bytes: number): string` - Formatea tamaños de archivo

### 2. **CodeAssessComponent** (componente padre)
- **Responsabilidad:** Orquestación de la lógica de análisis
- **Estado principal:**
  - `selectedFile: File | null` - Archivo ZIP seleccionado
  - `isAnalyzing: boolean` - Indica si hay análisis en progreso
  - `analysisCompleted: boolean` - Indica si el análisis finalizó
  - `treeStructure: TreeNode | null` - Estructura de archivos del proyecto
  - `detectedPipeline: any` - Pipeline ML detectado

### 3. **CodeAssessHeroComponent**
- **Responsabilidad:** Input de archivo ZIP
- **Eventos:** `@Output() fileUpload: EventEmitter<File>`
- **Validaciones:**
  - Solo archivos `.zip`
  - Máximo 50MB
  - Deshabilitado durante análisis

### 4. **CodeAssessHeaderComponent**
- **Responsabilidad:** Botón "Run analysis"
- **Props:** 
  - `@Input() isAnalyzing: boolean`
  - `@Input() hasFile: boolean`
- **Estados visuales:**
  - Normal: "Run analysis" con ícono play
  - Analyzing: "Analizando..." con spinner
  - Disabled: Opacidad reducida cuando no hay archivo

### 5. **CodeAssessExplorerComponent**
- **Responsabilidad:** Visualización del proyecto analizado
- **Props:**
  - `@Input() fileName: string`
  - `@Input() fileSize: string`
  - `@Input() treeStructure: TreeNode | null`
  - `@Input() isAnalyzing: boolean`
- **Estados:**
  - Empty: Sin archivo subido
  - Analyzing: Spinner animado
  - Complete: Árbol de archivos con badges de estado

### 6. **CodeAssessAnalysisFormComponent**
- **Responsabilidad:** Selector de tipo de análisis
- **Props:** `@Input() disabled: boolean`
- **Opciones:** Cohesion, Coupling, All
- **Nota:** Actualmente informativo, el backend ejecuta análisis completo automáticamente

## 🔄 Flujo de Ejecución

```
1. Usuario selecciona archivo .zip
   └─> CodeAssessHeroComponent.onFileSelected()
       └─> Validación (tipo, tamaño)
           └─> Emite: fileUpload.emit(file)

2. CodeAssessComponent.onFileUpload(file)
   └─> Validaciones adicionales
   └─> Almacena: selectedFile, selectedFileName, selectedFileSize
   └─> Llama: startAnalysis()

3. CodeAssessComponent.startAnalysis()
   └─> Activa: isAnalyzing = true
   └─> CodeAnalysisService.uploadProjectZip(file)
       └─> HTTP POST → http://0.0.0.0:5060/api/upload-zip
           └─> FormData con campo "file"

4. Respuesta del servidor
   ├─> Success:
   │   ├─> Almacena: sessionId, treeStructure, detectedPipeline
   │   ├─> Notifica: MessageService (success toast)
   │   └─> Actualiza: isAnalyzing = false, analysisCompleted = true
   │
   └─> Error:
       ├─> Notifica: MessageService (error toast con mensaje)
       └─> Actualiza: isAnalyzing = false

5. Explorer muestra resultados
   └─> CodeAssessExplorerComponent renderiza:
       ├─> Nombre y tamaño del archivo
       ├─> Badge de estado (Complete/Analyzing/Pending)
       ├─> Preview de archivos (primeros 10)
       └─> Contador total de archivos
```

## 🚀 Cómo Usar

### Requisitos Previos
1. Backend ejecutándose en `http://0.0.0.0:5060`
2. Angular dev server con proxy configurado (`ng serve`)

### Pasos para Probar
1. Navega a `/assess`
2. Haz clic en "Upload project (.zip)"
3. Selecciona un archivo ZIP de proyecto Python
4. El análisis se ejecuta automáticamente
5. Observa:
   - Spinner en botón de upload y header
   - Toast de "Analizando"
   - Explorer muestra "Analyzing..."
6. Al completar:
   - Toast de "Éxito" con cantidad de archivos
   - Explorer muestra estructura del proyecto
   - Badge cambia a "Complete"

### Archivos de Prueba Sugeridos
- Proyecto Python con estructura ML típica
- Contener: data_collection, data_cleaning, feature_engineering, model_training, model_evaluation
- Tamaño: < 50MB
- Formato: `.zip`

## 🔧 Configuración

### Proxy Configuration (`src/proxy.config.json`)
```json
{
  "/api/upload-zip": {
    "target": "http://0.0.0.0:5060",
    "secure": false,
    "changeOrigin": true
  }
}
```

### Módulo Configuration
- `HttpClientModule` importado en `CodeAssessmentModule`
- `FormsModule` para ngModel en formularios
- `MessageService` de PrimeNG para notificaciones

## 🐛 Troubleshooting

### Error: "Cannot connect to server"
- **Causa:** Backend no está ejecutándose
- **Solución:** Iniciar backend en puerto 5060
- **Verificar:** `curl http://0.0.0.0:5060/api/upload-zip` debería responder

### Error: "Only ZIP files allowed"
- **Causa:** Archivo seleccionado no es .zip
- **Solución:** Comprimir proyecto en formato ZIP

### Error: "File too large"
- **Causa:** Archivo supera 50MB
- **Solución:** Reducir tamaño eliminando archivos innecesarios (node_modules, venv, etc.)

### Backend responde pero sin datos
- **Verificar:** Campo FormData debe llamarse exactamente "file"
- **Verificar:** Content-Type debe ser multipart/form-data (automático en Angular)
- **Verificar:** Backend logs para errores de procesamiento

## 📊 Tipos de Datos

### TreeNode Interface
```typescript
interface TreeNode {
  name: string;              // Nombre del archivo/directorio
  path: string;              // Ruta completa
  type: 'file' | 'directory'; // Tipo de nodo
  size?: number;             // Tamaño en bytes (solo archivos)
  valid_syntax?: boolean;    // Validación de sintaxis Python
  children?: TreeNode[];     // Hijos (solo directorios)
}
```

### AnalysisResponse Interface
```typescript
interface AnalysisResponse {
  success: boolean;
  data: {
    session_id: string;
    tree_structure: TreeNode;
    auto_detected_pipeline: {
      is_valid_pipeline: boolean;
      files_analyzed: number;
      detected_stages: {
        data_collection?: DetectedFile[];
        data_cleaning?: DetectedFile[];
        feature_engineering?: DetectedFile[];
        model_training?: DetectedFile[];
        model_evaluation?: DetectedFile[];
      };
      missing_stages: string[];
    };
  };
}
```

## 🔮 Próximos Pasos

### Funcionalidad Pendiente
- [ ] Implementar árbol de archivos colapsable/expandible
- [ ] Mostrar detalles de pipeline detectado
- [ ] Visualizar archivos con sintaxis inválida
- [ ] Integrar tipo de análisis seleccionado (cohesion/coupling)
- [ ] Descargar reportes de análisis
- [ ] Historial de sesiones analizadas
- [ ] Comparación entre versiones de proyecto

### Mejoras de UX
- [ ] Drag & drop para archivo ZIP
- [ ] Barra de progreso durante upload
- [ ] Preview de código en modal
- [ ] Exportar resultados a PDF/JSON
- [ ] Filtros por tipo de archivo
- [ ] Búsqueda en estructura de proyecto

## 📝 Notas Técnicas

- **No hardcodeamos el endpoint:** URL configurada en `CodeAnalysisService.API_URL`
- **HttpClient:** Angular maneja automáticamente Content-Type para FormData
- **Observables:** Patrón reactivo con RxJS para manejo asíncrono
- **Error handling:** Captura tanto errores HTTP como de validación
- **Memory leaks:** Observable se completa automáticamente tras respuesta
- **Type safety:** Interfaces TypeScript para respuesta del servidor

## 👥 Contacto

Para dudas sobre la integración, revisar:
1. Logs de consola del navegador (F12)
2. Network tab para ver request/response
3. Backend logs para errores del servidor
4. Este README para referencia de tipos y flujos
