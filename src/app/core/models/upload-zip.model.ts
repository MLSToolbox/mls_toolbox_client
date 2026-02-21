export interface UploadZipResponse {
  auto_detected_pipeline: AutoDetectedPipeline;
  session_id: string;
  tree_structure: TreeStructure;
}

export interface AutoDetectedPipeline {
  detected_stages: DetectedStages;
  file_stages: Record<string, string[]>;
  files_analyzed: number;
  is_valid_pipeline: boolean;
  missing_stages: any[];
}

export type DetectedStages = Record<string, StageDetection[]>;

export interface StageDetection {
  evidences: Evidence[];
  file: string;
}

export interface Evidence {
  method: Method;
  value: string;
}

export enum Method {
  Filename = "filename",
  Import = "import",
  Keyword = "keyword",
}

export interface TreeStructure {
  children: TreeStructureChild[];
  name: string;
  path: string;
  type: Type;
}

export interface TreeStructureChild {
  children: ChildChild[];
  name: string;
  path: string;
  type: Type;
}

export interface ChildChild {
  name: string;
  path: string;
  size?: number;
  type: Type;
  valid_syntax?: boolean;
  children?: ChildChild[];
}

export enum Type {
  Directory = "directory",
  File = "file",
}
