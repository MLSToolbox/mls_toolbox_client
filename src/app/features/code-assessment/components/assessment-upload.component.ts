import { Component, Output, EventEmitter, Input, ViewChild, ElementRef } from '@angular/core';

@Component({
  selector: 'app-assessment-upload',
  template: `
    <div class="flex items-center justify-center py-12 px-8 bg-gray-50">
      <div class="max-w-2xl w-full">
        <!-- Icon -->
        <div class="flex justify-center mb-6">
          <div 
            class="w-24 h-24 rounded-full flex items-center justify-center transition-all duration-300"
            [ngClass]="{
              'bg-blue-50': !isUploading && !uploadedFileName,
              'bg-green-50': uploadedFileName && !isUploading,
              'bg-blue-100': isUploading
            }">
            <!-- Loading Spinner -->
            <svg 
              *ngIf="isUploading" 
              class="w-12 h-12 text-blue-600 animate-spin" 
              fill="none" 
              viewBox="0 0 24 24">
              <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
              <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
            </svg>
            <!-- Upload Icon -->
            <svg 
              *ngIf="!isUploading && !uploadedFileName" 
              class="w-12 h-12 text-blue-600" 
              fill="none" 
              stroke="currentColor" 
              viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12"></path>
            </svg>
            <!-- Success Icon -->
            <svg 
              *ngIf="uploadedFileName && !isUploading" 
              class="w-12 h-12 text-green-600" 
              fill="none" 
              stroke="currentColor" 
              viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"></path>
            </svg>
          </div>
        </div>

        <!-- Title -->
        <h2 class="text-2xl font-bold text-center mb-2" style="color: rgb(0, 32, 96);">
          {{ isUploading ? 'Uploading...' : (uploadedFileName ? 'File Uploaded Successfully!' : 'Upload Your Project') }}
        </h2>
        
        <!-- Subtitle -->
        <p class="text-center text-gray-600 mb-8">
          {{ isUploading ? 'Please wait while we process your file' : 'Drag your .zip file here or click to select' }}
        </p>

        <!-- Upload Area -->
        <div 
          class="border-2 border-dashed rounded-xl p-12 text-center transition-all duration-300"
          [ngClass]="{
            'border-gray-300 bg-white hover:border-blue-400 hover:bg-blue-50/50 cursor-pointer': !isDragging && !uploadedFileName && !isUploading,
            'border-blue-500 bg-blue-50': isDragging && !isUploading,
            'border-green-500 bg-green-50': uploadedFileName && !isUploading,
            'border-gray-300 bg-gray-50 cursor-not-allowed opacity-60': isUploading
          }"
          [class.pointer-events-none]="isUploading"
          (click)="!isUploading && fileInput.click()"
          (dragover)="onDragOver($event)"
          (dragleave)="onDragLeave($event)"
          (drop)="onDrop($event)">
          
          <!-- Upload Icon -->
          <div *ngIf="!uploadedFileName && !isUploading" class="mb-4">
            <svg class="w-16 h-16 mx-auto text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4"></path>
            </svg>
          </div>

          <!-- Loading State -->
          <div *ngIf="isUploading" class="mb-4">
            <div class="w-16 h-16 mx-auto relative">
              <svg class="w-16 h-16 text-blue-200" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12"></path>
              </svg>
            </div>
          </div>

          <!-- Success Icon -->
          <div *ngIf="uploadedFileName && !isUploading" class="mb-4">
            <svg class="w-16 h-16 mx-auto text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"></path>
            </svg>
          </div>

          <!-- Text -->
          <p class="text-lg font-medium mb-2" [ngClass]="{
            'text-gray-700': !uploadedFileName && !isUploading,
            'text-green-700': uploadedFileName && !isUploading,
            'text-blue-700': isUploading
          }">
            {{ getDisplayText() }}
          </p>
          
          <!-- File Size -->
          <p *ngIf="fileSize && uploadedFileName" class="text-sm text-gray-600 mb-2">
            {{ fileSize }}
          </p>
          
          <p class="text-sm text-gray-500">
            ZIP files only (Max 50MB)
          </p>

          <!-- Hidden Input -->
          <input 
            #fileInput
            type="file" 
            accept=".zip,application/zip,application/x-zip-compressed"
            class="hidden"
            [disabled]="isUploading"
            (change)="onFileSelected($event)">
        </div>

        <!-- Error Message -->
        <div *ngIf="errorMessage" class="mt-6 p-4 bg-red-50 rounded-lg border border-red-200">
          <div class="flex gap-3">
            <svg class="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path>
            </svg>
            <div>
              <p class="text-sm font-medium text-red-900 mb-1">Upload Error</p>
              <p class="text-sm text-red-700">{{ errorMessage }}</p>
            </div>
          </div>
        </div>

        <!-- Info Box -->
        <div *ngIf="!uploadedFileName && !isUploading && !errorMessage" class="mt-6 p-4 bg-blue-50 rounded-lg border border-blue-100">
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

        <!-- Upload Again Button -->
        <div *ngIf="uploadedFileName && !isUploading" class="mt-6 flex justify-center">
          <button
            (click)="resetUpload()"
            class="px-6 py-2 text-sm font-medium text-blue-700 bg-blue-50 rounded-lg hover:bg-blue-100 transition-colors duration-200 flex items-center gap-2">
            <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"></path>
            </svg>
            Upload Different File
          </button>
        </div>
      </div>
    </div>
  `,
  standalone: false
})
export class AssessmentUploadComponent {
  @Input() uploadedFileName: string | null = null;
  @Input() isUploading = false;
  @Input() errorMessage: string | null = null;
  @Input() fileSize: string | null = null;
  @Output() fileSelected = new EventEmitter<File>();
  @Output() reset = new EventEmitter<void>();
  
  @ViewChild('fileInput') fileInput!: ElementRef<HTMLInputElement>;
  
  isDragging = false;
  private readonly MAX_FILE_SIZE = 50 * 1024 * 1024; // 50MB

  getDisplayText(): string {
    if (this.isUploading) {
      return 'Processing your file...';
    }
    if (this.uploadedFileName) {
      return this.uploadedFileName;
    }
    return 'Click to upload or drag and drop';
  }

  onFileSelected(event: Event): void {
    const input = event.target as HTMLInputElement;
    if (input.files && input.files[0]) {
      this.handleFile(input.files[0]);
    }
    // Reset input value to allow selecting the same file again
    input.value = '';
  }

  onDragOver(event: DragEvent): void {
    if (this.isUploading) return;
    event.preventDefault();
    event.stopPropagation();
    this.isDragging = true;
  }

  onDragLeave(event: DragEvent): void {
    if (this.isUploading) return;
    event.preventDefault();
    event.stopPropagation();
    this.isDragging = false;
  }

  onDrop(event: DragEvent): void {
    if (this.isUploading) return;
    event.preventDefault();
    event.stopPropagation();
    this.isDragging = false;

    if (event.dataTransfer?.files && event.dataTransfer.files[0]) {
      this.handleFile(event.dataTransfer.files[0]);
    }
  }

  private handleFile(file: File): void {
    console.group('📁 File Selection Handler');
    console.log('File selected:', {
      name: file.name,
      size: file.size,
      type: file.type,
      lastModified: new Date(file.lastModified)
    });

    // Validate file type
    const isZip = file.name.toLowerCase().endsWith('.zip') || 
                  file.type === 'application/zip' || 
                  file.type === 'application/x-zip-compressed';
    
    if (!isZip) {
      console.error('❌ Invalid file type');
      this.errorMessage = 'Please upload a valid ZIP file';
      console.groupEnd();
      return;
    }

    // Validate file size
    if (file.size > this.MAX_FILE_SIZE) {
      const sizeMB = (file.size / 1024 / 1024).toFixed(2);
      console.error(`❌ File too large: ${sizeMB}MB (max: 50MB)`);
      this.errorMessage = `File size (${sizeMB}MB) exceeds the 50MB limit`;
      console.groupEnd();
      return;
    }

    console.log('✅ File validation passed');
    console.log('🚀 Emitting file to parent component');
    console.groupEnd();

    // Emit file for upload
    this.fileSelected.emit(file);
  }

  resetUpload(): void {
    this.reset.emit();
    if (this.fileInput) {
      this.fileInput.nativeElement.value = '';
    }
  }
}
