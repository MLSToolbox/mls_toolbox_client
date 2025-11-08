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
import { AssessmentMetricsComponent } from "./components/assessment-metrics.component";

@NgModule({
  declarations: [
    // Pages
    AssessmentPageComponent,
    // Components
    AssessmentStepperComponent,
    AssessmentUploadComponent,
    AssessmentMetricsComponent
  ],
  imports: [
    CommonModule,
    HttpClientModule,
    SharedModule,
    CodeAssessmentRoutingModule,
  ],
})
export class CodeAssessmentModule {}
