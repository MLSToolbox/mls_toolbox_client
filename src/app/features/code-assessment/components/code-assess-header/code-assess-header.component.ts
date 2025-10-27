import { Component, EventEmitter, Input, Output } from '@angular/core';

@Component({
  selector: 'app-code-assess-header',
  templateUrl: './code-assess-header.component.html',
  styleUrl: './code-assess-header.component.css'
})
export class CodeAssessHeaderComponent {
  @Input() canAnalyze: boolean = false;
  @Input() isAnalyzing: boolean = false;
  
  @Output() runAnalysis = new EventEmitter<void>();
  
  onRunAnalysis() {
    if (this.canAnalyze && !this.isAnalyzing) {
      console.log('🎯 Run analysis clicked');
      this.runAnalysis.emit();
    } else {
      console.warn('⚠️ Cannot run analysis:', { canAnalyze: this.canAnalyze, isAnalyzing: this.isAnalyzing });
    }
  }
}
