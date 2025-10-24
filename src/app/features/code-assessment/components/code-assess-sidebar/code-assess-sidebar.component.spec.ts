import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CodeAssessSidebarComponent } from './code-assess-sidebar.component';

describe('CodeAssessSidebarComponent', () => {
  let component: CodeAssessSidebarComponent;
  let fixture: ComponentFixture<CodeAssessSidebarComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [CodeAssessSidebarComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(CodeAssessSidebarComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should emit toggleSidebar event when onToggle is called', () => {
    spyOn(component.toggleSidebar, 'emit');
    component.onToggle();
    expect(component.toggleSidebar.emit).toHaveBeenCalled();
  });

  it('should close sidebar when closeSidebar is called and sidebar is open', () => {
    component.isOpen = true;
    spyOn(component.toggleSidebar, 'emit');
    component.closeSidebar();
    expect(component.toggleSidebar.emit).toHaveBeenCalled();
  });

  it('should not emit event when closeSidebar is called and sidebar is closed', () => {
    component.isOpen = false;
    spyOn(component.toggleSidebar, 'emit');
    component.closeSidebar();
    expect(component.toggleSidebar.emit).not.toHaveBeenCalled();
  });
});
