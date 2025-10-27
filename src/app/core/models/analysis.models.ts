/**
 * Modelos para el análisis inicial de proyecto (upload ZIP)
 */

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
