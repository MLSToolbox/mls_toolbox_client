import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CodeAssessHeaderComponent } from './code-assess-header.component';

describe('CodeAssessHeaderComponent', () => {
  let component: CodeAssessHeaderComponent;
  let fixture: ComponentFixture<CodeAssessHeaderComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [CodeAssessHeaderComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(CodeAssessHeaderComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should log to console when button is clicked', () => {
    spyOn(console, 'log');
    component.onRunAnalysis();
    expect(console.log).toHaveBeenCalledWith('Run analysis clicked');
  });
});
