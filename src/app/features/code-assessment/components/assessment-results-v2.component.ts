import { Component, Input, Output, EventEmitter, OnInit } from '@angular/core';
import { 
  AnalyzeResponse, 
  AnalysisResult,
  FPCResult,
  FileStructureResult,
  LCCMLResult,
  PyLintResult,
  RadonCCResult,
  RadonMIResult,
  PipelineDetectionResult
} from '@app/core/models';

interface FileRecommendation {
  filePath: string;
  metricId: string;
  metricName: string;
  severity: 'error' | 'warning' | 'info';
  message: string;
  details?: any;
}

@Component({
  selector: 'app-assessment-results-v2',
  template: `
    <div class="w-full max-w-7xl mx-auto px-4 py-8">
      
      <div class="flex items-center justify-between mb-8">
        <div>
          <h2 class="text-3xl font-bold mb-2" style="color: rgb(0, 32, 96);">Analysis Results</h2>
          <p class="text-gray-600">Quality metrics for your Python project</p>
        </div>
        
        <div class="flex gap-3">
          <button
            (click)="onExport()"
            class="px-6 py-3 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors flex items-center gap-2">
            <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"></path>
            </svg>
            Export Results
          </button>
          
          <button
            (click)="onNewAnalysis()"
            class="px-6 py-3 text-sm font-medium text-white rounded-lg transition-all hover:shadow-lg flex items-center gap-2"
            style="background: linear-gradient(135deg, rgb(0, 32, 96) 0%, rgb(0, 50, 120) 100%);">
            <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"></path>
            </svg>
            New Analysis
          </button>
        </div>
      </div>

      <div class="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        <div class="lg:col-span-2 space-y-6">
          <div *ngFor="let metric of analyzedMetrics" 
               class="bg-white rounded-lg border border-gray-200 shadow-sm hover:shadow-md transition-shadow">
            
            <div class="border-b border-gray-200 px-6 py-4">
              <div class="flex items-center justify-between">
                <div class="flex items-center gap-3">
                  <div class="w-12 h-12 rounded-lg flex items-center justify-center"
                       [ngClass]="getScoreBgClass(metric.score)">
                    <span class="text-xl font-bold" [ngClass]="getScoreTextClass(metric.score)">
                      {{ metric.score.toFixed(1) }}
                    </span>
                  </div>
                  <div>
                    <h3 class="text-lg font-bold text-gray-900">{{ metric.documentation.name }}</h3>
                    <p class="text-sm text-gray-600">{{ metric.documentation.category }}</p>
                  </div>
                </div>
                
                <button 
                  (click)="toggleMetricDetails(metric.analyzer_id)"
                  class="p-2 hover:bg-gray-100 rounded-lg transition-colors">
                  <svg class="w-5 h-5 text-gray-600 transition-transform"
                       [class.rotate-180]="expandedMetrics.has(metric.analyzer_id)"
                       fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7"></path>
                  </svg>
                </button>
              </div>
            </div>

            <div class="px-6 py-4">
              <p class="text-sm text-gray-700 mb-4">{{ metric.documentation.description }}</p>
              
              <div class="w-full h-2 bg-gray-200 rounded-full overflow-hidden mb-2">
                <div 
                  class="h-full transition-all duration-1000 rounded-full"
                  [ngClass]="getScoreBarClass(metric.score)"
                  [style.width.%]="metric.score * 10">
                </div>
              </div>
              
              <div class="flex items-center justify-between text-xs text-gray-600">
                <span>{{ getScoreInterpretation(metric) }}</span>
                <span>{{ metric.module_count }} modules</span>
              </div>
            </div>

            <div *ngIf="expandedMetrics.has(metric.analyzer_id)" class="border-t border-gray-200 px-6 py-4 bg-gray-50">
              
              <div class="mb-4">
                <h4 class="text-sm font-semibold text-gray-900 mb-2">Interpretation Guide</h4>
                <div class="space-y-1">
                  <div *ngFor="let item of getInterpretationItems(metric)" class="text-xs text-gray-700">
                    <span class="font-medium">{{ item.range }}:</span> {{ item.description }}
                  </div>
                </div>
              </div>

              <div *ngIf="metric.documentation.formula" class="mb-4">
                <h4 class="text-sm font-semibold text-gray-900 mb-2">Formula</h4>
                <code class="text-xs bg-white px-3 py-2 rounded border border-gray-200 block">{{ metric.documentation.formula }}</code>
              </div>

              <div *ngIf="metric.documentation.references.length > 0" class="mb-4">
                <h4 class="text-sm font-semibold text-gray-900 mb-2">References</h4>
                <ul class="space-y-1">
                  <li *ngFor="let ref of metric.documentation.references" class="text-xs">
                    <a [href]="ref" target="_blank" class="text-blue-600 hover:underline flex items-center gap-1">
                      {{ ref }}
                      <svg class="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14"></path>
                      </svg>
                    </a>
                  </li>
                </ul>
              </div>

              <div *ngIf="hasFileRecommendations(metric.analyzer_id)">
                <h4 class="text-sm font-semibold text-gray-900 mb-3">File-Level Issues</h4>
                <div class="space-y-2 max-h-64 overflow-y-auto">
                  <div *ngFor="let rec of getFileRecommendations(metric.analyzer_id)"
                       class="text-xs border rounded-lg p-3"
                       [ngClass]="{
                         'border-red-200 bg-red-50': rec.severity === 'error',
                         'border-yellow-200 bg-yellow-50': rec.severity === 'warning',
                         'border-blue-200 bg-blue-50': rec.severity === 'info'
                       }">
                    <div class="flex items-start gap-2 mb-1">
                      <svg *ngIf="rec.severity === 'error'" class="w-4 h-4 text-red-600 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path>
                      </svg>
                      <svg *ngIf="rec.severity === 'warning'" class="w-4 h-4 text-yellow-600 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"></path>
                      </svg>
                      <svg *ngIf="rec.severity === 'info'" class="w-4 h-4 text-blue-600 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path>
                      </svg>
                      <div class="flex-1">
                        <p class="font-mono font-medium mb-1"
                           [ngClass]="{
                             'text-red-900': rec.severity === 'error',
                             'text-yellow-900': rec.severity === 'warning',
                             'text-blue-900': rec.severity === 'info'
                           }">{{ rec.filePath }}</p>
                        <p class="text-gray-700 mb-1">{{ rec.message }}</p>
                        <div *ngIf="rec.details" class="text-gray-600 text-xs mt-1">
                          <pre class="whitespace-pre-wrap">{{ formatDetails(rec.details) }}</pre>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div class="lg:col-span-1">
          <div class="bg-white rounded-lg border border-gray-200 shadow-sm sticky top-4">
            <div class="border-b border-gray-200 px-6 py-4">
              <h3 class="text-lg font-bold text-gray-900">Summary</h3>
            </div>
            
            <div class="p-6 space-y-4">
              <div>
                <div class="text-sm text-gray-600 mb-1">Session ID</div>
                <div class="text-xs font-mono bg-gray-50 px-3 py-2 rounded border border-gray-200 truncate">
                  {{ results?.session_id }}
                </div>
              </div>

              <div>
                <div class="text-sm text-gray-600 mb-1">Analyzed</div>
                <div class="text-sm font-medium text-gray-900">
                  {{ results?.timestamp | date:'medium' }}
                </div>
              </div>

              <div>
                <div class="text-sm text-gray-600 mb-2">Metrics Run</div>
                <div class="space-y-2">
                  <div *ngFor="let metric of analyzedMetrics" 
                       class="flex items-center justify-between text-xs">
                    <span class="text-gray-700">{{ metric.documentation.name }}</span>
                    <span class="px-2 py-1 rounded font-medium"
                          [ngClass]="{
                            'bg-green-100 text-green-800': metric.score >= 7,
                            'bg-yellow-100 text-yellow-800': metric.score >= 4 && metric.score < 7,
                            'bg-red-100 text-red-800': metric.score < 4
                          }">
                      {{ metric.score.toFixed(1) }}
                    </span>
                  </div>
                </div>
              </div>

              <div class="pt-4 border-t border-gray-200">
                <div class="text-sm text-gray-600 mb-2">Total Issues Found</div>
                <div class="grid grid-cols-3 gap-2 text-center">
                  <div>
                    <div class="text-xl font-bold text-red-600">{{ getTotalIssues('error') }}</div>
                    <div class="text-xs text-gray-600">Errors</div>
                  </div>
                  <div>
                    <div class="text-xl font-bold text-yellow-600">{{ getTotalIssues('warning') }}</div>
                    <div class="text-xs text-gray-600">Warnings</div>
                  </div>
                  <div>
                    <div class="text-xl font-bold text-blue-600">{{ getTotalIssues('info') }}</div>
                    <div class="text-xs text-gray-600">Info</div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  `,
  standalone: false
})
export class AssessmentResultsV2Component implements OnInit {
  @Input() results: AnalyzeResponse | null = null;
  @Output() newAnalysis = new EventEmitter<void>();
  @Output() exportResults = new EventEmitter<void>();

  analyzedMetrics: AnalysisResult[] = [];
  fileRecommendations: FileRecommendation[] = [];
  expandedMetrics = new Set<string>();

  ngOnInit(): void {
    if (this.results?.results) {
      this.analyzedMetrics = Object.values(this.results.results);
      this.extractFileRecommendations();
    }
  }

  extractFileRecommendations(): void {
    this.fileRecommendations = [];

    Object.entries(this.results?.results || {}).forEach(([key, result]) => {
      const metricId = result.analyzer_id;
      const metricName = result.documentation.name;

      if (metricId === 'fpc') {
        const fpcResult = result as FPCResult;
        (fpcResult.messages || []).forEach((msg: any) => {
          this.fileRecommendations.push({
            filePath: msg.file,
            metricId,
            metricName,
            severity: msg.severity,
            message: `${msg.diagnosis} - ${msg.recommendation}`,
            details: msg
          });
        });
      } else if (metricId === 'file_structure') {
        const fsResult = result as FileStructureResult;
        Object.entries(fsResult.details.files || {}).forEach(([filePath, fileData]) => {
          if (fileData.recommendation && fileData.severity) {
            this.fileRecommendations.push({
              filePath,
              metricId,
              metricName,
              severity: fileData.severity,
              message: fileData.recommendation,
              details: fileData
            });
          }
        });
      } else if (metricId === 'lccml') {
        const lccmlResult = result as LCCMLResult;
        Object.entries(lccmlResult.details.files || {}).forEach(([filePath, fileData]) => {
          if (fileData.lccml !== null && fileData.lccml < 0.5) {
            this.fileRecommendations.push({
              filePath,
              metricId,
              metricName,
              severity: fileData.lccml < 0.2 ? 'error' : 'warning',
              message: `Low cohesion detected (${fileData.lccml.toFixed(2)}). ${fileData.n_disconnected_pairs || 0} disconnected method pairs.`,
              details: fileData
            });
          }
        });
      } else if (metricId === 'pylint') {
        const pylintResult = result as PyLintResult;
        (pylintResult.details?.messages || []).forEach((msg: any) => {
          this.fileRecommendations.push({
            filePath: msg.path,
            metricId,
            metricName,
            severity: msg.type === 'error' || msg.type === 'fatal' ? 'error' : 
                     msg.type === 'warning' ? 'warning' : 'info',
            message: `[${msg.symbol}] ${msg.message} (Line ${msg.line})`,
            details: msg
          });
        });
      }
    });
  }

  toggleMetricDetails(analyzerId: string): void {
    if (this.expandedMetrics.has(analyzerId)) {
      this.expandedMetrics.delete(analyzerId);
    } else {
      this.expandedMetrics.add(analyzerId);
    }
  }

  hasFileRecommendations(metricId: string): boolean {
    return this.fileRecommendations.some(r => r.metricId === metricId);
  }

  getFileRecommendations(metricId: string): FileRecommendation[] {
    return this.fileRecommendations.filter(r => r.metricId === metricId);
  }

  getScoreBgClass(score: number): string {
    if (score >= 7) return 'bg-green-100';
    if (score >= 4) return 'bg-yellow-100';
    return 'bg-red-100';
  }

  getScoreTextClass(score: number): string {
    if (score >= 7) return 'text-green-700';
    if (score >= 4) return 'text-yellow-700';
    return 'text-red-700';
  }

  getScoreBarClass(score: number): string {
    if (score >= 7) return 'bg-green-500';
    if (score >= 4) return 'bg-yellow-500';
    return 'bg-red-500';
  }

  getScoreInterpretation(metric: AnalysisResult): string {
    const score = metric.score;
    const interpretation = metric.documentation.interpretation;
    
    for (const [range, description] of Object.entries(interpretation)) {
      if (this.isScoreInRange(score, range)) {
        return description;
      }
    }
    
    return 'No interpretation available';
  }

  isScoreInRange(score: number, range: string): boolean {
    if (range.includes('-')) {
      const [min, max] = range.split('-').map(s => parseFloat(s.trim()));
      return score >= min && score <= max;
    } else if (range.startsWith('>')) {
      const min = parseFloat(range.substring(1));
      return score > min;
    } else if (range.startsWith('<')) {
      const max = parseFloat(range.substring(1));
      return score < max;
    }
    return false;
  }

  getInterpretationItems(metric: AnalysisResult): Array<{range: string, description: string}> {
    return Object.entries(metric.documentation.interpretation).map(([range, description]) => ({
      range,
      description
    }));
  }

  getTotalIssues(severity: 'error' | 'warning' | 'info'): number {
    return this.fileRecommendations.filter(r => r.severity === severity).length;
  }

  formatDetails(details: any): string {
    if (!details) return '';
    const filtered = { ...details };
    delete filtered.recommendation;
    delete filtered.severity;
    return JSON.stringify(filtered, null, 2);
  }

  onNewAnalysis(): void {
    this.newAnalysis.emit();
  }

  onExport(): void {
    this.exportResults.emit();
  }
}
