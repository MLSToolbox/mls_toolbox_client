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
  description: string;
  formula?: string;
  ideal_range: IdealRange;
  interpretation: { [key: string]: string };
  references: string[];
  category: string;
}

export interface IdealRange {
  min?: number;
  max?: number;
  optimal?: string;
  acceptable?: string;
  warning?: string;
}

export interface FPCResult extends AnalysisResult {
  details: {
    files: { [filePath: string]: FPCFileResult };
    summary: FPCSummary;
  };
  messages: FPCMessage[];
}

export interface FPCFileResult {
  unique_stages: number;
  unique_phases: number;
  stages_detected: string[];
  phases_detected: string[];
  cohesion_level: 'high' | 'medium' | 'low' | 'non_ml' | 'small_file';
  function_stages: { [funcName: string]: string[] };
  ml_content: boolean;
  non_ml_keywords: string[];
  nloc: number;
  above_nloc_threshold: boolean;
  is_script_file: boolean;
}

export interface FPCSummary {
  total_files: number;
  high_cohesion: number;
  medium_cohesion: number;
  low_cohesion: number;
  non_ml_files: number;
  small_files: number;
  scan_mode: string;
  nloc_threshold: number;
}

export interface FPCMessage {
  file: string;
  severity: 'error' | 'warning' | 'info';
  category: string;
  diagnosis: string;
  recommendation: string;
}

export interface FileStructureResult extends AnalysisResult {
  details: {
    files: { [filePath: string]: FileStructureFileResult };
    summary: FileStructureSummary;
  };
  messages: {
    messages: string[];
  };
}

export interface FileStructureFileResult {
  pattern: 'classes_only' | 'functions_only' | 'script_only' | 'mixed' | 'mixed_script';
  num_classes: number;
  num_functions: number;
  num_methods: number;
  num_loose_statements: number;
  total_components: number;
  recommendation?: string;
  severity?: 'error' | 'warning' | 'info';
}

export interface FileStructureSummary {
  total_files: number;
  classes_only: number;
  functions_only: number;
  script_only: number;
  mixed: number;
  mixed_script: number;
  scan_mode: string;
}

export interface LCCMLResult extends AnalysisResult {
  details: {
    files: { [filePath: string]: LCCMLFileResult };
    summary: LCCMLSummary;
  };
  messages: {
    messages: string[];
  };
}

export interface LCCMLFileResult {
  lccml: number | null;
  n_methods: number;
  n_possible_pairs: number;
  n_connected_pairs: number;
  n_disconnected_pairs?: number;
  disconnected_pairs?: [string, string][];
  connection_breakdown: {
    by_variables: number;
    by_files: number;
    by_ml_functions: number;
    by_method_calls: number;
  };
  cohesion_level: string;
}

export interface LCCMLSummary {
  total_files: number;
  high_cohesion: number;
  good_cohesion: number;
  moderate_cohesion: number;
  low_cohesion: number;
  very_low_cohesion: number;
  single_method_files: number;
  average_lccml: number;
}

export interface PyLintResult extends AnalysisResult {
  messages: {
    convention: number;
    refactor: number;
    warning: number;
    error: number;
    fatal: number;
    info: number;
  };
  details: {
    messages: PyLintMessage[];
    statistics: any;
    config: any;
  };
}

export interface PyLintMessage {
  type: string;
  module: string;
  obj: string;
  line: number;
  column: number;
  endLine?: number;
  endColumn?: number;
  path: string;
  symbol: string;
  message: string;
  messageId: string;
}

export interface RadonCCResult extends AnalysisResult {
  messages: {};
  details: {
    complexity_method: string;
  };
}

export interface RadonMIResult extends AnalysisResult {
  messages: {};
  details: {
    maintainability_method: string;
  };
}

export interface PipelineDetectionResult extends AnalysisResult {
  details: {
    detected_stages: { [stage: string]: PipelineStageFile[] };
    files_analyzed: number;
    is_valid_pipeline: boolean;
    missing_stages: string[];
  };
}

export interface PipelineStageFile {
  file: string;
  evidences: PipelineEvidence[];
}

export interface PipelineEvidence {
  method: 'filename' | 'import' | 'keyword';
  value: string;
}

export interface LDSCResult extends AnalysisResult {
  details: {
    files: { [filePath: string]: LDSCFileResult };
    summary: LDSCSummary;
  };
}

export interface LDSCFileResult {
  ldsc: number | null;
  n_methods: number;
  n_possible_pairs: number;
  n_shared_pairs: number;
  shared_pairs: [string, string][];
  cohesion_level: string;
}

export interface LDSCSummary {
  total_files: number;
  high_cohesion: number;
  good_cohesion: number;
  moderate_cohesion: number;
  low_cohesion: number;
  very_low_cohesion: number;
  single_method_files: number;
  average_ldsc: number;
}

export interface IFCMResult extends AnalysisResult {
  details: {
    files: { [filePath: string]: IFCMFileResult };
    summary: IFCMSummary;
  };
}

export interface IFCMFileResult {
  ifc_m: number | null;
  n_methods: number;
  n_possible_pairs: number;
  n_connected_pairs: number;
  connected_pairs: [string, string][];
  cohesion_level: string;
}

export interface IFCMSummary {
  total_files: number;
  high_cohesion: number;
  good_cohesion: number;
  moderate_cohesion: number;
  low_cohesion: number;
  very_low_cohesion: number;
  single_method_files: number;
  average_ifc_m: number;
}