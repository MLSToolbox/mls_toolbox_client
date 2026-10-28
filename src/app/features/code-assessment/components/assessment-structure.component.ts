import { Component, Input, Output, EventEmitter, OnInit } from '@angular/core';
import { AutoDetectedPipeline } from '@app/core/models/upload-zip.model';
import { RunAnalysisOptions } from "../models/assessment.models";

interface MetricType {
  id: string;
  name: string;
  description: string;
  enabled: boolean;
  selected: boolean;
  config: {
    metrics: string[];
  };
}

@Component({
  selector: "app-assessment-structure",
  template: `
    <div class="w-full max-w-3xl mx-auto px-4 py-8">
      <div class="bg-white rounded-lg border border-gray-200 shadow-sm">
        <div class="border-b border-gray-200 px-6 py-4">
          <div class="flex items-center gap-3">
            <svg
              class="w-6 h-6 text-blue-600"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                stroke-linecap="round"
                stroke-linejoin="round"
                stroke-width="2"
                d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"
              ></path>
            </svg>
            <h2 class="text-xl font-bold text-gray-900">
              Select Type of Metrics
            </h2>
          </div>
          <p class="text-sm text-gray-600 mt-2">
            Choose the type of analysis to perform
          </p>
          <p class="text-xs text-green-700 bg-green-50 border border-green-200 rounded-lg px-3 py-2 mt-3 flex items-center gap-2">
            <svg class="w-4 h-4 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"></path>
            </svg>
            Pipeline stages confirmed ({{ confirmedFileCount }} file(s) with a stage assigned).
          </p>
        </div>

        <div class="p-6 space-y-4 max-h-[400px] overflow-y-auto">
          <div
            *ngFor="let type of metricTypes"
            class="border rounded-lg p-4 transition-all duration-200 cursor-pointer"
            [ngClass]="{
              'border-blue-500 bg-blue-50': type.selected,
              'border-gray-200 bg-white hover:border-blue-300 hover:bg-blue-50':
                !type.selected && type.enabled,
              'opacity-50 cursor-not-allowed bg-gray-50': !type.enabled,
            }"
            (click)="selectType(type)"
          >
            <div class="flex items-start gap-3">
              <div class="flex-shrink-0 mt-1">
                <div
                  class="w-5 h-5 rounded-full border-2 flex items-center justify-center transition-colors"
                  [ngClass]="{
                    'border-blue-500 bg-blue-500': type.selected,
                    'border-gray-300 bg-white': !type.selected,
                  }"
                >
                  <div
                    *ngIf="type.selected"
                    class="w-2 h-2 rounded-full bg-white"
                  ></div>
                </div>
              </div>
              <div class="flex-1 min-w-0">
                <h3 class="text-sm font-semibold text-gray-900 mb-1">
                  {{ type.name }}
                </h3>
                <p class="text-xs text-gray-600 line-clamp-2">
                  {{ type.description }}
                </p>
                <span
                  *ngIf="!type.enabled"
                  class="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium mt-2 bg-gray-200 text-gray-600"
                >
                  Coming Soon
                </span>
              </div>
            </div>
          </div>
        </div>

        <div class="border-t border-gray-200 p-6">
          <div class="flex flex-col gap-3">
            <button
              (click)="onContinue()"
              [disabled]="!hasSelection || isAnalyzing"
              class="w-full px-6 py-3 text-sm font-medium text-white rounded-lg transition-all duration-200 hover:shadow-lg disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
              style="background: linear-gradient(135deg, rgb(0, 32, 96) 0%, rgb(0, 50, 120) 100%);"
            >
              <svg
                *ngIf="!isAnalyzing"
                class="w-5 h-5"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  stroke-linecap="round"
                  stroke-linejoin="round"
                  stroke-width="2"
                  d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z"
                ></path>
                <path
                  stroke-linecap="round"
                  stroke-linejoin="round"
                  stroke-width="2"
                  d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                ></path>
              </svg>
              <svg
                *ngIf="isAnalyzing"
                class="w-5 h-5 animate-spin"
                fill="none"
                viewBox="0 0 24 24"
              >
                <circle
                  class="opacity-25"
                  cx="12"
                  cy="12"
                  r="10"
                  stroke="currentColor"
                  stroke-width="4"
                ></circle>
                <path
                  class="opacity-75"
                  fill="currentColor"
                  d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                ></path>
              </svg>
              {{ isAnalyzing ? "Starting Analysis..." : "Run Analysis" }}
            </button>

            <button
              (click)="onBack()"
              [disabled]="isAnalyzing"
              class="w-full px-6 py-3 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors duration-200 flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <svg
                class="w-4 h-4"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  stroke-linecap="round"
                  stroke-linejoin="round"
                  stroke-width="2"
                  d="M10 19l-7-7m0 0l7-7m-7 7h18"
                ></path>
              </svg>
              Back to Pipeline Validation
            </button>
          </div>
        </div>
      </div>
    </div>
  `,
  standalone: false,
})
export class AssessmentStructureComponent implements OnInit {
  @Input() autoDetectedPipeline: AutoDetectedPipeline | null = null;
  @Input() manualFileStages: { [key: string]: string[] } = {};
  @Input() isAnalyzing = false;
  @Output() runAnalysis = new EventEmitter<RunAnalysisOptions>();
  @Output() back = new EventEmitter<void>();

  metricTypes: MetricType[] = [
    {
      id: "cohesion",
      name: "Cohesion",
      description:
        "Analyze code cohesion using module and package-level metrics",
      enabled: true,
      selected: false,
      config: {
        metrics: ["ccpm", "scpm", "fcpm", "ccpp", "scpp", "fcpp"],
      },
    },
    {
      id: "coupling",
      name: "Coupling",
      description: "Analyze code coupling metrics.",
      enabled: false,
      selected: false,
      config: {
        metrics: [],
      },
    },
    {
      id: "solid",
      name: "SOLID",
      description: "Analyze SOLID principles adherence.",
      enabled: false,
      selected: false,
      config: {
        metrics: [],
      },
    },
  ];

  ngOnInit(): void {
    // Select first enabled option by default
    const firstEnabled = this.metricTypes.find((t) => t.enabled);
    if (firstEnabled) {
      firstEnabled.selected = true;
    }
  }

  get hasSelection(): boolean {
    return this.metricTypes.some((t) => t.selected);
  }

  get confirmedFileCount(): number {
    return Object.values(this.getMergedStages()).filter(
      (stages) => Array.isArray(stages) && stages.length > 0,
    ).length;
  }

  get hasAnalyzableFiles(): boolean {
    const mergedStages = this.getMergedStages();
    return Object.values(mergedStages).some((stages) => Array.isArray(stages) && stages.length > 0);
  }

  selectType(type: MetricType): void {
    if (!type.enabled) return;

    // Unselect all others (radio behavior)
    this.metricTypes.forEach((t) => (t.selected = false));
    type.selected = true;
  }

  onContinue(): void {
    const selectedType = this.metricTypes.find((t) => t.selected);

    if (selectedType && this.hasAnalyzableFiles) {
      const payload: RunAnalysisOptions = {
        metrics: [...selectedType.config.metrics],
      };

      if (this.hasManualOverrides) {
        payload.pipeline_overrides = {
          file_stages: this.getManualOverrides(),
          excluded_files: [],
        };
      }

      this.runAnalysis.emit(payload);
    }
  }

  private getMergedStages(): { [key: string]: string[] } {
    const merged: { [key: string]: string[] } = {};

    // 1. Populate with auto-detected stages (prefer file-centric map when available)
    if (this.autoDetectedPipeline?.file_stages) {
      Object.entries(this.autoDetectedPipeline.file_stages).forEach(
        ([file, stages]) => {
          const normalizedFile = this.normalizePath(file);
          if (!normalizedFile) {
            return;
          }
          merged[normalizedFile] = Array.isArray(stages)
            ? [...new Set(stages)]
            : [];
        },
      );
    } else if (this.autoDetectedPipeline?.detected_stages) {
      const detectedStages = this.autoDetectedPipeline.detected_stages as any;
      Object.entries(detectedStages).forEach(([stage, files]) => {
        if (files && Array.isArray(files)) {
          files.forEach((f: any) => {
            const filePath = this.normalizePath(String(f.file || ""));
            if (!filePath) {
              return;
            }
            if (!merged[filePath]) {
              merged[filePath] = [];
            }
            if (!merged[filePath].includes(stage)) {
              merged[filePath].push(stage);
            }
          });
        }
      });
    }

    // 2. Apply manual overrides confirmed in the Validate Pipeline step.
    // This will overwrite auto-detected stages for files that have been manually edited.
    // Keeping an empty array in manualFileStages effectively removes the file from analysis.
    Object.entries(this.manualFileStages || {}).forEach(([file, stages]) => {
      const normalizedFile = this.normalizePath(file);
      if (!normalizedFile) {
        return;
      }
      merged[normalizedFile] = [...stages];
    });
    return merged;
  }

  private get hasManualOverrides(): boolean {
    return Object.keys(this.manualFileStages || {}).length > 0;
  }

  private getManualOverrides(): { [key: string]: string[] } {
    const overrides: { [key: string]: string[] } = {};

    Object.entries(this.manualFileStages || {}).forEach(([file, stages]) => {
      const normalizedFile = this.normalizePath(file);
      if (!normalizedFile) {
        return;
      }
      overrides[normalizedFile] = Array.isArray(stages) ? [...new Set(stages)] : [];
    });

    return overrides;
  }

  private normalizePath(path: string): string {
    return path.replace(/\\/g, "/").replace(/^\/+/, "").trim();
  }

  onBack(): void {
    this.back.emit();
  }
}
