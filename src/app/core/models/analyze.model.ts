export interface AnalyzeResponse {
  results: AnalysisResults;
  session_id: string;
  timestamp: string;
}

export interface AnalysisResults {
  [key: string]: AnalysisResult;
}

export interface AnalysisResult {
  analyzer_id: string;
  score: number;
  messages: any;
  module_count: number;
  details?: any;
  timestamp?: string;
  documentation: MetricDocumentation;
}

export interface MetricDocumentation {
  metric_id: string;
  name: string;
  summary: string;
  ideal_range: IdealRange;
  sections: MetricDocSection[];
  interpretation: MetricInterpretationItem[];
  references: MetricReference[];
  category: string;
}

export type MetricDocSectionType =
  | "text"
  | "formula"
  | "list"
  | "steps"
  | "table"
  | "note";

export interface MetricDocSection {
  id: string;
  title: string;
  type: MetricDocSectionType;
  content: any;
}

export interface MetricInterpretationItem {
  range: string;
  description: string;
  severity: "success" | "info" | "warning" | "error";
  label?: string;
}

export interface MetricReference {
  label: string;
  url: string;
}

export interface IdealRange {
  min?: number;
  max?: number;
  optimal?: string;
  acceptable?: string;
  warning?: string;
}

export interface CCPMResult extends AnalysisResult {
  details: {
    files: { [filePath: string]: CCPMFileResult };
    summary: CCPMSummary;
  };
  messages: CCPMMessage[];
}

export interface CCPMFileResult {
  // Detección de Etapas/Fases ML
  unique_stages: number;
  unique_phases: number;
  stages_detected: string[];
  phases_detected: string[];
  
  // Análisis de Cohesión
  cohesion_level: 'very_high' | 'high' | 'medium' | 'low' | 'very_low' | 'non_ml_file';
  
  // Detalle de Funciones
  function_stages: { [funcName: string]: string[] };
  
  // Contenido ML
  ml_content_only: boolean;          // true = solo código ML, false = tiene código no-ML
  non_ml_keywords_found: string[];   // Keywords no-ML encontrados
  
  // Métricas de Tamaño
  nloc: number;                      // Non-comment Lines of Code
  above_nloc_threshold: boolean;     // Si excede el umbral (default: 30)
  
  // Tipo de Archivo
  is_script_file: boolean;           // true si es script (sin funciones/clases)
  source: 'pipeline_metadata' | 'heuristic'; // Origen de detección de etapas
}

export interface CCPMSummary {
  total_files: number;
  
  // Contadores por nivel de cohesión
  very_high_cohesion: number;        // 1 etapa, solo ML (SRP perfecto)
  high_cohesion: number;             // 1 etapa con problemas menores
  medium_cohesion: number;           // 1 fase, múltiples etapas
  low_cohesion: number;              // Múltiples fases, solo ML
  very_low_cohesion: number;         // Múltiples fases + código no-ML
  
  // Archivos especiales
  non_ml_files: number;              // Archivos sin contenido ML
  small_files: number;               // Archivos bajo el umbral NLOC
  
  // Configuración
  scan_mode: string;                 // "pipeline_scope" | "manual_override_scope" | "empty_scope"
  nloc_threshold: number;            // Umbral NLOC (default: 30)
}

export interface CCPMMessage {
  file: string;
  severity: 'critical' | 'high' | 'medium' | 'low' | 'info';
  category: string;
  diagnosis: string;
  recommendation: string | null;     // null si no hay recomendación
  rule_id?: number;                  // ID de la regla aplicada (1-10)
}









export interface SCPMResult extends AnalysisResult {
  messages: SCPMMessage[] | { by_file: { [filePath: string]: SCPMMessage[] } };
  details: {
    files: { [filePath: string]: SCPMFileResult };
    summary: SCPMSummary;
  };
}

export interface SCPMMessage {
  file: string;
  severity: 'critical' | 'high' | 'medium' | 'low' | 'info';
  diagnosis: string;
  recommendation: string | null;
  rule_id?: number;
}

export interface SCPMFileResult {
  scpm: number | null;
  n_methods: number;
  n_possible_pairs: number;
  n_shared_pairs: number;
  shared_pairs: [string, string][];
  shared_variable_count: number;
  shared_file_count: number;
  shared_vars: string[];
  shared_files: string[];
  shared_type: 'variables' | 'files' | 'mixed';
  breakdown: {
    pairs_via_variables: number;
    pairs_via_files: number;
  };
  cohesion_level: 'very_high' | 'high' | 'medium' | 'low' | 'very_low' | 'not_applicable';
  n_components: number;
  n_disconnected_methods: number;
  disconnected_methods: string[];
}

export interface SCPMSummary {
  total_files: number;
  very_high_cohesion: number;
  high_cohesion: number;
  medium_cohesion: number;
  low_cohesion: number;
  very_low_cohesion: number;
  single_method_files: number;
  average_scpm: number;
  modules_with_multiple_components: number;
}

export interface FCPMResult extends AnalysisResult {
  messages: FCPMMessage[] | { by_file: { [filePath: string]: FCPMMessage[] } };
  details: {
    files: { [filePath: string]: FCPMFileResult };
    summary: FCPMSummary;
  };
}

export interface FCPMMessage {
  file: string;
  severity: 'critical' | 'high' | 'medium' | 'low' | 'info';
  diagnosis: string;
  recommendation: string | null;
  rule_id?: number;
}

export interface FCPMFileResult {
  fcpm: number | null;
  n_methods: number;
  n_possible_pairs: number;
  n_connected_pairs: number;
  connected_pairs: [string, string][];
  call_graph: { [method: string]: string[] };
  breakdown: {
    direct_invocations: number;
    indirect_invocations: number;
  };
  cohesion_level: 'very_high' | 'high' | 'moderate' | 'low' | 'very_low' | 'not_applicable';
  n_components: number;
  n_disconnected_methods: number;
  disconnected_methods: string[];
}

export interface FCPMSummary {
  total_files: number;
  very_high_cohesion: number;
  high_cohesion: number;
  moderate_cohesion: number;
  low_cohesion: number;
  very_low_cohesion: number;
  single_method_files: number;
  average_fcpm: number;
}

// ===========================
// PACKAGE-LEVEL METRICS
// ===========================

export interface FCPPResult extends AnalysisResult {
  details?: {
    summary?: {
      packages_analyzed?: number;
      average_fcpp?: number;
      avg_groups?: number;
      avg_connections_ratio?: number;
    };
    packages?: {
      [packagePath: string]: {
        fcpp?: number;
        n_nodes?: number;
        connections_count?: number;
        n_groups?: number;
        groups?: Array<string[]>;
        isolated_nodes?: string[];
        nodes?: string[];
        connections?: Array<{
          node_a: string;
          node_b: string;
          type: string;
          reason: string;
        }>;
      };
    };
  };
  messages: {
    global?: Array<{
      message: string;
      level: 'error' | 'warning' | 'success' | 'info';
    }>;
    by_package?: {
      [packagePath: string]: Array<{
        diagnosis?: string;
        recommendation?: string;
        severity?: 'critical' | 'warning' | 'info' | 'success';
      }>;
    };
  };
}

export interface SCPPResult extends AnalysisResult {
  details?: {
    summary?: {
      total_packages_analyzed?: number;
      average_scpp_score?: number;
      avg_shared_pairs?: number;
      packages_with_issues?: number;
    };
    packages?: {
      [packagePath: string]: {
        scpp?: number;
        n_nodes?: number;
        n_shared?: number;
        n_pairs?: number;
        n_groups?: number;
        groups?: Array<string[]>;
        isolated_nodes?: string[];
        nodes?: string[];
        connections?: Array<{
          node_a: string;
          node_b: string;
          shared_resources: string[];
        }>;
      };
    };
  };
  messages: {
    global?: Array<{
      message: string;
      level: 'error' | 'warning' | 'success' | 'info';
    }>;
    by_package?: {
      [packagePath: string]: Array<{
        diagnosis?: string;
        recommendation?: string;
        severity?: 'critical' | 'warning' | 'info' | 'success';
      }>;
    };
  };
}

export interface CCPPResult extends AnalysisResult {
  details?: {
    summary?: {
      total_packages_analyzed?: number;
      average_ccpp_score?: number;
      overall_quality?: string;
      packages_needing_attention?: number;
      packages_with_good_purity?: number;
      purity_summary?: {
        High?: number;
        Moderate?: number;
        Low?: number;
        'Very Low'?: number;
      };
    };
    packages?: {
      [packagePath: string]: {
        metrics?: {
          total_modules?: number;
          ml_modules?: number;
          ccpp_score?: number;
          purity_level?: string;
        };
        phases_detected?: string[];
        stages_detected?: string[];
        quality_indicators?: {
          needs_refactoring?: boolean;
          has_ml_content?: boolean;
          is_pure_package?: boolean;
        };
      };
    };
  };
  messages: {
    global?: Array<{
      message: string;
      level: 'error' | 'warning' | 'success' | 'info';
    }>;
    by_package?: {
      [packagePath: string]: Array<{
        diagnosis?: string;
        recommendation?: string;
        severity?: 'critical' | 'warning' | 'info' | 'success';
      }>;
    };
  };
}








