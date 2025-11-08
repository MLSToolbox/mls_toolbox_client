import { Component, Input, Output, EventEmitter } from '@angular/core';
import { AssessmentStep } from '../models/assessment.models';

@Component({
  selector: 'app-assessment-stepper',
  template: `
    <div class="w-full py-8 px-4 bg-white border-b border-gray-100">
      <div class="max-w-4xl mx-auto">
        <!-- Mobile View -->
        <div class="md:hidden">
          <div class="flex items-center justify-between mb-4">
            <span class="text-sm font-medium text-gray-600">Step {{ currentStep }} of {{ steps.length }}</span>
            <span class="text-sm font-semibold" style="color: rgb(0, 32, 96);">
              {{ getCurrentStepLabel() }}
            </span>
          </div>
          <!-- Progress Bar -->
          <div class="w-full h-2 bg-gray-200 rounded-full overflow-hidden">
            <div 
              class="h-full bg-blue-600 transition-all duration-500 rounded-full"
              [style.width.%]="(currentStep / steps.length) * 100">
            </div>
          </div>
        </div>

        <!-- Desktop View -->
        <div class="hidden md:block">
          <div class="flex items-center justify-between relative">
            <!-- Connection Line Background -->
            <div class="absolute top-8 left-0 right-0 h-0.5 bg-gray-200" style="z-index: 0;"></div>
            <!-- Progress Line -->
            <div 
              class="absolute top-8 left-0 h-0.5 bg-blue-600 transition-all duration-500"
              [style.width.%]="progressWidth"
              style="z-index: 1;">
            </div>

            <!-- Steps -->
            <div 
              *ngFor="let step of steps; let i = index"
              class="flex flex-col items-center flex-1 relative"
              style="z-index: 2;">
              <!-- Circle Button -->
              <button
                type="button"
                [disabled]="!canNavigateToStep(step.number)"
                (click)="onStepClick(step.number)"
                class="w-16 h-16 rounded-full flex items-center justify-center font-bold text-lg transition-all duration-300 mb-3 focus:outline-none focus:ring-2 focus:ring-offset-2"
                [ngClass]="{
                  'bg-blue-600 text-white shadow-lg scale-110 focus:ring-blue-500': step.number === currentStep,
                  'bg-green-500 text-white shadow-md hover:bg-green-600 cursor-pointer focus:ring-green-500': step.completed && canNavigateToStep(step.number),
                  'bg-gray-200 text-gray-500 cursor-not-allowed': step.number > currentStep && !step.completed,
                  'bg-green-500 text-white shadow-md cursor-not-allowed': step.completed && !canNavigateToStep(step.number)
                }">
                <!-- Number -->
                <span *ngIf="!step.completed && step.number !== currentStep">{{ step.number }}</span>
                
                <!-- Current Step Pulse -->
                <span *ngIf="step.number === currentStep && !isLoading" class="relative flex">
                  <span class="animate-ping absolute inline-flex h-full w-full rounded-full bg-blue-400 opacity-75"></span>
                  <span class="relative inline-flex">{{ step.number }}</span>
                </span>

                <!-- Loading Spinner -->
                <svg 
                  *ngIf="step.number === currentStep && isLoading"
                  class="w-6 h-6 animate-spin" 
                  fill="none" 
                  viewBox="0 0 24 24">
                  <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
                  <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                
                <!-- Checkmark -->
                <svg 
                  *ngIf="step.completed"
                  class="w-8 h-8" 
                  fill="none" 
                  stroke="currentColor" 
                  viewBox="0 0 24 24">
                  <path 
                    stroke-linecap="round" 
                    stroke-linejoin="round" 
                    stroke-width="3" 
                    d="M5 13l4 4L19 7">
                  </path>
                </svg>
              </button>
              
              <!-- Label -->
              <span 
                class="text-sm font-medium text-center transition-colors duration-300 px-2"
                [ngClass]="{
                  'text-blue-600 font-semibold': step.number === currentStep,
                  'text-green-600 font-medium': step.completed,
                  'text-gray-500': step.number > currentStep && !step.completed
                }">
                {{ step.label }}
              </span>

              <!-- Description (optional) -->
              <span 
                *ngIf="step.number === currentStep && stepDescription"
                class="text-xs text-gray-500 text-center mt-1 px-2">
                {{ stepDescription }}
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  `,
  standalone: false
})
export class AssessmentStepperComponent {
  @Input() steps: AssessmentStep[] = [
    { number: 1, label: 'Upload Code', completed: false },
    { number: 2, label: 'Choose Metrics', completed: false },
    { number: 3, label: 'Analysis', completed: false },
    { number: 4, label: 'Results', completed: false }
  ];
  @Input() currentStep = 1;
  @Input() isLoading = false;
  @Input() allowNavigation = true;
  @Input() stepDescription = '';
  @Output() stepChange = new EventEmitter<number>();

  get progressWidth(): number {
    if (this.currentStep === 1) return 0;
    return ((this.currentStep - 1) / (this.steps.length - 1)) * 100;
  }

  getCurrentStepLabel(): string {
    const step = this.steps.find(s => s.number === this.currentStep);
    return step?.label || '';
  }

  canNavigateToStep(stepNumber: number): boolean {
    if (!this.allowNavigation || this.isLoading) return false;
    
    // Can't navigate to future steps
    if (stepNumber > this.currentStep) return false;
    
    // Can navigate back to previous completed steps
    const step = this.steps.find(s => s.number === stepNumber);
    return step?.completed || stepNumber <= this.currentStep;
  }

  onStepClick(stepNumber: number): void {
    if (this.canNavigateToStep(stepNumber) && stepNumber !== this.currentStep) {
      this.stepChange.emit(stepNumber);
    }
  }
}
