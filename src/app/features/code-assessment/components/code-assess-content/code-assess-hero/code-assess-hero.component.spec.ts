import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CodeAssessHeroComponent } from './code-assess-hero.component';

describe('CodeAssessHeroComponent', () => {
  let component: CodeAssessHeroComponent;
  let fixture: ComponentFixture<CodeAssessHeroComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [CodeAssessHeroComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(CodeAssessHeroComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should emit file upload event', () => {
    const mockFile = new File(['test'], 'test.zip', { type: 'application/zip' });
    spyOn(component.fileUpload, 'emit');
    
    const event = {
      target: {
        files: [mockFile]
      }
    } as any;
    
    component.onFileSelected(event);
    expect(component.fileUpload.emit).toHaveBeenCalledWith(mockFile);
  });
});
