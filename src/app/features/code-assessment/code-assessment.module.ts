import { NgModule } from "@angular/core";
import { CommonModule } from "@angular/common";
import { FormsModule } from "@angular/forms";
import { HttpClientModule } from "@angular/common/http";
import { CodeAssessmentRoutingModule } from "./code-assessment-routing.module";
import { SharedModule } from "@shared/shared.module";

// Pages
import { AssessmentPageComponent } from "./pages/assessment-page.component";

// Components
import { AssessmentStepperComponent } from "./components/assessment-stepper.component";
import { AssessmentUploadComponent } from "./components/assessment-upload.component";
import { AssessmentStructureComponent, TreeNodeComponent } from "./components/assessment-structure.component";
import { AssessmentResultsV2Component } from "./components/assessment-results-v2.component";
import { AssessmentResultsFinalComponent, TreeNodeClickableComponent } from "./components/assessment-results-final.component";

@NgModule({
  declarations: [
    // Pages
    AssessmentPageComponent,
    // Components
    AssessmentStepperComponent,
    AssessmentUploadComponent,
    AssessmentStructureComponent,
    TreeNodeComponent,
    AssessmentResultsV2Component,
    AssessmentResultsFinalComponent,
    TreeNodeClickableComponent
  ],
  imports: [
    CommonModule,
    FormsModule,
    HttpClientModule,
    SharedModule,
    CodeAssessmentRoutingModule,
  ],
})
export class CodeAssessmentModule { }

