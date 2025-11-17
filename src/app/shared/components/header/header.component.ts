import { Component } from '@angular/core';

@Component({
  selector: 'app-header',
  templateUrl: './header.component.html',
  standalone: false
})
export class HeaderComponent {
  readonly wikiUrl = 'https://github.com/MLSToolbox/.github/wiki';
  
  navigateToWiki(): void {
    window.open(this.wikiUrl, '_blank');
  }
}
