/**
 * Modelos para métricas FPC (Functional Pipeline Cohesion)
 * Análisis a nivel de archivo/módulo
 */

import { BaseMetricResult, MetricType, MetricCategory, QualityLevel, MetricNodeDetails } from './base-metric.models';

export type CohesionLevel = 'high' | 'medium' | 'low';

export interface FPCFileDetails extends Omit<MetricNodeDetails, 'quality_level'> {
  path: string;
  quality_level: CohesionLevel; // FPC usa minúsculas
  score: number;
  cohesion_level: CohesionLevel;
  function_stages: { [functionName: string]: string[] };
  phases_detected: string[];
  source: string;
  stages_detected: string[];
  unique_phases: number;
  unique_stages: number;
}

export interface FPCResult extends Omit<BaseMetricResult, 'message_count'> {
  analyzer_id: 'FPC';
  metric_type: MetricType.FILE_LEVEL;
  metric_category: MetricCategory.COHESION;
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
  message_count: { messages: string[] }; // FPC tiene estructura diferente
}
