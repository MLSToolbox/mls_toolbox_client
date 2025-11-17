import { NgModule } from "@angular/core";
import { RouterModule, Routes } from "@angular/router";
import { AssessmentPageComponent } from "./pages/assessment-page.component";

const routes: Routes = [
  {
    path: '',
    component: AssessmentPageComponent
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class CodeAssessmentRoutingModule {}
