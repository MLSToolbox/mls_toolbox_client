import { Component, Input, Output, EventEmitter, OnInit, OnChanges } from '@angular/core';
import {
  AnalyzeResponse,
  AnalysisResult,
  CCPMResult,
  SCPMResult,
  FCPMResult,
  FCPPResult,
  SCPPResult,
  CCPPResult,
  MetricDocSection,
  MetricDocumentation,
  MetricReference
} from '@app/core/models';
import { TreeStructure, ChildChild } from '@app/core/models/upload-zip.model';

interface DetailedMessage {
  diagnosis: string;
  recommendation?: string;
  severity: string;
  rule_id?: number;
}

interface FileMetricsData {
  [metricId: string]: {
    metricName: string;
    category: string;
    data: any;
    score?: number;
    severity?: 'error' | 'warning' | 'info' | 'success';
    messages?: string[];
    detailedMessages?: DetailedMessage[];
  };
}

@Component({
  selector: 'app-assessment-results-final',
  template: `
    <div class="flex h-full bg-gray-50">
      
      <div class="w-80 bg-white border-r border-gray-200 flex flex-col flex-shrink-0">
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
            (click)="onExportResults()"
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
                  [pathsWithMetrics]="pathsWithMetrics"
                  (nodeSelected)="onNodeSelected($event)">
                </app-tree-node-clickable>
              </ng-container>
            </div>
          </div>
        </div>
      </div>

      <div class="flex-1 overflow-y-auto min-h-0">
        <div class="max-w-5xl mx-auto p-8 pb-16">
          
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
                   class="bg-white rounded-xl border shadow-lg overflow-hidden transition-all"
                   [ngClass]="{
                     'border-emerald-300': getCohesionLevel(metricId) === 'very_high' || getCohesionLevel(metricId) === 'excellent',
                     'border-green-200': getCohesionLevel(metricId) === 'high' || getCohesionLevel(metricId) === 'good',
                     'border-yellow-200': getCohesionLevel(metricId) === 'medium' || getCohesionLevel(metricId) === 'moderate',
                     'border-orange-200': getCohesionLevel(metricId) === 'low',
                     'border-red-200': getCohesionLevel(metricId) === 'very_low',
                     'border-gray-200': !getCohesionLevel(metricId)
                   }">
                
                <!-- Collapsible Header -->
                <div 
                  class="px-6 py-4 bg-gradient-to-r from-blue-50 to-indigo-50 border-b border-gray-200 cursor-pointer hover:from-blue-100 hover:to-indigo-100 transition-colors"
                  (click)="toggleMetricCollapse(metricId)">
                  <div class="flex items-center justify-between">
                    <div class="flex items-center gap-4 flex-1">
                      <!-- Collapse/Expand Icon -->
                      <svg class="w-5 h-5 text-gray-600 transition-transform" 
                           [class.rotate-90]="!isMetricCollapsed(metricId)"
                           fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7"></path>
                      </svg>
                      
                      <div class="flex-1">
                        <div class="flex items-center gap-3">
                          <svg class="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"></path>
                          </svg>
                          <h3 class="text-xl font-bold text-gray-900">{{ selectedFileData[metricId].metricName }}</h3>
                        </div>
                      </div>
                    </div>
                    
                    <!-- Score/Cohesion Badge -->
                    <div class="flex items-center gap-3">
                      <!-- Score Badge (if available) -->
                      <div *ngIf="selectedFileData[metricId].score !== undefined" 
                           class="flex items-center gap-2 px-4 py-2 rounded-lg shadow-md"
                           [ngClass]="{
                             'bg-gradient-to-br from-red-500 to-red-700': selectedFileData[metricId].score! < 3,
                             'bg-gradient-to-br from-orange-400 to-orange-600': selectedFileData[metricId].score! >= 3 && selectedFileData[metricId].score! < 5,
                             'bg-gradient-to-br from-yellow-400 to-yellow-600': selectedFileData[metricId].score! >= 5 && selectedFileData[metricId].score! < 7,
                             'bg-gradient-to-br from-green-400 to-green-600': selectedFileData[metricId].score! >= 7 && selectedFileData[metricId].score! < 9,
                             'bg-gradient-to-br from-emerald-500 to-emerald-700': selectedFileData[metricId].score! >= 9
                           }">
                        <div class="text-2xl font-bold text-white">
                          {{ selectedFileData[metricId].score!.toFixed(1) }}
                        </div>
                        <div class="text-xs text-white opacity-90">/10</div>
                      </div>
                      
                      <!-- Cohesion Badge (if available and no score) -->
                      <div *ngIf="selectedFileData[metricId].score === undefined && getCohesionLevel(metricId)" 
                           class="px-4 py-2 rounded-lg shadow-md font-bold text-white capitalize"
                           [ngClass]="{
                             'bg-gradient-to-br from-emerald-500 to-emerald-700': getCohesionLevel(metricId) === 'very_high' || getCohesionLevel(metricId) === 'excellent',
                             'bg-gradient-to-br from-green-400 to-green-600': getCohesionLevel(metricId) === 'high' || getCohesionLevel(metricId) === 'good',
                             'bg-gradient-to-br from-yellow-400 to-yellow-600': getCohesionLevel(metricId) === 'medium' || getCohesionLevel(metricId) === 'moderate',
                             'bg-gradient-to-br from-orange-400 to-orange-600': getCohesionLevel(metricId) === 'low',
                             'bg-gradient-to-br from-red-500 to-red-700': getCohesionLevel(metricId) === 'very_low',
                             'bg-gradient-to-br from-gray-600 to-gray-800': getCohesionLevel(metricId) === 'not_applicable' || getCohesionLevel(metricId) === 'non_ml_file' || getCohesionLevel(metricId) === 'small_file' || getCohesionLevel(metricId) === 'no_class'
                           }">
                        {{ getCohesionLevel(metricId)?.replace('_', ' ') }}
                      </div>
                    </div>
                  </div>
                </div>

                
                <!-- Collapsible Content -->
                <div *ngIf="!isMetricCollapsed(metricId)" class="transition-all">
                  <!-- Description and Learn More Button -->
                  <div class="px-6 py-4 bg-gray-50 border-b border-gray-200">
                    <p class="text-sm text-gray-600 mb-3">
                      {{ getMetricDescription(metricId) }}
                    </p>
                    <button 
                      (click)="toggleMetricDetails(metricId); $event.stopPropagation()"
                      class="inline-flex items-center gap-2 px-3 py-1.5 text-xs font-medium text-blue-700 bg-white border border-blue-300 rounded-lg hover:bg-blue-50 transition-colors">
                      <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path>
                      </svg>
                      {{ isMetricDetailsExpanded(metricId) ? 'Hide Details' : 'Learn More' }}
                    </button>
                  </div>

                <!-- Expanded Metric Documentation -->
                <div *ngIf="isMetricDetailsExpanded(metricId)" class="mx-6 mt-6 bg-gradient-to-br from-gray-50 to-blue-50 rounded-lg border-2 border-blue-200 overflow-hidden">
                  <div class="px-5 py-3 bg-blue-600 text-white">
                    <h4 class="font-bold text-sm">Metric Documentation</h4>
                  </div>
                  <div *ngIf="getMetricDocumentation(metricId) as doc" class="p-5 space-y-5">
                    <!-- Summary -->
                    <div *ngIf="doc.summary" class="bg-white rounded-lg p-4 border border-gray-200">
                      <div class="text-xs font-semibold text-blue-700 mb-2 uppercase tracking-wide">Summary</div>
                      <p class="text-sm text-gray-800 leading-relaxed">{{ doc.summary }}</p>
                    </div>

                    <!-- Structured Sections -->
                    <div *ngFor="let section of doc.sections" class="bg-white rounded-lg border border-gray-200 overflow-hidden">
                      <div class="px-4 py-2 border-b border-gray-200 bg-gray-50">
                        <h5 class="text-xs font-semibold text-blue-700 uppercase tracking-wide">{{ section.title }}</h5>
                      </div>

                      <div class="p-4" [ngSwitch]="section.type">
                        <div *ngSwitchCase="'formula'" class="bg-gray-50 rounded-lg border border-gray-200 p-3">
                          <pre class="font-mono text-xs text-gray-800 whitespace-pre-wrap leading-relaxed">{{ getFormulaExpression(section) }}</pre>
                        </div>

                        <div *ngSwitchCase="'list'" class="space-y-2">
                          <div *ngFor="let item of getSectionItems(section)" class="flex gap-2 text-sm text-gray-800">
                            <span class="text-blue-600 mt-0.5">•</span>
                            <span>{{ item }}</span>
                          </div>
                        </div>

                        <div *ngSwitchCase="'steps'" class="space-y-2">
                          <div *ngFor="let step of getSectionItems(section); let idx = index" class="flex gap-3 text-sm text-gray-800">
                            <span class="w-5 h-5 flex items-center justify-center rounded-full bg-blue-100 text-blue-700 text-xs font-bold flex-shrink-0 mt-0.5">{{ idx + 1 }}</span>
                            <span>{{ step }}</span>
                          </div>
                        </div>

                        <div *ngSwitchCase="'table'" class="overflow-x-auto">
                          <table *ngIf="getSectionTable(section) as table" class="min-w-full text-xs border border-gray-200 rounded-lg overflow-hidden">
                            <thead class="bg-blue-50">
                              <tr>
                                <th *ngFor="let col of table.columns" class="px-3 py-2 text-left font-semibold text-blue-700 border-b border-gray-200">{{ col }}</th>
                              </tr>
                            </thead>
                            <tbody>
                              <tr *ngFor="let row of table.rows" class="border-b border-gray-100 last:border-b-0">
                                <td *ngFor="let cell of row" class="px-3 py-2 text-gray-700 align-top">{{ cell }}</td>
                              </tr>
                            </tbody>
                          </table>
                        </div>

                        <div *ngSwitchCase="'note'" class="rounded-lg border p-3 text-sm"
                             [ngClass]="getNoteToneClass(section)">
                          {{ getNoteText(section) }}
                        </div>

                        <div *ngSwitchDefault class="space-y-2">
                          <p *ngFor="let paragraph of getSectionParagraphs(section)" class="text-sm text-gray-800 leading-relaxed">{{ paragraph }}</p>
                        </div>
                      </div>
                    </div>

                    <!-- Ideal Range -->
                    <div *ngIf="getIdealRangeEntries(doc).length > 0">
                      <div class="text-xs font-semibold text-blue-700 mb-2 uppercase tracking-wide">Ideal Range</div>
                      <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                        <div *ngFor="let entry of getIdealRangeEntries(doc)"
                             class="rounded-lg p-3 border"
                             [ngClass]="entry.toneClass">
                          <div class="text-xs font-medium mb-1"
                               [ngClass]="entry.labelToneClass">{{ entry.label }}</div>
                          <div class="text-sm font-bold"
                               [ngClass]="entry.valueToneClass">{{ entry.value }}</div>
                        </div>
                      </div>
                    </div>

                    <!-- Interpretation Guide -->
                    <div *ngIf="doc.interpretation && doc.interpretation.length > 0">
                      <div class="text-xs font-semibold text-blue-700 mb-2 uppercase tracking-wide">Interpretation Guide</div>
                      <div class="space-y-2">
                        <div *ngFor="let item of getMetricInterpretationItems(metricId)" 
                             class="rounded-lg p-3 border flex gap-3"
                             [ngClass]="getInterpretationToneClass(item.severity)">
                          <div class="flex-shrink-0 font-mono text-sm font-bold"
                               [ngClass]="item.rangeToneClass">{{ item.range }}</div>
                          <div class="text-sm">
                            <span *ngIf="item.label" class="font-semibold mr-1">{{ item.label }}:</span>
                            <span>{{ item.description }}</span>
                          </div>
                        </div>
                      </div>
                    </div>

                    <!-- References -->
                    <div *ngIf="doc.references && doc.references.length > 0">
                      <div class="text-xs font-semibold text-blue-700 mb-2 uppercase tracking-wide">References</div>
                      <div class="space-y-2">
                        <a *ngFor="let ref of getMetricReferences(metricId)" 
                           [href]="ref.url" 
                           target="_blank"
                           class="flex items-center gap-2 text-sm text-blue-600 hover:text-blue-800 hover:underline">
                          <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14"></path>
                          </svg>
                          {{ ref.label }}
                        </a>
                      </div>
                    </div>
                  </div>
                </div>

                <!-- Detailed Messages -->
                <div *ngIf="selectedFileData[metricId].detailedMessages && selectedFileData[metricId].detailedMessages!.length > 0" 
                     class="mx-6 mt-6 space-y-4">
                  <div *ngFor="let detailedMsg of selectedFileData[metricId].detailedMessages" 
                       class="rounded-lg overflow-hidden border-2"
                       [ngClass]="{
                         'border-red-300': detailedMsg.severity === 'high' || detailedMsg.severity === 'error',
                         'border-yellow-300': detailedMsg.severity === 'medium' || detailedMsg.severity === 'warning',
                         'border-blue-300': detailedMsg.severity === 'low' || detailedMsg.severity === 'info',
                         'border-green-300': detailedMsg.severity === 'success'
                       }">
                    
                    <!-- Severity Badge -->
                    <div class="px-4 py-2 flex items-center justify-between"
                         [ngClass]="{
                           'bg-red-100': detailedMsg.severity === 'high' || detailedMsg.severity === 'error',
                           'bg-yellow-100': detailedMsg.severity === 'medium' || detailedMsg.severity === 'warning',
                           'bg-blue-100': detailedMsg.severity === 'low' || detailedMsg.severity === 'info',
                           'bg-green-100': detailedMsg.severity === 'success'
                         }">
                      <span class="text-xs font-bold uppercase tracking-wide"
                            [ngClass]="{
                              'text-red-700': detailedMsg.severity === 'high' || detailedMsg.severity === 'error',
                              'text-yellow-700': detailedMsg.severity === 'medium' || detailedMsg.severity === 'warning',
                              'text-blue-700': detailedMsg.severity === 'low' || detailedMsg.severity === 'info',
                              'text-green-700': detailedMsg.severity === 'success'
                            }">
                        {{ detailedMsg.severity }} Severity
                      </span>
                      <span *ngIf="detailedMsg.rule_id" class="text-xs font-mono text-gray-600">
                        Rule #{{ detailedMsg.rule_id }}
                      </span>
                    </div>

                    <!-- Diagnosis -->
                    <div class="px-4 py-3 bg-white border-t border-gray-200">
                      <div class="flex items-start gap-3">
                        <svg class="w-5 h-5 flex-shrink-0 mt-0.5"
                             [ngClass]="{
                               'text-red-600': detailedMsg.severity === 'high' || detailedMsg.severity === 'error',
                               'text-yellow-600': detailedMsg.severity === 'medium' || detailedMsg.severity === 'warning',
                               'text-blue-600': detailedMsg.severity === 'low' || detailedMsg.severity === 'info',
                               'text-green-600': detailedMsg.severity === 'success'
                             }"
                             fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"></path>
                        </svg>
                        <div class="flex-1">
                          <div class="text-xs font-bold text-gray-500 mb-1 uppercase tracking-wide">Diagnosis</div>
                          <p class="text-sm text-gray-800">{{ detailedMsg.diagnosis }}</p>
                        </div>
                      </div>
                    </div>

                    <!-- Recommendation -->
                    <div *ngIf="detailedMsg.recommendation" class="px-4 py-3 bg-gradient-to-r from-blue-50 to-indigo-50 border-t border-gray-200">
                      <div class="flex items-start gap-3">
                        <svg class="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z"></path>
                        </svg>
                        <div class="flex-1">
                          <div class="text-xs font-bold text-blue-700 mb-1 uppercase tracking-wide">Recommendation</div>
                          <p class="text-sm text-blue-900 font-medium">{{ detailedMsg.recommendation }}</p>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                <!-- Key Metrics Grid -->
                <div class="px-6 py-6">
                  <div *ngIf="metricId === 'ccpm'" class="space-y-4">
                    <!-- Primary Metrics -->
                    <div class="grid grid-cols-2 gap-4">
                      <div class="bg-gradient-to-br from-blue-50 to-blue-100 rounded-lg p-4 border border-blue-200">
                        <div class="text-xs font-semibold text-blue-600 mb-1">COHESION LEVEL</div>
                        <div class="text-2xl font-bold capitalize"
                             [ngClass]="{
                               'text-emerald-700': selectedFileData[metricId].data.cohesion_level === 'very_high',
                               'text-green-700': selectedFileData[metricId].data.cohesion_level === 'high',
                               'text-yellow-600': selectedFileData[metricId].data.cohesion_level === 'medium',
                               'text-orange-600': selectedFileData[metricId].data.cohesion_level === 'low',
                               'text-red-700': selectedFileData[metricId].data.cohesion_level === 'very_low',
                               'text-gray-700': selectedFileData[metricId].data.cohesion_level === 'non_ml_file' || selectedFileData[metricId].data.cohesion_level === 'small_file'
                             }">
                          {{ selectedFileData[metricId].data.cohesion_level?.replace('_', ' ') || 'N/A' }}
                        </div>
                      </div>
                      
                      <div class="bg-gradient-to-br from-gray-50 to-gray-100 rounded-lg p-4 border border-gray-200">
                        <div class="text-xs font-semibold text-gray-600 mb-1">FILE SIZE (NLOC)</div>
                        <div class="text-2xl font-bold text-gray-700">
                          {{ selectedFileData[metricId].data.nloc || 0 }}
                        </div>
                        <div class="text-xs text-gray-600 mt-1">
                          {{ selectedFileData[metricId].data.above_nloc_threshold ? 'Above' : 'Below' }} threshold
                        </div>
                      </div>
                    </div>

                    <!-- Pipeline Detection Metrics -->
                    <div class="grid grid-cols-3 gap-4">
                      <div class="bg-gradient-to-br from-indigo-50 to-indigo-100 rounded-lg p-4 border border-indigo-200">
                        <div class="text-xs font-semibold text-indigo-600 mb-1">STAGES DETECTED</div>
                        <div class="text-2xl font-bold text-indigo-700">
                          {{ selectedFileData[metricId].data.stages_detected?.length || 0 }}
                        </div>
                        <div class="text-xs text-indigo-600 mt-1">Unique: {{ selectedFileData[metricId].data.unique_stages || 0 }}</div>
                      </div>

                      <div class="bg-gradient-to-br from-purple-50 to-purple-100 rounded-lg p-4 border border-purple-200">
                        <div class="text-xs font-semibold text-purple-600 mb-1">PHASES</div>
                        <div class="text-2xl font-bold text-purple-700">
                          {{ selectedFileData[metricId].data.phases_detected?.length || 0 }}
                        </div>
                        <div class="text-xs text-purple-600 mt-1">Unique: {{ selectedFileData[metricId].data.unique_phases || 0 }}</div>
                      </div>

                      <div class="bg-gradient-to-br from-teal-50 to-teal-100 rounded-lg p-4 border border-teal-200">
                        <div class="text-xs font-semibold text-teal-600 mb-1">ML CONTENT</div>
                        <div class="text-lg font-bold text-teal-700">
                          {{ selectedFileData[metricId].data.ml_content_only ? 'Only ML' : 'Mixed' }}
                        </div>
                        <div class="text-xs text-teal-600 mt-1">
                          {{ selectedFileData[metricId].data.is_script_file ? 'Script file' : 'Structured file' }}
                        </div>
                        <div *ngIf="selectedFileData[metricId].data.non_ml_keywords_found?.length > 0" class="text-xs text-red-600 mt-1">
                          Non-ML: {{ selectedFileData[metricId].data.non_ml_keywords_found.length }} keywords
                        </div>
                      </div>
                    </div>

                    <!-- Detected Stages List -->
                    <div *ngIf="selectedFileData[metricId].data.stages_detected && selectedFileData[metricId].data.stages_detected.length > 0"
                         class="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-lg p-4 border border-blue-200">
                      <div class="text-xs font-semibold text-blue-700 mb-2 uppercase tracking-wide">Detected Pipeline Stages</div>
                      <div class="flex flex-wrap gap-2">
                        <span *ngFor="let stage of selectedFileData[metricId].data.stages_detected"
                              class="px-3 py-1 text-xs font-medium rounded-full bg-white border border-blue-300 text-blue-700">
                          {{ stage.replace('_', ' ') }}
                        </span>
                      </div>
                    </div>

                    <!-- Detected Phases List -->
                    <div *ngIf="selectedFileData[metricId].data.phases_detected && selectedFileData[metricId].data.phases_detected.length > 0"
                         class="bg-gradient-to-r from-purple-50 to-pink-50 rounded-lg p-4 border border-purple-200">
                      <div class="text-xs font-semibold text-purple-700 mb-2 uppercase tracking-wide">Detected Pipeline Phases</div>
                      <div class="flex flex-wrap gap-2">
                        <span *ngFor="let phase of selectedFileData[metricId].data.phases_detected"
                              class="px-3 py-1 text-xs font-medium rounded-full bg-white border border-purple-300 text-purple-700">
                          {{ phase.replace('_', ' ') }}
                        </span>
                      </div>
                    </div>

                    <!-- Non-ML Keywords Found (Warning) -->
                    <div *ngIf="selectedFileData[metricId].data.non_ml_keywords_found && selectedFileData[metricId].data.non_ml_keywords_found.length > 0"
                         class="bg-gradient-to-r from-red-50 to-orange-50 rounded-lg p-4 border border-red-200">
                      <div class="flex items-start gap-3">
                        <svg class="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"></path>
                        </svg>
                        <div class="flex-1">
                          <div class="text-xs font-bold text-red-700 mb-2 uppercase tracking-wide">Non-ML Keywords Detected</div>
                          <p class="text-xs text-red-800 mb-2">This file contains non-ML code, which affects cohesion:</p>
                          <div class="flex flex-wrap gap-2">
                            <span *ngFor="let keyword of selectedFileData[metricId].data.non_ml_keywords_found"
                                  class="px-2 py-1 text-xs font-medium rounded bg-white border border-red-300 text-red-700">
                              {{ keyword }}
                            </span>
                          </div>
                        </div>
                      </div>
                    </div>

                    <!-- Detection Source Info -->
                    <div class="bg-gray-50 rounded-lg p-3 border border-gray-200">
                      <div class="flex items-center gap-2 text-xs text-gray-600">
                        <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path>
                        </svg>
                        <span>Detection source: <strong class="text-gray-900">{{ selectedFileData[metricId].data.source }}</strong></span>
                      </div>
                    </div>
                  </div>

                  <!-- LCCML TEMPLATE REMOVED - Metric no longer used -->

                  <div *ngIf="metricId === 'scpm'" class="space-y-4">
                    <!-- Primary Metrics -->
                    <div class="grid grid-cols-2 gap-4">
                      <div class="bg-gradient-to-br from-orange-50 to-orange-100 rounded-lg p-4 border border-orange-200">
                        <div class="text-xs font-semibold text-orange-600 mb-1">COHESION LEVEL</div>
                        <div class="text-2xl font-bold capitalize"
                             [ngClass]="{
                               'text-emerald-700': selectedFileData[metricId].data.cohesion_level === 'very_high',
                               'text-green-700': selectedFileData[metricId].data.cohesion_level === 'high',
                               'text-yellow-600': selectedFileData[metricId].data.cohesion_level === 'medium',
                               'text-orange-600': selectedFileData[metricId].data.cohesion_level === 'low',
                               'text-red-700': selectedFileData[metricId].data.cohesion_level === 'very_low',
                               'text-gray-700': selectedFileData[metricId].data.cohesion_level === 'not_applicable'
                             }">
                          {{ selectedFileData[metricId].data.cohesion_level?.replace('_', ' ') || 'N/A' }}
                        </div>
                      </div>

                      <div class="bg-gradient-to-br from-indigo-50 to-indigo-100 rounded-lg p-4 border border-indigo-200">
                        <div class="text-xs font-semibold text-indigo-600 mb-1">SCPM SCORE</div>
                        <div class="text-2xl font-bold text-indigo-700">
                          {{ selectedFileData[metricId].data.scpm !== null && selectedFileData[metricId].data.scpm !== undefined 
                             ? (selectedFileData[metricId].data.scpm * 100).toFixed(1) + '%'  
                             : 'N/A' }}
                        </div>
                      </div>
                    </div>

                    <!-- Connection Metrics -->
                    <div class="grid grid-cols-4 gap-4">
                      <div class="bg-gradient-to-br from-blue-50 to-blue-100 rounded-lg p-4 border border-blue-200">
                        <div class="text-xs font-semibold text-blue-600 mb-1">METHODS</div>
                        <div class="text-2xl font-bold text-blue-700">
                          {{ selectedFileData[metricId].data.n_methods || 0 }}
                        </div>
                      </div>
                      
                      <div class="bg-gradient-to-br from-teal-50 to-teal-100 rounded-lg p-4 border border-teal-200">
                        <div class="text-xs font-semibold text-teal-600 mb-1">POSSIBLE PAIRS</div>
                        <div class="text-2xl font-bold text-teal-700">
                          {{ selectedFileData[metricId].data.n_possible_pairs || 0 }}
                        </div>
                      </div>

                      <div class="bg-gradient-to-br from-green-50 to-green-100 rounded-lg p-4 border border-green-200">
                        <div class="text-xs font-semibold text-green-600 mb-1">SHARED PAIRS</div>
                        <div class="text-2xl font-bold text-green-700">
                          {{ selectedFileData[metricId].data.n_shared_pairs || 0 }}
                        </div>
                        <div class="text-xs text-green-600 mt-1">
                          {{ selectedFileData[metricId].data.n_possible_pairs > 0 
                             ? ((selectedFileData[metricId].data.n_shared_pairs / selectedFileData[metricId].data.n_possible_pairs) * 100).toFixed(0) + '%' 
                             : '0%' }} shared
                        </div>
                      </div>

                      <div class="bg-gradient-to-br from-purple-50 to-purple-100 rounded-lg p-4 border border-purple-200">
                        <div class="text-xs font-semibold text-purple-600 mb-1">COMPONENTS</div>
                        <div class="text-2xl font-bold text-purple-700">
                          {{ selectedFileData[metricId].data.n_components || 0 }}
                        </div>
                        <div class="text-xs text-purple-600 mt-1">Structural groups</div>
                      </div>
                    </div>

                    <!-- Shared Resources Summary -->
                    <div class="grid grid-cols-3 gap-4">
                      <div class="bg-gradient-to-br from-cyan-50 to-cyan-100 rounded-lg p-4 border border-cyan-200">
                        <div class="text-xs font-semibold text-cyan-600 mb-1">SHARED TYPE</div>
                        <div class="text-lg font-bold capitalize text-cyan-700">
                          {{ selectedFileData[metricId].data.shared_type || 'N/A' }}
                        </div>
                      </div>

                      <div class="bg-gradient-to-br from-lime-50 to-lime-100 rounded-lg p-4 border border-lime-200">
                        <div class="text-xs font-semibold text-lime-600 mb-1">SHARED VARIABLES</div>
                        <div class="text-2xl font-bold text-lime-700">
                          {{ selectedFileData[metricId].data.shared_variable_count || 0 }}
                        </div>
                      </div>

                      <div class="bg-gradient-to-br from-amber-50 to-amber-100 rounded-lg p-4 border border-amber-200">
                        <div class="text-xs font-semibold text-amber-600 mb-1">SHARED FILES</div>
                        <div class="text-2xl font-bold text-amber-700">
                          {{ selectedFileData[metricId].data.shared_file_count || 0 }}
                        </div>
                      </div>
                    </div>

                    <!-- Breakdown Metrics -->
                    <div *ngIf="selectedFileData[metricId].data.breakdown" class="grid grid-cols-2 gap-4">
                      <div class="bg-gradient-to-br from-violet-50 to-violet-100 rounded-lg p-4 border border-violet-200">
                        <div class="text-xs font-semibold text-violet-600 mb-1">PAIRS VIA VARIABLES</div>
                        <div class="text-2xl font-bold text-violet-700">
                          {{ selectedFileData[metricId].data.breakdown.pairs_via_variables || 0 }}
                        </div>
                      </div>

                      <div class="bg-gradient-to-br from-rose-50 to-rose-100 rounded-lg p-4 border border-rose-200">
                        <div class="text-xs font-semibold text-rose-600 mb-1">PAIRS VIA FILES</div>
                        <div class="text-2xl font-bold text-rose-700">
                          {{ selectedFileData[metricId].data.breakdown.pairs_via_files || 0 }}
                        </div>
                      </div>
                    </div>

                    <!-- Disconnected Methods Warning -->
                    <div *ngIf="selectedFileData[metricId].data.disconnected_methods && selectedFileData[metricId].data.disconnected_methods.length > 0"
                         class="bg-gradient-to-r from-red-50 to-orange-50 rounded-lg p-4 border border-red-200">
                      <div class="flex items-start gap-3">
                        <svg class="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"></path>
                        </svg>
                        <div class="flex-1">
                          <div class="text-xs font-bold text-red-700 mb-2 uppercase tracking-wide">Disconnected Methods ({{ selectedFileData[metricId].data.n_disconnected_methods }})</div>
                          <p class="text-xs text-red-800 mb-2">These methods don't share variables/files with others:</p>
                          <div class="flex flex-wrap gap-2">
                            <span *ngFor="let method of selectedFileData[metricId].data.disconnected_methods"
                                  class="px-2 py-1 text-xs font-mono rounded bg-white border border-red-300 text-red-700">
                              {{ method }}()
                            </span>
                          </div>
                        </div>
                      </div>
                    </div>

                    <!-- Shared Variables List -->
                    <div *ngIf="selectedFileData[metricId].data.shared_vars && selectedFileData[metricId].data.shared_vars.length > 0"
                         class="bg-gradient-to-r from-green-50 to-emerald-50 rounded-lg p-4 border border-green-200">
                      <div class="text-xs font-semibold text-green-700 mb-2 uppercase tracking-wide">Shared Variables</div>
                      <div class="flex flex-wrap gap-2">
                        <span *ngFor="let variable of selectedFileData[metricId].data.shared_vars"
                              class="px-3 py-1 text-xs font-mono rounded-full bg-white border border-green-300 text-green-700">
                          {{ variable }}
                        </span>
                      </div>
                    </div>

                    <!-- Shared Files List -->
                    <div *ngIf="selectedFileData[metricId].data.shared_files && selectedFileData[metricId].data.shared_files.length > 0"
                         class="bg-gradient-to-r from-blue-50 to-cyan-50 rounded-lg p-4 border border-blue-200">
                      <div class="text-xs font-semibold text-blue-700 mb-2 uppercase tracking-wide">Shared Files</div>
                      <div class="flex flex-wrap gap-2">
                        <span *ngFor="let file of selectedFileData[metricId].data.shared_files"
                              class="px-3 py-1 text-xs font-mono rounded-full bg-white border border-blue-300 text-blue-700">
                          {{ file }}
                        </span>
                      </div>
                    </div>

                    <!-- Shared Pairs List -->
                    <div *ngIf="selectedFileData[metricId].data.shared_pairs && selectedFileData[metricId].data.shared_pairs.length > 0"
                         class="bg-gray-50 rounded-lg p-4 border border-gray-200">
                      <div class="text-xs font-semibold text-gray-700 mb-2 uppercase tracking-wide">Shared Method Pairs</div>
                      <div class="flex flex-wrap gap-2">
                        <span *ngFor="let pair of selectedFileData[metricId].data.shared_pairs"
                              class="px-3 py-1 text-xs font-mono rounded-full bg-white border border-gray-300 text-gray-700">
                          {{ pair[0] }}() ↔ {{ pair[1] }}()
                        </span>
                      </div>
                    </div>
                  </div>

                  <div *ngIf="metricId === 'fcpm'" class="space-y-4">
                    <!-- Primary Metrics -->
                    <div class="grid grid-cols-2 gap-4">
                      <div class="bg-gradient-to-br from-pink-50 to-pink-100 rounded-lg p-4 border border-pink-200">
                        <div class="text-xs font-semibold text-pink-600 mb-1">COHESION LEVEL</div>
                        <div class="text-2xl font-bold capitalize"
                             [ngClass]="{
                               'text-emerald-700': selectedFileData[metricId].data.cohesion_level === 'very_high',
                               'text-green-700': selectedFileData[metricId].data.cohesion_level === 'high',
                               'text-yellow-600': selectedFileData[metricId].data.cohesion_level === 'moderate',
                               'text-orange-600': selectedFileData[metricId].data.cohesion_level === 'low',
                               'text-red-700': selectedFileData[metricId].data.cohesion_level === 'very_low',
                               'text-gray-700': selectedFileData[metricId].data.cohesion_level === 'not_applicable'
                             }">
                          {{ selectedFileData[metricId].data.cohesion_level?.replace('_', ' ') || 'N/A' }}
                        </div>
                      </div>

                      <div class="bg-gradient-to-br from-indigo-50 to-indigo-100 rounded-lg p-4 border border-indigo-200">
                        <div class="text-xs font-semibold text-indigo-600 mb-1">FCPM SCORE</div>
                        <div class="text-2xl font-bold text-indigo-700">
                          {{ selectedFileData[metricId].data.fcpm !== null && selectedFileData[metricId].data.fcpm !== undefined 
                             ? (selectedFileData[metricId].data.fcpm * 100).toFixed(1) + '%'  
                             : 'N/A' }}
                        </div>
                      </div>
                    </div>

                    <!-- Connection Metrics -->
                    <div class="grid grid-cols-4 gap-4">
                      <div class="bg-gradient-to-br from-blue-50 to-blue-100 rounded-lg p-4 border border-blue-200">
                        <div class="text-xs font-semibold text-blue-600 mb-1">METHODS</div>
                        <div class="text-2xl font-bold text-blue-700">
                          {{ selectedFileData[metricId].data.n_methods || 0 }}
                        </div>
                      </div>
                      
                      <div class="bg-gradient-to-br from-teal-50 to-teal-100 rounded-lg p-4 border border-teal-200">
                        <div class="text-xs font-semibold text-teal-600 mb-1">POSSIBLE PAIRS</div>
                        <div class="text-2xl font-bold text-teal-700">
                          {{ selectedFileData[metricId].data.n_possible_pairs || 0 }}
                        </div>
                      </div>

                      <div class="bg-gradient-to-br from-green-50 to-green-100 rounded-lg p-4 border border-green-200">
                        <div class="text-xs font-semibold text-green-600 mb-1">CONNECTED PAIRS</div>
                        <div class="text-2xl font-bold text-green-700">
                          {{ selectedFileData[metricId].data.n_connected_pairs || 0 }}
                        </div>
                        <div class="text-xs text-green-600 mt-1">
                          {{ selectedFileData[metricId].data.n_possible_pairs > 0 
                             ? ((selectedFileData[metricId].data.n_connected_pairs / selectedFileData[metricId].data.n_possible_pairs) * 100).toFixed(0) + '%' 
                             : '0%' }} connected
                        </div>
                      </div>

                      <div class="bg-gradient-to-br from-orange-50 to-orange-100 rounded-lg p-4 border border-orange-200">
                        <div class="text-xs font-semibold text-orange-600 mb-1">COMPONENTS</div>
                        <div class="text-2xl font-bold text-orange-700">
                          {{ selectedFileData[metricId].data.n_components || 0 }}
                        </div>
                        <div class="text-xs text-orange-600 mt-1">Functional groups</div>
                      </div>
                    </div>

                    <!-- Breakdown Metrics -->
                    <div *ngIf="selectedFileData[metricId].data.breakdown" class="grid grid-cols-2 gap-4">
                      <div class="bg-gradient-to-br from-purple-50 to-purple-100 rounded-lg p-4 border border-purple-200">
                        <div class="text-xs font-semibold text-purple-600 mb-1">DIRECT INVOCATIONS</div>
                        <div class="text-2xl font-bold text-purple-700">
                          {{ selectedFileData[metricId].data.breakdown.direct_invocations || 0 }}
                        </div>
                      </div>

                      <div class="bg-gradient-to-br from-cyan-50 to-cyan-100 rounded-lg p-4 border border-cyan-200">
                        <div class="text-xs font-semibold text-cyan-600 mb-1">INDIRECT INVOCATIONS</div>
                        <div class="text-2xl font-bold text-cyan-700">
                          {{ selectedFileData[metricId].data.breakdown.indirect_invocations || 0 }}
                        </div>
                      </div>
                    </div>

                    <!-- Disconnected Methods Warning -->
                    <div *ngIf="selectedFileData[metricId].data.disconnected_methods && selectedFileData[metricId].data.disconnected_methods.length > 0"
                         class="bg-gradient-to-r from-red-50 to-orange-50 rounded-lg p-4 border border-red-200">
                      <div class="flex items-start gap-3">
                        <svg class="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"></path>
                        </svg>
                        <div class="flex-1">
                          <div class="text-xs font-bold text-red-700 mb-2 uppercase tracking-wide">Disconnected Methods ({{ selectedFileData[metricId].data.n_disconnected_methods }})</div>
                          <p class="text-xs text-red-800 mb-2">These methods are not called by any other method in the file:</p>
                          <div class="flex flex-wrap gap-2">
                            <span *ngFor="let method of selectedFileData[metricId].data.disconnected_methods"
                                  class="px-2 py-1 text-xs font-mono rounded bg-white border border-red-300 text-red-700">
                              {{ method }}()
                            </span>
                          </div>
                        </div>
                      </div>
                    </div>

                    <!-- Connected Pairs List -->
                    <div *ngIf="selectedFileData[metricId].data.connected_pairs && selectedFileData[metricId].data.connected_pairs.length > 0"
                         class="bg-gradient-to-r from-green-50 to-teal-50 rounded-lg p-4 border border-green-200">
                      <div class="text-xs font-semibold text-green-700 mb-2 uppercase tracking-wide">Connected Method Pairs</div>
                      <div class="flex flex-wrap gap-2">
                        <span *ngFor="let pair of selectedFileData[metricId].data.connected_pairs"
                              class="px-3 py-1 text-xs font-mono rounded-full bg-white border border-green-300 text-green-700">
                          {{ pair[0] }}() → {{ pair[1] }}()
                        </span>
                      </div>
                    </div>

                    <!-- Call Graph Visualization -->
                    <div *ngIf="selectedFileData[metricId].data.call_graph && Object.keys(selectedFileData[metricId].data.call_graph).length > 0"
                         class="bg-gray-50 rounded-lg p-4 border border-gray-200">
                      <div class="text-xs font-semibold text-gray-700 mb-3 uppercase tracking-wide">Call Graph</div>
                      <div class="space-y-2">
                        <div *ngFor="let entry of getCallGraphEntries(selectedFileData[metricId].data.call_graph)" 
                             class="flex items-start gap-3 p-2 bg-white rounded border border-gray-200">
                          <span class="text-xs font-mono font-bold text-gray-700 min-w-[100px]">{{ entry[0] }}()</span>
                          <span class="text-gray-400">→</span>
                          <div class="flex-1 flex flex-wrap gap-1">
                            <span *ngIf="entry[1].length === 0" class="text-xs text-gray-400 italic">No calls</span>
                            <span *ngFor="let callee of entry[1]"
                                  class="px-2 py-0.5 text-xs font-mono rounded bg-blue-50 border border-blue-200 text-blue-700">
                              {{ callee }}()
                            </span>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>

                  <!-- FCPP (Package-level Functional Cohesion) -->
                  <div *ngIf="metricId === 'fcpp'" class="space-y-4">
                    <div class="grid grid-cols-2 gap-4">
                      <div class="bg-gradient-to-br from-green-50 to-green-100 rounded-lg p-4 border border-green-200">
                        <div class="text-xs font-semibold text-green-600 mb-1">FCPP SCORE</div>
                        <div class="text-2xl font-bold text-green-700" [ngClass]="{'text-lg': selectedFileData[metricId].data.fcpp === undefined || selectedFileData[metricId].data.fcpp === null}">
                          {{ selectedFileData[metricId].data.fcpp !== undefined && selectedFileData[metricId].data.fcpp !== null ? (selectedFileData[metricId].data.fcpp * 10).toFixed(1) : 'Not Applicable' }}
                        </div>
                        <div class="text-xs text-green-600 mt-1" *ngIf="selectedFileData[metricId].data.fcpp !== undefined && selectedFileData[metricId].data.fcpp !== null">/ 10</div>
                      </div>
                      
                      <div class="bg-gradient-to-br from-blue-50 to-blue-100 rounded-lg p-4 border border-blue-200">
                        <div class="text-xs font-semibold text-blue-600 mb-1">ROOT NODES</div>
                        <div class="text-2xl font-bold text-blue-700">
                          {{ selectedFileData[metricId].data.n_nodes || 0 }}
                        </div>
                        <div class="text-xs text-blue-600 mt-1">
                          {{ selectedFileData[metricId].data.connections_count || 0 }} connections
                        </div>
                      </div>
                    </div>

                    <div class="grid grid-cols-2 gap-4">
                      <div class="bg-gradient-to-br from-purple-50 to-purple-100 rounded-lg p-4 border border-purple-200">
                        <div class="text-xs font-semibold text-purple-600 mb-1">GROUPS</div>
                        <div class="text-2xl font-bold text-purple-700">
                          {{ selectedFileData[metricId].data.n_groups || 0 }}
                        </div>
                      </div>
                      
                      <div class="bg-gradient-to-br from-orange-50 to-orange-100 rounded-lg p-4 border border-orange-200">
                        <div class="text-xs font-semibold text-orange-600 mb-1">ISOLATED NODES</div>
                        <div class="text-2xl font-bold text-orange-700">
                          {{ selectedFileData[metricId].data.isolated_nodes?.length || 0 }}
                        </div>
                      </div>
                    </div>

                    <div *ngIf="selectedFileData[metricId].data.connections?.length > 0"
                         class="bg-gradient-to-r from-green-50 to-teal-50 rounded-lg p-4 border border-green-200 max-h-64 overflow-y-auto">
                      <div class="text-xs font-semibold text-green-700 mb-3 uppercase tracking-wide">Node Connections</div>
                      <div class="space-y-2">
                        <div *ngFor="let conn of selectedFileData[metricId].data.connections" 
                             class="flex items-start gap-3 p-2 bg-white rounded border border-gray-200">
                          <span class="text-xs font-mono font-bold text-gray-700">{{ conn.node_a }}</span>
                          <span class="text-gray-400">↔</span>
                          <span class="text-xs font-mono font-bold text-gray-700">{{ conn.node_b }}</span>
                          <span class="text-xs text-gray-500 ml-auto">{{ conn.type }}</span>
                        </div>
                      </div>
                    </div>
                  </div>

                  <!-- SCPP (Package-level Structural Coupling) -->
                  <div *ngIf="metricId === 'scpp'" class="space-y-4">
                    <div class="grid grid-cols-2 gap-4">
                      <div class="bg-gradient-to-br from-orange-50 to-orange-100 rounded-lg p-4 border border-orange-200">
                        <div class="text-xs font-semibold text-orange-600 mb-1">SCPP SCORE</div>
                        <div class="text-2xl font-bold text-orange-700" [ngClass]="{'text-lg': selectedFileData[metricId].data.scpp === undefined || selectedFileData[metricId].data.scpp === null}">
                          {{ selectedFileData[metricId].data.scpp !== undefined && selectedFileData[metricId].data.scpp !== null ? (selectedFileData[metricId].data.scpp * 10).toFixed(1) : 'Not Applicable' }}
                        </div>
                        <div class="text-xs text-orange-600 mt-1" *ngIf="selectedFileData[metricId].data.scpp !== undefined && selectedFileData[metricId].data.scpp !== null">/ 10 (lower is better)</div>
                      </div>
                      
                      <div class="bg-gradient-to-br from-blue-50 to-blue-100 rounded-lg p-4 border border-blue-200">
                        <div class="text-xs font-semibold text-blue-600 mb-1">ROOT NODES</div>
                        <div class="text-2xl font-bold text-blue-700">
                          {{ selectedFileData[metricId].data.n_nodes || 0 }}
                        </div>
                      </div>
                    </div>

                    <div class="grid grid-cols-3 gap-4">
                      <div class="bg-gradient-to-br from-red-50 to-red-100 rounded-lg p-4 border border-red-200">
                        <div class="text-xs font-semibold text-red-600 mb-1">SHARED RESOURCES</div>
                        <div class="text-2xl font-bold text-red-700">
                          {{ selectedFileData[metricId].data.n_shared || 0 }}
                        </div>
                        <div class="text-xs text-red-600 mt-1">of {{ selectedFileData[metricId].data.n_pairs || 0 }} pairs</div>
                      </div>

                      <div class="bg-gradient-to-br from-purple-50 to-purple-100 rounded-lg p-4 border border-purple-200">
                        <div class="text-xs font-semibold text-purple-600 mb-1">GROUPS</div>
                        <div class="text-2xl font-bold text-purple-700">
                          {{ selectedFileData[metricId].data.n_groups || 0 }}
                        </div>
                      </div>
                      
                      <div class="bg-gradient-to-br from-teal-50 to-teal-100 rounded-lg p-4 border border-teal-200">
                        <div class="text-xs font-semibold text-teal-600 mb-1">ISOLATED NODES</div>
                        <div class="text-2xl font-bold text-teal-700">
                          {{ selectedFileData[metricId].data.isolated_nodes?.length || 0 }}
                        </div>
                      </div>
                    </div>

                    <div *ngIf="selectedFileData[metricId].data.connections?.length > 0"
                         class="bg-gradient-to-r from-red-50 to-orange-50 rounded-lg p-4 border border-red-200 max-h-64 overflow-y-auto">
                      <div class="text-xs font-semibold text-red-700 mb-3 uppercase tracking-wide">Shared Resource Pairs</div>
                      <div class="space-y-2">
                        <div *ngFor="let conn of selectedFileData[metricId].data.connections" 
                             class="p-2 bg-white rounded border border-gray-200">
                          <div class="flex items-center gap-3 mb-1">
                            <span class="text-xs font-mono font-bold text-gray-700">{{ conn.node_a }}</span>
                            <span class="text-gray-400">↔</span>
                            <span class="text-xs font-mono font-bold text-gray-700">{{ conn.node_b }}</span>
                          </div>
                          <div class="flex flex-wrap gap-1 mt-1">
                            <span *ngFor="let res of conn.shared_resources"
                                  class="px-2 py-0.5 text-xs font-mono rounded bg-red-50 border border-red-200 text-red-700">
                              {{ res }}
                            </span>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>

                  <!-- CCPP (Package-level Conceptual Cohesion) -->
                  <div *ngIf="metricId === 'ccpp'" class="space-y-4">
                    <div class="grid grid-cols-2 gap-4">
                      <div class="bg-gradient-to-br from-indigo-50 to-indigo-100 rounded-lg p-4 border border-indigo-200">
                        <div class="text-xs font-semibold text-indigo-600 mb-1">COHESION LEVEL</div>
                        <div class="text-2xl font-bold capitalize"
                             [ngClass]="{
                               'text-emerald-700': selectedFileData[metricId].data.metrics?.cohesion_level === 'very_high',
                               'text-green-700': selectedFileData[metricId].data.metrics?.cohesion_level === 'high',
                               'text-yellow-600': selectedFileData[metricId].data.metrics?.cohesion_level === 'medium',
                               'text-orange-600': selectedFileData[metricId].data.metrics?.cohesion_level === 'low',
                               'text-red-700': selectedFileData[metricId].data.metrics?.cohesion_level === 'very_low'
                             }">
                          {{ selectedFileData[metricId].data.metrics?.cohesion_level?.replace('_', ' ') || 'N/A' }}
                        </div>
                      </div>
                      
                      <div class="bg-gradient-to-br from-blue-50 to-blue-100 rounded-lg p-4 border border-blue-200">
                        <div class="text-xs font-semibold text-blue-600 mb-1">CCPP SCORE</div>
                        <div class="text-2xl font-bold text-blue-700">
                          {{ selectedFileData[metricId].data.metrics?.ccpp_score !== undefined ? (selectedFileData[metricId].data.metrics.ccpp_score * 10).toFixed(1) : 'N/A' }}
                        </div>
                        <div class="text-xs text-blue-600 mt-1">/ 10</div>
                      </div>
                    </div>

                    <div class="grid grid-cols-2 gap-4">
                      <div class="bg-gradient-to-br from-purple-50 to-purple-100 rounded-lg p-4 border border-purple-200">
                        <div class="text-xs font-semibold text-purple-600 mb-1">MODULES</div>
                        <div class="text-2xl font-bold text-purple-700">
                          {{ selectedFileData[metricId].data.metrics?.total_modules || 0 }}
                        </div>
                        <div class="text-xs text-purple-600 mt-1">
                          {{ selectedFileData[metricId].data.metrics?.ml_modules || 0 }} with ML content
                        </div>
                      </div>
                      
                      <div class="bg-gradient-to-br from-teal-50 to-teal-100 rounded-lg p-4 border border-teal-200">
                        <div class="text-xs font-semibold text-teal-600 mb-1">REFACTORING</div>
                        <div class="text-lg font-bold"
                             [ngClass]="{
                               'text-green-700': !selectedFileData[metricId].data.quality_indicators?.needs_refactoring,
                               'text-red-700': selectedFileData[metricId].data.quality_indicators?.needs_refactoring
                             }">
                          {{ selectedFileData[metricId].data.quality_indicators?.needs_refactoring ? 'Needed' : 'Not needed' }}
                        </div>
                      </div>
                    </div>

                    <div *ngIf="selectedFileData[metricId].data.stages_detected && selectedFileData[metricId].data.stages_detected.length > 0"
                         class="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-lg p-4 border border-blue-200">
                      <div class="text-xs font-semibold text-blue-700 mb-2 uppercase tracking-wide">Detected Stages</div>
                      <div class="flex flex-wrap gap-2">
                        <span *ngFor="let stage of selectedFileData[metricId].data.stages_detected"
                              class="px-3 py-1 text-xs font-medium rounded-full bg-white border border-blue-300 text-blue-700">
                          {{ stage.replace('_', ' ') }}
                        </span>
                      </div>
                    </div>

                    <div *ngIf="selectedFileData[metricId].data.phases_detected && selectedFileData[metricId].data.phases_detected.length > 0"
                         class="bg-gradient-to-r from-purple-50 to-pink-50 rounded-lg p-4 border border-purple-200">
                      <div class="text-xs font-semibold text-purple-700 mb-2 uppercase tracking-wide">Detected Phases</div>
                      <div class="flex flex-wrap gap-2">
                        <span *ngFor="let phase of selectedFileData[metricId].data.phases_detected"
                              class="px-3 py-1 text-xs font-medium rounded-full bg-white border border-purple-300 text-purple-700">
                          {{ phase.replace('_', ' ') }}
                        </span>
                      </div>
                    </div>
                  </div>

                  <div *ngIf="metricId === 'ifc_p'" class="space-y-4">
                    <!-- Primary Metrics -->
                    <div class="grid grid-cols-2 gap-4">
                      <div class="bg-gradient-to-br from-pink-50 to-pink-100 rounded-lg p-4 border border-pink-200">
                        <div class="text-xs font-semibold text-pink-600 mb-1">COHESION LEVEL</div>
                        <div class="text-2xl font-bold capitalize"
                             [ngClass]="{
                               'text-emerald-700': selectedFileData[metricId].data.cohesion_level === 'excellent',
                               'text-green-700': selectedFileData[metricId].data.cohesion_level === 'good',
                               'text-yellow-600': selectedFileData[metricId].data.cohesion_level === 'moderate',
                               'text-orange-600': selectedFileData[metricId].data.cohesion_level === 'low',
                               'text-red-700': selectedFileData[metricId].data.cohesion_level === 'very_low'
                             }">
                          {{ selectedFileData[metricId].data.cohesion_level?.replace('_', ' ') || 'N/A' }}
                        </div>
                      </div>

                      <div class="bg-gradient-to-br from-indigo-50 to-indigo-100 rounded-lg p-4 border border-indigo-200">
                        <div class="text-xs font-semibold text-indigo-600 mb-1">IFC-P SCORE</div>
                        <div class="text-2xl font-bold text-indigo-700">
                          {{ selectedFileData[metricId].data.ifc_p !== null ? (selectedFileData[metricId].data.ifc_p * 10).toFixed(1) : 'N/A' }}
                        </div>
                        <div class="text-xs text-indigo-600 mt-1">/ 10</div>
                      </div>
                    </div>

                    <!-- Connection Metrics -->
                    <div class="grid grid-cols-3 gap-4">
                      <div class="bg-gradient-to-br from-blue-50 to-blue-100 rounded-lg p-4 border border-blue-200">
                        <div class="text-xs font-semibold text-blue-600 mb-1">MODULES</div>
                        <div class="text-2xl font-bold text-blue-700">
                          {{ selectedFileData[metricId].data.n_modules || 0 }}
                        </div>
                      </div>
                      
                      <div class="bg-gradient-to-br from-teal-50 to-teal-100 rounded-lg p-4 border border-teal-200">
                        <div class="text-xs font-semibold text-teal-600 mb-1">POSSIBLE PAIRS</div>
                        <div class="text-2xl font-bold text-teal-700">
                          {{ selectedFileData[metricId].data.n_possible_pairs || 0 }}
                        </div>
                      </div>

                      <div class="bg-gradient-to-br from-green-50 to-green-100 rounded-lg p-4 border border-green-200">
                        <div class="text-xs font-semibold text-green-600 mb-1">CONNECTED PAIRS</div>
                        <div class="text-2xl font-bold text-green-700">
                          {{ selectedFileData[metricId].data.n_connected_pairs || 0 }}
                        </div>
                      </div>
                    </div>
                  </div>

                  <div *ngIf="metricId === 'lpcml'" class="space-y-4">
                    <div class="grid grid-cols-2 gap-4">
                      <div class="bg-gradient-to-br from-purple-50 to-purple-100 rounded-lg p-4 border border-purple-200">
                        <div class="text-xs font-semibold text-purple-600 mb-1">COHESION LEVEL</div>
                        <div class="text-2xl font-bold capitalize"
                             [ngClass]="{
                               'text-emerald-700': selectedFileData[metricId].data.cohesion_level === 'excellent',
                               'text-green-700': selectedFileData[metricId].data.cohesion_level === 'acceptable',
                               'text-yellow-600': selectedFileData[metricId].data.cohesion_level === 'moderate',
                               'text-red-700': selectedFileData[metricId].data.cohesion_level === 'poor'
                             }">
                          {{ selectedFileData[metricId].data.cohesion_level?.replace('_', ' ') || 'N/A' }}
                        </div>
                      </div>

                      <div class="bg-gradient-to-br from-indigo-50 to-indigo-100 rounded-lg p-4 border border-indigo-200">
                        <div class="text-xs font-semibold text-indigo-600 mb-1">LPCML SCORE</div>
                        <div class="text-2xl font-bold text-indigo-700">
                          {{ selectedFileData[metricId].data.lpcml !== null ? selectedFileData[metricId].data.lpcml : 'N/A' }}
                        </div>
                        <div class="text-xs text-indigo-600 mt-1">Components</div>
                      </div>
                    </div>

                    <div class="grid grid-cols-3 gap-4">
                      <div class="bg-gradient-to-br from-blue-50 to-blue-100 rounded-lg p-4 border border-blue-200">
                        <div class="text-xs font-semibold text-blue-600 mb-1">ELEMENTS</div>
                        <div class="text-2xl font-bold text-blue-700">
                          {{ selectedFileData[metricId].data.n_elements || 0 }}
                        </div>
                      </div>
                      
                      <div class="bg-gradient-to-br from-teal-50 to-teal-100 rounded-lg p-4 border border-teal-200">
                        <div class="text-xs font-semibold text-teal-600 mb-1">COMPONENTS</div>
                        <div class="text-2xl font-bold text-teal-700">
                          {{ selectedFileData[metricId].data.n_components || 0 }}
                        </div>
                      </div>

                      <div class="bg-gradient-to-br from-green-50 to-green-100 rounded-lg p-4 border border-green-200">
                        <div class="text-xs font-semibold text-green-600 mb-1">COHESION RATIO</div>
                        <div class="text-2xl font-bold text-green-700">
                          {{ (selectedFileData[metricId].data.cohesion_ratio * 100).toFixed(0) }}%
                        </div>
                      </div>
                    </div>
                  </div>

                  <div *ngIf="metricId === 'pmcr'" class="space-y-4">
                    <div class="grid grid-cols-2 gap-4">
                      <div class="bg-gradient-to-br from-blue-50 to-blue-100 rounded-lg p-4 border border-blue-200">
                        <div class="text-xs font-semibold text-blue-600 mb-1">COHESION LEVEL</div>
                        <div class="text-2xl font-bold capitalize"
                             [ngClass]="{
                               'text-emerald-700': selectedFileData[metricId].data.cohesion_level === 'excellent',
                               'text-green-700': selectedFileData[metricId].data.cohesion_level === 'good',
                               'text-yellow-600': selectedFileData[metricId].data.cohesion_level === 'moderate',
                               'text-orange-600': selectedFileData[metricId].data.cohesion_level === 'low',
                               'text-red-700': selectedFileData[metricId].data.cohesion_level === 'very_low'
                             }">
                          {{ selectedFileData[metricId].data.cohesion_level?.replace('_', ' ') || 'N/A' }}
                        </div>
                      </div>

                      <div class="bg-gradient-to-br from-indigo-50 to-indigo-100 rounded-lg p-4 border border-indigo-200">
                        <div class="text-xs font-semibold text-indigo-600 mb-1">PMCR SCORE</div>
                        <div class="text-2xl font-bold text-indigo-700">
                          {{ selectedFileData[metricId].data.pmcr !== null ? (selectedFileData[metricId].data.pmcr * 10).toFixed(1) : 'N/A' }}
                        </div>
                        <div class="text-xs text-indigo-600 mt-1">/ 10</div>
                      </div>
                    </div>

                    <div class="grid grid-cols-3 gap-4">
                      <div class="bg-gradient-to-br from-blue-50 to-blue-100 rounded-lg p-4 border border-blue-200">
                        <div class="text-xs font-semibold text-blue-600 mb-1">MODULES</div>
                        <div class="text-2xl font-bold text-blue-700">
                          {{ selectedFileData[metricId].data.n_modules || 0 }}
                        </div>
                      </div>
                      
                      <div class="bg-gradient-to-br from-teal-50 to-teal-100 rounded-lg p-4 border border-teal-200">
                        <div class="text-xs font-semibold text-teal-600 mb-1">POSSIBLE PAIRS</div>
                        <div class="text-2xl font-bold text-teal-700">
                          {{ selectedFileData[metricId].data.n_possible_pairs || 0 }}
                        </div>
                      </div>

                      <div class="bg-gradient-to-br from-green-50 to-green-100 rounded-lg p-4 border border-green-200">
                        <div class="text-xs font-semibold text-green-600 mb-1">CONNECTED PAIRS</div>
                        <div class="text-2xl font-bold text-green-700">
                          {{ selectedFileData[metricId].data.n_connected_pairs || 0 }}
                        </div>
                      </div>
                    </div>
                  </div>

                  <div *ngIf="metricId === 'pdsc'" class="space-y-4">
                    <div class="grid grid-cols-2 gap-4">
                      <div class="bg-gradient-to-br from-orange-50 to-orange-100 rounded-lg p-4 border border-orange-200">
                        <div class="text-xs font-semibold text-orange-600 mb-1">COHESION LEVEL</div>
                        <div class="text-2xl font-bold capitalize"
                             [ngClass]="{
                               'text-emerald-700': selectedFileData[metricId].data.pdsc >= 0.8,
                               'text-green-700': selectedFileData[metricId].data.pdsc >= 0.6 && selectedFileData[metricId].data.pdsc < 0.8,
                               'text-yellow-600': selectedFileData[metricId].data.pdsc >= 0.4 && selectedFileData[metricId].data.pdsc < 0.6,
                               'text-orange-600': selectedFileData[metricId].data.pdsc >= 0.2 && selectedFileData[metricId].data.pdsc < 0.4,
                               'text-red-700': selectedFileData[metricId].data.pdsc < 0.2
                             }">
                          {{ selectedFileData[metricId].data.pdsc >= 0.8 ? 'Excellent' : 
                             selectedFileData[metricId].data.pdsc >= 0.6 ? 'Good' :
                             selectedFileData[metricId].data.pdsc >= 0.4 ? 'Moderate' :
                             selectedFileData[metricId].data.pdsc >= 0.2 ? 'Low' : 'Very Low' }}
                        </div>
                      </div>

                      <div class="bg-gradient-to-br from-indigo-50 to-indigo-100 rounded-lg p-4 border border-indigo-200">
                        <div class="text-xs font-semibold text-indigo-600 mb-1">PDSC SCORE</div>
                        <div class="text-2xl font-bold text-indigo-700">
                          {{ selectedFileData[metricId].data.pdsc !== null ? (selectedFileData[metricId].data.pdsc * 10).toFixed(1) : 'N/A' }}
                        </div>
                        <div class="text-xs text-indigo-600 mt-1">/ 10</div>
                      </div>
                    </div>

                    <div class="grid grid-cols-3 gap-4">
                      <div class="bg-gradient-to-br from-blue-50 to-blue-100 rounded-lg p-4 border border-blue-200">
                        <div class="text-xs font-semibold text-blue-600 mb-1">MODULES</div>
                        <div class="text-2xl font-bold text-blue-700">
                          {{ selectedFileData[metricId].data.n_modules || 0 }}
                        </div>
                      </div>
                      
                      <div class="bg-gradient-to-br from-teal-50 to-teal-100 rounded-lg p-4 border border-teal-200">
                        <div class="text-xs font-semibold text-teal-600 mb-1">POSSIBLE PAIRS</div>
                        <div class="text-2xl font-bold text-teal-700">
                          {{ selectedFileData[metricId].data.n_possible_pairs || 0 }}
                        </div>
                      </div>

                      <div class="bg-gradient-to-br from-green-50 to-green-100 rounded-lg p-4 border border-green-200">
                        <div class="text-xs font-semibold text-green-600 mb-1">SHARED PAIRS</div>
                        <div class="text-2xl font-bold text-green-700">
                          {{ selectedFileData[metricId].data.n_shared_pairs || 0 }}
                        </div>
                      </div>
                    </div>
                  </div>

                  <div *ngIf="metricId === 'pfp'" class="space-y-4">
                    <div class="grid grid-cols-2 gap-4">
                      <div class="bg-gradient-to-br from-teal-50 to-teal-100 rounded-lg p-4 border border-teal-200">
                        <div class="text-xs font-semibold text-teal-600 mb-1">COHESION LEVEL</div>
                        <div class="text-2xl font-bold capitalize"
                             [ngClass]="{
                               'text-emerald-700': selectedFileData[metricId].data.metrics.purity_level === 'High',
                               'text-yellow-600': selectedFileData[metricId].data.metrics.purity_level === 'Moderate',
                               'text-red-700': selectedFileData[metricId].data.metrics.purity_level === 'Low' || selectedFileData[metricId].data.metrics.purity_level === 'Very Low'
                             }">
                          {{ selectedFileData[metricId].data.metrics.purity_level || 'N/A' }}
                        </div>
                      </div>

                      <div class="bg-gradient-to-br from-indigo-50 to-indigo-100 rounded-lg p-4 border border-indigo-200">
                        <div class="text-xs font-semibold text-indigo-600 mb-1">PFP SCORE</div>
                        <div class="text-2xl font-bold text-indigo-700">
                          {{ selectedFileData[metricId].data.metrics.pfp_score !== null ? (selectedFileData[metricId].data.metrics.pfp_score * 10).toFixed(1) : 'N/A' }}
                        </div>
                        <div class="text-xs text-indigo-600 mt-1">/ 10</div>
                      </div>
                    </div>

                    <div class="grid grid-cols-3 gap-4">
                      <div class="bg-gradient-to-br from-blue-50 to-blue-100 rounded-lg p-4 border border-blue-200">
                        <div class="text-xs font-semibold text-blue-600 mb-1">TOTAL MODULES</div>
                        <div class="text-2xl font-bold text-blue-700">
                          {{ selectedFileData[metricId].data.metrics.total_modules || 0 }}
                        </div>
                      </div>
                      
                      <div class="bg-gradient-to-br from-purple-50 to-purple-100 rounded-lg p-4 border border-purple-200">
                        <div class="text-xs font-semibold text-purple-600 mb-1">ML MODULES</div>
                        <div class="text-2xl font-bold text-purple-700">
                          {{ selectedFileData[metricId].data.metrics.ml_modules || 0 }}
                        </div>
                      </div>

                      <div class="bg-gradient-to-br from-red-50 to-red-100 rounded-lg p-4 border border-red-200">
                        <div class="text-xs font-semibold text-red-600 mb-1">REFACTORING</div>
                        <div class="text-lg font-bold text-red-700">
                          {{ selectedFileData[metricId].data.quality_indicators.needs_refactoring ? 'Required' : 'Not Required' }}
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
  pathsWithMetrics: Set<string> = new Set();
  expandedMetricDetails: Set<string> = new Set();
  collapsedMetrics: Set<string> = new Set(); // Track collapsed metrics

  // Make Object available in template
  Object = Object;

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
    this.pathsWithMetrics.clear();

    // Initialize all metrics as collapsed by default
    this.collapsedMetrics.clear();
    this.allMetrics.forEach(metric => {
      this.collapsedMetrics.add(metric.analyzer_id);
    });

    this.allMetrics.forEach(metric => {
      const metricId = metric.analyzer_id;
      const metricName = metric.documentation.name;
      const category = metric.documentation.category;

      console.log(`Processing metric: ${metricId}`, metric);

      if (metricId === 'ccpm') {
        this.processCCPMMetric(metric as CCPMResult, metricName, category);
      } else if (metricId === 'scpm') {
        this.processSCPMMetric(metric as SCPMResult, metricName, category);
      } else if (metricId === 'fcpm') {
        this.processFCPMMetric(metric as FCPMResult, metricName, category);
      } else if (metricId === 'fcpp') {
        console.log('Processing FCPP - packages:', (metric as FCPPResult).details?.packages);
        this.processFCPPMetric(metric as FCPPResult, metricName, category);
      } else if (metricId === 'scpp') {
        console.log('Processing SCPP - packages:', (metric as SCPPResult).details?.packages);
        this.processSCPPMetric(metric as SCPPResult, metricName, category);
      } else if (metricId === 'ccpp') {
        console.log('Processing CCPP - packages:', (metric as CCPPResult).details?.packages);
        this.processCCPPMetric(metric as CCPPResult, metricName, category);
      }
    });

    // Populate pathsWithMetrics from fileMetricsMap (ALL variations are already in the map thanks to registerMetric)
    this.fileMetricsMap.forEach((_, path) => {
      this.pathsWithMetrics.add(path);
    });
  }

  processCCPMMetric(metric: CCPMResult, metricName: string, category: string): void {
    Object.entries(metric.details?.files || {}).forEach(([filePath, fileData]) => {
      // Normalize path - add leading slash if not present
      const normalizedPath = filePath.startsWith('/') ? filePath : '/' + filePath;

      if (!this.fileMetricsMap.has(normalizedPath)) {
        this.fileMetricsMap.set(normalizedPath, {});
      }

      const fileMetrics = this.fileMetricsMap.get(normalizedPath)!;
      const messages: string[] = [];
      const detailedMessages: DetailedMessage[] = [];
      let severity: 'error' | 'warning' | 'info' | 'success' = 'info';

      // Get messages from metric.messages.by_file (standardized format)
      // Try with and without leading slash
      const fileMessages = (metric.messages as any)?.by_file?.[filePath] ||
        (metric.messages as any)?.by_file?.[normalizedPath] || [];

      fileMessages.forEach((msg: any) => {
        // Store detailed message with diagnosis and recommendation separated
        detailedMessages.push({
          diagnosis: msg.diagnosis || '',
          recommendation: msg.recommendation || '',
          severity: msg.severity || 'info',
          rule_id: msg.rule_id
        });

        // Also create simple message for backward compatibility
        const diagnosisText = msg.diagnosis || '';
        const recommendationText = msg.recommendation || '';
        messages.push(`${diagnosisText} ${recommendationText}`.trim());

        // Determine overall severity (highest wins)
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
        if (fileData.cohesion_level === 'very_high') {
          severity = 'success';
          messages.push('Very high cohesion - Perfect SRP (Single Responsibility Principle)');
        } else if (fileData.cohesion_level === 'high') {
          severity = 'success';
          messages.push('High cohesion - Well-organized code');
        } else if (fileData.cohesion_level === 'medium') {
          severity = 'warning';
          messages.push('Medium cohesion - Consider splitting into separate stages');
        } else if (fileData.cohesion_level === 'low') {
          severity = 'error';
          messages.push('Low cohesion - Multiple phases, needs refactoring');
        } else if (fileData.cohesion_level === 'very_low') {
          severity = 'error';
          messages.push('Very low cohesion - Multiple phases with non-ML code, critical refactoring needed');
        } else if (fileData.cohesion_level === 'non_ml_file') {
          severity = 'info';
          messages.push('Non-ML file detected');
        }
      }

      fileMetrics['ccpm'] = {
        metricName,
        category,
        data: fileData,
        severity,
        messages,
        detailedMessages
      };
    });
  }











  processSCPMMetric(metric: SCPMResult, metricName: string, category: string): void {
    Object.entries(metric.details?.files || {}).forEach(([filePath, fileData]) => {
      const normalizedPath = filePath.startsWith('/') ? filePath : '/' + filePath;
      if (!this.fileMetricsMap.has(normalizedPath)) {
        this.fileMetricsMap.set(normalizedPath, {});
      }

      const fileMetrics = this.fileMetricsMap.get(normalizedPath)!;
      const messages: string[] = [];
      const detailedMessages: DetailedMessage[] = [];
      let severity: 'error' | 'warning' | 'info' | 'success' = 'info';

      // Get messages from metric.messages.by_file (standardized format)
      const fileMessages = (metric.messages as any)?.by_file?.[filePath] ||
        (metric.messages as any)?.by_file?.[normalizedPath] || [];

      fileMessages.forEach((msg: any) => {
        // Store detailed message with diagnosis and recommendation separated
        detailedMessages.push({
          diagnosis: msg.diagnosis || '',
          recommendation: msg.recommendation || '',
          severity: msg.severity || 'info',
          rule_id: msg.rule_id
        });

        // Also create simple message for backward compatibility
        const diagnosisText = msg.diagnosis || '';
        const recommendationText = msg.recommendation || '';
        messages.push(`${diagnosisText} ${recommendationText}`.trim());

        // Determine overall severity (highest wins)
        if (msg.severity === 'high' || msg.severity === 'error' || msg.severity === 'critical') {
          severity = 'error';
        } else if (msg.severity === 'medium' && severity !== 'error') {
          severity = 'warning';
        } else if (msg.severity === 'low' && severity === 'info') {
          severity = 'info';
        }
      });

      // Fallback to cohesion_level if no messages
      if (messages.length === 0) {
        if (fileData.cohesion_level === 'very_high') {
          severity = 'success';
          messages.push('Very high structural cohesion - Excellent variable sharing');
        } else if (fileData.cohesion_level === 'high') {
          severity = 'success';
          messages.push('High structural cohesion - Strong data connections');
        } else if (fileData.cohesion_level === 'medium') {
          severity = 'info';
          messages.push('Medium structural cohesion - Acceptable variable sharing');
        } else if (fileData.cohesion_level === 'low') {
          severity = 'warning';
          messages.push('Low structural cohesion - Few shared variables/files');
        } else if (fileData.cohesion_level === 'very_low') {
          severity = 'error';
          messages.push('Very low structural cohesion - Critical refactoring needed');
        } else if (fileData.cohesion_level === 'not_applicable') {
          severity = 'info';
          messages.push('SCPM not applicable (single method file)');
        }
      }

      fileMetrics['scpm'] = {
        metricName,
        category,
        data: fileData,
        score: fileData.scpm !== null ? fileData.scpm * 10 : undefined,
        severity,
        messages,
        detailedMessages
      };
    });
  }

  processFCPMMetric(metric: FCPMResult, metricName: string, category: string): void {
    Object.entries(metric.details?.files || {}).forEach(([filePath, fileData]) => {
      const normalizedPath = filePath.startsWith('/') ? filePath : '/' + filePath;
      if (!this.fileMetricsMap.has(normalizedPath)) {
        this.fileMetricsMap.set(normalizedPath, {});
      }

      const fileMetrics = this.fileMetricsMap.get(normalizedPath)!;
      const messages: string[] = [];
      const detailedMessages: DetailedMessage[] = [];
      let severity: 'error' | 'warning' | 'info' | 'success' = 'info';

      // Get messages from metric.messages.by_file (standardized format)
      const fileMessages = (metric.messages as any)?.by_file?.[filePath] ||
        (metric.messages as any)?.by_file?.[normalizedPath] || [];

      fileMessages.forEach((msg: any) => {
        // Store detailed message with diagnosis and recommendation separated
        detailedMessages.push({
          diagnosis: msg.diagnosis || '',
          recommendation: msg.recommendation || '',
          severity: msg.severity || 'info',
          rule_id: msg.rule_id
        });

        // Also create simple message for backward compatibility
        const diagnosisText = msg.diagnosis || '';
        const recommendationText = msg.recommendation || '';
        messages.push(`${diagnosisText} ${recommendationText}`.trim());

        // Determine overall severity (highest wins)
        if (msg.severity === 'high' || msg.severity === 'error' || msg.severity === 'critical') {
          severity = 'error';
        } else if (msg.severity === 'medium' && severity !== 'error') {
          severity = 'warning';
        } else if (msg.severity === 'low' && severity === 'info') {
          severity = 'info';
        }
      });

      // Fallback to cohesion_level if no messages
      if (messages.length === 0) {
        if (fileData.cohesion_level === 'very_high') {
          severity = 'success';
          messages.push('Very high functional cohesion - Excellent method call structure');
        } else if (fileData.cohesion_level === 'high') {
          severity = 'success';
          messages.push('High functional cohesion - Strong information flow');
        } else if (fileData.cohesion_level === 'moderate') {
          severity = 'info';
          messages.push('Moderate functional cohesion - Acceptable method interactions');
        } else if (fileData.cohesion_level === 'low') {
          severity = 'warning';
          messages.push('Low functional cohesion - Weak method connections');
        } else if (fileData.cohesion_level === 'very_low') {
          severity = 'error';
          messages.push('Very low functional cohesion - Critical refactoring needed');
        } else if (fileData.cohesion_level === 'not_applicable') {
          severity = 'info';
          messages.push('FCPM not applicable (single method file)');
        }
      }

      fileMetrics['fcpm'] = {
        metricName,
        category,
        data: fileData,
        score: fileData.fcpm !== null ? fileData.fcpm * 10 : undefined,
        severity,
        messages,
        detailedMessages
      };
    });
  }

  // ===========================
  // PACKAGE-LEVEL METRICS
  // ===========================

  processFCPPMetric(metric: FCPPResult, metricName: string, category: string): void {
    Object.entries(metric.details?.packages || {}).forEach(([packagePath, packageData]) => {
      const messages: string[] = [];
      const detailedMessages: DetailedMessage[] = [];
      let severity: 'error' | 'warning' | 'info' | 'success' = 'info';

      // Get messages from metric.messages.by_package
      const packageMessages = (metric.messages as any)?.by_package?.[packagePath] || [];

      packageMessages.forEach((msg: any) => {
        detailedMessages.push({
          diagnosis: msg.diagnosis || '',
          recommendation: msg.recommendation || '',
          severity: msg.severity || 'info'
        });

        messages.push(`${msg.diagnosis || ''} ${msg.recommendation || ''}`.trim());

        if (msg.severity === 'critical') {
          severity = 'error';
        } else if (msg.severity === 'warning' && severity !== 'error') {
          severity = 'warning';
        }
      });

      // Fallback to score-based assessment if no messages
      if (messages.length === 0) {
        if (packageData.cohesion_level === 'not_applicable' || packageData.fcpp === null || packageData.fcpp === undefined) {
          severity = 'info';
          messages.push('FCPP is not applicable for this package');
        } else if (packageData.fcpp >= 0.8) {
          severity = 'success';
          messages.push('Excellent functional cohesion at package level');
        } else if (packageData.fcpp >= 0.6) {
          severity = 'info';
          messages.push('Good functional cohesion - Package components are well connected');
        } else if (packageData.fcpp >= 0.4) {
          severity = 'warning';
          messages.push('Moderate cohesion - Consider improving connections between nodes');
        } else {
          severity = 'error';
          messages.push('Low cohesion - Package needs refactoring');
        }
      }

      // Use registerMetric to handle all path variations
      this.registerMetric(packagePath, 'fcpp', {
        metricName,
        category,
        data: packageData,
        score: packageData.fcpp !== undefined && packageData.fcpp !== null ? packageData.fcpp * 10 : undefined,
        severity,
        messages,
        detailedMessages
      });
    });
  }

  processSCPPMetric(metric: SCPPResult, metricName: string, category: string): void {
    Object.entries(metric.details?.packages || {}).forEach(([packagePath, packageData]) => {
      console.log('Processing SCPP package:', packagePath, packageData);
      const messages: string[] = [];
      const detailedMessages: DetailedMessage[] = [];
      let severity: 'error' | 'warning' | 'info' | 'success' = 'info';

      // Get messages from metric.messages.by_package
      const packageMessages = (metric.messages as any)?.by_package?.[packagePath] || [];

      packageMessages.forEach((msg: any) => {
        detailedMessages.push({
          diagnosis: msg.diagnosis || '',
          recommendation: msg.recommendation || '',
          severity: msg.severity || 'info'
        });

        messages.push(`${msg.diagnosis || ''} ${msg.recommendation || ''}`.trim());

        if (msg.severity === 'critical') {
          severity = 'error';
        } else if (msg.severity === 'warning' && severity !== 'error') {
          severity = 'warning';
        }
      });

      // Fallback to score-based assessment if no messages
      if (messages.length === 0) {
        if (packageData.cohesion_level === 'not_applicable' || packageData.scpp === null || packageData.scpp === undefined) {
          severity = 'info';
          messages.push('SCPP is not applicable for this package');
        } else if (packageData.scpp >= 0.8) {
          severity = 'success';
          messages.push('Excellent structural coupling - Minimal shared resources');
        } else if (packageData.scpp >= 0.6) {
          severity = 'info';
          messages.push('Good structural coupling - Acceptable resource sharing');
        } else if (packageData.scpp >= 0.4) {
          severity = 'warning';
          messages.push('Moderate coupling - Consider reducing shared dependencies');
        } else {
          severity = 'error';
          messages.push('High coupling - Package has excessive shared resources');
        }
      }

      // Use registerMetric to handle all path variations
      this.registerMetric(packagePath, 'scpp', {
        metricName,
        category,
        data: packageData,
        score: packageData.scpp !== undefined && packageData.scpp !== null ? packageData.scpp * 10 : undefined,
        severity,
        messages,
        detailedMessages
      });
    });
  }

  processCCPPMetric(metric: CCPPResult, metricName: string, category: string): void {
    console.log('processCCPPMetric called - packages count:', Object.keys(metric.details?.packages || {}).length);
    Object.entries(metric.details?.packages || {}).forEach(([packagePath, packageData]) => {
      console.log('Processing CCPP package:', packagePath, packageData);
      const messages: string[] = [];
      const detailedMessages: DetailedMessage[] = [];
      let severity: 'error' | 'warning' | 'info' | 'success' = 'info';

      // Get messages from metric.messages.by_package
      const packageMessages = (metric.messages as any)?.by_package?.[packagePath] || [];

      packageMessages.forEach((msg: any) => {
        detailedMessages.push({
          diagnosis: msg.diagnosis || '',
          recommendation: msg.recommendation || '',
          severity: msg.severity || 'info'
        });

        messages.push(`${msg.diagnosis || ''} ${msg.recommendation || ''}`.trim());

        if (msg.severity === 'critical') {
          severity = 'error';
        } else if (msg.severity === 'warning' && severity !== 'error') {
          severity = 'warning';
        }
      });

      // Fallback to cohesion level if no messages
      if (messages.length === 0 && packageData.metrics?.cohesion_level) {
        const cohesionLevel = packageData.metrics.cohesion_level;
        if (cohesionLevel === 'very_high' || cohesionLevel === 'high') {
          severity = 'success';
          messages.push('High conceptual cohesion - Well-focused ML package');
        } else if (cohesionLevel === 'medium') {
          severity = 'info';
          messages.push('Moderate conceptual cohesion - Acceptable ML stage focus');
        } else if (cohesionLevel === 'low') {
          severity = 'warning';
          messages.push('Low conceptual cohesion - Multiple ML stages mixed');
        } else if (cohesionLevel === 'very_low') {
          severity = 'error';
          messages.push('Very low conceptual cohesion - Package needs reorganization');
        }
      }

      // Use registerMetric to handle all path variations
      this.registerMetric(packagePath, 'ccpp', {
        metricName,
        category,
        data: packageData,
        score: packageData.metrics?.ccpp_score !== undefined ? packageData.metrics.ccpp_score * 10 : "Not Applicable",
        severity,
        messages,
        detailedMessages
      });
    });
  }

  private registerMetric(path: string, metricId: string, metricData: any): void {
    const paths = new Set<string>();
    paths.add(path);

    // Add variations with/without leading slash
    if (!path.startsWith('/')) paths.add('/' + path);
    if (path.startsWith('/')) paths.add(path.substring(1));

    // Handle root path variations
    if (path === '.' || path === '' || path === '/') {
      paths.add('.');
      paths.add('');
      paths.add('/');
      if (this.projectStructure?.path) {
        paths.add(this.projectStructure.path);
      }
    } else if (this.projectStructure?.path) {
      // If we have project root, try to construct absolute path
      const root = this.projectStructure.path.endsWith('/')
        ? this.projectStructure.path.slice(0, -1)
        : this.projectStructure.path;

      // If path is relative (doesn't start with root), add absolute version
      if (!path.startsWith(root)) {
        const cleanPath = path.startsWith('/') ? path.slice(1) : path;
        paths.add(`${root}/${cleanPath}`);
      }
    }

    paths.forEach(p => {
      if (!this.fileMetricsMap.has(p)) {
        this.fileMetricsMap.set(p, {});
      }
      const metrics = this.fileMetricsMap.get(p)!;
      metrics[metricId] = metricData;
    });
  }




  onNodeSelected(event: { path: string, type: 'file' | 'directory', node: any }): void {
    this.selectNode(event.path, event.type, event.node);
  }

  selectNode(path: string, type: 'file' | 'directory', node: any): void {
    this.selectedPath = path;
    this.selectedNodeType = type;

    if (type === 'file') {
      // Try exact match, then with leading slash, then without
      let metrics = this.fileMetricsMap.get(path);
      if (!metrics && !path.startsWith('/')) metrics = this.fileMetricsMap.get('/' + path);
      if (!metrics && path.startsWith('/')) metrics = this.fileMetricsMap.get(path.substring(1));

      this.selectedFileData = metrics || {};
    } else {
      // For directories, first check if we have direct metrics (from folder analyzers)
      let directMetrics = this.fileMetricsMap.get(path);
      if (!directMetrics && !path.startsWith('/')) directMetrics = this.fileMetricsMap.get('/' + path);
      if (!directMetrics && path.startsWith('/')) directMetrics = this.fileMetricsMap.get(path.substring(1));

      // Special case for root: if path matches project root, check for '.' or '' in metrics
      if (!directMetrics && this.projectStructure && path === this.projectStructure.path) {
        directMetrics = this.fileMetricsMap.get('.') || this.fileMetricsMap.get('');
      }

      // Try stripping project root path if present
      if (!directMetrics && this.projectStructure) {
        const rootPath = this.projectStructure.path;
        if (path.startsWith(rootPath + '/')) {
          const relativePath = path.substring(rootPath.length + 1);
          directMetrics = this.fileMetricsMap.get(relativePath);
          if (!directMetrics) directMetrics = this.fileMetricsMap.get('/' + relativePath);
        }
      }

      if (directMetrics && Object.keys(directMetrics).length > 0) {
        this.selectedFileData = directMetrics;
      } else {
        // Fallback to aggregation if no direct metrics
        this.selectedFileData = this.aggregateDirectoryMetrics(node);
      }
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

  isMetricDetailsExpanded(metricId: string): boolean {
    return this.expandedMetricDetails.has(metricId);
  }

  toggleMetricDetails(metricId: string): void {
    if (this.expandedMetricDetails.has(metricId)) {
      this.expandedMetricDetails.delete(metricId);
    } else {
      this.expandedMetricDetails.add(metricId);
    }
  }

  isMetricCollapsed(metricId: string): boolean {
    return this.collapsedMetrics.has(metricId);
  }

  toggleMetricCollapse(metricId: string): void {
    if (this.collapsedMetrics.has(metricId)) {
      this.collapsedMetrics.delete(metricId);
    } else {
      this.collapsedMetrics.add(metricId);
    }
  }

  getCohesionLevel(metricId: string): string | null {
    const data = this.selectedFileData[metricId]?.data;
    if (!data) return null;

    // Check for cohesion_level property in the data
    if (data.cohesion_level) {
      return data.cohesion_level;
    }

    // Check for cohesion_level in metrics (for CCPP)
    if (data.metrics?.cohesion_level) {
      return data.metrics.cohesion_level;
    }

    // Check for purity_level in metrics (for PFP)
    if (data.metrics?.purity_level) {
      const level = data.metrics.purity_level.toLowerCase();
      if (level === 'high') return 'high';
      if (level === 'moderate') return 'moderate';
      if (level === 'low') return 'low';
      if (level === 'very low') return 'very_low';
      return level;
    }

    return null;
  }

  onExportResults(): void {
    this.exportResults.emit();
  }

  getCallGraphEntries(callGraph: { [method: string]: string[] }): Array<[string, string[]]> {
    return Object.entries(callGraph) as Array<[string, string[]]>;
  }

  getMetricDescription(metricId: string): string {
    const metric = this.allMetrics.find(m => m.analyzer_id === metricId);
    return metric?.documentation?.summary || '';
  }

  getMetricDocumentation(metricId: string): MetricDocumentation | null {
    const metric = this.allMetrics.find(m => m.analyzer_id === metricId);
    return metric?.documentation || null;
  }

  getMetricIdealRange(metricId: string): any {
    const metric = this.allMetrics.find(m => m.analyzer_id === metricId);
    return metric?.documentation?.ideal_range || null;
  }

  getMetricInterpretation(metricId: string): MetricDocumentation['interpretation'] {
    const metric = this.allMetrics.find(m => m.analyzer_id === metricId);
    return metric?.documentation?.interpretation || [];
  }

  getMetricInterpretationItems(metricId: string): Array<{
    range: string;
    description: string;
    severity: string;
    label?: string;
    rangeToneClass: string;
  }> {
    return this.getMetricInterpretation(metricId).map((item) => ({
      range: item.range,
      description: item.description,
      severity: item.severity || 'info',
      label: item.label,
      rangeToneClass: this.getRangeToneClass(item.severity || 'info'),
    }));
  }

  getMetricReferences(metricId: string): MetricReference[] {
    const metric = this.allMetrics.find(m => m.analyzer_id === metricId);
    return metric?.documentation?.references || [];
  }

  getFormulaExpression(section: MetricDocSection): string {
    return section?.content?.expression || '';
  }

  getSectionParagraphs(section: MetricDocSection): string[] {
    const paragraphs = section?.content?.paragraphs;
    if (!Array.isArray(paragraphs)) return [];
    return paragraphs.filter((paragraph: unknown): paragraph is string => typeof paragraph === 'string');
  }

  getSectionItems(section: MetricDocSection): string[] {
    const items = section?.content?.items;
    if (!Array.isArray(items)) return [];
    return items.filter((item: unknown): item is string => typeof item === 'string');
  }

  getSectionTable(section: MetricDocSection): { columns: string[]; rows: string[][] } | null {
    const table = section?.content;
    if (!table || !Array.isArray(table.columns) || !Array.isArray(table.rows)) return null;

    const columns = table.columns.filter((column: unknown): column is string => typeof column === 'string');
    const rows = table.rows
      .filter((row: unknown): row is unknown[] => Array.isArray(row))
      .map((row: unknown[]) =>
        row.map((cell) => (typeof cell === 'string' ? cell : String(cell ?? '')))
      );

    if (columns.length === 0 || rows.length === 0) return null;
    return { columns, rows };
  }

  getNoteText(section: MetricDocSection): string {
    return section?.content?.text || '';
  }

  getNoteToneClass(section: MetricDocSection): string {
    const tone = section?.content?.tone;
    if (tone === 'warning') return 'bg-yellow-50 border-yellow-200 text-yellow-800';
    if (tone === 'success') return 'bg-green-50 border-green-200 text-green-800';
    return 'bg-blue-50 border-blue-200 text-blue-800';
  }

  getIdealRangeEntries(doc: MetricDocumentation): Array<{
    label: string;
    value: string;
    toneClass: string;
    labelToneClass: string;
    valueToneClass: string;
  }> {
    const idealRange = doc?.ideal_range || {};
    const entries: Array<{
      label: string;
      value: string;
      toneClass: string;
      labelToneClass: string;
      valueToneClass: string;
    }> = [];

    const addEntry = (
      label: string,
      value: unknown,
      toneClass: string,
      labelToneClass: string,
      valueToneClass: string,
    ): void => {
      if (value === undefined || value === null || value === '') return;
      entries.push({
        label,
        value: String(value),
        toneClass,
        labelToneClass,
        valueToneClass,
      });
    };

    addEntry(
      'Optimal',
      idealRange.optimal,
      'bg-green-50 border-green-200',
      'text-green-600',
      'text-green-700',
    );
    addEntry(
      'Acceptable',
      idealRange.acceptable,
      'bg-yellow-50 border-yellow-200',
      'text-yellow-600',
      'text-yellow-700',
    );
    addEntry(
      'Warning',
      idealRange.warning,
      'bg-red-50 border-red-200',
      'text-red-600',
      'text-red-700',
    );
    addEntry(
      'Min',
      idealRange.min,
      'bg-blue-50 border-blue-200',
      'text-blue-600',
      'text-blue-700',
    );
    addEntry(
      'Max',
      idealRange.max,
      'bg-indigo-50 border-indigo-200',
      'text-indigo-600',
      'text-indigo-700',
    );

    return entries;
  }

  getInterpretationToneClass(severity: string): string {
    if (severity === 'error') return 'bg-red-50 border-red-200 text-red-900';
    if (severity === 'warning') return 'bg-yellow-50 border-yellow-200 text-yellow-900';
    if (severity === 'success') return 'bg-green-50 border-green-200 text-green-900';
    return 'bg-blue-50 border-blue-200 text-blue-900';
  }

  private getRangeToneClass(severity: string): string {
    if (severity === 'error') return 'text-red-700';
    if (severity === 'warning') return 'text-yellow-700';
    if (severity === 'success') return 'text-green-700';
    return 'text-blue-700';
  }

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

        <!-- Orange dot for folders with metrics, blue for files -->
        <div *ngIf="hasMetrics" 
             class="w-2 h-2 rounded-full ml-2" 
             [class.bg-orange-500]="isDirectory"
             [class.bg-blue-500]="!isDirectory"
             title="Has metrics"></div>
      </div>

      <div *ngIf="isDirectory && isExpanded && node.children">
        <ng-container *ngFor="let child of node.children">
          <app-tree-node-clickable 
            [node]="child" 
            [level]="level + 1"
            [selectedPath]="selectedPath"
            [pathsWithMetrics]="pathsWithMetrics"
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
  @Input() pathsWithMetrics: Set<string> = new Set();
  @Output() nodeSelected = new EventEmitter<{ path: string, type: 'file' | 'directory', node: any }>();

  isExpanded = false;

  get isDirectory(): boolean {
    return this.node.type === 'directory';
  }

  get isPythonFile(): boolean {
    return this.node.name.endsWith('.py');
  }

  get hasMetrics(): boolean {
    return (
      this.pathsWithMetrics.has(this.node.path) ||
      this.pathsWithMetrics.has('/' + this.node.path) ||
      this.pathsWithMetrics.has(this.node.path.replace(/^\//, ''))
    );
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
