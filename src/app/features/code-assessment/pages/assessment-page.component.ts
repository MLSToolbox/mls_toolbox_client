import { Component, OnInit, OnDestroy } from '@angular/core';
import { saveAs } from "file-saver";
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { CodeAssessmentService } from '../services/code-assessment.service';
import {
  AssessmentState,
  AssessmentStep,
  AssessmentStepEnum,
  RunAnalysisOptions,
} from "../models/assessment.models";
import { buildResultsCsvExportArtifact } from "../utils/results-csv-export.util";

@Component({
  selector: "app-assessment-page",
  templateUrl: "./assessment-page.component.html",
  standalone: false,
})
export class AssessmentPageComponent implements OnInit, OnDestroy {
  private destroy$ = new Subject<void>();

  state: AssessmentState = {
    currentStep: AssessmentStepEnum.UPLOAD,
    uploadedFile: null,
    sessionId: null,
    uploadResponse: null,
    analysisResponse: null,
    isUploading: false,
    isAnalyzing: false,
    error: null,
    selectedMetrics: [],
  };

  steps: AssessmentStep[] = [
    { number: 1, label: "Upload Code", completed: false, icon: "upload" },
    { number: 2, label: "Project & Metrics", completed: false, icon: "folder" },
    { number: 3, label: "Analysis", completed: false, icon: "activity" },
    { number: 4, label: "Results", completed: false, icon: "check-circle" },
  ];

  // Expose enum to template
  readonly StepEnum = AssessmentStepEnum;

  constructor(private assessmentService: CodeAssessmentService) {}

  ngOnInit(): void {
    console.log(
      "🎬 AssessmentPageComponent initialized with steps:",
      this.steps,
    );
    console.log("🎬 Initial state:", this.state);

    this.assessmentService.state$
      .pipe(takeUntil(this.destroy$))
      .subscribe((state) => {
        console.log("📊 Assessment State Updated:", {
          currentStep: state.currentStep,
          stepName: this.getStepName(state.currentStep),
          hasFile: !!state.uploadedFile,
          sessionId: state.sessionId,
          isUploading: state.isUploading,
          isAnalyzing: state.isAnalyzing,
          hasError: !!state.error,
        });
        console.log("📊 Stepper will receive:", {
          steps: this.steps,
          currentStep: state.currentStep,
        });
        this.state = state;
        this.updateSteps(state.currentStep);
      });
  }

  private getStepName(step: number): string {
    const names: { [key: number]: string } = {
      1: "UPLOAD",
      2: "METRICS",
      3: "ANALYSIS",
      4: "RESULTS",
    };
    return names[step] || "UNKNOWN";
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  /**
   * Handle source upload (file or Git URL)
   */
  onFileSelected(source: File | string): void {
    this.assessmentService
      .uploadFile(source)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: () => {
          console.log("Source uploaded successfully");
        },
        error: (error) => {
          console.error("Upload failed:", error);
        },
      });
  }

  /**
   * Handle upload reset
   */
  onUploadReset(): void {
    this.assessmentService.resetAssessment();
  }

  /**
   * Handle back navigation to upload step
   */
  onBackToUpload(): void {
    this.assessmentService.setStep(AssessmentStepEnum.UPLOAD);
  }

  /**
   * Handle metrics selection and run analysis
   */
  onRunAnalysis(options: RunAnalysisOptions): void {
    console.log("🚀 assessment-page RECEIVED options:", options);
    console.log("🚀 options.metrics:", options.metrics);
    console.log("🚀 Starting analysis with options:", options);
    this.assessmentService
      .runAnalysis(options)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: () => {
          console.log("✅ Analysis completed successfully");
        },
        error: (error) => {
          console.error("❌ Analysis failed:", error);
        },
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
    if (
      confirm(
        "Are you sure you want to start a new assessment? All current progress will be lost.",
      )
    ) {
      this.assessmentService.resetAssessment();
    }
  }

  /**
   * Export results as CSV files packed into a ZIP archive.
   */
  onExportResults(): void {
    if (!this.state.analysisResponse) {
      console.warn("No results to export");
      return;
    }

    const exportArtifact = buildResultsCsvExportArtifact(
      this.state.analysisResponse,
    );
    saveAs(exportArtifact.blob, exportArtifact.fileName);

    console.log("📥 Results exported successfully as ZIP/CSV");
  }

  /**
   * Update steps based on current state
   */
  private updateSteps(currentStep: number): void {
    this.steps = this.steps.map((step) => ({
      ...step,
      completed: step.number < currentStep,
    }));
  }

  /**
   * Get readable file size
   */
  getFileSize(): string | null {
    if (!this.state?.uploadedFile) return null;
    return this.assessmentService.getReadableFileSize(
      this.state.uploadedFile.size,
    );
  }

  /**
   * Get upload error message
   */
  getUploadErrorMessage(): string | null {
    if (!this.state?.error) return null;
    const errorCode = this.state.error.code;
    if (errorCode === "UPLOAD_ERROR" || errorCode === "VALIDATION_ERROR") {
      return this.state.error.message;
    }
    return null;
  }

  /**
   * Get step description
   */
  getStepDescription(): string {
    if (!this.state) return "";

    switch (this.state.currentStep) {
      case AssessmentStepEnum.UPLOAD:
        return "Upload your Python project as a ZIP file";
      case AssessmentStepEnum.STRUCTURE:
        return "Review project structure and select metrics";
      case AssessmentStepEnum.ANALYSIS:
        return "Running quality assessment on your code";
      case AssessmentStepEnum.RESULTS:
        return "View detailed analysis results";
      default:
        return "";
    }
  }
}
