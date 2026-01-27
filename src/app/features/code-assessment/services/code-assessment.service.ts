import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable, throwError, of } from 'rxjs';
import { tap, catchError, finalize, map } from 'rxjs/operators';
import { ApiService } from '@app/core/services/api.service';
import {
  AssessmentState,
  UploadedFile,
  AssessmentError,
  AssessmentStepEnum,
  MetricOption
} from '../models/assessment.models';

@Injectable({
  providedIn: 'root'
})
export class CodeAssessmentService {
  // Las métricas y su documentación se obtienen del backend en la respuesta de análisis
  // No se mantiene un registro estático ya que viene dinámicamente desde AnalysisResult.documentation

  private readonly INITIAL_STATE: AssessmentState = {
    currentStep: AssessmentStepEnum.UPLOAD,
    uploadedFile: null,
    sessionId: null,
    uploadResponse: null,
    analysisResponse: null,
    isUploading: false,
    isAnalyzing: false,
    error: null,
    selectedMetrics: []
  };

  private stateSubject = new BehaviorSubject<AssessmentState>(this.INITIAL_STATE);
  public state$ = this.stateSubject.asObservable();

  constructor(private apiService: ApiService) { }

  /**
   * Get current state snapshot
   */
  private get currentState(): AssessmentState {
    return this.stateSubject.value;
  }

  /**
   * Update state immutably
   */
  private updateState(partial: Partial<AssessmentState>): void {
    this.stateSubject.next({
      ...this.currentState,
      ...partial
    });
  }

  /**
   * Upload source (ZIP file or Git URL) to backend
   */
  uploadFile(source: File | string): Observable<void> {
    const isFile = source instanceof File;

    console.log(isFile ? '📤 Starting file upload:' : '🔗 Starting Git repository upload:',
      isFile ? { name: (source as File).name, size: (source as File).size, type: (source as File).type } : source
    );

    // Validate source
    if (isFile) {
      const validation = this.validateFile(source as File);
      if (!validation.valid) {
        console.error('❌ File validation failed:', validation.error);
        this.updateState({
          error: {
            message: validation.error || 'Invalid file',
            code: 'VALIDATION_ERROR'
          }
        });
        return throwError(() => new Error(validation.error));
      }
    } else {
      const validation = this.validateGitUrl(source as string);
      if (!validation.valid) {
        console.error('❌ Git URL validation failed:', validation.error);
        this.updateState({
          error: {
            message: validation.error || 'Invalid Git URL',
            code: 'VALIDATION_ERROR'
          }
        });
        return throwError(() => new Error(validation.error));
      }
    }

    // Prepare state based on source type
    const stateUpdate: Partial<AssessmentState> = {
      isUploading: true,
      error: null
    };

    if (isFile) {
      const file = source as File;
      const uploadedFile: UploadedFile = {
        name: file.name,
        size: file.size,
        type: file.type,
        file
      };
      stateUpdate.uploadedFile = uploadedFile;
      stateUpdate.uploadSource = 'zip';
    } else {
      stateUpdate.uploadSource = 'git';
      stateUpdate.gitUrl = source as string;
      // Create a pseudo UploadedFile for Git URLs
      stateUpdate.uploadedFile = {
        name: (source as string).split('/').pop() || 'repository',
        size: 0,
        type: 'git',
        file: null as any
      };
    }

    this.updateState(stateUpdate);

    console.log('✅ Source validated, sending to API...');

    return this.apiService.upload(source).pipe(
      tap(response => {
        console.log('📥 Upload response received:', response);
        if (response.success && response.data) {
          console.log('✅ Upload successful, session ID:', response.data.session_id);
          this.updateState({
            sessionId: response.data.session_id,
            uploadResponse: response.data,
            currentStep: AssessmentStepEnum.STRUCTURE,
            isUploading: false
          });
        } else {
          throw new Error('Upload failed: Invalid response');
        }
      }),
      map(() => void 0),
      catchError(error => {
        console.error('❌ Upload error:', error);
        const errorObj: AssessmentError = {
          message: error?.error?.error?.message || error?.error?.message || error?.message || 'Failed to upload source',
          code: 'UPLOAD_ERROR',
          details: error
        };
        this.updateState({
          error: errorObj,
          isUploading: false
        });
        return throwError(() => errorObj);
      })
    );
  }

  /**
   * Run analysis with selected metrics
   */
  runAnalysis(options: { metrics: string[], all_files?: boolean, pipeline_overrides?: any }): Observable<void> {
    const { sessionId } = this.currentState;

    console.log('💼 code-assessment.service.runAnalysis CALLED');
    console.log('💼 options received:', options);
    console.log('💼 options.metrics:', options.metrics);
    console.log('💼 options.all_files:', options.all_files);
    console.log('💼 options.pipeline_overrides:', options.pipeline_overrides);

    if (!sessionId) {
      const error: AssessmentError = {
        message: 'No session ID available. Please upload a file first.',
        code: 'NO_SESSION'
      };
      this.updateState({ error });
      return throwError(() => error);
    }

    this.updateState({
      isAnalyzing: true,
      error: null,
      selectedMetrics: options.metrics,
      currentStep: AssessmentStepEnum.ANALYSIS
    });

    const analysisData: any = {
      analyzers: options.metrics,
      all_files: options.pipeline_overrides ? false : (options.all_files || false),
    };

    if (options.pipeline_overrides) {
      analysisData.pipeline_overrides = options.pipeline_overrides;
    } else {
      analysisData.pipeline_overrides = {
        file_stages: {},
        excluded_files: []
      };
    }

    console.log('🔬 Sending analysis request:', analysisData);
    console.log('🔬 analysisData.analyzers:', analysisData.analyzers);
    console.log('🔬 analysisData.all_files:', analysisData.all_files);

    return this.apiService.analyze(sessionId, analysisData).pipe(
      tap(response => {
        if (response.success && response.data) {
          this.updateState({
            analysisResponse: response.data,
            currentStep: AssessmentStepEnum.RESULTS,
            isAnalyzing: false
          });
        } else {
          throw new Error('Analysis failed: Invalid response');
        }
      }),
      map(() => void 0),
      catchError(error => {
        const errorObj: AssessmentError = {
          message: error?.error?.message || error?.message || 'Failed to run analysis',
          code: 'ANALYSIS_ERROR',
          details: error
        };
        this.updateState({
          error: errorObj,
          isAnalyzing: false,
          currentStep: AssessmentStepEnum.STRUCTURE
        });
        return throwError(() => errorObj);
      })
    );
  }

  /**
   * Navigate to specific step
   */
  setStep(step: AssessmentStepEnum): void {
    const { sessionId } = this.currentState;

    // Validate navigation
    if (step > AssessmentStepEnum.UPLOAD && !sessionId) {
      this.updateState({
        error: {
          message: 'Please upload a file first',
          code: 'NAVIGATION_ERROR'
        }
      });
      return;
    }

    this.updateState({
      currentStep: step,
      error: null
    });
  }

  /**
   * Clear error
   */
  clearError(): void {
    this.updateState({ error: null });
  }

  /**
   * Reset entire assessment
   */
  resetAssessment(): void {
    this.stateSubject.next(this.INITIAL_STATE);
  }

  /**
   * Validate file before upload
   */
  private validateFile(file: File): { valid: boolean; error?: string } {
    const MAX_SIZE = 50 * 1024 * 1024; // 50MB
    const ALLOWED_TYPES = ['.zip', 'application/zip', 'application/x-zip-compressed'];

    if (!file) {
      return { valid: false, error: 'No file provided' };
    }

    if (file.size > MAX_SIZE) {
      return {
        valid: false,
        error: `File size exceeds 50MB limit. Current size: ${(file.size / 1024 / 1024).toFixed(2)}MB`
      };
    }

    const isValidType = ALLOWED_TYPES.some(type =>
      file.name.endsWith('.zip') || file.type === type
    );

    if (!isValidType) {
      return {
        valid: false,
        error: 'Only ZIP files are allowed'
      };
    }

    return { valid: true };
  }

  /**
   * Validate Git URL before upload
   */
  private validateGitUrl(url: string): { valid: boolean; error?: string } {
    if (!url || !url.trim()) {
      return { valid: false, error: 'Git URL cannot be empty' };
    }

    const trimmed = url.trim();

    if (!trimmed.endsWith('.git')) {
      return { valid: false, error: 'Git URL must end with .git' };
    }

    if (!trimmed.startsWith('http://') && !trimmed.startsWith('https://')) {
      return { valid: false, error: 'Git URL must start with http:// or https://' };
    }

    return { valid: true };
  }

  /**
   * Get file size in human-readable format
   */
  getReadableFileSize(bytes: number): string {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return Math.round(bytes / Math.pow(k, i) * 100) / 100 + ' ' + sizes[i];
  }
}
