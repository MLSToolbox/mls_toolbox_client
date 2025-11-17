import { NgModule } from "@angular/core";
import { CommonModule } from "@angular/common";
import { HttpClientModule } from "@angular/common/http";
import { CodeAssessmentRoutingModule } from "./code-assessment-routing.module";
import { SharedModule } from "@shared/shared.module";

// Pages
import { AssessmentPageComponent } from "./pages/assessment-page.component";

// Components
import { AssessmentStepperComponent } from "./components/assessment-stepper.component";
import { AssessmentUploadComponent } from "./components/assessment-upload.component";
import { AssessmentStructureComponent, TreeNodeComponent } from "./components/assessment-structure.component";
import { AssessmentResultsComponent } from "./components/assessment-results.component";

@NgModule({
  declarations: [
    // Pages
    AssessmentPageComponent,
    // Components
    AssessmentStepperComponent,
    AssessmentUploadComponent,
    AssessmentStructureComponent,
    TreeNodeComponent,
    AssessmentResultsComponent
  ],
  imports: [
    CommonModule,
    HttpClientModule,
    SharedModule,
    CodeAssessmentRoutingModule,
  ],
})
export class CodeAssessmentModule {}
