import { Component, Input } from '@angular/core';
import { PFPPackageDetails } from '@app/core';

@Component({
  selector: 'app-metric-detail-pfp',
  templateUrl: './metric-detail-pfp.component.html',
  styleUrl: './metric-detail-pfp.component.css'
})
export class MetricDetailPfpComponent {
  @Input() data!: PFPPackageDetails;
}
