import { Component, Input, Output, EventEmitter } from '@angular/core';
import { AssessmentStep } from '../models/assessment.models';

@Component({
  selector: 'app-assessment-stepper',
  template: `
    <div class="w-full py-8 px-4" style="background: linear-gradient(to bottom, #f8fafc 0%, #ffffff 100%);">
      <div class="max-w-4xl mx-auto">
        <div class="flex items-center justify-between">
          <!-- Step Items -->
          <ng-container *ngFor="let step of steps; let i = index; let last = last">
            <!-- Step Circle and Label -->
            <div class="flex flex-col items-center relative group">
              <!-- Circle with Glow Effect -->
              <div 
                class="w-14 h-14 rounded-full flex items-center justify-center font-bold text-base transition-all duration-300 relative"
                [ngClass]="{
                  'bg-gradient-to-br from-blue-500 to-blue-700 text-white shadow-xl shadow-blue-500/50 scale-110': step.number === currentStep,
                  'bg-gradient-to-br from-green-400 to-green-600 text-white shadow-lg shadow-green-500/30': step.completed && step.number !== currentStep,
                  'bg-white border-2 border-gray-300 text-gray-400': step.number > currentStep && !step.completed
                }">
                <!-- Pulse Animation for Current Step -->
                <span *ngIf="step.number === currentStep" 
                      class="absolute inset-0 rounded-full bg-blue-500 animate-ping opacity-20"></span>
                
                <!-- Number or Checkmark -->
                <span *ngIf="!step.completed || step.number === currentStep" class="relative z-10">{{ step.number }}</span>
                <svg *ngIf="step.completed && step.number !== currentStep" 
                     class="w-7 h-7 relative z-10" fill="none" stroke="currentColor" viewBox="0 0 24 24" stroke-width="3">
                  <path stroke-linecap="round" stroke-linejoin="round" d="M5 13l4 4L19 7"></path>
                </svg>
              </div>
              
              <!-- Label -->
              <span 
                class="text-xs font-semibold text-center mt-3 transition-all duration-300 max-w-[80px]"
                [ngClass]="{
                  'text-blue-700 scale-105': step.number === currentStep,
                  'text-green-600': step.completed && step.number !== currentStep,
                  'text-gray-400': step.number > currentStep && !step.completed
                }">
                {{ step.label }}
              </span>
            </div>

            <!-- Connector Line with Gradient (except for last item) -->
            <div *ngIf="!last" class="flex-1 h-1 mx-3 rounded-full transition-all duration-500 relative overflow-hidden"
                 [ngClass]="{
                   'bg-gradient-to-r from-blue-500 to-blue-600': step.completed,
                   'bg-gray-200': !step.completed
                 }">
              <!-- Animated shimmer effect for active line -->
              <div *ngIf="step.completed" 
                   class="absolute inset-0 bg-gradient-to-r from-transparent via-white to-transparent opacity-40 animate-shimmer">
              </div>
            </div>
          </ng-container>
        </div>
      </div>
    </div>

    <style>
      @keyframes shimmer {
        0% { transform: translateX(-100%); }
        100% { transform: translateX(100%); }
      }
      .animate-shimmer {
        animation: shimmer 2s infinite;
      }
    </style>
  `,
  standalone: false
})
export class AssessmentStepperComponent {
  @Input() steps: AssessmentStep[] = [];
  @Input() currentStep = 1;
  @Input() isLoading = false;
  @Input() allowNavigation = true;
  @Input() stepDescription = '';
  @Output() stepChange = new EventEmitter<number>();
}
