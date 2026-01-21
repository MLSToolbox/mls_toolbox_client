import { Component, Input, Output, EventEmitter, OnInit } from '@angular/core';
import { TreeStructure, ChildChild, AutoDetectedPipeline } from '@app/core/models/upload-zip.model';
import { MetricOption } from '../models/assessment.models';

interface MetricType {
  id: string;
  name: string;
  description: string;
  enabled: boolean;
  selected: boolean;
  config: {
    metrics: string[];
    all_files: boolean;
  };
}

@Component({
  selector: 'app-assessment-structure',
  template: `
    <div class="w-full max-w-7xl mx-auto px-4 py-8">
      <div class="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        <div class="lg:col-span-2">
          <div class="bg-white rounded-lg border border-gray-200 shadow-sm">
            <div class="border-b border-gray-200 px-6 py-4 flex justify-between items-center">
              <div>
                <div class="flex items-center gap-3">
                  <svg class="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-6l-2-2H5a2 2 0 00-2 2z"></path>
                  </svg>
                  <h2 class="text-xl font-bold text-gray-900">Project Structure</h2>
                </div>
                <p class="text-sm text-gray-600 mt-2">Review the detected files and folders from your project</p>
              </div>
              <button 
                (click)="toggleEditMode()"
                class="p-2 rounded-full hover:bg-gray-100 transition-colors"
                [class.bg-blue-100]="isEditingPipeline"
                [class.text-blue-600]="isEditingPipeline"
                [class.text-gray-500]="!isEditingPipeline"
                title="Edit Pipeline Stages">
                <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z"></path>
                </svg>
              </button>
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
                    <app-tree-node 
                      [node]="child" 
                      [level]="1" 
                      [detectedPipeline]="autoDetectedPipeline"
                      [isEditing]="isEditingPipeline"
                      [manualStages]="manualFileStages"
                      (stagesChange)="onFileStagesChange($event)">
                    </app-tree-node>
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
                <h2 class="text-xl font-bold text-gray-900">Select Type of Metrics</h2>
              </div>
              <p class="text-sm text-gray-600 mt-2">Choose the type of analysis to perform</p>
            </div>

            <div class="p-6 space-y-4 max-h-[400px] overflow-y-auto">
              <div *ngFor="let type of metricTypes" 
                   class="border rounded-lg p-4 transition-all duration-200 cursor-pointer"
                   [ngClass]="{
                     'border-blue-500 bg-blue-50': type.selected,
                     'border-gray-200 bg-white hover:border-blue-300 hover:bg-blue-50': !type.selected && type.enabled,
                     'opacity-50 cursor-not-allowed bg-gray-50': !type.enabled
                   }"
                   (click)="selectType(type)">
                <div class="flex items-start gap-3">
                  <div class="flex-shrink-0 mt-1">
                    <div class="w-5 h-5 rounded-full border-2 flex items-center justify-center transition-colors"
                         [ngClass]="{
                           'border-blue-500 bg-blue-500': type.selected,
                           'border-gray-300 bg-white': !type.selected
                         }">
                      <div *ngIf="type.selected" class="w-2 h-2 rounded-full bg-white"></div>
                    </div>
                  </div>
                  <div class="flex-1 min-w-0">
                    <h3 class="text-sm font-semibold text-gray-900 mb-1">{{ type.name }}</h3>
                    <p class="text-xs text-gray-600 line-clamp-2">{{ type.description }}</p>
                    <span *ngIf="!type.enabled" class="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium mt-2 bg-gray-200 text-gray-600">
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
  @Input() autoDetectedPipeline: AutoDetectedPipeline | null = null;
  @Input() isAnalyzing = false;
  @Output() runAnalysis = new EventEmitter<{ metrics: string[], all_files: boolean, pipeline_overrides?: any }>();
  @Output() back = new EventEmitter<void>();

  isEditingPipeline = false;
  manualFileStages: { [key: string]: string[] } = {};

  metricTypes: MetricType[] = [
    {
      id: 'cohesion',
      name: 'Cohesion',
      description: 'Analyze code cohesion using file and package-level metrics.',
      enabled: true,
      selected: false,
      config: {
        metrics: ['ccpm', 'lccml', 'scpm', 'fcpm', 'ifc_p', 'lpcml', 'pmcr', 'pdsc', 'pfp'],
        all_files: true
      }
    },
    {
      id: 'coupling',
      name: 'Coupling',
      description: 'Analyze code coupling metrics.',
      enabled: false,
      selected: false,
      config: {
        metrics: [],
        all_files: false
      }
    },
    {
      id: 'solid',
      name: 'SOLID',
      description: 'Analyze SOLID principles adherence.',
      enabled: false,
      selected: false,
      config: {
        metrics: [],
        all_files: false
      }
    }
  ];

  ngOnInit(): void {
    // Select first enabled option by default
    const firstEnabled = this.metricTypes.find(t => t.enabled);
    if (firstEnabled) {
      firstEnabled.selected = true;
    }
  }

  get hasSelection(): boolean {
    return this.metricTypes.some(t => t.selected);
  }

  selectType(type: MetricType): void {
    if (!type.enabled) return;

    // Unselect all others (radio behavior)
    this.metricTypes.forEach(t => t.selected = false);
    type.selected = true;
  }

  onContinue(): void {
    const selectedType = this.metricTypes.find(t => t.selected);

    if (selectedType) {
      const payload: any = { ...selectedType.config };

      // If manual overrides exist, use them and disable all_files
      if (Object.keys(this.manualFileStages).length > 0) {
        payload.all_files = false;

        // Merge auto-detected stages with manual overrides
        const mergedStages = this.getMergedStages();

        payload.pipeline_overrides = {
          file_stages: mergedStages,
          excluded_files: []
        };
      }

      this.runAnalysis.emit(payload);
    }
  }

  private getMergedStages(): { [key: string]: string[] } {
    const merged: { [key: string]: string[] } = {};

    // 1. Populate with auto-detected stages
    if (this.autoDetectedPipeline?.detected_stages) {
      const detectedStages = this.autoDetectedPipeline.detected_stages as any;
      Object.entries(detectedStages).forEach(([stage, files]) => {
        if (files && Array.isArray(files)) {
          files.forEach((f: any) => {
            const filePath = f.file;
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

    // 2. Apply manual overrides
    // This will overwrite auto-detected stages for files that have been manually edited
    // If manualStages has an empty array for a file, it effectively removes it from analysis
    Object.entries(this.manualFileStages).forEach(([file, stages]) => {
      // We need to match the file path format. 
      // Assuming manualFileStages uses the same path format as autoDetectedPipeline (or compatible)
      // If manualFileStages uses absolute/full paths and autoDetected uses relative, we might have a mismatch.
      // However, TreeNodeComponent uses node.path.
      // Let's assume consistency for now.

      // If stages is empty, we keep it as empty (file excluded)
      // If stages has content, we use it.
      merged[file] = stages;
    });

    // Filter out files with no stages?
    // If the backend receives "file": [], does it analyze it?
    // Probably not, or it analyzes with 0 stages (which might be fast/useless).
    // To be clean, maybe we should remove keys with empty arrays?
    // But if we remove the key, does 'all_files: false' mean it's ignored?
    // Yes, usually 'all_files: false' means "only analyze files listed in overrides".
    // So if we omit the key, it's ignored.
    // If we send "file": [], it might be analyzed with 0 stages.
    // Let's filter out empty arrays to be safe and clean.

    const finalStages: { [key: string]: string[] } = {};
    Object.entries(merged).forEach(([file, stages]) => {
      if (stages.length > 0) {
        finalStages[file] = stages;
      }
    });

    return finalStages;
  }

  toggleEditMode(): void {
    this.isEditingPipeline = !this.isEditingPipeline;
  }

  onFileStagesChange(event: { file: string, stages: string[] }): void {
    this.manualFileStages[event.file] = event.stages;
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
             [class.text-orange-500]="!isExpanded && hasSelectedContent"
             [class.text-gray-400]="!isExpanded && !hasSelectedContent"
             fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-6l-2-2H5a2 2 0 00-2 2z"></path>
        </svg>

        <svg *ngIf="!isDirectory && isPythonFile" 
             class="w-5 h-5 flex-shrink-0" 
             [class.text-orange-500]="hasStages"
             [class.text-blue-600]="!hasStages"
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

        <div *ngIf="!isDirectory && !isEditing && getDetectedStages().length > 0" class="flex gap-1 flex-shrink-0">
          <span *ngFor="let stage of getDetectedStages()" 
                class="px-2 py-0.5 text-xs font-medium rounded"
                [ngClass]="getStageColor(stage)"
                [title]="'Detected: ' + formatStageName(stage)">
            {{ formatStageName(stage) }}
          </span>
        </div>

        <div *ngIf="!isDirectory && isEditing" class="flex gap-1 flex-shrink-0 ml-auto" (click)="$event.stopPropagation()">
          <div class="relative">
            <button 
              (click)="toggleStageSelector()"
              class="p-1 rounded hover:bg-gray-200 transition-colors"
              class="p-1 rounded hover:bg-gray-200 transition-colors"
              [class.text-orange-500]="hasStages"
              [class.bg-orange-50]="hasStages"
              [class.text-gray-400]="!isStageSelectorOpen && !hasStages">
              <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z"></path>
              </svg>
            </button>
            
            <div *ngIf="isStageSelectorOpen" class="absolute right-0 top-full mt-1 bg-white border border-gray-200 rounded-lg shadow-lg z-50 w-64 p-2">
              <div class="flex justify-between items-center mb-2 px-2">
                <span class="text-xs font-semibold text-gray-500">Select Stages (Max 5)</span>
                <button (click)="toggleStageSelector()" class="text-gray-400 hover:text-gray-600">
                  <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"></path>
                  </svg>
                </button>
              </div>
              <div *ngFor="let stage of availableStages" class="flex items-center gap-2 p-1 hover:bg-gray-50 rounded cursor-pointer" (click)="toggleStage(stage)">
                <input type="checkbox" [checked]="isStageSelected(stage)" class="rounded text-blue-600 focus:ring-blue-500 pointer-events-none">
                <span class="text-sm text-gray-700">{{ formatStageName(stage) }}</span>
              </div>
            </div>
          </div>
          
           <div class="flex gap-1 ml-2">
             <span *ngFor="let stage of getEffectiveStages()" 
                class="px-2 py-0.5 text-xs font-medium rounded"
                [ngClass]="getStageColor(stage)">
            {{ formatStageName(stage) }}
          </span>
          </div>
        </div>
      </div>

      <div *ngIf="isDirectory && isExpanded && node.children">
        <ng-container *ngFor="let child of node.children">
          <app-tree-node 
            [node]="child" 
            [level]="level + 1" 
            [detectedPipeline]="detectedPipeline"
            [isEditing]="isEditing"
            [manualStages]="manualStages"
            (stagesChange)="stagesChange.emit($event)">
          </app-tree-node>
        </ng-container>
      </div>
    </div>
  `,
  standalone: false
})
export class TreeNodeComponent {
  @Input() node!: ChildChild;
  @Input() level = 0;
  @Input() detectedPipeline: AutoDetectedPipeline | null = null;
  @Input() isEditing = false;
  @Input() manualStages: { [key: string]: string[] } = {};
  @Output() stagesChange = new EventEmitter<{ file: string, stages: string[] }>();

  availableStages = [
    'data_collection',
    'data_cleaning',
    'feature_engineering',
    'model_training',
    'model_evaluation'
  ];

  isExpanded = false;
  isStageSelectorOpen = false;

  get isDirectory(): boolean {
    return this.node.type === 'directory';
  }

  get isPythonFile(): boolean {
    return this.node.name.endsWith('.py');
  }

  get hasStages(): boolean {
    return this.getEffectiveStages().length > 0;
  }

  get hasSelectedContent(): boolean {
    if (!this.isDirectory) return false;
    return this.checkChildrenForStages(this.node);
  }

  private checkChildrenForStages(node: ChildChild): boolean {
    if (node.type === 'file') {
      // Check if this file has stages (either manual or detected)
      // We need to replicate getEffectiveStages logic here but for a specific node
      // This is a bit tricky since getEffectiveStages depends on 'this.node'
      // But we can pass the node path to a helper
      return this.getStagesForNode(node).length > 0;
    }

    if (node.children) {
      return node.children.some(child => this.checkChildrenForStages(child));
    }

    return false;
  }

  private getStagesForNode(node: ChildChild): string[] {
    // Check manual stages
    for (const [path, stages] of Object.entries(this.manualStages)) {
      if (node.path && (path === node.path || node.path.endsWith(path) || path.endsWith(node.path))) {
        return stages;
      }
    }

    // Check detected stages
    if (!this.detectedPipeline?.detected_stages) {
      return [];
    }

    const stages: string[] = [];
    const detectedStages = this.detectedPipeline.detected_stages as any;
    Object.entries(detectedStages).forEach(([stage, files]) => {
      if (files && Array.isArray(files)) {
        if (files.some((f: any) => node.path.endsWith(f.file) || f.file.endsWith(node.path))) {
          stages.push(stage);
        }
      }
    });
    return stages;
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

  getDetectedStages(): string[] {
    if (!this.detectedPipeline?.detected_stages || this.isDirectory) {
      return [];
    }

    const stages: string[] = [];
    const detectedStages = this.detectedPipeline.detected_stages as any;
    Object.entries(detectedStages).forEach(([stage, files]) => {
      if (files && Array.isArray(files)) {
        if (files.some((f: any) => this.node.path.endsWith(f.file) || f.file.endsWith(this.node.path))) {
          stages.push(stage);
        }
      }
    });
    return stages;
  }

  formatStageName(stage: string): string {
    return stage.split('_').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ');
  }

  getStageColor(stage: string): string {
    const colors: { [key: string]: string } = {
      'data_collection': 'bg-blue-100 text-blue-800',
      'data_cleaning': 'bg-green-100 text-green-800',
      'feature_engineering': 'bg-purple-100 text-purple-800',
      'model_training': 'bg-orange-100 text-orange-800',
      'model_evaluation': 'bg-pink-100 text-pink-800'
    };
    return colors[stage] || 'bg-gray-100 text-gray-800';
  }

  getManualStages(): string[] {
    for (const [path, stages] of Object.entries(this.manualStages)) {
      if (this.node.path && (path === this.node.path || this.node.path.endsWith(path) || path.endsWith(this.node.path))) {
        return stages;
      }
    }
    return [];
  }

  getEffectiveStages(): string[] {
    const manual = this.getManualStages();
    if (manual.length > 0) return manual;

    // If explicit empty array in manual stages (user cleared selection), return empty
    // We need to distinguish between "no override" and "override to empty"
    // But current logic deletes key if empty, so "no key" means "use default"
    // If we want to allow "clearing" stages, we need to keep empty array in manualStages
    // But onFileStagesChange deletes the key if empty.
    // So currently, if user deselects all, it reverts to auto-detected.
    // To fix this, we should check if the key exists in manualStages, even if empty?
    // But onFileStagesChange deletes it.
    // Let's assume if key exists (even empty), use it.
    // But getManualStages returns [] if not found.
    // We need to check existence directly.

    const hasManual = Object.keys(this.manualStages).some(path =>
      this.node.path && (path === this.node.path || this.node.path.endsWith(path) || path.endsWith(this.node.path))
    );

    if (hasManual) {
      return this.getManualStages();
    }

    return this.getDetectedStages();
  }

  isStageSelected(stage: string): boolean {
    return this.getEffectiveStages().includes(stage);
  }

  toggleStage(stage: string): void {
    const currentStages = [...this.getEffectiveStages()];
    const index = currentStages.indexOf(stage);

    if (index > -1) {
      currentStages.splice(index, 1);
    } else {
      if (currentStages.length < 5) {
        currentStages.push(stage);
      }
    }

    this.stagesChange.emit({
      file: this.node.path || this.node.name,
      stages: currentStages
    });
  }
  toggleStageSelector(): void {
    this.isStageSelectorOpen = !this.isStageSelectorOpen;
  }
}
