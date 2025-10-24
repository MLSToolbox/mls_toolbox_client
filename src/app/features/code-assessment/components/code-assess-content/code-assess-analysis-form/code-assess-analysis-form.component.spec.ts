import { ComponentFixture, TestBed } from '@angular/core/testing';
import { FormsModule } from '@angular/forms';

import { CodeAssessAnalysisFormComponent } from './code-assess-analysis-form.component';

describe('CodeAssessAnalysisFormComponent', () => {
  let component: CodeAssessAnalysisFormComponent;
  let fixture: ComponentFixture<CodeAssessAnalysisFormComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [CodeAssessAnalysisFormComponent],
      imports: [FormsModule]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(CodeAssessAnalysisFormComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should default to cohesion analysis type', () => {
    expect(component.selectedAnalysisType).toBe('cohesion');
  });

  it('should emit analysis type change', () => {
    spyOn(component.analysisTypeChange, 'emit');
    
    component.selectedAnalysisType = 'coupling';
    
    expect(component.analysisTypeChange.emit).toHaveBeenCalledWith('coupling');
  });
});
