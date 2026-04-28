import {
  Component,
  ElementRef,
  HostListener,
  Injector,
  OnDestroy,
  OnInit,
  ViewChild,
} from "@angular/core";
import { MenuItem } from "primeng/api";
import { Subscription } from "rxjs";

import { GraphEditorService } from "../../services/graph-editor.service";
import { ModuleNode } from "../../models/nodes";
import { Node } from "../../editor";

const beforeUnloadHandler = (event: {
  preventDefault: () => void;
  returnValue: boolean;
}) => {
  event.preventDefault();
  event.returnValue = true;
};

@Component({
  selector: "app-graph-editor",
  templateUrl: "./graph-editor.component.html",
  styleUrl: "./graph-editor.component.css",
})
export class GraphEditorComponent implements OnInit, OnDestroy {
  @ViewChild("rete") container!: ElementRef<HTMLElement>;
  showMap: boolean = true;
  configErrorMessage: string | null = null;
  moduleImIn: string = "General Editor";
  showConfirmArrange: boolean = false;
  subscription: Subscription;
  allNode: Node | undefined;
  copyNode: Node | undefined;
  subscriptionNode: Subscription;
  configErrorSubscription: Subscription;
  items: MenuItem[];
  last_selected_node: string = "";
  constructor(
    private injector: Injector,
    private editorService: GraphEditorService
  ) {
    window.addEventListener("beforeunload", beforeUnloadHandler);

    this.subscription = this.editorService.selectedEditor.subscribe(
      (message: any) => {
        this.moduleImIn = message;
      }
    );

    this.subscriptionNode = this.editorService.selectedSource.subscribe(
      (message: any) => {
        if (message == "") {
          this.allNode = undefined;
          this.last_selected_node = "";
          return;
        }

        if (message == this.last_selected_node) return;
        this.last_selected_node = message;
        this.allNode = this.editorService.getNodeById(message);
      }
    );

    this.configErrorSubscription = this.editorService.configError.subscribe((message) => {
      this.configErrorMessage = message;
    });

    this.items = [];
  }

  async ngOnInit() {
    try {
      await this.editorService.waitForFetch();
      const availableNodes = this.editorService.getAvailableNodes();
      for (const value of availableNodes.keys()) {
        let items = [];
        for (const item of availableNodes.get(value)!) {
          items.push({
            label: item,
            command: () => {
              this.editorService.addNode(item);
            },
          });
        }
        this.items.push({
          label: value,
          items,
        });
      }
    } catch (error) {
      this.configErrorMessage =
        error instanceof Error ? error.message : String(error);
    }
  }

  async ngAfterViewInit() {
    try {
      await this.editorService.createEditor(
        this.container.nativeElement,
        this.injector
      );
      await this.editorService.homeZoom();
    } catch (error) {
      this.configErrorMessage =
        error instanceof Error ? error.message : String(error);
    }
  }

  ngOnDestroy() {
    window.removeEventListener("beforeunload", beforeUnloadHandler);
    this.subscription.unsubscribe();
    this.subscriptionNode.unsubscribe();
    this.configErrorSubscription.unsubscribe();
  }

  save(severity: string) {
    // console.log(severity);
  }

  addStage() {
    this.editorService.addNode("Step");
  }

  @HostListener("mouseenter") onMouseEnter() {
    this.editorService.mouseOver(this);
  }

  async keyEvent(event: KeyboardEvent) {
    if (event.key === "Delete" && this.allNode) this.deleteNode();

    if (event.key === "c" && event.ctrlKey && this.allNode)
      this.copyNode = this.allNode;

    if (event.key === "x" && event.ctrlKey && this.allNode) {
      this.copyNode = this.allNode;
      this.deleteNode();
    }

    if (event.key === "v" && event.ctrlKey && this.copyNode) {
      this.editorService.addNode(
        this.copyNode.getNodeName(),
        undefined,
        JSON.parse(JSON.stringify(this.copyNode.data()))
      );
      this.copyNode = undefined;
    }
  }

  async zoomIn() {
    await this.editorService.zoomIn();
  }

  async zoomOut() {
    await this.editorService.zoomOut();
  }

  async homeZoom() {
    await this.editorService.homeZoom();
  }

  async toggleMap() {
    this.showMap = !this.showMap;
    if (this.showMap) {
      this.container.nativeElement.classList.remove("hide-minimap");
    } else {
      this.container.nativeElement.classList.add("hide-minimap");
    }
  }

  async arrangeNodes() {
    await this.editorService.arrangeNodes();
  }

  backToRoot() {
    let node = new ModuleNode();
    node.id = "root";
    node.setName("General Editor");
    this.editorService.changeEditor(node.id, true);
  }

  deleteNode() {
    this.editorService.deleteNode(this.allNode!.id);
    this.allNode = undefined;
  }
}
