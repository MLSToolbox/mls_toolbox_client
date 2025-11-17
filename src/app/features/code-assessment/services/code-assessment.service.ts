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
      id: 'radon_cc',
      name: 'Cyclomatic Complexity',
      description: 'Measures code complexity by counting independent paths through code. Higher values indicate more complex, harder to test code.',
      category: 'complexity',
      enabled: true,
      selected: false,
      formula: 'CC = E - N + 2P (E=edges, N=nodes, P=connected components)',
      ideal_range: { min: 1, max: 10, optimal: '1-5', acceptable: '6-10', warning: '>10' },
      interpretation: {
        '1-5': 'Simple, easy to test',
        '6-10': 'More complex, acceptable',
        '11-20': 'Complex, consider refactoring',
        '>20': 'Very complex, refactoring needed'
      },
      references: [
        'https://radon.readthedocs.io/en/latest/intro.html',
        'https://en.wikipedia.org/wiki/Cyclomatic_complexity'
      ]
    },
    {
      id: 'radon_mi',
      name: 'Maintainability Index',
      description: 'Composite metric measuring code maintainability based on complexity, volume, and comments. Higher values indicate more maintainable code.',
      category: 'maintainability',
      enabled: true,
      selected: false,
      formula: 'MI = 171 - 5.2*ln(V) - 0.23*G - 16.2*ln(L) (V=volume, G=complexity, L=lines)',
      ideal_range: { min: 0, max: 100, optimal: '>20', acceptable: '10-20', warning: '<10' },
      interpretation: {
        '20-100': 'Maintainable',
        '10-19': 'Moderate maintainability',
        '0-9': 'Difficult to maintain'
      },
      references: ['https://radon.readthedocs.io/en/latest/intro.html']
    },
    {
      id: 'pylint',
      name: 'Code Quality Score',
      description: 'Evaluates code against PEP 8 style guide, detects errors, enforces coding standards, and finds code smells.',
      category: 'quality',
      enabled: true,
      selected: false,
      formula: 'Score = 10.0 - ((float(5 * error + warning + refactor + convention) / statement) * 10)',
      ideal_range: { min: null, max: 10.0, optimal: '>8.0', acceptable: '7.0-8.0', warning: '<7.0' },
      interpretation: {
        '9.0-10.0': 'Excellent - very few issues detected',
        '8.0-8.9': 'Good - minor improvements possible',
        '7.0-7.9': 'Acceptable - consider addressing warnings',
        '5.0-6.9': 'Needs improvement - multiple issues found',
        '<5.0': 'Poor - significant refactoring needed'
      },
      references: [
        'https://pylint.pycqa.org/en/latest/',
        'https://peps.python.org/pep-0008/'
      ]
    },
    {
      id: 'fpc',
      name: 'Functional Pipeline Cohesion',
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
      id: 'file_structure',
      name: 'File Structure Quality',
      description: 'Evaluates Python file organization patterns. Identifies whether files follow OOP principles, functional style, script style, or anti-patterns.',
      category: 'structure',
      enabled: true,
      selected: false,
      formula: 'Score = (classes_only * 1.0 + functions_only * 0.9 + script_only * 0.6 + mixed * 0.5 + mixed_script * 0.3) / total_files * 10',
      ideal_range: { min: 0, max: 10, optimal: '>8.0', acceptable: '6.0-8.0', warning: '<6.0' },
      interpretation: {
        '9.0-10.0': 'Excellent - consistent OOP or functional patterns throughout',
        '7.0-8.9': 'Good - mostly consistent with few script-style files',
        '6.0-6.9': 'Acceptable - some script-style or mixed pattern files',
        '4.0-5.9': 'Poor - many anti-patterns, architectural inconsistency',
        '<3.0': 'Critical - predominant use of mixed script anti-pattern'
      },
      references: [
        'https://peps.python.org/pep-0008/',
        'https://en.wikipedia.org/wiki/Separation_of_concerns'
      ]
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
      id: 'pipeline',
      name: 'ML Pipeline Detection',
      description: 'Detects and maps ML pipeline stages in the codebase. Identifies which files and functions belong to different stages.',
      category: 'detection',
      enabled: true,
      selected: false,
      interpretation: {
        'comprehensive': 'All major ML pipeline stages detected',
        'partial': 'Some pipeline stages detected, others may be missing',
        'minimal': 'Few or no ML pipeline patterns detected'
      },
      references: ['https://github.com/MLS-Toobox/mls_code_generator']
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

  getAvailableMetrics(): MetricOption[] {
    return JSON.parse(JSON.stringify(this.METRICS_REGISTRY));
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

    const analysisData = {
      analyzers: metrics,
      all_files: false,
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
