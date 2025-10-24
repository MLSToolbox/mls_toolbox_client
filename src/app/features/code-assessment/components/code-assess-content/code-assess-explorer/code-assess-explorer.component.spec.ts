import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CodeAssessExplorerComponent } from './code-assess-explorer.component';

describe('CodeAssessExplorerComponent', () => {
  let component: CodeAssessExplorerComponent;
  let fixture: ComponentFixture<CodeAssessExplorerComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [CodeAssessExplorerComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(CodeAssessExplorerComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should show empty state when no project', () => {
    component.projectFileName = '';
    expect(component.hasProject).toBe(false);
  });

  it('should show project preview when project exists', () => {
    component.projectFileName = 'my-project.zip';
    component.projectFileSize = '2.5 MB';
    expect(component.hasProject).toBe(true);
  });
});
