import { Component, Input, Output, EventEmitter, OnInit } from '@angular/core';
import { TreeStructure, ChildChild } from '@app/core/models/upload-zip.model';
import { MetricOption } from '../models/assessment.models';

@Component({
  selector: 'app-assessment-structure',
  template: `
    <div class="w-full max-w-7xl mx-auto px-4 py-8">
      <div class="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        <div class="lg:col-span-2">
          <div class="bg-white rounded-lg border border-gray-200 shadow-sm">
            <div class="border-b border-gray-200 px-6 py-4">
              <div class="flex items-center gap-3">
                <svg class="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-6l-2-2H5a2 2 0 00-2 2z"></path>
                </svg>
                <h2 class="text-xl font-bold text-gray-900">Project Structure</h2>
              </div>
              <p class="text-sm text-gray-600 mt-2">Review the detected files and folders from your project</p>
            </div>
            
            <div class="p-6 max-h-[600px] overflow-y-auto">
              <div *ngIf="projectStructure" class="space-y-1">
                <div class="flex items-center gap-2 py-2 px-3 bg-blue-50 rounded-lg font-semibold text-blue-900">
                  <svg class="w-5 h-5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-6l-2-2H5a2 2 0 00-2 2z"></path>
                  </svg>
                  {{ projectStructure.name }}
                </div>
                
                <div class="ml-4" *ngIf="projectStructure.children">
                  <ng-container *ngFor="let child of projectStructure.children">
                    <app-tree-node [node]="child" [level]="1"></app-tree-node>
                  </ng-container>
                </div>
              </div>

              <div *ngIf="!projectStructure" class="text-center py-12 text-gray-500">
                <svg class="w-16 h-16 mx-auto mb-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"></path>
                </svg>
                <p class="font-medium">No structure available</p>
              </div>
            </div>
          </div>
        </div>

        <div class="lg:col-span-1">
          <div class="bg-white rounded-lg border border-gray-200 shadow-sm sticky top-4">
            <div class="border-b border-gray-200 px-6 py-4">
              <div class="flex items-center gap-3">
                <svg class="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"></path>
                </svg>
                <h2 class="text-xl font-bold text-gray-900">Select Metrics</h2>
              </div>
              <p class="text-sm text-gray-600 mt-2">Choose quality metrics to analyze</p>
            </div>

            <div class="p-6 space-y-4 max-h-[400px] overflow-y-auto">
              <div *ngFor="let metric of availableMetrics" 
                   class="border rounded-lg p-4 transition-all duration-200 cursor-pointer"
                   [ngClass]="{
                     'border-blue-500 bg-blue-50': metric.selected,
                     'border-gray-200 bg-white hover:border-blue-300 hover:bg-blue-50': !metric.selected,
                     'opacity-50 cursor-not-allowed': !metric.enabled
                   }"
                   (click)="toggleMetric(metric)">
                <div class="flex items-start gap-3">
                  <div class="flex-shrink-0 mt-1">
                    <div class="w-5 h-5 rounded border-2 flex items-center justify-center transition-colors"
                         [ngClass]="{
                           'border-blue-500 bg-blue-500': metric.selected,
                           'border-gray-300 bg-white': !metric.selected
                         }">
                      <svg *ngIf="metric.selected" class="w-3 h-3 text-white" fill="currentColor" viewBox="0 0 20 20">
                        <path fill-rule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clip-rule="evenodd"></path>
                      </svg>
                    </div>
                  </div>
                  <div class="flex-1 min-w-0">
                    <h3 class="text-sm font-semibold text-gray-900 mb-1">{{ metric.name }}</h3>
                    <p class="text-xs text-gray-600 line-clamp-2">{{ metric.description }}</p>
                    <span class="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium mt-2"
                          [ngClass]="{
                            'bg-purple-100 text-purple-800': metric.category === 'cohesion',
                            'bg-blue-100 text-blue-800': metric.category === 'complexity',
                            'bg-green-100 text-green-800': metric.category === 'maintainability',
                            'bg-yellow-100 text-yellow-800': metric.category === 'quality',
                            'bg-orange-100 text-orange-800': metric.category === 'structure',
                            'bg-gray-100 text-gray-800': metric.category === 'detection'
                          }">
                      {{ metric.category }}
                    </span>
                  </div>
                </div>
              </div>

              <div *ngIf="availableMetrics.length === 0" class="text-center py-8 text-gray-500">
                <p class="text-sm">No metrics available</p>
              </div>
            </div>

            <div class="border-t border-gray-200 p-6">
              <div class="mb-4">
                <p class="text-sm text-gray-600">
                  <span class="font-semibold text-gray-900">{{ selectedCount }}</span> 
                  of {{ availableMetrics.length }} metrics selected
                </p>
              </div>

              <div class="flex flex-col gap-3">
                <button
                  (click)="onContinue()"
                  [disabled]="selectedCount === 0 || isAnalyzing"
                  class="w-full px-6 py-3 text-sm font-medium text-white rounded-lg transition-all duration-200 hover:shadow-lg disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                  style="background: linear-gradient(135deg, rgb(0, 32, 96) 0%, rgb(0, 50, 120) 100%);">
                  <svg *ngIf="!isAnalyzing" class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z"></path>
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path>
                  </svg>
                  <svg *ngIf="isAnalyzing" class="w-5 h-5 animate-spin" fill="none" viewBox="0 0 24 24">
                    <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
                    <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  {{ isAnalyzing ? 'Starting Analysis...' : 'Run Analysis' }}
                </button>

                <button
                  (click)="onBack()"
                  [disabled]="isAnalyzing"
                  class="w-full px-6 py-3 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors duration-200 flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed">
                  <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10 19l-7-7m0 0l7-7m-7 7h18"></path>
                  </svg>
                  Back to Upload
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  `,
  standalone: false
})
export class AssessmentStructureComponent implements OnInit {
  @Input() projectStructure: TreeStructure | null = null;
  @Input() availableMetrics: MetricOption[] = [];
  @Input() isAnalyzing = false;
  @Output() runAnalysis = new EventEmitter<string[]>();
  @Output() back = new EventEmitter<void>();

  ngOnInit(): void {
    if (this.availableMetrics.length === 0) {
      console.warn('No metrics available');
    }
  }

  get selectedCount(): number {
    return this.availableMetrics.filter(m => m.selected).length;
  }

  toggleMetric(metric: MetricOption): void {
    if (!metric.enabled) return;
    metric.selected = !metric.selected;
  }

  onContinue(): void {
    const selectedMetricIds = this.availableMetrics
      .filter(m => m.selected)
      .map(m => m.id);
    
    if (selectedMetricIds.length > 0) {
      this.runAnalysis.emit(selectedMetricIds);
    }
  }

  onBack(): void {
    this.back.emit();
  }
}

@Component({
  selector: 'app-tree-node',
  template: `
    <div>
      <div 
        class="flex items-center gap-2 py-1.5 px-3 rounded-lg hover:bg-gray-50 transition-colors cursor-pointer group"
        [style.padding-left.px]="level * 16 + 12"
        (click)="toggleExpanded()">
        
        <svg *ngIf="isDirectory" 
             class="w-4 h-4 text-gray-400 transition-transform flex-shrink-0"
             [class.rotate-90]="isExpanded"
             fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7"></path>
        </svg>
        
        <div class="w-4 h-4 flex-shrink-0" *ngIf="!isDirectory"></div>

        <svg *ngIf="isDirectory" 
             class="w-5 h-5 flex-shrink-0"
             [class.text-blue-500]="isExpanded"
             [class.text-gray-400]="!isExpanded"
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
              [class.text-gray-900]="isDirectory"
              [class.text-gray-700]="!isDirectory">
          {{ node.name }}
        </span>

        <span *ngIf="!isDirectory && node.size !== undefined" 
              class="text-xs text-gray-500 flex-shrink-0 opacity-0 group-hover:opacity-100 transition-opacity">
          {{ formatSize(node.size) }}
        </span>

        <span *ngIf="!isDirectory && node.valid_syntax === false"
              class="px-2 py-0.5 text-xs font-medium bg-red-100 text-red-800 rounded flex-shrink-0">
          Invalid Syntax
        </span>
      </div>

      <div *ngIf="isDirectory && isExpanded && node.children">
        <ng-container *ngFor="let child of node.children">
          <app-tree-node [node]="child" [level]="level + 1"></app-tree-node>
        </ng-container>
      </div>
    </div>
  `,
  standalone: false
})
export class TreeNodeComponent {
  @Input() node!: ChildChild;
  @Input() level = 0;

  isExpanded = false;

  get isDirectory(): boolean {
    return this.node.type === 'directory';
  }

  get isPythonFile(): boolean {
    return this.node.name.endsWith('.py');
  }

  toggleExpanded(): void {
    if (this.isDirectory) {
      this.isExpanded = !this.isExpanded;
    }
  }

  formatSize(bytes: number): string {
    if (bytes === 0) return '0 B';
    const k = 1024;
    const sizes = ['B', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return Math.round((bytes / Math.pow(k, i)) * 100) / 100 + ' ' + sizes[i];
  }
}
