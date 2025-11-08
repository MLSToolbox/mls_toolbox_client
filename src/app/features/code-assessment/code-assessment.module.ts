import { NgModule } from "@angular/core";
import { CommonModule } from "@angular/common";
import { HttpClientModule } from "@angular/common/http";
import { CodeAssessmentRoutingModule } from "./code-assessment-routing.module";
import { SharedModule } from "@shared/shared.module";

// Pages
import { AssessmentPageComponent } from "./pages/assessment-page/assessment-page.component";

// Components
import { UploadZoneComponent } from "./components/upload-zone/upload-zone.component";
import { MetricCardComponent } from "./components/metric-card/metric-card.component";
import { ProgressStepsComponent } from "./components/progress-steps/progress-steps.component";
import { InfoCardComponent } from "./components/info-card/info-card.component";
import { ResultsSidebarComponent } from "./components/results-sidebar/results-sidebar.component";
import { ResultsContentComponent } from "./components/results-content/results-content.component";
import { ResultCardComponent } from "./components/result-card/result-card.component";

@NgModule({
  declarations: [
    AssessmentPageComponent,
    UploadZoneComponent,
    MetricCardComponent,
    ProgressStepsComponent,
    InfoCardComponent,
    ResultsSidebarComponent,
    ResultsContentComponent,
    ResultCardComponent
  ],
  imports: [
    CommonModule,
    HttpClientModule,
    SharedModule,
    CodeAssessmentRoutingModule,
  ],
})
export class CodeAssessmentModule {}
