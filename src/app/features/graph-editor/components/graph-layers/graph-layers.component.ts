import { Subscription } from "rxjs";
import { Component, HostListener } from "@angular/core";
import { GraphEditorService } from "@app/core";

@Component({
  selector: "app-graph-layers",
  templateUrl: "./graph-layers.component.html",
  styleUrl: "./graph-layers.component.css",
})
export class GraphLayersComponent {
  allModules: any;
  modulesKeys: any;
  modulesNames: any;
  modulesColors: any;
  modulesCollapsed: any;
  subscription: Subscription | undefined;
  constructor(
    private editorService: GraphEditorService
  ) {
    this.allModules = editorService.modules;
  }

  ngOnInit(): void {
    this.subscription = this.editorService.anyChange.subscribe((message) => {
      this.allModules = {};
      this.modulesKeys = [];
      this.modulesNames = {};
      this.modulesCollapsed = {};
      this.allModules = this.editorService.modules;
      let moduleIds = Object.keys(this.allModules);
      // delete root from modulesKeys
      moduleIds.splice(moduleIds.indexOf("root"), 1);
      this.modulesKeys = moduleIds;
      this.modulesNames = {};
      this.modulesColors = {};
      for (let module in moduleIds) {
        for (let node of this.allModules["root"].nodes) {
          if (node.id == moduleIds[module]) {
            this.modulesNames[moduleIds[module]] =
              node.data.params["Stage name"].value;
            this.modulesColors[moduleIds[module]] =
              node.data.params["color"].value;
            this.modulesCollapsed[moduleIds[module]] = false;
          }
        }
      }
    });
  }

  @HostListener("mouseenter") onMouseEnter() {
    this.editorService.mouseOver(this);
  }

  keyEvent(event: KeyboardEvent) {
    // console.log("Event handled from graph layers: " + event.key);
  }

  toggleModule(module: string) {
    // console.log("Toggling module: " + module);
    this.editorService.changeEditor(module, true);
  }

  async toggleNode(node: any) {
    // console.log("Toggling node: " + node.name);
    await this.editorService.changeEditor(
      await this.editorService.getNodeModule(node.id),
      true
    );
    this.editorService.selectNode(node.id);
    // console.log(this.allModules);
  }
}
