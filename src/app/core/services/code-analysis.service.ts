import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '@environments/environment.development';



export interface Evidence {
  method: string;
  value: string;
}

export interface DetectedFile {
  evidences: Evidence[];
  file: string;
}

export interface DetectedStages {
  data_cleaning?: DetectedFile[];
  data_collection?: DetectedFile[];
  feature_engineering?: DetectedFile[];
  model_evaluation?: DetectedFile[];
  model_training?: DetectedFile[];
}

export interface AutoDetectedPipeline {
  detected_stages: DetectedStages;
  files_analyzed: number;
  is_valid_pipeline: boolean;
  missing_stages: string[];
}

export interface TreeNode {
  name: string;
  path: string;
  type: 'file' | 'directory';
  size?: number;
  valid_syntax?: boolean;
  children?: TreeNode[];
}

export interface AnalysisResponse {
  success: boolean;
  data: {
    session_id: string;
    auto_detected_pipeline: AutoDetectedPipeline;
    tree_structure: TreeNode;
  };
}

@Injectable({
  providedIn: 'root'
})
export class CodeAnalysisService {
  // Usar la configuración del environment
  private readonly API_URL = environment.api.codeAnalysisBaseUrl;

  constructor(private http: HttpClient) {}

  /**
   * Sube un archivo ZIP para análisis
   * @param file Archivo ZIP del proyecto
   * @returns Observable con la respuesta del análisis
   */
  uploadProjectZip(file: File): Observable<AnalysisResponse> {
    const formData = new FormData();
    formData.append('file', file);

    // Usar el endpoint configurado en el environment
    const endpoint = `${this.API_URL}${environment.api.endpoints.uploadZip}`;
    
    // No establecer Content-Type manualmente, el navegador lo hace con el boundary correcto
    return this.http.post<AnalysisResponse>(
      endpoint,
      formData
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
}
