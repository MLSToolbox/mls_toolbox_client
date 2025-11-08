import { Component, OnInit, OnDestroy } from '@angular/core';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { CodeAssessmentService } from '../services/code-assessment.service';
import { AssessmentState, AssessmentStep, AssessmentStepEnum } from '../models/assessment.models';

@Component({
  selector: 'app-assessment-page',
  templateUrl: './assessment-page.component.html',
  standalone: false
})
export class AssessmentPageComponent implements OnInit, OnDestroy {
  private destroy$ = new Subject<void>();
  
  state: AssessmentState | null = null;
  steps: AssessmentStep[] = [
    { number: 1, label: 'Upload Code', completed: false, icon: 'upload' },
    { number: 2, label: 'Choose Metrics', completed: false, icon: 'sliders' },
    { number: 3, label: 'Analysis', completed: false, icon: 'activity' },
    { number: 4, label: 'Results', completed: false, icon: 'check-circle' }
  ];

  // Expose enum to template
  readonly StepEnum = AssessmentStepEnum;

  constructor(
    private assessmentService: CodeAssessmentService
  ) {}

  ngOnInit(): void {
    this.assessmentService.state$
      .pipe(takeUntil(this.destroy$))
      .subscribe(state => {
        this.state = state;
        this.updateSteps(state.currentStep);
      });
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  /**
   * Handle file upload
   */
  onFileSelected(file: File): void {
    this.assessmentService.uploadFile(file)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: () => {
          console.log('File uploaded successfully');
        },
        error: (error) => {
          console.error('Upload failed:', error);
        }
      });
  }

  /**
   * Handle upload reset
   */
  onUploadReset(): void {
    this.assessmentService.resetAssessment();
  }

  /**
   * Handle metrics selection and run analysis
   */
  onRunAnalysis(metrics: string[]): void {
    this.assessmentService.runAnalysis(metrics)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: () => {
          console.log('Analysis completed successfully');
        },
        error: (error) => {
          console.error('Analysis failed:', error);
        }
      });
  }

  /**
   * Handle step navigation
   */
  onStepChange(step: number): void {
    this.assessmentService.setStep(step as AssessmentStepEnum);
  }

  /**
   * Clear current error
   */
  onClearError(): void {
    this.assessmentService.clearError();
  }

  /**
   * Reset entire assessment
   */
  onResetAssessment(): void {
    if (confirm('Are you sure you want to start a new assessment? All current progress will be lost.')) {
      this.assessmentService.resetAssessment();
    }
  }

  /**
   * Update steps based on current state
   */
  private updateSteps(currentStep: number): void {
    this.steps = this.steps.map(step => ({
      ...step,
      completed: step.number < currentStep
    }));
  }

  /**
   * Get readable file size
   */
  getFileSize(): string | null {
    if (!this.state?.uploadedFile) return null;
    return this.assessmentService.getReadableFileSize(this.state.uploadedFile.size);
  }

  /**
   * Get upload error message
   */
  getUploadErrorMessage(): string | null {
    if (!this.state?.error) return null;
    const errorCode = this.state.error.code;
    if (errorCode === 'UPLOAD_ERROR' || errorCode === 'VALIDATION_ERROR') {
      return this.state.error.message;
    }
    return null;
  }

  /**
   * Get step description
   */
  getStepDescription(): string {
    if (!this.state) return '';
    
    switch (this.state.currentStep) {
      case AssessmentStepEnum.UPLOAD:
        return 'Upload your Python project as a ZIP file';
      case AssessmentStepEnum.METRICS:
        return 'Select the metrics you want to analyze';
      case AssessmentStepEnum.ANALYSIS:
        return 'Running quality assessment on your code';
      case AssessmentStepEnum.RESULTS:
        return 'View detailed analysis results';
      default:
        return '';
    }
  }
}
