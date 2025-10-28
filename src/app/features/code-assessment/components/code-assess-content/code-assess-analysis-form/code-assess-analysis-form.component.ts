import { Component, EventEmitter, Output, Input } from '@angular/core';

@Component({
  selector: 'app-code-assess-analysis-form',
  templateUrl: './code-assess-analysis-form.component.html',
  styleUrl: './code-assess-analysis-form.component.css'
})
export class CodeAssessAnalysisFormComponent {
  @Input() sessionId: string = '';
  @Input() isAnalyzing: boolean = false;
  
  @Output() analysisTypeChange = new EventEmitter<string>();
  @Output() startAnalysis = new EventEmitter<any[]>();
  
  private _selectedAnalysisType: string = 'all';

  get selectedAnalysisType(): string {
    return this._selectedAnalysisType;
  }

  set selectedAnalysisType(value: string) {
    this._selectedAnalysisType = value;
    this.analysisTypeChange.emit(value);
  }
  
  get canAnalyze(): boolean {
    return !!this.sessionId && !this.isAnalyzing;
  }
  
  private getAnalyzersFromType(type: string): any[] {
    switch (type) {
      case 'cohesion':
        return ['fpc'];
      case 'coupling':
        return ['pfp'];
      case 'all':
        return ['fpc', 'pfp'];
      default:
        return ['fpc', 'pfp'];
    }
  }
  
  onAnalyzeClick(): void {
    if (!this.canAnalyze) {
      console.warn('⚠️ No se puede analizar: sin sesión o análisis en curso');
      return;
    }
    
    const analyzers = this.getAnalyzersFromType(this.selectedAnalysisType);
    console.log(`🚀 Iniciando análisis tipo: ${this.selectedAnalysisType}`);
    console.log(`📋 Analizadores:`, analyzers);
    
    this.startAnalysis.emit(analyzers);
  }
}
