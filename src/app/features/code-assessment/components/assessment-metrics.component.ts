import { Component, Output, EventEmitter } from '@angular/core';

@Component({
  selector: 'app-assessment-metrics',
  template: `
    <div class="w-full max-w-4xl">
      <div class="text-center mb-8">
        <h2 class="text-2xl font-bold mb-2" style="color: rgb(0, 32, 96);">Choose Metrics</h2>
        <p class="text-gray-600">Select the quality metrics you want to analyze in your project</p>
      </div>
      
      <!-- Metrics Selection Card -->
      <div class="bg-white rounded-lg border border-gray-200 shadow-sm p-8">
        <!-- Info Banner -->
        <div class="bg-blue-50 border border-blue-100 rounded-lg p-4 mb-6">
          <div class="flex gap-3">
            <svg class="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path>
            </svg>
            <div>
              <p class="text-sm font-medium text-blue-900 mb-1">Available Metrics</p>
              <p class="text-sm text-blue-700">
                We'll analyze your code using CCPM (Conceptual Cohesion of Pipeline Modules) metrics to assess code quality.
              </p>
            </div>
          </div>
        </div>

        <!-- Metrics List -->
        <div class="space-y-4 mb-8">
          <div class="border border-gray-200 rounded-lg p-4 bg-gray-50">
            <div class="flex items-start gap-3">
              <div class="flex-shrink-0 mt-1">
                <svg class="w-6 h-6 text-green-600" fill="currentColor" viewBox="0 0 20 20">
                  <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clip-rule="evenodd"></path>
                </svg>
              </div>
              <div class="flex-1">
                <h3 class="text-base font-semibold text-gray-900 mb-1">CCPM Metrics (Default)</h3>
                <p class="text-sm text-gray-600 mb-2">
                  Comprehensive quality assessment including:
                </p>
                <ul class="text-sm text-gray-600 space-y-1 ml-4">
                  <li>• File structure analysis</li>
                  <li>• Pipeline detection and validation</li>
                  <li>• Class complexity metrics</li>
                  <li>• Code maintainability index</li>
                </ul>
              </div>
              <div class="flex-shrink-0">
                <span class="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">
                  Selected
                </span>
              </div>
            </div>
          </div>

          <!-- Additional metrics (coming soon) -->
          <div class="border border-gray-200 rounded-lg p-4 opacity-60">
            <div class="flex items-start gap-3">
              <div class="flex-shrink-0 mt-1">
                <svg class="w-6 h-6 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"></path>
                </svg>
              </div>
              <div class="flex-1">
                <h3 class="text-base font-semibold text-gray-700 mb-1">Additional Metrics</h3>
                <p class="text-sm text-gray-500">
                  More metrics will be available in future updates
                </p>
              </div>
              <div class="flex-shrink-0">
                <span class="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-gray-100 text-gray-600">
                  Coming Soon
                </span>
              </div>
            </div>
          </div>
        </div>

        <!-- Action Buttons -->
        <div class="flex items-center justify-between gap-4 pt-6 border-t border-gray-200">
          <button
            (click)="onBack()"
            class="px-6 py-3 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors duration-200 flex items-center gap-2">
            <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10 19l-7-7m0 0l7-7m-7 7h18"></path>
            </svg>
            Back
          </button>
          
          <button
            (click)="onRunAnalysis()"
            [disabled]="isAnalyzing"
            class="px-8 py-3 text-sm font-medium text-white rounded-lg transition-all duration-200 hover:shadow-lg disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
            style="background: linear-gradient(135deg, rgb(0, 32, 96) 0%, rgb(0, 50, 120) 100%);">
            <svg *ngIf="!isAnalyzing" class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z"></path>
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path>
            </svg>
            <svg *ngIf="isAnalyzing" class="w-5 h-5 animate-spin" fill="none" viewBox="0 0 24 24">
              <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
              <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
            </svg>
            {{ isAnalyzing ? 'Analyzing...' : 'Run Analysis' }}
          </button>
        </div>
      </div>
    </div>
  `,
  standalone: false
})
export class AssessmentMetricsComponent {
  @Output() runAnalysis = new EventEmitter<string[]>();
  @Output() back = new EventEmitter<void>();

  isAnalyzing = false;

  onRunAnalysis(): void {
    this.isAnalyzing = true;
    // For now, we only support CCPM metrics
    this.runAnalysis.emit(['ccpm']);
  }

  onBack(): void {
    this.back.emit();
  }
}
