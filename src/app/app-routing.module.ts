import { NgModule } from "@angular/core";
import { RouterModule, Routes } from "@angular/router";

const routes: Routes = [
  {
    path: "",
    redirectTo: "/home",
    pathMatch: "full",
    runGuardsAndResolvers: "always",
  },
  {
    path: "home",
    loadChildren: () =>
      import("./features/home/home.module").then((m) => m.HomeModule),
  },
  {
    path: "pipeline_generator",
    loadChildren: () =>
      import("./features/graph-editor/graph-editor.module").then(
        (m) => m.GraphEditorModule
      ),
  },
  {
    path: "assess",
    loadChildren: () =>
      import("./features/code-assessment/code-assessment.module").then(
        (m) => m.CodeAssessmentModule
      ),
  },
];

@NgModule({
  imports: [RouterModule.forRoot(routes, { onSameUrlNavigation: "reload" })],
  exports: [RouterModule],
})
export class AppRoutingModule {}
