import { Component, EventEmitter, Output } from '@angular/core';

@Component({
  selector: 'app-code-assess-analysis-form',
  templateUrl: './code-assess-analysis-form.component.html',
  styleUrl: './code-assess-analysis-form.component.css'
})
export class CodeAssessAnalysisFormComponent {
  @Output() analysisTypeChange = new EventEmitter<string>();
  
  private _selectedAnalysisType: string = 'all';

  get selectedAnalysisType(): string {
    return this._selectedAnalysisType;
  }

  set selectedAnalysisType(value: string) {
    this._selectedAnalysisType = value;
    this.analysisTypeChange.emit(value);
  }
}
