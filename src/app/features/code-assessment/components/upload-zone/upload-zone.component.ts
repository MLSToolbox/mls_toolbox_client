import { Component, Output, EventEmitter } from '@angular/core';

@Component({
  selector: 'app-upload-zone',
  templateUrl: './upload-zone.component.html',
  standalone: false
})
export class UploadZoneComponent {
  @Output() fileSelected = new EventEmitter<File>();

  isDragging = false;

  onFileSelected(event: Event): void {
    const input = event.target as HTMLInputElement;
    if (input.files && input.files.length > 0) {
      this.fileSelected.emit(input.files[0]);
    }
  }

  onDragOver(event: DragEvent): void {
    event.preventDefault();
    this.isDragging = true;
  }

  onDragLeave(event: DragEvent): void {
    event.preventDefault();
    this.isDragging = false;
  }

  onDrop(event: DragEvent): void {
    event.preventDefault();
    this.isDragging = false;
    
    if (event.dataTransfer?.files && event.dataTransfer.files.length > 0) {
      this.fileSelected.emit(event.dataTransfer.files[0]);
    }
  }
}
