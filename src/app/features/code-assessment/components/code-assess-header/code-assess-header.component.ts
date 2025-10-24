import { Component, EventEmitter, Output } from '@angular/core';

@Component({
  selector: 'app-code-assess-header',
  templateUrl: './code-assess-header.component.html',
  styleUrl: './code-assess-header.component.css'
})
export class CodeAssessHeaderComponent {
  onRunAnalysis() {
    console.log('Run analysis clicked');
  }
}
