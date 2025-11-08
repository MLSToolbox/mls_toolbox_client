import { Component, Input } from '@angular/core';

export interface Step {
  number: number;
  label: string;
  status: 'completed' | 'active' | 'pending';
}

@Component({
  selector: 'app-progress-steps',
  templateUrl: './progress-steps.component.html',
  standalone: false
})
export class ProgressStepsComponent {
  @Input() steps: Step[] = [];
}
