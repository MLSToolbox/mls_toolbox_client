import { UploadZipResponse, AnalyzeResponse } from '@app/core/models';

export interface AssessmentStep {
  number: number;
  label: string;
  completed: boolean;
  icon?: string;
}

export interface UploadedFile {
  name: string;
  size: number;
  type: string;
  file: File;
}

export interface AssessmentState {
  currentStep: number;
  uploadedFile: UploadedFile | null;
  uploadSource?: 'zip' | 'git'; // Track which upload method was used
  gitUrl?: string; // Store Git URL if using Git upload
  sessionId: string | null;
  uploadResponse: UploadZipResponse | null;
  analysisResponse: AnalyzeResponse | null;
  isUploading: boolean;
  isAnalyzing: boolean;
  error: AssessmentError | null;
  selectedMetrics: string[];
}

export interface AssessmentError {
  message: string;
  code?: string;
  details?: any;
}

export enum AssessmentStepEnum {
  UPLOAD = 1,
  STRUCTURE = 2,
  ANALYSIS = 3,
  RESULTS = 4
}

export interface MetricOption {
  id: string;
  name: string;
  description: string;
  category: string;
  enabled: boolean;
  selected: boolean;
  formula?: string;
  ideal_range?: {
    min?: number | null;
    max?: number | null;
    optimal?: string;
    acceptable?: string;
    warning?: string;
  };
  interpretation?: { [key: string]: string };
  references?: string[];
}
