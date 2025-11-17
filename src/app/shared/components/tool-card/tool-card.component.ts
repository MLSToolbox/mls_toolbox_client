import { Component, Input } from '@angular/core';

@Component({
  selector: 'app-tool-card',
  templateUrl: './tool-card.component.html',
  standalone: false
})
export class ToolCardComponent {
  @Input() title = '';
  @Input() description = '';
  @Input() features: string[] = [];
  @Input() routerLink = '';
  @Input() iconPath = '';
}
