import { Component, EventEmitter, Input, Output, HostListener } from '@angular/core';

@Component({
  selector: 'app-code-assess-sidebar',
  templateUrl: './code-assess-sidebar.component.html',
  styleUrl: './code-assess-sidebar.component.css'
})
export class CodeAssessSidebarComponent {
  @Input() isOpen = false;
  @Output() toggleSidebar = new EventEmitter<void>();

  onToggle() {
    this.toggleSidebar.emit();
  }

  closeSidebar() {
    if (this.isOpen) {
      this.toggleSidebar.emit();
    }
  }

  // Cerrar sidebar con tecla Escape
  @HostListener('document:keydown.escape', ['$event'])
  onEscapeKey(event: KeyboardEvent) {
    if (this.isOpen) {
      this.closeSidebar();
    }
  }

  // Prevenir scroll del body cuando sidebar está abierto en mobile
  @HostListener('window:resize', ['$event'])
  onResize() {
    if (window.innerWidth > 1024 && this.isOpen) {
      // Auto-cerrar en desktop
      this.closeSidebar();
    }
  }
}
