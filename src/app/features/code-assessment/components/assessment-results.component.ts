import { Component, Input, Output, EventEmitter } from '@angular/core';
import { AnalyzeResponse } from '@app/core/models';

@Component({
  selector: 'app-assessment-results',
  template: `
    <div class="w-full max-w-7xl mx-auto px-4">
      <!-- Header -->
      <div class="text-center mb-8">
        <div class="inline-flex items-center justify-center w-16 h-16 rounded-full bg-green-100 mb-4">
          <svg class="w-8 h-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"></path>
          </svg>
        </div>
        <h2 class="text-3xl font-bold mb-2" style="color: rgb(0, 32, 96);">Analysis Complete</h2>
        <p class="text-gray-600">Here are the quality metrics for your Python project</p>
      </div>

      <div *ngIf="results">
        <!-- Overall Score Card -->
        <div class="bg-white rounded-xl border border-gray-200 shadow-lg p-8 mb-6">
          <div class="flex items-center justify-between flex-wrap gap-6">
            <div class="flex-1 min-w-[200px]">
              <h3 class="text-lg font-semibold text-gray-700 mb-2">Overall Quality Score</h3>
              <div class="flex items-baseline gap-2">
                <span class="text-5xl font-bold" [ngClass]="getScoreColor(fpcResults?.score || 0)">
                  {{ (fpcResults?.score || 0).toFixed(1) }}
                </span>
                <span class="text-2xl text-gray-400">/10</span>
              </div>
              <div class="mt-2">
                <div class="w-full h-3 bg-gray-200 rounded-full overflow-hidden">
                  <div 
                    class="h-full transition-all duration-1000 rounded-full"
                    [ngClass]="getScoreBarColor(fpcResults?.score || 0)"
                    [style.width.%]="(fpcResults?.score || 0) * 10">
                  </div>
                </div>
              </div>
              <p class="text-sm text-gray-500 mt-2">{{ getScoreLabel(fpcResults?.score || 0) }}</p>
            </div>

            <div class="flex gap-6">
              <div class="text-center">
                <div class="text-3xl font-bold text-gray-800">{{ fpcResults?.module_count || 0 }}</div>
                <div class="text-sm text-gray-600 mt-1">Modules Analyzed</div>
              </div>
              <div class="text-center">
                <div class="text-3xl font-bold text-gray-800">{{ fpcResults?.details?.summary?.total_files || 0 }}</div>
                <div class="text-sm text-gray-600 mt-1">Files Scanned</div>
              </div>
            </div>
          </div>
        </div>

        <!-- Cohesion Analysis -->
        <div class="bg-white rounded-xl border border-gray-200 shadow-lg p-8 mb-6">
          <h3 class="text-xl font-bold mb-6" style="color: rgb(0, 32, 96);">
            <svg class="w-6 h-6 inline-block mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"></path>
            </svg>
            Code Cohesion Distribution
          </h3>
          
          <div class="grid grid-cols-1 md:grid-cols-3 gap-6">
            <!-- High Cohesion -->
            <div class="bg-green-50 border border-green-200 rounded-lg p-6 hover:shadow-md transition-shadow">
              <div class="flex items-center justify-between mb-4">
                <div class="flex items-center gap-3">
                  <div class="w-12 h-12 bg-green-500 rounded-lg flex items-center justify-center">
                    <svg class="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"></path>
                    </svg>
                  </div>
                  <div>
                    <div class="text-sm font-medium text-green-700">High Cohesion</div>
                    <div class="text-2xl font-bold text-green-900">{{ fpcResults?.details?.summary?.high_cohesion || 0 }}</div>
                  </div>
                </div>
              </div>
              <div class="text-xs text-green-700">Well-structured modules with focused responsibilities</div>
            </div>

            <!-- Medium Cohesion -->
            <div class="bg-yellow-50 border border-yellow-200 rounded-lg p-6 hover:shadow-md transition-shadow">
              <div class="flex items-center justify-between mb-4">
                <div class="flex items-center gap-3">
                  <div class="w-12 h-12 bg-yellow-500 rounded-lg flex items-center justify-center">
                    <svg class="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"></path>
                    </svg>
                  </div>
                  <div>
                    <div class="text-sm font-medium text-yellow-700">Medium Cohesion</div>
                    <div class="text-2xl font-bold text-yellow-900">{{ fpcResults?.details?.summary?.medium_cohesion || 0 }}</div>
                  </div>
                </div>
              </div>
              <div class="text-xs text-yellow-700">Acceptable structure, some improvement possible</div>
            </div>

            <!-- Low Cohesion -->
            <div class="bg-red-50 border border-red-200 rounded-lg p-6 hover:shadow-md transition-shadow">
              <div class="flex items-center justify-between mb-4">
                <div class="flex items-center gap-3">
                  <div class="w-12 h-12 bg-red-500 rounded-lg flex items-center justify-center">
                    <svg class="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"></path>
                    </svg>
                  </div>
                  <div>
                    <div class="text-sm font-medium text-red-700">Low Cohesion</div>
                    <div class="text-2xl font-bold text-red-900">{{ fpcResults?.details?.summary?.low_cohesion || 0 }}</div>
                  </div>
                </div>
              </div>
              <div class="text-xs text-red-700">Needs refactoring for better organization</div>
            </div>
          </div>

          <!-- Progress Bar Visualization -->
          <div class="mt-6">
            <div class="flex items-center gap-2 mb-2">
              <span class="text-sm font-medium text-gray-700">Distribution:</span>
              <span class="text-sm text-gray-500">{{ getTotalFiles() }} files analyzed</span>
            </div>
            <div class="w-full h-4 bg-gray-200 rounded-full overflow-hidden flex">
              <div 
                *ngIf="getHighCohesionPercent() > 0"
                class="bg-green-500 h-full transition-all duration-1000"
                [style.width.%]="getHighCohesionPercent()"
                [title]="'High: ' + getHighCohesionPercent().toFixed(1) + '%'">
              </div>
              <div 
                *ngIf="getMediumCohesionPercent() > 0"
                class="bg-yellow-500 h-full transition-all duration-1000"
                [style.width.%]="getMediumCohesionPercent()"
                [title]="'Medium: ' + getMediumCohesionPercent().toFixed(1) + '%'">
              </div>
              <div 
                *ngIf="getLowCohesionPercent() > 0"
                class="bg-red-500 h-full transition-all duration-1000"
                [style.width.%]="getLowCohesionPercent()"
                [title]="'Low: ' + getLowCohesionPercent().toFixed(1) + '%'">
              </div>
            </div>
            <div class="flex justify-between text-xs text-gray-600 mt-1">
              <span>{{ getHighCohesionPercent().toFixed(0) }}% High</span>
              <span>{{ getMediumCohesionPercent().toFixed(0) }}% Medium</span>
              <span>{{ getLowCohesionPercent().toFixed(0) }}% Low</span>
            </div>
          </div>
        </div>

        <!-- File Details -->
        <div class="bg-white rounded-xl border border-gray-200 shadow-lg p-8 mb-6">
          <h3 class="text-xl font-bold mb-6" style="color: rgb(0, 32, 96);">
            <svg class="w-6 h-6 inline-block mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"></path>
            </svg>
            Detailed File Analysis
          </h3>

          <div class="space-y-3">
            <div *ngFor="let file of fpcResults?.details?.files || []; let i = index" 
                 class="border border-gray-200 rounded-lg p-4 hover:border-blue-300 hover:bg-blue-50 transition-all">
              <div class="flex items-start justify-between gap-4">
                <div class="flex-1">
                  <div class="flex items-center gap-3 mb-2">
                    <span class="px-2 py-1 text-xs font-mono bg-gray-100 text-gray-800 rounded">
                      {{ getFileName(file.source) }}
                    </span>
                    <span 
                      class="px-2 py-1 text-xs font-semibold rounded"
                      [ngClass]="getCohesionBadgeClass(file.cohesion_level)">
                      {{ file.cohesion_level }}
                    </span>
                  </div>
                  <div class="text-xs text-gray-600 mb-2">{{ file.source }}</div>
                  <div class="flex gap-4 text-sm">
                    <div class="flex items-center gap-1">
                      <svg class="w-4 h-4 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z"></path>
                      </svg>
                      <span class="text-gray-700">{{ file.unique_stages }} stages</span>
                    </div>
                    <div class="flex items-center gap-1">
                      <svg class="w-4 h-4 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 6V4m0 2a2 2 0 100 4m0-4a2 2 0 110 4m-6 8a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4m6 6v10m6-2a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4"></path>
                      </svg>
                      <span class="text-gray-700">{{ file.unique_phases }} phases</span>
                    </div>
                  </div>
                </div>
                <button 
                  (click)="toggleFileDetails(i)"
                  class="p-2 hover:bg-gray-200 rounded-lg transition-colors">
                  <svg class="w-5 h-5 text-gray-600 transition-transform" 
                       [class.rotate-180]="expandedFiles.has(i)"
                       fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7"></path>
                  </svg>
                </button>
              </div>

              <!-- Expanded Details -->
              <div *ngIf="expandedFiles.has(i)" class="mt-4 pt-4 border-t border-gray-200">
                <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <h4 class="text-sm font-semibold text-gray-700 mb-2">Stages Detected:</h4>
                    <div class="flex flex-wrap gap-1">
                      <span *ngFor="let stage of file.stages_detected" 
                            class="px-2 py-1 text-xs bg-blue-100 text-blue-800 rounded">
                        {{ stage }}
                      </span>
                      <span *ngIf="file.stages_detected.length === 0" class="text-xs text-gray-500 italic">
                        No stages detected
                      </span>
                    </div>
                  </div>
                  <div>
                    <h4 class="text-sm font-semibold text-gray-700 mb-2">Phases Detected:</h4>
                    <div class="flex flex-wrap gap-1">
                      <span *ngFor="let phase of file.phases_detected" 
                            class="px-2 py-1 text-xs bg-purple-100 text-purple-800 rounded">
                        {{ phase }}
                      </span>
                      <span *ngIf="file.phases_detected.length === 0" class="text-xs text-gray-500 italic">
                        No phases detected
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <div *ngIf="(fpcResults?.details?.files?.length || 0) === 0" 
                 class="text-center py-8 text-gray-500">
              No files analyzed
            </div>
          </div>
        </div>

        <!-- Action Buttons -->
        <div class="flex items-center justify-between gap-4 pt-6">
          <button
            (click)="onNewAnalysis()"
            class="px-6 py-3 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors duration-200 flex items-center gap-2">
            <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"></path>
            </svg>
            New Analysis
          </button>
          
          <button
            (click)="onExportResults()"
            class="px-8 py-3 text-sm font-medium text-white rounded-lg transition-all duration-200 hover:shadow-lg flex items-center gap-2"
            style="background: linear-gradient(135deg, rgb(0, 32, 96) 0%, rgb(0, 50, 120) 100%);">
            <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4"></path>
            </svg>
            Export Report
          </button>
        </div>
      </div>

      <!-- No Results -->
      <div *ngIf="!results" class="text-center py-12">
        <div class="text-gray-400 mb-4">
          <svg class="w-16 h-16 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"></path>
          </svg>
        </div>
        <p class="text-gray-600">No results available</p>
      </div>
    </div>
  `,
  standalone: false
})
export class AssessmentResultsComponent {
  @Input() results: AnalyzeResponse | null = null;
  @Output() newAnalysis = new EventEmitter<void>();
  @Output() exportResults = new EventEmitter<void>();

  expandedFiles = new Set<number>();

  get fpcResults() {
    return this.results?.results?.fpc;
  }

  getTotalFiles(): number {
    const summary = this.fpcResults?.details?.summary;
    if (!summary) return 0;
    return summary.high_cohesion + summary.medium_cohesion + summary.low_cohesion;
  }

  getHighCohesionPercent(): number {
    const total = this.getTotalFiles();
    if (total === 0) return 0;
    return (this.fpcResults?.details?.summary?.high_cohesion || 0) / total * 100;
  }

  getMediumCohesionPercent(): number {
    const total = this.getTotalFiles();
    if (total === 0) return 0;
    return (this.fpcResults?.details?.summary?.medium_cohesion || 0) / total * 100;
  }

  getLowCohesionPercent(): number {
    const total = this.getTotalFiles();
    if (total === 0) return 0;
    return (this.fpcResults?.details?.summary?.low_cohesion || 0) / total * 100;
  }

  getScoreColor(score: number): string {
    if (score >= 8) return 'text-green-600';
    if (score >= 6) return 'text-yellow-600';
    if (score >= 4) return 'text-orange-600';
    return 'text-red-600';
  }

  getScoreBarColor(score: number): string {
    if (score >= 8) return 'bg-green-500';
    if (score >= 6) return 'bg-yellow-500';
    if (score >= 4) return 'bg-orange-500';
    return 'bg-red-500';
  }

  getScoreLabel(score: number): string {
    if (score >= 8) return 'Excellent code quality';
    if (score >= 6) return 'Good code quality';
    if (score >= 4) return 'Fair code quality - improvement recommended';
    return 'Poor code quality - refactoring needed';
  }

  getCohesionBadgeClass(level: string): string {
    const normalizedLevel = level?.toLowerCase() || '';
    if (normalizedLevel.includes('high')) {
      return 'bg-green-100 text-green-800';
    }
    if (normalizedLevel.includes('medium')) {
      return 'bg-yellow-100 text-yellow-800';
    }
    return 'bg-red-100 text-red-800';
  }

  getFileName(path: string): string {
    if (!path) return '';
    const parts = path.split('/');
    return parts[parts.length - 1];
  }

  toggleFileDetails(index: number): void {
    if (this.expandedFiles.has(index)) {
      this.expandedFiles.delete(index);
    } else {
      this.expandedFiles.add(index);
    }
  }

  onNewAnalysis(): void {
    this.newAnalysis.emit();
  }

  onExportResults(): void {
    this.exportResults.emit();
  }
}
