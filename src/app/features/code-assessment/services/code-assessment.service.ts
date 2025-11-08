import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable, throwError, of } from 'rxjs';
import { tap, catchError, finalize, map } from 'rxjs/operators';
import { ApiService } from '@app/core/services/api.service';
import { 
  AssessmentState, 
  UploadedFile, 
  AssessmentError,
  AssessmentStepEnum 
} from '../models/assessment.models';

@Injectable({
  providedIn: 'root'
})
export class CodeAssessmentService {
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

  constructor(private apiService: ApiService) {}

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
   * Upload ZIP file to backend
   */
  uploadFile(file: File): Observable<void> {
    console.log('📤 Starting file upload:', {
      name: file.name,
      size: file.size,
      type: file.type
    });

    // Validate file
    const validation = this.validateFile(file);
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

    const uploadedFile: UploadedFile = {
      name: file.name,
      size: file.size,
      type: file.type,
      file
    };

    this.updateState({
      uploadedFile,
      isUploading: true,
      error: null
    });

    console.log('✅ File validated, sending to API...');

    return this.apiService.uploadZip(file).pipe(
      tap(response => {
        console.log('📥 Upload response received:', response);
        if (response.success && response.data) {
          console.log('✅ Upload successful, session ID:', response.data.session_id);
          this.updateState({
            sessionId: response.data.session_id,
            uploadResponse: response.data,
            currentStep: AssessmentStepEnum.METRICS,
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
          message: error?.error?.message || error?.message || 'Failed to upload file',
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
  runAnalysis(metrics: string[]): Observable<void> {
    const { sessionId } = this.currentState;

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
      selectedMetrics: metrics,
      currentStep: AssessmentStepEnum.ANALYSIS
    });

    // Map metrics to backend analyzers
    // 'fpc' metric maps to 'fpc' analyzer which includes file, pipeline, and class analysis
    const analyzers = metrics.includes('fpc') ? ['fpc'] : metrics;

    const analysisData = {
      analyzers: analyzers,
      all_files: false, // Only analyze ML pipeline files by default
      pipeline_overrides: {
        file_stages: {},
        excluded_files: []
      }
    };

    console.log('🔬 Sending analysis request:', analysisData);

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
          currentStep: AssessmentStepEnum.METRICS // Go back to metrics selection
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
