import { Component, Input, Output, EventEmitter, OnChanges, SimpleChanges } from '@angular/core';
import { 
  AnalysisResponse, 
  TreeNode,
  ProjectAnalysisResponse,
  CohesionLevel,
  PurityLevel,
  FPCFileDetails,
  PFPPackageDetails,
  CodeAnalysisService,
  MetricNodeDetails,
  MetricRegistryService
} from '@app/core';

interface FileTreeNode {
  name: string;
  path: string;
  type: 'file' | 'directory';
  size?: number;
  validSyntax?: boolean;
  children?: FileTreeNode[];
  expanded?: boolean;
  selected?: boolean;
  level?: number;
  qualityColor?: 'green' | 'yellow' | 'red' | null;
  
  // Sistema de métricas múltiples (nuevo)
  metrics?: {
    [metricId: string]: MetricNodeDetails;
  };
  
  // Mantener compatibilidad temporal con código existente
  fpcData?: FPCFileDetails;
  pfpData?: PFPPackageDetails;
}

@Component({
  selector: 'app-code-assess-explorer',
  templateUrl: './code-assess-explorer.component.html',
  styleUrl: './code-assess-explorer.component.css'
})
export class CodeAssessExplorerComponent implements OnChanges {
  @Input() projectFileName: string = '';
  @Input() projectFileSize: string = '';
  @Input() analysisData: AnalysisResponse | null = null;
  @Input() analysisResults: ProjectAnalysisResponse | null = null;
  
  @Output() nodeSelected = new EventEmitter<FileTreeNode>();
  
  // Datos del árbol
  rootNodes: FileTreeNode[] = [];
  filesAnalyzed: number = 0;
  isValidPipeline: boolean = false;
  
  // Nodo seleccionado para mostrar detalles de métricas
  selectedNode: FileTreeNode | null = null;
  showMetricDetails: boolean = false;
  
  // Métrica actualmente seleccionada para mostrar (por defecto la primera disponible)
  activeMetricId: string | null = null;
  
  constructor(
    private codeAnalysisService: CodeAnalysisService,
    public metricRegistry: MetricRegistryService
  ) {}
  
  ngOnChanges(changes: SimpleChanges): void {
    if (changes['analysisData'] && this.analysisData) {
      this.processAnalysisData();
    }
    
    // Cuando llegan los resultados del análisis, aplicar colores
    if (changes['analysisResults'] && this.analysisResults) {
      this.applyAnalysisColors();
    }
  }
  
  get hasProject(): boolean {
    return !!this.projectFileName;
  }
  
  get hasTreeData(): boolean {
    return this.rootNodes.length > 0;
  }
  
  private processAnalysisData(): void {
    if (!this.analysisData) return;
    
   
    
    // Extraer información del pipeline
    this.filesAnalyzed = this.analysisData.data.auto_detected_pipeline.files_analyzed;
    this.isValidPipeline = this.analysisData.data.auto_detected_pipeline.is_valid_pipeline;
    
    // Obtener el árbol del backend
    const treeStructure = this.analysisData.data.tree_structure;
    
    // Los children del root son los nodos principales del proyecto
    if (treeStructure.children && treeStructure.children.length > 0) {
      this.rootNodes = treeStructure.children.map((node: any) => this.convertNode(node, 0));
    }
    
   
  }
  
  private convertNode(node: TreeNode, level: number): FileTreeNode {
    return {
      name: node.name,
      path: node.path,
      type: node.type,
      size: node.size,
      validSyntax: node.valid_syntax,
      children: node.children?.map((child: any) => this.convertNode(child, level + 1)) || [],
      expanded: false,
      selected: false,
      level: level
    };
  }
  
  // Toggle expand/collapse de un nodo
  toggleNode(node: FileTreeNode): void {
    if (node.type === 'directory') {
      node.expanded = !node.expanded;
    }
  }
  
  // Toggle selección de un nodo con recursión
  toggleSelection(node: FileTreeNode, event?: Event): void {
    if (event) {
      event.stopPropagation();
    }
    
    node.selected = !node.selected;
    
    
    if (node.type === 'directory' && node.children && node.children.length > 0) {
      this.selectAllChildren(node.children, node.selected);
    }
    
    
  }
  
  // Seleccionar/deseleccionar recursivamente todos los children
  private selectAllChildren(children: FileTreeNode[], selected: boolean): void {
    for (const child of children) {
      child.selected = selected;
      if (child.children && child.children.length > 0) {
        this.selectAllChildren(child.children, selected);
      }
    }
  }
  
  // Obtener todos los nodos visibles (para renderizar)
  getVisibleNodes(): FileTreeNode[] {
    const visible: FileTreeNode[] = [];
    
    const traverse = (nodes: FileTreeNode[]) => {
      for (const node of nodes) {
        visible.push(node);
        if (node.expanded && node.children && node.children.length > 0) {
          traverse(node.children);
        }
      }
    };
    
    traverse(this.rootNodes);
    return visible;
  }
  
  // Helper para formatear tamaño de archivo
  formatSize(bytes: number): string {
    return this.codeAnalysisService.formatFileSize(bytes);
  }
  
  // Obtener el icono según el tipo de nodo
  getIcon(node: FileTreeNode): string {
    if (node.type === 'directory') {
      return node.expanded ? '▼' : '▶';
    }
    
    // Icono simple para archivos
    return '�';
  }
  
  // Obtener el color del icono de carpeta (amarillo/dorado como VS Code)
  getFolderIconColor(node: FileTreeNode): string {
    if (node.type === 'directory') {
      return '#C09553'; // Amarillo/dorado como VS Code
    }
    return '#858585'; // Gris para triángulos
  }
  
  // Calcular el padding basado en el nivel
  getPaddingLeft(level: number): string {
    return `${level * 20}px`;
  }
  
  /**
   * Aplica colores a los nodos del árbol basándose en los resultados del análisis
   */
  private applyAnalysisColors(): void {
    if (!this.analysisResults) return;
    
    
    
    const results = this.analysisResults.data.results;
    
    // Mapear colores de FPC (archivos)
    if (results.fpc) {
      console.log('📊 FPC Files:', Object.keys(results.fpc.details.files));
      this.applyFPCColors(results.fpc.details.files);
    }
    
    // Mapear colores de PFP (paquetes/directorios)
    if (results.pfp) {
    
      this.applyPFPColors(results.pfp.details.packages);
    }
    
    
  }
  

  private applyFPCColors(files: { [filePath: string]: any }): void {
    const normalizePath = (path: string) => {
      // Normalizar: convertir backslashes a forward slashes
      return path.replace(/\\/g, '/').toLowerCase();
    };
    
    const getPathSegments = (path: string) => {
      return normalizePath(path).split('/').filter(s => s.length > 0);
    };
    
    const pathsMatch = (nodePath: string, filePath: string): boolean => {
      const nodeSegments = getPathSegments(nodePath);
      const fileSegments = getPathSegments(filePath);
      
      // Si el file path es más largo que el node path, no puede coincidir
      if (fileSegments.length > nodeSegments.length) {
        return false;
      }
      
      // Verificar si los últimos N segmentos del node path coinciden con el file path
      // Por ejemplo: node="project/src/data/preprocess.py" debería coincidir con file="src/data/preprocess.py"
      const nodeEndSegments = nodeSegments.slice(-fileSegments.length);
      return nodeEndSegments.every((seg, i) => seg === fileSegments[i]);
    };
    
    // Recorrer todos los nodos y aplicar colores
    const applyToNodes = (nodes: FileTreeNode[]) => {
      for (const node of nodes) {
        if (node.type === 'file') {
          console.log(`🔍 Checking file: ${node.path}`);
          
          // Buscar coincidencia en los archivos analizados
          for (const [filePath, fileData] of Object.entries(files)) {
            if (pathsMatch(node.path, filePath)) {
              node.qualityColor = this.mapCohesionToColor(fileData.cohesion_level);
              node.fpcData = fileData; // Guardar datos completos para mostrar detalles
              
              break;
            }
          }
        }
        
        // Recursión para hijos
        if (node.children) {
          applyToNodes(node.children);
        }
      }
    };
    
    applyToNodes(this.rootNodes);
  }
  

  private applyPFPColors(packages: { [packagePath: string]: any }): void {
    const normalizePath = (path: string) => {
      // Normalizar: convertir backslashes a forward slashes y eliminar trailing slash
      return path.replace(/\\/g, '/').replace(/\/$/, '').toLowerCase();
    };
    
    const getPathSegments = (path: string) => {
      return normalizePath(path).split('/').filter(s => s.length > 0);
    };
    
    const pathsMatch = (nodePath: string, packagePath: string): boolean => {
      const nodeSegments = getPathSegments(nodePath);
      const packageSegments = getPathSegments(packagePath);
      
      // Si el package path es más largo que el node path, no puede coincidir
      if (packageSegments.length > nodeSegments.length) {
        return false;
      }
      
      // Verificar si los últimos N segmentos del node path coinciden con el package path
      // Por ejemplo: node="project/src/data" debería coincidir con package="src/data"
      const nodeEndSegments = nodeSegments.slice(-packageSegments.length);
      return nodeEndSegments.every((seg, i) => seg === packageSegments[i]);
    };
    
    // Recorrer todos los nodos y aplicar colores
    const applyToNodes = (nodes: FileTreeNode[]) => {
      for (const node of nodes) {
        if (node.type === 'directory') {
          console.log(`🔍 Checking directory: ${node.path}`);
          
          // Buscar coincidencia en los paquetes analizados
          for (const [packagePath, packageData] of Object.entries(packages)) {
            if (pathsMatch(node.path, packagePath)) {
              node.qualityColor = this.mapPurityToColor(packageData.metrics.purity_level);
              node.pfpData = packageData; // Guardar datos completos para mostrar detalles
              
              break;
            }
          }
        }
        
        // Recursión para hijos
        if (node.children) {
          applyToNodes(node.children);
        }
      }
    };
    
    applyToNodes(this.rootNodes);
  }
  
  /**
   * Mapea cohesion_level (FPC) a color
   * high → verde, medium → amarillo, low → rojo
   */
  private mapCohesionToColor(cohesionLevel: CohesionLevel): 'green' | 'yellow' | 'red' {
    switch (cohesionLevel) {
      case 'high':
        return 'green';
      case 'medium':
        return 'yellow';
      case 'low':
        return 'red';
      default:
        return 'yellow';
    }
  }
  
  /**
   * Mapea purity_level (PFP) a color
   * High → verde, Moderate → amarillo, Low/Very Low → rojo
   */
  private mapPurityToColor(purityLevel: PurityLevel): 'green' | 'yellow' | 'red' {
    switch (purityLevel) {
      case 'High':
        return 'green';
      case 'Moderate':
        return 'yellow';
      case 'Low':
      case 'Very Low':
        return 'red';
      default:
        return 'yellow';
    }
  }
  

  showNodeMetrics(node: FileTreeNode, event: MouseEvent): void {
    event.stopPropagation();
    
    // Verificar si el nodo tiene métricas (nuevo sistema o legacy)
    if (node.metrics || node.fpcData || node.pfpData) {
      // Emitir evento al componente padre
      this.nodeSelected.emit(node);
      
      // Mantener compatibilidad con el modal antiguo (opcional)
      this.selectedNode = node;
      this.showMetricDetails = false; // Desactivar modal, usar panel lateral
      
      // Establecer la primera métrica disponible como activa
      this.activeMetricId = this.getAvailableMetrics(node)[0] || null;
    }
  }
  
  closeMetricDetails(): void {
    this.showMetricDetails = false;
    this.selectedNode = null;
    this.activeMetricId = null;
  }
  
  hasMetrics(node: FileTreeNode): boolean {
    return !!(node.metrics || node.fpcData || node.pfpData);
  }
  
  /**
   * Obtiene las IDs de todas las métricas disponibles para un nodo
   */
  getAvailableMetrics(node: FileTreeNode): string[] {
    const metricsIds: string[] = [];
    
    // Nuevo sistema de métricas
    if (node.metrics) {
      metricsIds.push(...Object.keys(node.metrics));
    }
    
    // Legacy: FPC y PFP
    if (node.fpcData && !metricsIds.includes('FPC')) {
      metricsIds.push('FPC');
    }
    if (node.pfpData && !metricsIds.includes('PFP')) {
      metricsIds.push('PFP');
    }
    
    return metricsIds;
  }
  
  /**
   * Obtiene los datos de una métrica específica del nodo
   */
  getMetricData(node: FileTreeNode, metricId: string): MetricNodeDetails | FPCFileDetails | PFPPackageDetails | null {
    // Intentar en el nuevo sistema
    if (node.metrics?.[metricId]) {
      return node.metrics[metricId];
    }
    
    // Fallback a legacy
    if (metricId === 'FPC' && node.fpcData) {
      return node.fpcData;
    }
    if (metricId === 'PFP' && node.pfpData) {
      return node.pfpData;
    }
    
    return null;
  }
  
  /**
   * Cambia la métrica activa mostrada en el panel
   */
  setActiveMetric(metricId: string): void {
    this.activeMetricId = metricId;
  }
}
