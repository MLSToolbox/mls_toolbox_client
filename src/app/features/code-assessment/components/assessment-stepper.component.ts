import { Component, Input } from '@angular/core';
import { AssessmentStep } from '../models/assessment.models';

@Component({
  selector: 'app-assessment-stepper',
  template: `
    <div class="w-full py-8 px-4 bg-white">
      <div class="max-w-4xl mx-auto">
        <div class="flex items-center justify-between relative">
          <!-- Línea de conexión -->
          <div class="absolute top-8 left-0 right-0 h-0.5 bg-gray-200 -z-10"></div>
          <div 
            class="absolute top-8 left-0 h-0.5 bg-blue-600 -z-10 transition-all duration-500"
            [style.width.%]="progressWidth">
          </div>

          <!-- Steps -->
          <div 
            *ngFor="let step of steps"
            class="flex flex-col items-center flex-1">
            <!-- Circle -->
            <div 
              class="w-16 h-16 rounded-full flex items-center justify-center font-bold text-lg transition-all duration-300 mb-3"
              [ngClass]="{
                'bg-blue-600 text-white shadow-lg': step.number === currentStep,
                'bg-green-500 text-white': step.completed,
                'bg-gray-200 text-gray-500': step.number > currentStep && !step.completed
              }">
              <span *ngIf="!step.completed">{{ step.number }}</span>
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
            </div>
            
            <!-- Label -->
            <span 
              class="text-sm font-medium text-center transition-colors duration-300"
              [ngClass]="{
                'text-blue-600': step.number === currentStep,
                'text-green-600': step.completed,
                'text-gray-500': step.number > currentStep && !step.completed
              }">
              {{ step.label }}
            </span>
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

  get progressWidth(): number {
    if (this.currentStep === 1) return 0;
    return ((this.currentStep - 1) / (this.steps.length - 1)) * 100;
  }
}
