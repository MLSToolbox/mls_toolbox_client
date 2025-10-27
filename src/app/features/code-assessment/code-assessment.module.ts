import { NgModule } from "@angular/core";
import { CommonModule } from "@angular/common";
import { HttpClientModule } from "@angular/common/http";
import { CodeAssessmentRoutingModule } from "./code-assessment-routing.module";
import { CodeAssessComponent } from "./components/code-assess/code-assess.component";

import { CodeAssessSidebarComponent } from "./components/code-assess-sidebar/code-assess-sidebar.component";
import { CodeAssessHeaderComponent } from "./components/code-assess-header/code-assess-header.component";
import { CodeAssessContentComponent } from "./components/code-assess-content/code-assess-content.component";
import { CodeAssessHeroComponent } from "./components/code-assess-content/code-assess-hero/code-assess-hero.component";
import { CodeAssessAnalysisFormComponent } from "./components/code-assess-content/code-assess-analysis-form/code-assess-analysis-form.component";
import { CodeAssessExplorerComponent } from "./components/code-assess-content/code-assess-explorer/code-assess-explorer.component";
import { KnobModule } from "primeng/knob";
import { TableModule } from "primeng/table";
import { TreeModule } from "primeng/tree";
import { FormsModule } from "@angular/forms";
import { ButtonModule } from "primeng/button";
import { SharedModule } from "@app/shared/shared.module";

@NgModule({
  declarations: [
    CodeAssessComponent,         
    CodeAssessSidebarComponent,
    CodeAssessHeaderComponent,
    CodeAssessContentComponent,
    CodeAssessHeroComponent,
    CodeAssessAnalysisFormComponent,
    CodeAssessExplorerComponent,
  ],
  imports: [
    CommonModule,
    HttpClientModule,
    SharedModule,
    FormsModule,
    ButtonModule,
    KnobModule,
    TableModule,
    TreeModule,
    CodeAssessmentRoutingModule
  ],
})
export class CodeAssessmentModule {}
