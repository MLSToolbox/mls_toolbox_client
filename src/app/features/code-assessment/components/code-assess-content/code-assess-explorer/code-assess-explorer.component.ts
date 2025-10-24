import { Component, Input } from '@angular/core';

@Component({
  selector: 'app-code-assess-explorer',
  templateUrl: './code-assess-explorer.component.html',
  styleUrl: './code-assess-explorer.component.css'
})
export class CodeAssessExplorerComponent {
  @Input() projectFileName: string = '';
  @Input() projectFileSize: string = '';
  
  get hasProject(): boolean {
    return !!this.projectFileName;
  }
}
