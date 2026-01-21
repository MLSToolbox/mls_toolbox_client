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
  private readonly METRICS_REGISTRY: MetricOption[] = [
    {
      id: 'ccpm',
      name: 'Conceptual Cohesion of Pipeline Modules',
      description: 'Measures cohesion of ML pipeline code by analyzing how well functions and classes are organized around specific ML pipeline stages.',
      category: 'cohesion',
      enabled: true,
      selected: true,
      formula: 'FPC = Weighted average of cohesion levels. High cohesion (10 pts): single stage. Medium cohesion (6 pts): single phase, multiple stages. Low cohesion (3 pts): multiple phases.',
      ideal_range: { min: 0, max: 10, optimal: '>7.0', acceptable: '5.0-7.0', warning: '<5.0' },
      interpretation: {
        'high (7.0-10.0)': 'Well-organized ML pipeline code with clear separation of concerns',
        'medium (4.0-6.9)': 'Code organization is acceptable but could benefit from better structure',
        'low (0-3.9)': 'Poorly organized code, consider restructuring around ML pipeline stages'
      },
      references: ['https://github.com/MLS-Toobox/mls_code_generator']
    },
    {
      id: 'lccml',
      name: 'Loose Class Cohesion Modified for ML',
      description: 'Measures module cohesion specifically for ML code by analyzing connectivity between methods based on shared access to variables, data/model files, ML library functions, and direct method calls.',
      category: 'cohesion',
      enabled: true,
      selected: false,
      formula: 'LCCML = (Mv ∪ Mf ∪ Ml ∪ Mc) / (n(n-1)/2)',
      ideal_range: { min: 0, max: 1.0, optimal: '>0.7', acceptable: '0.5-0.7', warning: '<0.5' },
      interpretation: {
        '0.8-1.0': 'Excellent - highly cohesive module, methods work together well',
        '0.6-0.79': 'Good - reasonable cohesion, minor improvements possible',
        '0.4-0.59': 'Moderate - consider refactoring to improve method connectivity',
        '0.2-0.39': 'Low - module likely doing too many unrelated things',
        '0.0-0.19': 'Very Low - module should be split into separate files'
      },
      references: [
        'Loose Class Cohesion (LCC) - Bieman & Kang, 1995',
        'LCOM4 - Hitz & Montazeri, 1995',
        'Adapted for ML pipelines'
      ]
    },
    {
      id: 'ifc_p',
      name: 'Information Flow Cohesion - Package',
      description: 'Measures the functional cooperation between modules of the same package via information flow (invocations or data consumption).',
      category: 'cohesion',
      enabled: true,
      selected: false,
      formula: 'IFC-P(P) = (2 * sum(F_ij)) / (m * (m - 1))',
      ideal_range: { min: 0, max: 1.0, optimal: '>0.8', acceptable: '0.6-0.8', warning: '<0.6' },
      interpretation: {
        '0.8-1.0': 'Excellent - high functional cooperation',
        '0.6-0.79': 'Good - reasonable cooperation',
        '0.4-0.59': 'Moderate - some cooperation',
        '0.2-0.39': 'Low - little cooperation',
        '0.0-0.19': 'Very Low - almost no cooperation'
      },
      references: []
    },
    {
      id: 'lpcml',
      name: 'Loose Package Cohesion Modified for ML',
      description: 'Measures the number of connected components within a package. A connected component represents a group of modules related through dependencies, shared data, model files, or ML library usage.',
      category: 'cohesion',
      enabled: true,
      selected: false,
      formula: 'LPCML(P) = |CC(G_P)|',
      ideal_range: { min: 1, max: 10, optimal: '1', acceptable: '<=3', warning: '>5' },
      interpretation: {
        '1': 'Excellent - single connected component',
        '<=3': 'Acceptable - few connected components',
        '<=5': 'Moderate - some fragmentation',
        '>5': 'Poor - highly fragmented'
      },
      references: []
    },
    {
      id: 'pmcr',
      name: 'Package Module Cohesion Ratio',
      description: 'Measures the proportion of interconnected modules in a package, considering both code dependencies and shared ML resources (datasets, models, APIs).',
      category: 'cohesion',
      enabled: true,
      selected: false,
      formula: 'PMCR(P) = Mc / (n * (n - 1) / 2)',
      ideal_range: { min: 0, max: 1.0, optimal: '>0.8', acceptable: '0.6-0.8', warning: '<0.6' },
      interpretation: {
        '0.8-1.0': 'Excellent - high interconnection',
        '0.6-0.79': 'Good - reasonable interconnection',
        '0.4-0.59': 'Moderate - some interconnection',
        '0.2-0.39': 'Low - little interconnection',
        '0.0-0.19': 'Very Low - almost no interconnection'
      },
      references: []
    },
    {
      id: 'pdsc',
      name: 'Package Data Structure Cohesion',
      description: 'Measures the structural sharing of data or models between modules of the same package.',
      category: 'cohesion',
      enabled: true,
      selected: false,
      formula: 'PDSC(P) = (2 * sum(Q_ij)) / (m * (m - 1))',
      ideal_range: { min: 0, max: 1.0, optimal: '>0.8', acceptable: '0.6-0.8', warning: '<0.6' },
      interpretation: {
        '0.8-1.0': 'Excellent - high data sharing',
        '0.6-0.79': 'Good - reasonable data sharing',
        '0.4-0.59': 'Moderate - some data sharing',
        '0.2-0.39': 'Low - little data sharing',
        '0.0-0.19': 'Very Low - almost no data sharing'
      },
      references: []
    },
    {
      id: 'pfp',
      name: 'Package Functional Purity',
      description: 'Measures how focused a package is on a specific ML pipeline function.',
      category: 'cohesion',
      enabled: true,
      selected: false,
      formula: 'PFP = (N_ml / N_total) * (1 / N_etapas)',
      ideal_range: { min: 0, max: 1.0, optimal: '>0.8', acceptable: '0.6-0.8', warning: '<0.6' },
      interpretation: {
        'High': 'Package is focused on a single ML stage',
        'Moderate': 'Package has some focus but mixes stages',
        'Low': 'Package is unfocused or has little ML content'
      },
      references: []
    }
  ];

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

  getAvailableMetrics(): MetricOption[] {
    return JSON.parse(JSON.stringify(this.METRICS_REGISTRY));
  }

  /**
   * Run analysis with selected metrics
   */
  runAnalysis(options: { metrics: string[], all_files?: boolean, pipeline_overrides?: any }): Observable<void> {
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
