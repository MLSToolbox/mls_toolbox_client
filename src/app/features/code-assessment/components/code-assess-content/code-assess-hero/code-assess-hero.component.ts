import { Component, EventEmitter, Output } from '@angular/core';
import { CodeAnalysisService, AnalysisResponse } from '@app/core';

@Component({
  selector: 'app-code-assess-hero',
  templateUrl: './code-assess-hero.component.html',
  styleUrl: './code-assess-hero.component.css'
})
export class CodeAssessHeroComponent {
  @Output() fileUpload = new EventEmitter<File>();
  @Output() analysisComplete = new EventEmitter<AnalysisResponse>();
  
  isUploading = false;

  constructor(private codeAnalysisService: CodeAnalysisService) {}

  onFileSelected(event: Event) {
    const input = event.target as HTMLInputElement;
    if (input.files && input.files.length > 0) {
      const file = input.files[0];
      
      // Validar que sea un archivo ZIP
      if (!file.name.endsWith('.zip')) {
        console.error('Error: Solo se permiten archivos .zip');
        alert('Por favor selecciona un archivo .zip');
        input.value = '';
        return;
      }
      
      // Emitir el archivo al componente padre
      this.fileUpload.emit(file);
      
      // Enviar al backend
      this.uploadFile(file);
      
      // Reset input
      input.value = '';
    }
  }

  private uploadFile(file: File) {
    this.isUploading = true;
    console.log('Subiendo archivo:', file.name);
    
    this.codeAnalysisService.uploadProjectZip(file).subscribe({
      next: (response) => {
        this.isUploading = false;
        console.log('✅ Respuesta del servidor:', response);
        console.log('Session ID:', response.data.session_id);
        console.log('Archivos analizados:', response.data.auto_detected_pipeline.files_analyzed);
        console.log('Pipeline válido:', response.data.auto_detected_pipeline.is_valid_pipeline);
        console.log('Estructura del árbol:', response.data.tree_structure);
        
        // Emitir la respuesta completa al padre
        this.analysisComplete.emit(response);
      },
      error: (error) => {
        this.isUploading = false;
        console.error('❌ Error al subir el archivo:', error);
        console.error('Detalles:', error.error);
        alert(`Error: ${error.error?.message || 'No se pudo conectar con el servidor'}`);
      }
    });
  }
}
