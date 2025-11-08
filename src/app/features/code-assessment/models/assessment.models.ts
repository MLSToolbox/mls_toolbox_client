export interface AssessmentStep {
  number: number;
  label: string;
  completed: boolean;
}

export interface UploadedFile {
  name: string;
  size: number;
  type: string;
}

export interface AssessmentState {
  currentStep: number;
  uploadedFile: UploadedFile | null;
  isAnalyzing: boolean;
  error: string | null;
}
