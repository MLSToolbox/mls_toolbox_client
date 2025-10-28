import {
  Component,
  EventEmitter,
  HostListener,
  OnInit,
  Output,
} from "@angular/core";
import {
  GraphEditorService,
} from "@app/core";
import { Subscription } from "rxjs";
import { Node } from "../../editor";
import { ModuleNode } from "../../models/nodes";
import { ParamOptions } from "../../dropbox.options";

@Component({
  selector: "app-graph-properties",
  templateUrl: "./graph-properties.component.html",
  styleUrl: "./graph-properties.component.css",
})
export class GraphPropertiesComponent implements OnInit {
  @Output() propertiesClose = new EventEmitter<boolean>();

  selectedNode: string = "";
  allNode: Node | undefined;
  nodeInfo: any;
  nodeInputKeys: any;
  colors: [] = [];
  subscription: Subscription | undefined;
  moduleNodeName = "Step";
  options: any;
  options_of_options: any;
  last_selected_node: string | undefined;
  paramOptions = ParamOptions;
  nodeParamOptions: [] | any;
  stageOptions: [] | any;
  constructor(
    private editorService: GraphEditorService
  ) {
    this.subscription = this.editorService.selectedSource.subscribe(async (message) => {
      if (message == "") {
        this.allNode = undefined;
        this.selectedNode = "";
        this.nodeInfo = undefined;
        this.nodeInputKeys = undefined;
        this.nodeParamOptions = [];
        this.last_selected_node = "";
        this.closeProperties();
        return;
      }
      if (message == this.last_selected_node) return;
      this.last_selected_node = message;
      this.openProperties();
      this.allNode = await this.editorService.getNodeById(message);
      this.selectedNode = this.allNode.label;
      this.nodeInfo = this.allNode.params;
      this.nodeInputKeys = this.nodeInfo ? Object.keys(this.nodeInfo) : [];
      this.nodeParamOptions = [];
      this.options = this.editorService.options;
      this.options_of_options = this.editorService.options_of_options;
      this.stageOptions = this.editorService
        .getModuleOptions()
        .filter((option: any) => option.id != this.allNode!.id);
    });
  }

  ngOnInit() {}

  ngOnChanges(): void {
    this.allNode = this.editorService.getNodeById(this.selectedNode);
    if (this.allNode == undefined) this.closeProperties();
  }

  @HostListener("mouseenter") onMouseEnter() {
    this.editorService.mouseOver(this);
  }

  keyEvent(event: KeyboardEvent) {
    if (event.key === "Escape") {
      this.closeProperties();
    }
  }

  async updateValue(key: string, value: any, field: string = "value") {
    // console.log(key, value, field)
    const inputElement = value.target as HTMLInputElement;
    // console.log(inputElement.value)
    this.allNode!.params[key][field] = inputElement.value;

    await this.allNode!.update();
    await this.editorService.updateNode(this.allNode!);
  }

  async updateOption(value: any, key = "color", field = "value") {
    this.allNode!.params[key][field] = value.value;

    await this.allNode!.update();
    await this.editorService.updateNode(this.allNode!);
  }

  async updateParam(key: string, value: Event) {
    const inputElement = value.target as HTMLInputElement;
    this.allNode!.params[key].param_label = inputElement.value;
    await this.allNode!.update();
    await this.editorService.updateNode(this.allNode!);
  }

  async updateList(key: string, event: Event, index: number) {
    const inputElement = event.target as HTMLInputElement;

    this.allNode!.params[key].value[index] = inputElement.value;
    //this.editorService
    await this.allNode!.update();
    //await this.editorService.updateNode(this.allNode!);
  }

  async updateLink(value: any) {
    let target_id = value.value as string;
    if (target_id == "") {
      if (this.allNode!.params["link"].value != "") {
        this.allNode!.params["link"].value = "";
        await this.editorService.unlinkModule(this.allNode! as ModuleNode);
      }
    } else {
      this.allNode!.params["link"].value = target_id;
      let result = await this.editorService.linkModule(this.allNode! as ModuleNode);
      if (!result) {
        this.allNode!.params["link"].value = ""; // CAN'T CHAIN LINKS
      }
    }
  }

  async updateMap(key: string, key_index: string, event: Event, index: number) {
    const inputElement = event.target as HTMLInputElement;

    this.allNode!.params[key].value[index][key_index] = inputElement.value;
    await this.allNode!.update();
    await this.editorService.updateNode(this.allNode!);
  }

  async addItemToMap(key: string) {
    this.allNode!.params[key].value.push({ key: "", value: "" });
    await this.allNode!.update();
    await this.editorService.updateNode(this.allNode!);
  }

  async addItemToList(key: string) {
    this.allNode!.params[key].value.push("");
    await this.allNode!.update();
    await this.editorService.updateNode(this.allNode!);
  }

  async removeItemFromList(key: string, index: number) {
    this.allNode!.params[key].value.splice(index, 1);
    await this.allNode!.update();
    await this.editorService.updateNode(this.allNode!);
  }

  trackByFn(index: number, item: any): number {
    return index;
  }

  ngOnDestroy() {
    this.subscription?.unsubscribe();
  }

  closeProperties() {
    this.propertiesClose.emit(true);
    this.editorService.unselectNodes();
    this.last_selected_node = "";
  }

  openProperties() {
    this.propertiesClose.emit(false);
  }

  showEditor() {
    this.editorService.generateJsonOfEditor();
  }

  changeEditor() {
    if (this.allNode == undefined) return;
    this.editorService.changeEditor(this.allNode!.id, true);
    this.closeProperties();
  }

  deleteNode() {
    if (this.allNode == undefined) return;
    this.editorService.deleteNode(this.allNode!.id);
  }

  getStageName(id: string) {
    return this.editorService.getStageName(id);
  }
}
