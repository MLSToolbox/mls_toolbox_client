import { Component, Input, Output, EventEmitter, OnInit, OnChanges } from '@angular/core';
import { 
  AnalyzeResponse, 
  AnalysisResult,
  FPCResult,
  FileStructureResult,
  LCCMLResult,
  PyLintResult,
  PipelineDetectionResult
} from '@app/core/models';
import { TreeStructure, ChildChild } from '@app/core/models/upload-zip.model';

interface FileMetricsData {
  [metricId: string]: {
    metricName: string;
    category: string;
    data: any;
    score?: number;
    severity?: 'error' | 'warning' | 'info' | 'success';
    messages?: string[];
  };
}

@Component({
  selector: 'app-assessment-results-final',
  template: `
    <div class="flex h-screen bg-gray-50">
      
      <div class="w-80 bg-white border-r border-gray-200 flex flex-col overflow-hidden">
        <div class="border-b border-gray-200 px-4 py-3 bg-gradient-to-r from-blue-50 to-indigo-50">
          <!-- New Analysis Button -->
          <button
            (click)="onNewAnalysis()"
            class="w-full px-3 py-2 mb-3 text-sm font-medium text-white rounded-lg transition-all hover:shadow-lg flex items-center justify-center gap-2"
            style="background: linear-gradient(135deg, rgb(0, 32, 96) 0%, rgb(0, 50, 120) 100%);">
            <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"></path>
            </svg>
            New Analysis
          </button>
          
          <!-- Download Results Button -->
          <button
            class="w-full px-3 py-2 mb-3 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors flex items-center justify-center gap-2">
            <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"></path>
            </svg>
            Download Results
          </button>
          
          <h3 class="text-sm font-bold text-gray-900 mb-1">Project Structure</h3>
          <p class="text-xs text-gray-600">Click on any file to see metrics</p>
        </div>
        
        <div class="flex-1 overflow-y-auto p-4">
          <div *ngIf="projectStructure">
            <div 
              class="flex items-center gap-2 py-2 px-3 rounded-lg font-semibold text-blue-900 bg-blue-50 mb-2 cursor-pointer hover:bg-blue-100 transition-colors"
              (click)="selectNode(projectStructure.path, 'directory', projectStructure)">
              <svg class="w-5 h-5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-6l-2-2H5a2 2 0 00-2 2z"></path>
              </svg>
              <span class="text-sm">{{ projectStructure.name }}</span>
            </div>
            
            <div class="ml-2">
              <ng-container *ngFor="let child of projectStructure.children">
                <app-tree-node-clickable 
                  [node]="child" 
                  [level]="1"
                  [selectedPath]="selectedPath"
                  (nodeSelected)="onNodeSelected($event)">
                </app-tree-node-clickable>
              </ng-container>
            </div>
          </div>
        </div>
      </div>

      <div class="flex-1 overflow-y-auto">
        <div class="max-w-5xl mx-auto p-8">
          
          <div *ngIf="!selectedPath" class="text-center py-16">
            <div class="w-20 h-20 mx-auto rounded-full bg-blue-100 flex items-center justify-center mb-4">
              <svg class="w-10 h-10 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 15l-2 5L9 9l11 4-5 2zm0 0l5 5M7.188 2.239l.777 2.897M5.136 7.965l-2.898-.777M13.95 4.05l-2.122 2.122m-5.657 5.656l-2.12 2.122"></path>
              </svg>
            </div>
            <h2 class="text-2xl font-bold mb-2" style="color: rgb(0, 32, 96);">Analysis Results Ready</h2>
            <p class="text-gray-600 mb-6">Select a file or folder from the tree to view detailed metrics</p>
            
            <div class="grid grid-cols-2 md:grid-cols-4 gap-4 max-w-2xl mx-auto">
              <div class="bg-white rounded-lg border border-gray-200 p-4">
                <div class="text-2xl font-bold text-gray-900">{{ getTotalMetrics() }}</div>
                <div class="text-xs text-gray-600 mt-1">Metrics Run</div>
              </div>
              <div class="bg-white rounded-lg border border-gray-200 p-4">
                <div class="text-2xl font-bold text-gray-900">{{ getTotalFiles() }}</div>
                <div class="text-xs text-gray-600 mt-1">Files Analyzed</div>
              </div>
              <div class="bg-white rounded-lg border border-gray-200 p-4">
                <div class="text-2xl font-bold text-red-600">{{ getTotalIssues('error') }}</div>
                <div class="text-xs text-gray-600 mt-1">Errors</div>
              </div>
              <div class="bg-white rounded-lg border border-gray-200 p-4">
                <div class="text-2xl font-bold text-yellow-600">{{ getTotalIssues('warning') }}</div>
                <div class="text-xs text-gray-600 mt-1">Warnings</div>
              </div>
            </div>
          </div>

          <div *ngIf="selectedPath && selectedFileData">
            
            <div class="mb-8">
              <div class="flex items-center gap-3 mb-2">
                <svg *ngIf="selectedNodeType === 'directory'" class="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-6l-2-2H5a2 2 0 00-2 2z"></path>
                </svg>
                <svg *ngIf="selectedNodeType === 'file'" class="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"></path>
                </svg>
                <h2 class="text-2xl font-bold" style="color: rgb(0, 32, 96);">{{ getFileName(selectedPath) }}</h2>
              </div>
              <p class="text-sm text-gray-600 font-mono">{{ selectedPath }}</p>
            </div>

            <div *ngIf="Object.keys(selectedFileData).length === 0" class="bg-yellow-50 border border-yellow-200 rounded-lg p-6 text-center">
              <svg class="w-12 h-12 mx-auto mb-3 text-yellow-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path>
              </svg>
              <p class="text-yellow-800 font-medium">No metrics data available for this {{ selectedNodeType }}</p>
              <p class="text-yellow-700 text-sm mt-1">This {{ selectedNodeType }} was not analyzed or does not contain Python files</p>
            </div>

            <div class="space-y-6">
              <div *ngFor="let metricId of getMetricIds()" 
                   class="bg-white rounded-lg border border-gray-200 shadow-sm overflow-hidden">
                
                <div class="border-b border-gray-200 px-6 py-4 bg-gray-50">
                  <div class="flex items-center justify-between">
                    <div>
                      <h3 class="text-lg font-bold text-gray-900">{{ selectedFileData[metricId].metricName }}</h3>
                      <span class="text-xs px-2 py-1 rounded font-medium inline-block mt-1"
                            [ngClass]="getCategoryClass(selectedFileData[metricId].category)">
                        {{ selectedFileData[metricId].category }}
                      </span>
                    </div>
                    <div *ngIf="selectedFileData[metricId].score !== undefined" 
                         class="text-right">
                      <div class="text-3xl font-bold"
                           [ngClass]="getScoreTextClass(selectedFileData[metricId].score!)">
                        {{ selectedFileData[metricId].score!.toFixed(1) }}
                      </div>
                      <div class="text-xs text-gray-600">Score</div>
                    </div>
                  </div>
                </div>

                <div class="px-6 py-4">
                  <div *ngIf="selectedFileData[metricId].severity" 
                       class="mb-4 px-4 py-3 rounded-lg flex items-start gap-3"
                       [ngClass]="{
                         'bg-red-50 border border-red-200': selectedFileData[metricId].severity === 'error',
                         'bg-yellow-50 border border-yellow-200': selectedFileData[metricId].severity === 'warning',
                         'bg-blue-50 border border-blue-200': selectedFileData[metricId].severity === 'info',
                         'bg-green-50 border border-green-200': selectedFileData[metricId].severity === 'success'
                       }">
                    <svg *ngIf="selectedFileData[metricId].severity === 'error'" class="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path>
                    </svg>
                    <svg *ngIf="selectedFileData[metricId].severity === 'warning'" class="w-5 h-5 text-yellow-600 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"></path>
                    </svg>
                    <svg *ngIf="selectedFileData[metricId].severity === 'info'" class="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path>
                    </svg>
                    <svg *ngIf="selectedFileData[metricId].severity === 'success'" class="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"></path>
                    </svg>
                    <div class="flex-1">
                      <div *ngFor="let msg of selectedFileData[metricId].messages" 
                           class="text-sm mb-2 last:mb-0"
                           [ngClass]="{
                             'text-red-800': selectedFileData[metricId].severity === 'error',
                             'text-yellow-800': selectedFileData[metricId].severity === 'warning',
                             'text-blue-800': selectedFileData[metricId].severity === 'info',
                             'text-green-800': selectedFileData[metricId].severity === 'success'
                           }">
                        {{ msg }}
                      </div>
                    </div>
                  </div>

                  <div class="space-y-3">
                    <div *ngFor="let item of getDataItems(selectedFileData[metricId].data)" class="flex items-start gap-3">
                      <div class="flex-shrink-0 w-32 text-sm font-medium text-gray-700">{{ item.label }}:</div>
                      <div class="flex-1">
                        <div *ngIf="!isArray(item.value) && !isObject(item.value)" class="text-sm text-gray-900">
                          {{ formatValue(item.value) }}
                        </div>
                        <div *ngIf="isArray(item.value)" class="space-y-1">
                          <div *ngFor="let arrItem of item.value" class="text-sm text-gray-700 flex items-center gap-2">
                            <svg class="w-3 h-3 text-gray-400" fill="currentColor" viewBox="0 0 20 20">
                              <path fill-rule="evenodd" d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z" clip-rule="evenodd"></path>
                            </svg>
                            {{ formatValue(arrItem) }}
                          </div>
                        </div>
                        <div *ngIf="isObject(item.value)" class="bg-gray-50 rounded p-3 text-xs font-mono">
                          <pre class="whitespace-pre-wrap text-gray-800">{{ formatObject(item.value) }}</pre>
                        </div>
                      </div>
                    </div>
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
export class AssessmentResultsFinalComponent implements OnInit, OnChanges {
  @Input() results: AnalyzeResponse | null = null;
  @Input() projectStructure: TreeStructure | null = null;
  @Output() newAnalysis = new EventEmitter<void>();
  @Output() exportResults = new EventEmitter<void>();

  selectedPath: string | null = null;
  selectedNodeType: 'file' | 'directory' | null = null;
  selectedFileData: FileMetricsData = {};
  allMetrics: AnalysisResult[] = [];
  fileMetricsMap: Map<string, FileMetricsData> = new Map();

  ngOnInit(): void {
    this.processResults();
  }

  ngOnChanges(): void {
    this.processResults();
  }

  processResults(): void {
    if (!this.results?.results) return;

    this.allMetrics = Object.values(this.results.results);
    this.fileMetricsMap.clear();

    this.allMetrics.forEach(metric => {
      const metricId = metric.analyzer_id;
      const metricName = metric.documentation.name;
      const category = metric.documentation.category;

      if (metricId === 'fpc') {
        this.processFPCMetric(metric as FPCResult, metricName, category);
      } else if (metricId === 'file_structure') {
        this.processFileStructureMetric(metric as FileStructureResult, metricName, category);
      } else if (metricId === 'lccml') {
        this.processLCCMLMetric(metric as LCCMLResult, metricName, category);
      } else if (metricId === 'pylint') {
        this.processPyLintMetric(metric as PyLintResult, metricName, category);
      } else if (metricId === 'radon_cc') {
        this.processRadonCCMetric(metric, metricName, category);
      } else if (metricId === 'radon_mi') {
        this.processRadonMIMetric(metric, metricName, category);
      } else if (metricId === 'pipeline') {
        this.processPipelineDetectionMetric(metric as PipelineDetectionResult, metricName, category);
      }
    });
  }

  processFPCMetric(metric: FPCResult, metricName: string, category: string): void {
    Object.entries(metric.details?.files || {}).forEach(([filePath, fileData]) => {
      // Normalize path - add leading slash if not present
      const normalizedPath = filePath.startsWith('/') ? filePath : '/' + filePath;
      
      if (!this.fileMetricsMap.has(normalizedPath)) {
        this.fileMetricsMap.set(normalizedPath, {});
      }
      
      const fileMetrics = this.fileMetricsMap.get(normalizedPath)!;
      const messages: string[] = [];
      let severity: 'error' | 'warning' | 'info' | 'success' = 'info';

      // Get messages from metric.messages.by_file (standardized format)
      // Try with and without leading slash
      const fileMessages = (metric.messages as any)?.by_file?.[filePath] || 
                          (metric.messages as any)?.by_file?.[normalizedPath] || [];
      fileMessages.forEach((msg: any) => {
        const diagnosisText = msg.diagnosis || '';
        const recommendationText = msg.recommendation || '';
        messages.push(`${diagnosisText} ${recommendationText}`.trim());
        
        if (msg.severity === 'high' || msg.severity === 'error') {
          severity = 'error';
        } else if (msg.severity === 'medium' && severity !== 'error') {
          severity = 'warning';
        } else if (msg.severity === 'low' && severity === 'info') {
          severity = 'info';
        }
      });

      // Fallback to cohesion_level if no messages
      if (messages.length === 0) {
        if (fileData.cohesion_level === 'high') {
          severity = 'success';
          messages.push('High cohesion - Well-organized code');
        } else if (fileData.cohesion_level === 'medium') {
          severity = 'warning';
          messages.push('Medium cohesion - Consider improvements');
        } else if (fileData.cohesion_level === 'low') {
          severity = 'error';
          messages.push('Low cohesion - Needs refactoring');
        } else if (fileData.cohesion_level === 'non_ml' || fileData.cohesion_level === 'small_file') {
          severity = 'info';
          messages.push(fileData.cohesion_level === 'non_ml' ? 'Non-ML file detected' : 'File too small for analysis');
        }
      }

      fileMetrics['fpc'] = {
        metricName,
        category,
        data: fileData,
        severity,
        messages
      };
    });
  }

  processFileStructureMetric(metric: FileStructureResult, metricName: string, category: string): void {
    Object.entries(metric.details?.files || {}).forEach(([filePath, fileData]) => {
      const normalizedPath = filePath.startsWith('/') ? filePath : '/' + filePath;
      if (!this.fileMetricsMap.has(normalizedPath)) {
        this.fileMetricsMap.set(normalizedPath, {});
      }
      
      const fileMetrics = this.fileMetricsMap.get(normalizedPath)!;
      fileMetrics['file_structure'] = {
        metricName,
        category,
        data: fileData,
        severity: fileData.severity,
        messages: fileData.recommendation ? [fileData.recommendation] : []
      };
    });
  }

  processLCCMLMetric(metric: LCCMLResult, metricName: string, category: string): void {
    Object.entries(metric.details?.files || {}).forEach(([filePath, fileData]) => {
      const normalizedPath = filePath.startsWith('/') ? filePath : '/' + filePath;
      if (!this.fileMetricsMap.has(normalizedPath)) {
        this.fileMetricsMap.set(normalizedPath, {});
      }
      
      const fileMetrics = this.fileMetricsMap.get(normalizedPath)!;
      const messages: string[] = [];
      let severity: 'error' | 'warning' | 'info' | 'success' = 'info';

      if (fileData.lccml === null) {
        messages.push('LCCML not applicable (single method file)');
        severity = 'info';
      } else if (fileData.lccml >= 0.7) {
        severity = 'success';
        messages.push('Excellent cohesion');
      } else if (fileData.lccml >= 0.5) {
        severity = 'info';
        messages.push('Good cohesion');
      } else {
        severity = 'warning';
        messages.push(`Low cohesion detected: ${fileData.n_disconnected_pairs} disconnected method pairs`);
      }

      fileMetrics['lccml'] = {
        metricName,
        category,
        data: fileData,
        score: fileData.lccml !== null ? fileData.lccml * 10 : undefined,
        severity,
        messages
      };
    });
  }

  processPyLintMetric(metric: PyLintResult, metricName: string, category: string): void {
    const messagesByFile: { [path: string]: any[] } = {};
    
    (metric.details?.messages || []).forEach((msg: any) => {
      const normalizedPath = msg.path.startsWith('/') ? msg.path : '/' + msg.path;
      if (!messagesByFile[normalizedPath]) {
        messagesByFile[normalizedPath] = [];
      }
      messagesByFile[normalizedPath].push(msg);
    });

    Object.entries(messagesByFile).forEach(([filePath, messages]) => {
      if (!this.fileMetricsMap.has(filePath)) {
        this.fileMetricsMap.set(filePath, {});
      }
      
      const fileMetrics = this.fileMetricsMap.get(filePath)!;
      const errorCount = messages.filter(m => m.type === 'error' || m.type === 'fatal').length;
      const warningCount = messages.filter(m => m.type === 'warning').length;
      
      let severity: 'error' | 'warning' | 'info' = 'info';
      const messageStrings: string[] = [];

      if (errorCount > 0) {
        severity = 'error';
        messageStrings.push(`${errorCount} error(s) found`);
      } else if (warningCount > 0) {
        severity = 'warning';
        messageStrings.push(`${warningCount} warning(s) found`);
      }

      messages.slice(0, 5).forEach(msg => {
        messageStrings.push(`[Line ${msg.line}] ${msg.symbol}: ${msg.message}`);
      });

      if (messages.length > 5) {
        messageStrings.push(`... and ${messages.length - 5} more issues`);
      }

      fileMetrics['pylint'] = {
        metricName,
        category,
        data: { messages, error_count: errorCount, warning_count: warningCount },
        severity,
        messages: messageStrings
      };
    });
  }

  processRadonCCMetric(metric: AnalysisResult, metricName: string, category: string): void {
    Object.entries((metric.details as any)?.files || {}).forEach(([filePath, fileData]) => {
      const normalizedPath = filePath.startsWith('/') ? filePath : '/' + filePath;
      if (!this.fileMetricsMap.has(normalizedPath)) {
        this.fileMetricsMap.set(normalizedPath, {});
      }
      
      const fileMetrics = this.fileMetricsMap.get(normalizedPath)!;
      fileMetrics['radon_cc'] = {
        metricName,
        category,
        data: fileData,
        score: metric.score
      };
    });
  }

  processRadonMIMetric(metric: AnalysisResult, metricName: string, category: string): void {
    Object.entries((metric.details as any)?.files || {}).forEach(([filePath, fileData]) => {
      const normalizedPath = filePath.startsWith('/') ? filePath : '/' + filePath;
      if (!this.fileMetricsMap.has(normalizedPath)) {
        this.fileMetricsMap.set(normalizedPath, {});
      }
      
      const fileMetrics = this.fileMetricsMap.get(normalizedPath)!;
      fileMetrics['radon_mi'] = {
        metricName,
        category,
        data: fileData,
        score: metric.score
      };
    });
  }

  processPipelineDetectionMetric(metric: PipelineDetectionResult, metricName: string, category: string): void {
    const fileStages: { [path: string]: string[] } = {};
    
    Object.entries(metric.details?.detected_stages || {}).forEach(([stage, files]) => {
      files.forEach(fileInfo => {
        const normalizedPath = fileInfo.file.startsWith('/') ? fileInfo.file : '/' + fileInfo.file;
        if (!fileStages[normalizedPath]) {
          fileStages[normalizedPath] = [];
        }
        fileStages[normalizedPath].push(stage);
      });
    });

    Object.entries(fileStages).forEach(([filePath, stages]) => {
      if (!this.fileMetricsMap.has(filePath)) {
        this.fileMetricsMap.set(filePath, {});
      }
      
      const fileMetrics = this.fileMetricsMap.get(filePath)!;
      fileMetrics['pipeline'] = {
        metricName,
        category,
        data: { stages },
        messages: [`Detected stages: ${stages.join(', ')}`],
        severity: 'info'
      };
    });
  }

  onNodeSelected(event: { path: string, type: 'file' | 'directory', node: any }): void {
    this.selectNode(event.path, event.type, event.node);
  }

  selectNode(path: string, type: 'file' | 'directory', node: any): void {
    this.selectedPath = path;
    this.selectedNodeType = type;
    
    if (type === 'file') {
      this.selectedFileData = this.fileMetricsMap.get(path) || {};
    } else {
      this.selectedFileData = this.aggregateDirectoryMetrics(node);
    }
  }

  aggregateDirectoryMetrics(node: any): FileMetricsData {
    const aggregated: FileMetricsData = {};
    
    return aggregated;
  }

  getFileName(path: string): string {
    return path.split('/').pop() || path;
  }

  getMetricIds(): string[] {
    return Object.keys(this.selectedFileData);
  }

  getDataItems(data: any): Array<{ label: string, value: any }> {
    if (!data) return [];
    
    return Object.entries(data)
      .filter(([key]) => !['recommendation', 'severity', 'messages', 'error_count', 'warning_count'].includes(key))
      .map(([key, value]) => ({
        label: this.formatLabel(key),
        value
      }));
  }

  formatLabel(key: string): string {
    return key.split('_').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ');
  }

  formatValue(value: any): string {
    if (typeof value === 'boolean') return value ? 'Yes' : 'No';
    if (typeof value === 'number') return value.toFixed(2);
    if (value === null) return 'N/A';
    return String(value);
  }

  formatObject(obj: any): string {
    return JSON.stringify(obj, null, 2);
  }

  isArray(value: any): boolean {
    return Array.isArray(value);
  }

  isObject(value: any): boolean {
    return value !== null && typeof value === 'object' && !Array.isArray(value);
  }

  getCategoryClass(category: string): string {
    const classes: { [key: string]: string } = {
      'cohesion': 'bg-purple-100 text-purple-800',
      'complexity': 'bg-blue-100 text-blue-800',
      'maintainability': 'bg-green-100 text-green-800',
      'quality': 'bg-yellow-100 text-yellow-800',
      'structure': 'bg-orange-100 text-orange-800',
      'detection': 'bg-gray-100 text-gray-800'
    };
    return classes[category] || 'bg-gray-100 text-gray-800';
  }

  getScoreTextClass(score: number): string {
    if (score >= 7) return 'text-green-600';
    if (score >= 4) return 'text-yellow-600';
    return 'text-red-600';
  }

  getTotalMetrics(): number {
    return this.allMetrics.length;
  }

  getTotalFiles(): number {
    return this.fileMetricsMap.size;
  }

  getTotalIssues(severity: 'error' | 'warning'): number {
    let count = 0;
    this.fileMetricsMap.forEach(fileMetrics => {
      Object.values(fileMetrics).forEach(metricData => {
        if (metricData.severity === severity) {
          count++;
        }
      });
    });
    return count;
  }

  onNewAnalysis(): void {
    this.newAnalysis.emit();
  }

  onExport(): void {
    this.exportResults.emit();
  }

  Object = Object;
}

@Component({
  selector: 'app-tree-node-clickable',
  template: `
    <div>
      <div 
        class="flex items-center gap-2 py-1.5 px-3 rounded-lg transition-colors cursor-pointer group"
        [class.bg-blue-100]="node.path === selectedPath"
        [class.hover:bg-gray-100]="node.path !== selectedPath"
        [style.padding-left.px]="level * 16 + 12"
        (click)="onNodeClick()">
        
        <svg *ngIf="isDirectory" 
             class="w-4 h-4 text-gray-400 transition-transform flex-shrink-0"
             [class.rotate-90]="isExpanded"
             fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7"></path>
        </svg>
        
        <div class="w-4 h-4 flex-shrink-0" *ngIf="!isDirectory"></div>

        <svg *ngIf="isDirectory" 
             class="w-5 h-5 flex-shrink-0"
             [class.text-blue-500]="isExpanded || node.path === selectedPath"
             [class.text-gray-400]="!isExpanded && node.path !== selectedPath"
             fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-6l-2-2H5a2 2 0 00-2 2z"></path>
        </svg>

        <svg *ngIf="!isDirectory && isPythonFile" 
             class="w-5 h-5 text-blue-600 flex-shrink-0" 
             fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"></path>
        </svg>

        <svg *ngIf="!isDirectory && !isPythonFile" 
             class="w-5 h-5 text-gray-400 flex-shrink-0" 
             fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"></path>
        </svg>

        <span class="text-sm flex-1 min-w-0 truncate"
              [class.font-medium]="isDirectory"
              [class.text-blue-900]="node.path === selectedPath"
              [class.text-gray-900]="isDirectory && node.path !== selectedPath"
              [class.text-gray-700]="!isDirectory && node.path !== selectedPath">
          {{ node.name }}
        </span>
      </div>

      <div *ngIf="isDirectory && isExpanded && node.children">
        <ng-container *ngFor="let child of node.children">
          <app-tree-node-clickable 
            [node]="child" 
            [level]="level + 1"
            [selectedPath]="selectedPath"
            (nodeSelected)="nodeSelected.emit($event)">
          </app-tree-node-clickable>
        </ng-container>
      </div>
    </div>
  `,
  standalone: false
})
export class TreeNodeClickableComponent {
  @Input() node!: ChildChild;
  @Input() level = 0;
  @Input() selectedPath: string | null = null;
  @Output() nodeSelected = new EventEmitter<{ path: string, type: 'file' | 'directory', node: any }>();

  isExpanded = false;

  get isDirectory(): boolean {
    return this.node.type === 'directory';
  }

  get isPythonFile(): boolean {
    return this.node.name.endsWith('.py');
  }

  onNodeClick(): void {
    if (this.isDirectory) {
      this.isExpanded = !this.isExpanded;
    }
    this.nodeSelected.emit({
      path: this.node.path,
      type: this.isDirectory ? 'directory' : 'file',
      node: this.node
    });
  }
}
