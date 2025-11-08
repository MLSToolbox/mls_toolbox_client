import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';

// Components
import { HeaderComponent } from './components/header/header.component';
import { HeroComponent } from './components/hero/hero.component';
import { ToolCardComponent } from './components/tool-card/tool-card.component';

@NgModule({
  declarations: [
    HeaderComponent,
    HeroComponent,
    ToolCardComponent
  ],
  imports: [
    CommonModule,
    RouterModule
  ],
  exports: [
    HeaderComponent,
    HeroComponent,
    ToolCardComponent
  ]
})
export class SharedModule { }
