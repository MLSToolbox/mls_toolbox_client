import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CodeAssessContentComponent } from './code-assess-content.component';

describe('CodeAssessContentComponent', () => {
  let component: CodeAssessContentComponent;
  let fixture: ComponentFixture<CodeAssessContentComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [CodeAssessContentComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(CodeAssessContentComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should handle file upload', () => {
    const mockFile = new File(['test'], 'test.zip', { type: 'application/zip' });
    spyOn(console, 'log');
    component.onFileUpload(mockFile);
    expect(component.uploadedFile).toBe(mockFile);
    expect(console.log).toHaveBeenCalledWith('File uploaded:', 'test.zip');
  });

  it('should handle analysis type selection', () => {
    spyOn(console, 'log');
    component.onAnalysisTypeChange('cohesion');
    expect(console.log).toHaveBeenCalledWith('Analysis type selected:', 'cohesion');
  });
});
