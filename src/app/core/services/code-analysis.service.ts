import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';
import { 
  AnalysisResponse, 
  TreeNode,
  ProjectAnalysisRequest,
  ProjectAnalysisResponse,
  AnalyzerType
} from '@app/core/models';

// Interface para PrimeNG TreeNode (UI específico)
export interface PrimeNGTreeNode {
  label?: string;
  data?: any;
  icon?: string;
  expandedIcon?: string;
  collapsedIcon?: string;
  children?: PrimeNGTreeNode[];
  leaf?: boolean;
  expanded?: boolean;
  type?: string;
  styleClass?: string;
  selectable?: boolean;
}

@Injectable({
  providedIn: 'root'
})
export class CodeAnalysisService {
  // Usar ruta relativa para que funcione con el proxy de Angular
  private readonly API_URL = '/api';

  constructor(private http: HttpClient) {}

  /**
   * Sube un archivo ZIP para análisis
   * @param file Archivo ZIP del proyecto
   * @returns Observable con la respuesta del análisis
   */
  uploadProjectZip(file: File): Observable<AnalysisResponse> {
    const formData = new FormData();
    formData.append('file', file);

    // Usar el endpoint configurado
    const endpoint = `${this.API_URL}/upload-zip`;
    
    // No establecer Content-Type manualmente, el navegador lo hace con el boundary correcto
    return this.http.post<AnalysisResponse>(
      endpoint,
      formData
    );
  }

  /**
   * Ejecuta el análisis de proyecto con los analizadores especificados
   * @param sessionId ID de sesión obtenido del upload
   * @param analyzers Array de analizadores a ejecutar ('fpc', 'pfp')
   * @returns Observable con la respuesta del análisis
   */
  analyzeProject(sessionId: string, analyzers: AnalyzerType[]): Observable<ProjectAnalysisResponse> {
    const endpoint = `${this.API_URL}/analyze/${sessionId}`;
    
    const requestBody: ProjectAnalysisRequest = {
      analyzers
    };
    
    
    
    return this.http.post<ProjectAnalysisResponse>(
      endpoint,
      requestBody,
      {
        headers: new HttpHeaders({
          'Content-Type': 'application/json'
        })
      }
    );
  }

  /**
   * Obtiene el tamaño del archivo en formato legible
   * @param bytes Tamaño en bytes
   * @returns String con el tamaño formateado
   */
  formatFileSize(bytes: number): string {
    if (bytes === 0) return '0 Bytes';
    
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    
    return Math.round(bytes / Math.pow(k, i) * 100) / 100 + ' ' + sizes[i];
  }

  /**
   * Convierte un TreeNode del backend al formato de PrimeNG
   * @param node Nodo del árbol del backend
   * @returns Nodo en formato PrimeNG
   */
  convertToPrimeNGTree(node: TreeNode): PrimeNGTreeNode {
    const isDirectory = node.type === 'directory';
    
    return {
      label: node.name,
      data: {
        path: node.path,
        size: node.size,
        validSyntax: node.valid_syntax,
        type: node.type
      },
      icon: isDirectory ? 'pi pi-folder' : this.getFileIcon(node.name),
      expandedIcon: 'pi pi-folder-open',
      collapsedIcon: 'pi pi-folder',
      leaf: !isDirectory,
      expanded: false,
      type: node.type,
      styleClass: isDirectory ? 'tree-folder' : 'tree-file',
      children: node.children?.map(child => this.convertToPrimeNGTree(child)) || []
    };
  }

  /**
   * Obtiene el icono apropiado para un archivo según su extensión
   * @param filename Nombre del archivo
   * @returns Clase de icono de PrimeNG
   */
  private getFileIcon(filename: string): string {
    const ext = filename.split('.').pop()?.toLowerCase();
    
    const iconMap: { [key: string]: string } = {
      'py': 'pi pi-file',
      'js': 'pi pi-file',
      'ts': 'pi pi-file',
      'json': 'pi pi-file',
      'md': 'pi pi-file',
      'txt': 'pi pi-file',
      'yml': 'pi pi-file',
      'yaml': 'pi pi-file',
      'xml': 'pi pi-file',
      'html': 'pi pi-file',
      'css': 'pi pi-file',
      'scss': 'pi pi-file'
    };
    
    return iconMap[ext || ''] || 'pi pi-file';
  }
}
