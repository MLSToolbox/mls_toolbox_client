import { NgModule } from "@angular/core";
import { CommonModule } from "@angular/common";
import { RouterModule } from "@angular/router";
import { SmallHeaderComponent } from "./components/small-header/small-header.component";
import { HeaderComponent } from "./components/header/header.component";
import { FeatureButtonComponent } from "./components/feature-button/feature-button.component";
import { ToolHeaderComponent } from "./components/tool-header/tool-header.component";
import { ButtonModule } from "primeng/button";

@NgModule({
  declarations: [
    SmallHeaderComponent,
    HeaderComponent,
    FeatureButtonComponent,
    ToolHeaderComponent
  ],
  imports: [
    CommonModule, 
    RouterModule,
    ButtonModule
  ],
  exports: [
    SmallHeaderComponent,
    HeaderComponent,
    FeatureButtonComponent,
    ToolHeaderComponent
  ],
})
export class SharedModule {}
