import { Component, Output, EventEmitter, Input } from '@angular/core';

@Component({
  selector: 'app-assessment-upload',
  template: `
    <div class="flex-1 flex items-center justify-center p-8 bg-gray-50">
      <div class="max-w-2xl w-full">
        <!-- Icon -->
        <div class="flex justify-center mb-6">
          <div class="w-24 h-24 rounded-full bg-blue-50 flex items-center justify-center">
            <svg class="w-12 h-12 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12"></path>
            </svg>
          </div>
        </div>

        <!-- Title -->
        <h2 class="text-2xl font-bold text-center mb-2" style="color: rgb(0, 32, 96);">
          Upload Your Project
        </h2>
        
        <!-- Subtitle -->
        <p class="text-center text-gray-600 mb-8">
          Drag your .zip file here or click to select
        </p>

        <!-- Upload Area -->
        <div 
          class="border-2 border-dashed rounded-xl p-12 text-center transition-all duration-300 cursor-pointer"
          [ngClass]="{
            'border-gray-300 bg-white hover:border-blue-400 hover:bg-blue-50/50': !isDragging && !uploadedFileName,
            'border-blue-500 bg-blue-50': isDragging,
            'border-green-500 bg-green-50': uploadedFileName
          }"
          (click)="fileInput.click()"
          (dragover)="onDragOver($event)"
          (dragleave)="onDragLeave($event)"
          (drop)="onDrop($event)">
          
          <!-- Upload Icon -->
          <div *ngIf="!uploadedFileName" class="mb-4">
            <svg class="w-16 h-16 mx-auto text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4"></path>
            </svg>
          </div>

          <!-- Success Icon -->
          <div *ngIf="uploadedFileName" class="mb-4">
            <svg class="w-16 h-16 mx-auto text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"></path>
            </svg>
          </div>

          <!-- Text -->
          <p class="text-lg font-medium mb-2" [ngClass]="{
            'text-gray-700': !uploadedFileName,
            'text-green-700': uploadedFileName
          }">
            {{ uploadedFileName || 'Click to upload or drag and drop' }}
          </p>
          <p class="text-sm text-gray-500">
            ZIP files only (Max 50MB)
          </p>

          <!-- Hidden Input -->
          <input 
            #fileInput
            type="file" 
            accept=".zip"
            class="hidden"
            (change)="onFileSelected($event)">
        </div>

        <!-- Info Box -->
        <div *ngIf="!uploadedFileName" class="mt-6 p-4 bg-blue-50 rounded-lg border border-blue-100">
          <div class="flex gap-3">
            <svg class="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path>
            </svg>
            <div>
              <p class="text-sm font-medium text-blue-900 mb-1">What to upload?</p>
              <p class="text-sm text-blue-700">
                Upload a ZIP file containing your Python project source code for quality assessment.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  `,
  standalone: false
})
export class AssessmentUploadComponent {
  @Input() uploadedFileName: string | null = null;
  @Output() fileSelected = new EventEmitter<File>();
  
  isDragging = false;

  onFileSelected(event: Event): void {
    const input = event.target as HTMLInputElement;
    if (input.files && input.files[0]) {
      this.handleFile(input.files[0]);
    }
  }

  onDragOver(event: DragEvent): void {
    event.preventDefault();
    event.stopPropagation();
    this.isDragging = true;
  }

  onDragLeave(event: DragEvent): void {
    event.preventDefault();
    event.stopPropagation();
    this.isDragging = false;
  }

  onDrop(event: DragEvent): void {
    event.preventDefault();
    event.stopPropagation();
    this.isDragging = false;

    if (event.dataTransfer?.files && event.dataTransfer.files[0]) {
      this.handleFile(event.dataTransfer.files[0]);
    }
  }

  private handleFile(file: File): void {
    if (file.name.endsWith('.zip') && file.size <= 50 * 1024 * 1024) {
      this.fileSelected.emit(file);
    } else {
      alert('Please upload a valid ZIP file under 50MB');
    }
  }
}
