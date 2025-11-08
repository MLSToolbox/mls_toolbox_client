import { Component, Input } from '@angular/core';

export interface MetricResult {
  id: string;
  name: string;
  score: number;
  status: string;
  message: string;
  color: 'green' | 'yellow' | 'orange' | 'red';
}

@Component({
  selector: 'app-result-card',
  templateUrl: './result-card.component.html',
  standalone: false
})
export class ResultCardComponent {
  @Input() result!: MetricResult;

  get borderColorClass(): string {
    const colors = {
      green: 'border-green-200 bg-green-50',
      yellow: 'border-yellow-200 bg-yellow-50',
      orange: 'border-orange-200 bg-orange-50',
      red: 'border-red-200 bg-red-50'
    };
    return colors[this.result.color];
  }

  get iconBgClass(): string {
    const colors = {
      green: 'bg-green-100 text-green-600',
      yellow: 'bg-yellow-100 text-yellow-600',
      orange: 'bg-orange-100 text-orange-600',
      red: 'bg-red-100 text-red-600'
    };
    return colors[this.result.color];
  }

  get statusIcon(): string {
    const icons = {
      green: '✓',
      yellow: '⚠',
      orange: '!',
      red: '✗'
    };
    return icons[this.result.color];
  }
}
