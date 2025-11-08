import { Component, Input } from '@angular/core';

@Component({
  selector: 'app-tool-header',
  templateUrl: './tool-header.component.html',
  standalone: false
})
export class ToolHeaderComponent {
  @Input() toolName = '';
  @Input() toolDescription = '';
  @Input() iconClass = '';
}
