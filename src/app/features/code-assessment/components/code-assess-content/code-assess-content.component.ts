import { Component } from '@angular/core';

@Component({
  selector: 'app-code-assess-content',
  templateUrl: './code-assess-content.component.html',
  styleUrl: './code-assess-content.component.css'
})
export class CodeAssessContentComponent {
  // Propiedades para manejar el estado del contenido
  uploadedFile: File | null = null;
  uploadedFileName: string = '';
  uploadedFileSize: string = '';

  // Handler para cuando se sube un archivo
  onFileUpload(file: File) {
    this.uploadedFile = file;
    this.uploadedFileName = file.name;
    this.uploadedFileSize = this.formatFileSize(file.size);
    console.log('File uploaded:', file.name);
  }

  // Handler para cuando se selecciona tipo de análisis
  onAnalysisTypeChange(type: string) {
    console.log('Analysis type selected:', type);
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
