import { ConfigurationService } from './../configuration.service';
import { Component, EventEmitter, HostListener, OnInit, Output } from '@angular/core';
import { Subscription } from 'rxjs';
import { GraphEditorService } from '../graph-editor.service';
import { Node } from '../editor';
import { ModuleNode } from '../nodes';

import {ParamOptions} from "../dropbox.options";
import { PanelFocusService } from '../panel-focus.service';
@Component({
  selector: 'app-graph-properties',
  templateUrl: './graph-properties.component.html',
  styleUrl: './graph-properties.component.css'
})
export class GraphPropertiesComponent implements OnInit {

  @Output() propertiesClose = new EventEmitter<boolean>();

  selectedNode : string = "";
  allNode : Node | undefined;
  nodeInfo : any;
  nodeInputKeys : any;
  colors : [] = [];
  subscription : Subscription | undefined;
  moduleNodeName = "Step";
  options:any;
  options_of_options:any;
  last_selected_node : string | undefined;
  paramOptions = ParamOptions;
  nodeParamOptions : [] | any;
  stageOptions : [] | any;
  constructor(
    private data : GraphEditorService,
    private focusService : PanelFocusService,
    private configService: ConfigurationService
  ){
    this.subscription = this.data.selectedSource.subscribe(async (message) => {
      
      if (message == ""){
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
      this.allNode = await this.data.getNode(message);
      this.selectedNode = this.allNode.label;
      this.nodeInfo = this.allNode.params;
      this.nodeInputKeys = this.nodeInfo ? Object.keys(this.nodeInfo) : [];
      this.nodeParamOptions = [];
      this.options = this.configService.getAllOptions();
      this.options_of_options = this.configService.getAllOptionsOfOptions();
      this.stageOptions = this.data.getModuleOptions().filter((option: any) => option.id != this.allNode!.id);
    });
  }

  ngOnInit() {
    
  }

  ngOnChanges(): void {
    this.allNode = this.data.getNode(this.selectedNode);
    if (this.allNode == undefined) this.closeProperties();
  }

  @HostListener('mouseenter') onMouseEnter() {
    this.focusService.mouseOver(this);
  }

  keyEvent(event: KeyboardEvent){

    if (event.key === 'Escape') {
      this.closeProperties();
    }
  }

  async updateValue(key: string, value: any, field: string = "value") {
    // console.log(key, value, field)
    const inputElement = value.target as HTMLInputElement;
    // console.log(inputElement.value)
    this.allNode!.params[key][field] = inputElement.value;

    await this.allNode!.update();
    await this.data.updateNode(this.allNode!);
  }

  async updateOption(value: any, key = 'color', field = 'value') {
    this. allNode!.params[key][field] = value.value;

    await this.allNode!.update();
    await this.data.updateNode(this.allNode!);
  }

  async updateParam(key: string, value: Event) {
    const inputElement = value.target as HTMLInputElement;
    this.allNode!.params[key].param_label = inputElement.value;
    await this.allNode!.update();
    await this.data.updateNode(this.allNode!);
  }

  async updateList(key: string, event: Event, index: number) {
    const inputElement = event.target as HTMLInputElement;

    this.allNode!.params[key].value[index] = inputElement.value;
    //this.data
    await this.allNode!.update();
    //await this.data.updateNode(this.allNode!);
  }

  async updateLink(value: any){
    let target_id = value.value as string;
    if (target_id == ""){
      if (this.allNode!.params['link'].value != '') {
        this.allNode!.params['link'].value = "";
        await this.data.unlinkModule(this.allNode! as ModuleNode);
      } 
    } else {
      this.allNode!.params['link'].value = target_id;
      let result = await this.data.linkModule(this.allNode! as ModuleNode);
      if (!result){
        this.allNode!.params['link'].value = ""; // CAN'T CHAIN LINKS
      }
    }
  }

  async updateMap(key: string, key_index: string, event: Event, index: number) {
    const inputElement = event.target as HTMLInputElement;

    this.allNode!.params[key].value[index][key_index] = inputElement.value;
    await this.allNode!.update();
    await this.data.updateNode(this.allNode!);
  }

  async addItemToMap(key: string) {
    this.allNode!.params[key].value.push({key: "", value: ""});
    await this.allNode!.update();
    await this.data.updateNode(this.allNode!);
  }

  async addItemToCleaningMap(key: string) {
    // Adds one preprocessing row for external model deployment metadata.
    this.allNode!.params[key].value.push({cleaning_type: "", column: "", replacement_value: ""});
    await this.allNode!.update();
    await this.data.updateNode(this.allNode!);
  }

  async updateCleaningMap(key: string, mapKey: string, event: Event, index: number) {
    // Updates free-text fields (column/replacement_value) of one preprocessing row.
    const inputElement = event.target as HTMLInputElement;
    this.allNode!.params[key].value[index][mapKey] = inputElement.value;
    await this.allNode!.update();
    await this.data.updateNode(this.allNode!);
  }

  async updateCleaningType(key: string, value: any, index: number) {
    // Updates the selected data-cleaning type for one preprocessing row.
    this.allNode!.params[key].value[index].cleaning_type = value.value;
    await this.allNode!.update();
    await this.data.updateNode(this.allNode!);
  }

  async addItemToList(key: string) {
    this.allNode!.params[key].value.push("");
    await this.allNode!.update();
    await this.data.updateNode(this.allNode!);
  }

  async removeItemFromList(key: string, index: number) {
    this.allNode!.params[key].value.splice(index, 1);
    await this.allNode!.update();
    await this.data.updateNode(this.allNode!);
  }

  trackByFn(index: number, item: any): number {
    return index
  }

  ngOnDestroy() {
    this.subscription?.unsubscribe();
  }

  closeProperties(){
    this.propertiesClose.emit(true);
    this.data.unselectNodes();
    this.last_selected_node = "";
  }

  openProperties(){
    this.propertiesClose.emit(false);
  }

  showEditor(){
    this.data.generateJsonOfEditor();
  }

  changeEditor(){
    if (this.allNode == undefined) return;
    this.data.changeEditor(this.allNode!.id, true);
    this.closeProperties(); 
  }
  
  deleteNode(){
    if (this.allNode == undefined) return;
    this.data.deleteNode(this.allNode!.id);
  }

  getStageName(id : string){
    return this.data.getStageName(id);
  }
}
