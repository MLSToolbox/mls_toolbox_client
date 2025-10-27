import { Component, Input } from '@angular/core';
import { FPCFileDetails } from '@app/core';

@Component({
  selector: 'app-metric-detail-fpc',
  templateUrl: './metric-detail-fpc.component.html',
  styleUrl: './metric-detail-fpc.component.css'
})
export class MetricDetailFpcComponent {
  @Input() data!: FPCFileDetails;
}
