import { Component, OnInit } from "@angular/core";
import { GraphEditorService } from "@app/core";
import { DynamicDialogRef } from "primeng/dynamicdialog";

@Component({
  selector: "app-template-dialog",
  templateUrl: "./template-dialog.component.html",
  styleUrl: "./template-dialog.component.css",
})
export class TemplateDialogComponent implements OnInit {
  availableTemplates: any[] = [];

  constructor(
    public editorService: GraphEditorService,
    private ref: DynamicDialogRef
  ) {}

  ngOnInit(): void {
    this.availableTemplates = this.editorService.getAvailableTemplates();
  }

  close(path: string) {
    this.ref.close(path);
  }

  cancel() {
    this.ref.close();
  }
}
