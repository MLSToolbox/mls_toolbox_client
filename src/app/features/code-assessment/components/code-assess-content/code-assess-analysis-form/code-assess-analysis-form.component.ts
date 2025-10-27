import { Component, EventEmitter, Input, Output } from '@angular/core';
import { AnalyzerType } from '@app/core';

@Component({
  selector: 'app-code-assess-analysis-form',
  templateUrl: './code-assess-analysis-form.component.html',
  styleUrl: './code-assess-analysis-form.component.css'
})
export class CodeAssessAnalysisFormComponent {
  @Input() sessionId: string = '';
  @Input() isAnalyzing: boolean = false;
  
  @Output() analysisTypeChange = new EventEmitter<string>();
  @Output() startAnalysis = new EventEmitter<AnalyzerType[]>();
  
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
  
  /**
   * Mapea el tipo de análisis seleccionado a los analizadores correspondientes
   */
  private getAnalyzersFromType(type: string): AnalyzerType[] {
    switch (type) {
      case 'cohesion':
        return ['fpc']; // Functional Programming Cohesion
      case 'coupling':
        return ['pfp']; // Pipeline Flow Pattern
      case 'all':
        return ['fpc', 'pfp']; // Todos los analizadores
      default:
        return ['fpc', 'pfp'];
    }
  }
  
  /**
   * Inicia el análisis con los analizadores seleccionados
   */
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
