import { Component, Input, Output, EventEmitter } from '@angular/core';

export interface Metric {
  id: string;
  name: string;
  description: string;
  icon: string;
}

@Component({
  selector: 'app-metric-card',
  templateUrl: './metric-card.component.html',
  standalone: false
})
export class MetricCardComponent {
  @Input() metric!: Metric;
  @Input() selected = false;
  @Output() toggle = new EventEmitter<string>();

  onToggle(): void {
    this.toggle.emit(this.metric.id);
  }
}
