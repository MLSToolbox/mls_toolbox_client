import { Component, Input } from '@angular/core';

@Component({
  selector: 'app-metric-detail-fpc',
  templateUrl: './metric-detail-fpc.component.html',
  styleUrl: './metric-detail-fpc.component.css'
})
export class MetricDetailFpcComponent {
  @Input() data!: any;
  @Input() isLightTheme: boolean = false;
}
