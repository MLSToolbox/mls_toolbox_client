import { Component, ElementRef, ViewChild } from "@angular/core";
import { DialogService, DynamicDialogRef } from "primeng/dynamicdialog";
import { GraphEditorService } from "@app/core";
import { TemplateDialogComponent } from "./template-dialog/template-dialog.component";

@Component({
  selector: "app-graph-file",
  templateUrl: "./graph-file.component.html",
  styleUrl: "./graph-file.component.css",
  providers: [DialogService],
})
export class GraphFileComponent {
  @ViewChild("fileInput") fileInput!: ElementRef;
  ref: DynamicDialogRef | undefined;

  constructor(
    public editorService: GraphEditorService,
    public dialogService: DialogService
  ) {}

  async importPipeline() {
    this.fileInput.nativeElement.click();
  }

  onFileSelected(event: Event) {
    const target = event.target as HTMLInputElement;
    if (target.files && target.files.length > 0) {
      const file: File = target.files[0]; // Get the first file
      const reader = new FileReader();
      reader.onload = () => {
        let fileContent = reader.result as string;
        // Execute your code here
        this.processFileContent(fileContent);
      };
      reader.readAsText(file);
      target.value = "";
    }
  }

  async processFileContent(content: string) {
    await this.clearEditor();
    await this.editorService.loadEditor(JSON.parse(content));
  }

  async clearEditor() {
    await this.editorService.cleanEditor();
    await this.editorService.homeZoom();
    await this.editorService.arrangeNodes();
  }

  generateCode() {
    this.editorService.generateAndDownloadCode();
  }

  downloadEditor() {
    this.editorService.generateJsonOfEditor();
  }

  showTemplates() {
    this.ref = this.dialogService.open(TemplateDialogComponent, {
      header: "Select a Template",
      width: "20vw",
      styleClass: "template-selection-dialog", // Added custom class for styling
      contentStyle: { overflow: "auto" },
      breakpoints: {
        "960px": "75vw",
        "640px": "90vw",
      },
    });

    this.ref.onClose.subscribe(async (path: string) => {
      if (path) {
        await this.editorService.loadTemplate(path);
      }
    });
  }

  ngOnDestroy() {
    if (this.ref) {
      this.ref.close();
    }
  }
}
