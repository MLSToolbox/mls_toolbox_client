/**
 * Modelos para métricas FPC (Functional Pipeline Cohesion)
 * Análisis a nivel de archivo/módulo
 */

export type CohesionLevel = 'high' | 'medium' | 'low';

export interface FPCFileDetails {
  cohesion_level: CohesionLevel;
  function_stages: { [functionName: string]: string[] };
  phases_detected: string[];
  source: string;
  stages_detected: string[];
  unique_phases: number;
  unique_stages: number;
}

export interface FPCResult {
  analyzer_id: string;
  details: {
    files: { [filePath: string]: FPCFileDetails };
    summary: {
      by_pattern: { 
        classes_only: number; 
        functions_only: number; 
        mixed: number;
      };
      high_cohesion: number;
      low_cohesion: number;
      medium_cohesion: number;
      ml_files_only: boolean;
      scan_mode: string;
      total_files: number;
      uses_pipeline_metadata: boolean;
    };
  };
  documentation: any;
  message_count: { messages: string[] };
  module_count: number;
  score: number;
  timestamp: string;
}
