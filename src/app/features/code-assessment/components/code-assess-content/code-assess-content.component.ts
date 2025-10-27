import { Component, EventEmitter, Input, Output } from '@angular/core';
import { AnalysisResponse, AnalyzerType, ProjectAnalysisResponse } from '@app/core';

@Component({
  selector: 'app-code-assess-content',
  templateUrl: './code-assess-content.component.html',
  styleUrl: './code-assess-content.component.css'
})
export class CodeAssessContentComponent {
  @Input() sessionId: string = '';
  @Input() isAnalyzing: boolean = false;
  @Input() analysisResults: ProjectAnalysisResponse | null = null;
  
  @Output() analysisComplete = new EventEmitter<AnalysisResponse>();
  @Output() analysisTypeChange = new EventEmitter<AnalyzerType[]>();
  
  // Propiedades para manejar el estado del contenido
  uploadedFile: File | null = null;
  uploadedFileName: string = '';
  uploadedFileSize: string = '';
  analysisResponse: AnalysisResponse | null = null;

  // Handler para cuando se sube un archivo
  onFileUpload(file: File) {
    this.uploadedFile = file;
    this.uploadedFileName = file.name;
    this.uploadedFileSize = this.formatFileSize(file.size);
    console.log('File uploaded:', file.name);
  }
  
  // Handler para cuando el análisis se completa (upload)
  onAnalysisUploadComplete(response: AnalysisResponse) {
    this.analysisResponse = response;
    console.log('📊 Analysis complete in content component:', response);
    
    // Propagar al componente padre
    this.analysisComplete.emit(response);
  }

  // Handler para cuando se selecciona tipo de análisis
  onAnalysisFormTypeChange(analyzers: AnalyzerType[]) {
    console.log('Analysis type selected in content:', analyzers);
    
    // Propagar al componente padre
    this.analysisTypeChange.emit(analyzers);
  }

  // Helper para formatear tamaño de archivo
  private formatFileSize(bytes: number): string {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return Math.round(bytes / Math.pow(k, i) * 100) / 100 + ' ' + sizes[i];
  }
}
