import { Component, Input } from '@angular/core';

@Component({
  selector: 'app-hero',
  templateUrl: './hero.component.html',
  standalone: false
})
export class HeroComponent {
  @Input() title = 'Welcome to MLS Toolbox';
  @Input() subtitle = 'A collection of tools for MLOps maintaining good software engineering practices';
  @Input() showGradient = true;
}
