import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CodeAssessMetricsPanelComponent } from './code-assess-metrics-panel.component';

describe('CodeAssessMetricsPanelComponent', () => {
  let component: CodeAssessMetricsPanelComponent;
  let fixture: ComponentFixture<CodeAssessMetricsPanelComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [CodeAssessMetricsPanelComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(CodeAssessMetricsPanelComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
