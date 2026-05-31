import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';

// Components
import { HeaderComponent } from './components/header/header.component';
import { HeroComponent } from './components/hero/hero.component';
import { ToolCardComponent } from './components/tool-card/tool-card.component';
import { ToolHeaderComponent } from './components/tool-header/tool-header.component';
import { ServiceAssignmentDashboardComponent } from '../features/graph-editor/components/service-assignment-dashboard/service-assignment-dashboard.component';

@NgModule({
  declarations: [
    HeaderComponent,
    HeroComponent,
    ToolCardComponent,
    ToolHeaderComponent,
    ServiceAssignmentDashboardComponent 
  ],
  imports: [
    CommonModule,
    RouterModule
  ],
  exports: [
    HeaderComponent,
    HeroComponent,
    ToolCardComponent,
    ToolHeaderComponent,
    ServiceAssignmentDashboardComponent
  ]
})
export class SharedModule { }
