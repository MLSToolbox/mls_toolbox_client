import { Component, Input, Output, EventEmitter } from '@angular/core';
import { FPCFileDetails, PFPPackageDetails } from '@app/core';

export interface MetricsPanelData {
  name: string;
  type: 'file' | 'directory';
  fpcData?: FPCFileDetails;
  pfpData?: PFPPackageDetails;
}

@Component({
  selector: 'app-code-assess-metrics-panel',
  templateUrl: './code-assess-metrics-panel.component.html',
  styleUrls: ['./code-assess-metrics-panel.component.css']
})
export class CodeAssessMetricsPanelComponent {
  @Input() selectedNode: MetricsPanelData | null = null;
  @Input() isVisible: boolean = false;
  @Input() isLightTheme: boolean = false; // Recibe el estado del tema
  @Output() closePanel = new EventEmitter<void>();

  onClose() {
    this.closePanel.emit();
  }
}
