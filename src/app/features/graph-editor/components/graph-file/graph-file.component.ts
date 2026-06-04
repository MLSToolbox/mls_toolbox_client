import { Component, ViewChild, ElementRef, AfterViewInit, OnDestroy } from "@angular/core";
import { DialogService, DynamicDialogRef } from "primeng/dynamicdialog";
import { GraphEditorService } from "@app/core";
import { TemplateDialogComponent } from "./template-dialog/template-dialog.component";
import { ServiceAssignmentDashboardComponent } from "../service-assignment-dashboard/service-assignment-dashboard.component";

@Component({
  selector: "app-graph-file",
  templateUrl: "./graph-file.component.html",
  styleUrls: ["./graph-file.component.css"],
  providers: [DialogService],
})
export class GraphFileComponent implements OnDestroy {
  @ViewChild("fileInput") fileInput!: ElementRef;
  @ViewChild(ServiceAssignmentDashboardComponent) serviceDashboard?: ServiceAssignmentDashboardComponent;
  ref: DynamicDialogRef | undefined;

  showServiceDashboard: boolean = false;
  stagesForDialog: any = {};

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
      const file: File = target.files[0];
      const reader = new FileReader();
      reader.onload = () => {
        let fileContent = reader.result as string;
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

  async openServicesDashboard() {
    try {
      await this.editorService.saveCurrentModuleSnapshotToModules();

      this.stagesForDialog = { root: this.editorService.modules?.root ?? (await this.editorService.getCurrentModuleSnapshot()) };
    } catch (e) {
      this.stagesForDialog = this.editorService.modules ?? {};
    }

    this.showServiceDashboard = true;

    setTimeout(() => {
      try {
        if (!this.serviceDashboard) return;
        const removed = this.serviceDashboard.unassignAllStages();
        this.serviceDashboard.stageAssignment = new Map(this.serviceDashboard.stageAssignment);
        this.serviceDashboard.assignmentsChange.emit(Object.fromEntries(this.serviceDashboard.stageAssignment.entries()));
        if (removed > 0) {
          console.info(`Cleared ${removed} service assignment(s) when opening Service Assignment dialog.`);
        }
      } catch (err) {
        console.error("Error clearing assignments on openServicesDashboard:", err);
      }
    }, 0);
  }

  onDashboardClose() {
    this.showServiceDashboard = false;
  }

  downloadEditor() {
    this.editorService.generateJsonOfEditor();
  }

  showTemplates() {
    this.ref = this.dialogService.open(TemplateDialogComponent, {
      header: "Select a Template",
      width: "20vw",
      styleClass: "template-selection-dialog",
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
