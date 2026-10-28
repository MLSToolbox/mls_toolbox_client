import { Component, Input, Output, EventEmitter } from '@angular/core';
import {
  TreeStructure,
  ChildChild,
  AutoDetectedPipeline,
} from '@app/core/models/upload-zip.model';
import { StageEditorCoordinatorService } from '../services/stage-editor-coordinator.service';

@Component({
  selector: 'app-assessment-stage-validation',
  providers: [StageEditorCoordinatorService],
  template: `
    <div class="w-full max-w-5xl mx-auto px-4 py-8">
      <div class="bg-white rounded-lg border border-gray-200 shadow-sm">
        <div class="border-b border-gray-200 px-6 py-4">
          <div class="flex items-center gap-3">
            <svg class="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"></path>
            </svg>
            <h2 class="text-xl font-bold text-gray-900">Validate Pipeline</h2>
          </div>
          <p class="text-sm text-gray-600 mt-2">
            Review the pipeline stages detected for each file before running the analysis. Hover a stage tag to see why it was detected.
          </p>
        </div>

        <!-- Summary banner -->
        <div class="px-6 py-4 border-b border-gray-200 bg-gray-50 flex flex-wrap gap-3">
          <div class="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-blue-50 border border-blue-200 text-sm text-blue-800">
            <svg class="w-4 h-4 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"></path>
            </svg>
            <span><strong>{{ filesWithStagesCount }}</strong> of <strong>{{ totalFilesAnalyzed }}</strong> files have a detected stage</span>
          </div>
          <div
            *ngIf="syntaxErrorFiles.length > 0"
            class="flex items-start gap-2 px-3 py-1.5 rounded-lg bg-red-50 border border-red-200 text-sm text-red-800"
          >
            <svg class="w-4 h-4 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path>
            </svg>
            <span>
              <strong>{{ syntaxErrorFiles.length }}</strong> file(s) with a syntax error: detailed cohesion/structure metrics won't be available for them, but file name and keyword evidence is still used where possible.
              <span class="block mt-1 font-mono text-xs text-red-700">{{ syntaxErrorFiles.join(', ') }}</span>
            </span>
          </div>
        </div>

        <div class="p-6 max-h-[500px] overflow-y-auto">
          <div class="flex items-center justify-between mb-3">
            <span class="text-xs font-semibold text-gray-500 uppercase tracking-wide">Project Structure</span>
            <button
              (click)="toggleEditMode()"
              class="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium border transition-colors flex-shrink-0"
              [ngClass]="isEditingPipeline
                ? 'bg-blue-600 text-white border-blue-600 hover:bg-blue-700'
                : 'bg-white text-gray-700 border-gray-300 hover:bg-gray-50'"
            >
              <svg *ngIf="!isEditingPipeline" class="w-3.5 h-3.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z"></path>
              </svg>
              <svg *ngIf="isEditingPipeline" class="w-3.5 h-3.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"></path>
              </svg>
              {{ isEditingPipeline ? 'Done Editing' : 'Edit Stages' }}
            </button>
          </div>

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
                  (stagesChange)="onFileStagesChange($event)"
                >
                </app-tree-node>
              </ng-container>
            </div>
          </div>

          <div *ngIf="!projectStructure" class="text-center py-12 text-gray-500">
            <p class="font-medium">No structure available</p>
          </div>
        </div>

        <div class="border-t border-gray-200 p-6">
          <div class="flex flex-col sm:flex-row gap-3 sm:justify-between">
            <button
              (click)="onBack()"
              class="px-6 py-3 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors duration-200 flex items-center justify-center gap-2"
            >
              <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10 19l-7-7m0 0l7-7m-7 7h18"></path>
              </svg>
              Back to Upload
            </button>
            <button
              (click)="openConfirmModal()"
              [disabled]="!hasAnalyzableFiles"
              class="px-6 py-3 text-sm font-medium text-white rounded-lg transition-all duration-200 hover:shadow-lg disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
              style="background: linear-gradient(135deg, rgb(0, 32, 96) 0%, rgb(0, 50, 120) 100%);"
            >
              Confirm stages and continue
              <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M14 5l7 7m0 0l-7 7m7-7H3"></path>
              </svg>
            </button>
          </div>
          <p *ngIf="!hasAnalyzableFiles" class="text-xs text-amber-700 bg-amber-50 border border-amber-200 rounded-lg px-3 py-2 mt-3">
            Assign at least one valid stage to a file before continuing.
          </p>
        </div>
      </div>
    </div>

    <!-- Confirmation modal -->
    <div
      *ngIf="showConfirmModal"
      class="fixed inset-0 bg-black/50 flex items-center justify-center z-50 px-4"
      (click)="cancelConfirm()"
    >
      <div
        class="bg-white rounded-lg shadow-xl max-w-md w-full"
        (click)="$event.stopPropagation()"
      >
        <div class="px-6 py-4 border-b border-gray-200">
          <h3 class="text-lg font-bold text-gray-900">Confirm pipeline stages?</h3>
          <p class="text-sm text-gray-600 mt-1">This is what will be sent to the analysis.</p>
        </div>

        <div class="px-6 py-4 space-y-3">
          <div class="flex items-center justify-between text-sm">
            <span class="text-gray-600">Files with a stage assigned</span>
            <span class="font-semibold text-gray-900">{{ filesWithStagesCount }}</span>
          </div>
          <div class="flex items-center justify-between text-sm" *ngIf="filesWithoutStageCount > 0">
            <span class="text-gray-600">Files without a stage (will be skipped)</span>
            <span class="font-semibold text-amber-700">{{ filesWithoutStageCount }}</span>
          </div>
          <div class="flex items-center justify-between text-sm" *ngIf="syntaxErrorFiles.length > 0">
            <span class="text-gray-600">Files with a syntax error</span>
            <span class="font-semibold text-red-700">{{ syntaxErrorFiles.length }}</span>
          </div>
        </div>

        <div class="px-6 py-4 border-t border-gray-200 flex justify-end gap-3">
          <button
            (click)="cancelConfirm()"
            class="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
          >
            Cancel
          </button>
          <button
            (click)="confirmAndContinue()"
            class="px-4 py-2 text-sm font-medium text-white rounded-lg transition-colors"
            style="background: linear-gradient(135deg, rgb(0, 32, 96) 0%, rgb(0, 50, 120) 100%);"
          >
            Confirm
          </button>
        </div>
      </div>
    </div>
  `,
  standalone: false,
})
export class AssessmentStageValidationComponent {
  @Input() projectStructure: TreeStructure | null = null;
  @Input() autoDetectedPipeline: AutoDetectedPipeline | null = null;
  @Output() confirmed = new EventEmitter<{ manualFileStages: Record<string, string[]> }>();
  @Output() back = new EventEmitter<void>();

  isEditingPipeline = false;
  showConfirmModal = false;
  manualFileStages: { [key: string]: string[] } = {};

  constructor(private readonly stageEditor: StageEditorCoordinatorService) {}

  get totalFilesAnalyzed(): number {
    return this.autoDetectedPipeline?.files_analyzed || 0;
  }

  get filesWithStagesCount(): number {
    return Object.values(this.getMergedFileStages()).filter((stages) => stages.length > 0).length;
  }

  get filesWithoutStageCount(): number {
    return Object.values(this.getMergedFileStages()).filter((stages) => stages.length === 0).length;
  }

  get hasAnalyzableFiles(): boolean {
    return this.filesWithStagesCount > 0;
  }

  get syntaxErrorFiles(): string[] {
    return this.autoDetectedPipeline?.syntax_error_files || [];
  }

  toggleEditMode(): void {
    this.isEditingPipeline = !this.isEditingPipeline;
    if (!this.isEditingPipeline) {
      this.stageEditor.closeAll();
    }
  }

  onFileStagesChange(event: { file: string; stages: string[] }): void {
    const normalizedFile = this.normalizePath(event.file);
    if (!normalizedFile) {
      return;
    }
    this.manualFileStages[normalizedFile] = event.stages;
  }

  openConfirmModal(): void {
    this.showConfirmModal = true;
  }

  cancelConfirm(): void {
    this.showConfirmModal = false;
  }

  confirmAndContinue(): void {
    this.showConfirmModal = false;
    this.confirmed.emit({ manualFileStages: this.manualFileStages });
  }

  onBack(): void {
    this.back.emit();
  }

  /**
   * Merges the backend's auto-detected file_stages with any stages the user
   * has edited in this session, so the summary banner and confirmation
   * modal reflect what will actually be sent to the analysis - not just the
   * original upload-time snapshot.
   */
  private getMergedFileStages(): Record<string, string[]> {
    const merged: Record<string, string[]> = {};

    Object.entries(this.autoDetectedPipeline?.file_stages || {}).forEach(([file, stages]) => {
      const normalizedFile = this.normalizePath(file);
      if (normalizedFile) {
        merged[normalizedFile] = Array.isArray(stages) ? [...stages] : [];
      }
    });

    Object.entries(this.manualFileStages).forEach(([file, stages]) => {
      const normalizedFile = this.normalizePath(file);
      if (normalizedFile) {
        merged[normalizedFile] = [...stages];
      }
    });

    return merged;
  }

  private normalizePath(path: string): string {
    return path.replace(/\\/g, '/').replace(/^\/+/, '').trim();
  }
}

@Component({
  selector: 'app-tree-node',
  template: `
    <div>
      <div
        class="flex items-center gap-2 py-1.5 px-3 rounded-lg hover:bg-gray-50 transition-colors cursor-pointer group"
        [style.padding-left.px]="level * 16 + 12"
        (click)="toggleExpanded()"
      >
        <svg
          *ngIf="isDirectory"
          class="w-4 h-4 text-gray-400 transition-transform flex-shrink-0"
          [class.rotate-90]="isExpanded"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7"></path>
        </svg>

        <div class="w-4 h-4 flex-shrink-0" *ngIf="!isDirectory"></div>

        <svg
          *ngIf="isDirectory"
          class="w-5 h-5 flex-shrink-0"
          [class.text-blue-500]="isExpanded"
          [class.text-orange-500]="!isExpanded && hasSelectedContent"
          [class.text-gray-400]="!isExpanded && !hasSelectedContent"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-6l-2-2H5a2 2 0 00-2 2z"></path>
        </svg>

        <svg
          *ngIf="!isDirectory && isPythonFile"
          class="w-5 h-5 flex-shrink-0"
          [class.text-orange-500]="hasStages"
          [class.text-blue-600]="!hasStages"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"></path>
        </svg>

        <svg
          *ngIf="!isDirectory && !isPythonFile"
          class="w-5 h-5 text-gray-400 flex-shrink-0"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"></path>
        </svg>

        <span
          class="text-sm flex-1 min-w-0 truncate"
          [class.font-medium]="isDirectory"
          [class.text-gray-900]="isDirectory"
          [class.text-gray-700]="!isDirectory"
        >
          {{ node.name }}
        </span>

        <span
          *ngIf="!isDirectory && node.size !== undefined"
          class="text-xs text-gray-500 flex-shrink-0 opacity-0 group-hover:opacity-100 transition-opacity"
        >
          {{ formatSize(node.size) }}
        </span>

        <span
          *ngIf="!isDirectory && node.valid_syntax === false"
          class="px-2 py-0.5 text-xs font-medium bg-red-100 text-red-800 rounded flex-shrink-0"
          title="Syntax error: detailed cohesion/structure metrics are unavailable for this file. Name and keyword evidence is still used for stage detection."
        >
          Invalid Syntax
        </span>

        <div
          *ngIf="!isDirectory && !isEditing && getDetectedStages().length > 0"
          class="flex gap-1 flex-shrink-0"
        >
          <span
            *ngFor="let stage of getDetectedStages()"
            class="px-2 py-0.5 text-xs font-medium rounded"
            [ngClass]="getStageColor(stage)"
            [title]="getStageEvidenceTitle(stage)"
          >
            {{ formatStageName(stage) }}
          </span>
        </div>

        <div
          *ngIf="!isDirectory && isEditing"
          class="flex gap-1 flex-shrink-0 ml-auto"
          (click)="$event.stopPropagation()"
        >
          <div class="relative">
            <button
              (click)="toggleStageSelector()"
              class="p-1 rounded hover:bg-gray-200 transition-colors"
              [class.text-orange-500]="hasStages"
              [class.bg-orange-50]="hasStages"
              [class.text-gray-400]="!isStageSelectorOpen && !hasStages"
            >
              <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z"></path>
              </svg>
            </button>

            <div
              *ngIf="isStageSelectorOpen"
              class="absolute right-0 top-full mt-1 bg-white border border-gray-200 rounded-lg shadow-lg z-50 w-64 p-2"
            >
              <div class="flex justify-between items-center mb-2 px-2">
                <span class="text-xs font-semibold text-gray-500">Select Stages (Max 5)</span>
                <button (click)="closeStageSelector()" class="text-gray-400 hover:text-gray-600">
                  <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"></path>
                  </svg>
                </button>
              </div>
              <div
                *ngFor="let stage of availableStages"
                class="flex items-center gap-2 p-1 hover:bg-gray-50 rounded cursor-pointer"
                (click)="toggleStage(stage)"
              >
                <input
                  type="checkbox"
                  [checked]="isStageSelected(stage)"
                  class="rounded text-blue-600 focus:ring-blue-500 pointer-events-none"
                />
                <span class="text-sm text-gray-700">{{ formatStageName(stage) }}</span>
              </div>
              <div class="flex justify-end mt-2 pt-2 border-t border-gray-100">
                <button
                  (click)="closeStageSelector()"
                  class="px-3 py-1 text-xs font-medium text-white bg-blue-600 rounded hover:bg-blue-700 transition-colors"
                >
                  Done
                </button>
              </div>
            </div>
          </div>

          <div class="flex gap-1 ml-2">
            <span
              *ngFor="let stage of getEffectiveStages()"
              class="px-2 py-0.5 text-xs font-medium rounded"
              [ngClass]="getStageColor(stage)"
            >
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
            (stagesChange)="stagesChange.emit($event)"
          >
          </app-tree-node>
        </ng-container>
      </div>
    </div>
  `,
  standalone: false,
})
export class TreeNodeComponent {
  @Input() node!: ChildChild;
  @Input() level = 0;
  @Input() detectedPipeline: AutoDetectedPipeline | null = null;
  @Input() isEditing = false;
  @Input() manualStages: { [key: string]: string[] } = {};
  @Output() stagesChange = new EventEmitter<{
    file: string;
    stages: string[];
  }>();

  availableStages = [
    'data_collection',
    'data_cleaning',
    'feature_engineering',
    'model_training',
    'model_evaluation',
  ];

  isExpanded = false;

  constructor(private readonly stageEditor: StageEditorCoordinatorService) {}

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

  /**
   * Identity used to coordinate with sibling/cousin tree nodes so only one
   * "Select Stages" popup is ever open at a time across the whole tree.
   */
  private get nodePath(): string {
    return this.normalizePath(this.node.path || this.node.name || '');
  }

  get isStageSelectorOpen(): boolean {
    return this.stageEditor.isOpen(this.nodePath);
  }

  toggleStageSelector(): void {
    this.stageEditor.toggle(this.nodePath);
  }

  closeStageSelector(): void {
    this.stageEditor.closeAll();
  }

  private checkChildrenForStages(node: ChildChild): boolean {
    if (node.type === 'file') {
      return this.getStagesForNode(node).length > 0;
    }

    if (node.children) {
      return node.children.some((child) => this.checkChildrenForStages(child));
    }

    return false;
  }

  private getStagesForNode(node: ChildChild): string[] {
    const normalizedNodePath = this.normalizePath(node.path || node.name || '');

    for (const [path, stages] of Object.entries(this.manualStages)) {
      if (this.pathsMatch(normalizedNodePath, this.normalizePath(path))) {
        return stages;
      }
    }

    return this.getAutoDetectedStagesForNode(normalizedNodePath);
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
    if (this.isDirectory) {
      return [];
    }

    const normalizedNodePath = this.normalizePath(this.node.path || this.node.name || '');
    return this.getAutoDetectedStagesForNode(normalizedNodePath);
  }

  private getAutoDetectedStagesForNode(normalizedNodePath: string): string[] {
    if (!this.detectedPipeline) {
      return [];
    }

    if (this.detectedPipeline.file_stages) {
      const exact = this.detectedPipeline.file_stages[normalizedNodePath];
      if (exact) {
        return [...exact];
      }

      for (const [filePath, stages] of Object.entries(this.detectedPipeline.file_stages)) {
        if (this.pathsMatch(normalizedNodePath, this.normalizePath(filePath))) {
          return [...stages];
        }
      }
    }

    if (!this.detectedPipeline.detected_stages) {
      return [];
    }

    const stages: string[] = [];
    const detectedStages = this.detectedPipeline.detected_stages as any;
    Object.entries(detectedStages).forEach(([stage, files]) => {
      if (files && Array.isArray(files)) {
        if (
          files.some((f: any) =>
            this.pathsMatch(normalizedNodePath, this.normalizePath(String(f.file || ''))),
          )
        ) {
          stages.push(stage);
        }
      }
    });
    return stages;
  }

  /**
   * Builds a human-readable explanation of why `stage` was detected for this
   * file, from the backend's per-stage evidence list (filename/keyword/import
   * matches). Falls back to a generic label when no evidence is found (e.g.
   * the stage was assigned manually).
   */
  getStageEvidenceTitle(stage: string): string {
    const normalizedNodePath = this.normalizePath(this.node.path || this.node.name || '');
    const entries = (this.detectedPipeline?.detected_stages as any)?.[stage];

    if (Array.isArray(entries)) {
      const match = entries.find((entry: any) =>
        this.pathsMatch(normalizedNodePath, this.normalizePath(String(entry.file || ''))),
      );
      if (match?.evidences?.length) {
        const reasons = match.evidences.map((e: any) => this.describeEvidence(e));
        return `${this.formatStageName(stage)} detected because: ${reasons.join('; ')}`;
      }
    }

    return `${this.formatStageName(stage)} (manually assigned)`;
  }

  private describeEvidence(evidence: { method: string; value: string }): string {
    switch (evidence.method) {
      case 'filename':
        return `file name contains "${evidence.value}"`;
      case 'keyword':
        return `code contains "${evidence.value}"`;
      case 'import':
        return `imports "${evidence.value}"`;
      default:
        return `${evidence.method}: "${evidence.value}"`;
    }
  }

  formatStageName(stage: string): string {
    return stage
      .split('_')
      .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
      .join(' ');
  }

  getStageColor(stage: string): string {
    const colors: { [key: string]: string } = {
      data_collection: 'bg-blue-100 text-blue-800',
      data_cleaning: 'bg-green-100 text-green-800',
      feature_engineering: 'bg-purple-100 text-purple-800',
      model_training: 'bg-orange-100 text-orange-800',
      model_evaluation: 'bg-pink-100 text-pink-800',
    };
    return colors[stage] || 'bg-gray-100 text-gray-800';
  }

  getManualStages(): string[] {
    const normalizedNodePath = this.normalizePath(this.node.path || this.node.name || '');
    for (const [path, stages] of Object.entries(this.manualStages)) {
      if (this.pathsMatch(normalizedNodePath, this.normalizePath(path))) {
        return stages;
      }
    }
    return [];
  }

  getEffectiveStages(): string[] {
    const manual = this.getManualStages();
    if (manual.length > 0) return manual;

    const normalizedNodePath = this.normalizePath(this.node.path || this.node.name || '');
    const hasManual = Object.keys(this.manualStages).some((path) => {
      return this.pathsMatch(normalizedNodePath, this.normalizePath(path));
    });

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
      stages: currentStages,
    });
  }

  private normalizePath(path: string): string {
    return path.replace(/\\/g, '/').replace(/^\/+/, '').trim();
  }

  private pathsMatch(pathA: string, pathB: string): boolean {
    if (!pathA || !pathB) {
      return false;
    }
    return pathA === pathB || pathA.endsWith(pathB) || pathB.endsWith(pathA);
  }
}
