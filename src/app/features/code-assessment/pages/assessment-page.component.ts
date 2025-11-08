import { Component, OnInit } from '@angular/core';
import { CodeAssessmentService } from '../services/code-assessment.service';
import { AssessmentState, AssessmentStep } from '../models/assessment.models';
import { Observable } from 'rxjs';

@Component({
  selector: 'app-assessment-page',
  templateUrl: './assessment-page.component.html',
  standalone: false
})
export class AssessmentPageComponent implements OnInit {
  state$: Observable<AssessmentState>;
  
  steps: AssessmentStep[] = [
    { number: 1, label: 'Upload Code', completed: false },
    { number: 2, label: 'Choose Metrics', completed: false },
    { number: 3, label: 'Analysis', completed: false },
    { number: 4, label: 'Results', completed: false }
  ];

  constructor(private assessmentService: CodeAssessmentService) {
    this.state$ = this.assessmentService.state$;
  }

  ngOnInit(): void {
    // Subscribe to state changes to update steps
    this.state$.subscribe(state => {
      this.updateSteps(state.currentStep);
    });
  }

  onFileSelected(file: File): void {
    this.assessmentService.uploadFile(file);
  }

  private updateSteps(currentStep: number): void {
    this.steps = this.steps.map(step => ({
      ...step,
      completed: step.number < currentStep
    }));
  }
}
