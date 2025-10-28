import { Component, EventEmitter, Input, Output } from '@angular/core';

interface FileTreeNode {
  name: string;
  path: string;
  type: 'file' | 'directory';
  fpcData?: any;
  pfpData?: any;
  metrics?: any;
}

@Component({
  selector: 'app-code-assess-content',
  templateUrl: './code-assess-content.component.html',
  styleUrl: './code-assess-content.component.css'
})
export class CodeAssessContentComponent {
  @Input() sessionId: string = '';
  @Input() isAnalyzing: boolean = false;
  @Input() analysisResults: any | null = null;
  @Input() isLightTheme: boolean = false;
  
  @Output() analysisComplete = new EventEmitter<any>();
  @Output() analysisTypeChange = new EventEmitter<any[]>();
  
  uploadedFile: File | null = null;
  uploadedFileName: string = '';
  uploadedFileSize: string = '';
  analysisResponse: any | null = null;
  
  selectedNode: FileTreeNode | null = null;
  showMetricsPanel: boolean = false;

  onFileUpload(file: File) {
    this.uploadedFile = file;
    this.uploadedFileName = file.name;
    this.uploadedFileSize = this.formatFileSize(file.size);
    console.log('File uploaded:', file.name);
  }
  
  onAnalysisUploadComplete(response: any) {
    this.analysisResponse = response;
    console.log('📊 Analysis complete in content component:', response);
    
    this.analysisComplete.emit(response);
  }

  onAnalysisFormTypeChange(analyzers: any[]) {
    console.log('Analysis type selected in content:', analyzers);
    
    this.analysisTypeChange.emit(analyzers);
  }
  
  // Handler para cuando se selecciona un nodo en el explorador
  onNodeSelected(node: FileTreeNode) {
    console.log('Node selected:', node);
    this.selectedNode = node;
    this.showMetricsPanel = true;
  }
  
  // Handler para cerrar el panel de métricas
  onCloseMetricsPanel() {
    this.showMetricsPanel = false;
    // Opcional: mantener el nodo seleccionado o limpiarlo
    // this.selectedNode = null;
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
