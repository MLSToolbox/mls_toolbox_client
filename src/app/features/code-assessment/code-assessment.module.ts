import { NgModule } from "@angular/core";
import { CommonModule } from "@angular/common";
import { HttpClientModule } from "@angular/common/http";
import { CodeAssessmentRoutingModule } from "./code-assessment-routing.module";
import { KnobModule } from "primeng/knob";
import { TableModule } from "primeng/table";
import { TreeModule } from "primeng/tree";
import { FormsModule } from "@angular/forms";
import { ButtonModule } from "primeng/button";

@NgModule({
  declarations: [],
  imports: [
    CommonModule,
    HttpClientModule,
    FormsModule,
    ButtonModule,
    KnobModule,
    TableModule,
    TreeModule,
    CodeAssessmentRoutingModule,
  ],
})
export class CodeAssessmentModule {}
