import { Component, Input } from '@angular/core';

@Component({
  selector: 'app-info-card',
  templateUrl: './info-card.component.html',
  standalone: false
})
export class InfoCardComponent {
  @Input() title = '';
  @Input() items: { icon?: string; label: string; value: string }[] = [];
}
