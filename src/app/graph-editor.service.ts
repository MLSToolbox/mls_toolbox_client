import { ModuleNode } from './nodes';
// graph-editor.service.ts
import { Injectable } from '@angular/core';
import { Schemes, Connection, Node, getConnectionSockets} from './editor';

import { NodeEditor } from 'rete';
import { Area2D, AreaExtensions, AreaPlugin } from 'rete-area-plugin';
import { Injector } from '@angular/core'
import { AngularPlugin, AngularArea2D, Presets as AngularPresets } from 'rete-angular-plugin/17';

import { ClassicFlow, ConnectionPlugin, getSourceTarget } from 'rete-connection-plugin';

import { ConnectionPathPlugin } from "rete-connection-path-plugin";

import { MinimapExtra, MinimapPlugin } from "rete-minimap-plugin";
import { CustomNodeComponent } from './custom-node/custom-node.component';
import { CustomConnectionComponent } from './custom-connection/custom-connection.component';
import { BehaviorSubject } from 'rxjs';
import { AutoArrangePlugin, Presets as ArrangePresets } from "rete-auto-arrange-plugin";
import { saveAs } from 'file-saver';
import { addCustomBackground } from './custom-background/background';
import { CustomSocketComponent} from './custom-socket';
import { ModelNodeComponent } from './custom-node/model-node.component';
import { getBaseURL, getNewNode } from './utils';
import { ConfigurationService } from './configuration.service';

type AreaExtra = Area2D<Schemes> | AngularArea2D<Schemes>  | MinimapExtra;

export  function accumulateOnCtrl(): { active(): boolean; destroy(): void;
} { 
    function active() {
      return false;
  }

  function destroy() {
  }
  return {
    active,
    destroy
  };
};

@Injectable({
  providedIn: 'root'
})
export class GraphEditorService {
  editor  : NodeEditor<Schemes> ;
  area    : AreaPlugin<Schemes, AreaExtra> | undefined;
  minimap : MinimapPlugin<Schemes>;
  showMap : boolean = true;
  private nodeSource : BehaviorSubject<string> = new BehaviorSubject<string>("");
  private editorSource : BehaviorSubject<string> = new BehaviorSubject<string>("General Editor");
  private anyChangeSource : BehaviorSubject<string> = new BehaviorSubject<string>("");
  anyChange = this.anyChangeSource.asObservable();
  selectedSource = this.nodeSource.asObservable();
  selectedEditor = this.editorSource.asObservable();
  selector = AreaExtensions.selector();
  arrange = new AutoArrangePlugin<Schemes>();
  modules : any;
  availableTemplates : any;
  currentModule = 'root';

  constructor(private injector: Injector,
    private configService: ConfigurationService
  ) {
    this.editor = new NodeEditor<Schemes>();
    this.minimap = new MinimapPlugin<Schemes>();
    
    this.loadAvailableTemplates();
  }

  async createEditor(container: HTMLElement, injector: Injector) {
    await this.configService.waitForFetch();
    if (this.area) this.area.destroy();
    this.area = new AreaPlugin<Schemes, AreaExtra>(container);
    
    const connection = new ConnectionPlugin<Schemes, AreaExtra>();
    const angularRender = new AngularPlugin<Schemes, AreaExtra>({ injector });
    const pathPlugin = new ConnectionPathPlugin<Schemes, Area2D<Schemes>>();
    this.arrange = new AutoArrangePlugin<Schemes>();

    this.arrange.addPreset(ArrangePresets.classic.setup());

    angularRender.use(pathPlugin)
    
    this.editor.use(this.area);
    
    this.area.use(angularRender);

    this.area.use(this.minimap);
    
    const editor = this.editor;
    connection.addPreset(
      () =>
        new ClassicFlow({
          canMakeConnection(from, to) {
            // this function checks if the old connection should be removed
            const [source, target] = getSourceTarget(from, to) || [null, null];
  
            if (!source || !target || from === to) return false;
  
            const sockets = getConnectionSockets(
              editor,
              new Connection(
                editor.getNode(source.nodeId),
                source.key as never,
                editor.getNode(target.nodeId),
                target.key as never
              )
            );

            let source_node = editor.getNode(source.nodeId);
            let target_node = editor.getNode(target.nodeId);

            if (source_node.getNodeName() === "Input" && target_node.getNodeName() === "Output") {
              return false;
            }
            if (!sockets.source.isCompatibleWith(sockets.target)) {
              connection.drop();
              return false;
            }
  
            return Boolean(source && target);
          },
          makeConnection(from, to, context) {
            const [source, target] = getSourceTarget(from, to) || [null, null];
            const { editor } = context;

            if (source && target) {
              editor.addConnection(
                new Connection(
                  editor.getNode(source.nodeId),
                  source.key as never,
                  editor.getNode(target.nodeId),
                  target.key as never
                )
              );
              return true;
            }
            return false; // Add this line
          },
        })
    );
    
    this.area.use(connection);
    
    this.area.use(this.arrange);
    
    AreaExtensions.simpleNodesOrder(this.area);

    AreaExtensions.restrictor(this.area, {
      scaling: () => ({ min: 0.3, max: 3 }),
    });

    addCustomBackground(this.area);
    
    angularRender.addPreset(AngularPresets.classic.setup(
      {
        customize: {
          node(data) {
            if (data.payload instanceof ModuleNode) return ModelNodeComponent;
            return CustomNodeComponent;
          },
          socket() {
            return CustomSocketComponent;
          },
          connection() {
            return CustomConnectionComponent;
          },
        }
      }
    ));

    angularRender.addPreset(AngularPresets.minimap.setup({ size: 200 }));
    
    this.area.addPipe(
      context => {
        if (context.type == "nodedragged"){
          this.selectNode(context.data.id);
        }
        return context;
      }
    )

    await this.getBaseEditor();
  }

  setEditor(editor: NodeEditor<Schemes>) {
    this.editor = editor;
  }

  async zoomIn() {
    if(!this.editor) return;
    if(!this.area) return;
    // get current zoom
    let zoom: number = this.area.area.transform.k;
    zoom = zoom + .1;
    await this.area.area.zoom(zoom);
  }

  async zoomOut() {
    if(!this.editor) return;
    if(!this.area) return;
    // get current zoom
    let zoom: number = this.area.area.transform.k;
    if (zoom <= 0.2) return;
    zoom = zoom - .1;
    await this.area.area.zoom(zoom);
  }

  async homeZoom() {
    if(!this.area) return;
    AreaExtensions.zoomAt(this.area, this.editor.getNodes());
  }

  async addNode(nodeName: string, nodeId?: string, nodeData?: any){
    this.anyChangeSource.next("Node added");
    if(!this.editor) return;
    if(!this.area) return;

    let node = getNewNode(nodeName, this.configService.getNode(nodeName));
    if (!node) {
      console.log("Node not found");
      return;
    }
    if (nodeId) {
      node.id = nodeId;
    }
    if (nodeName === "Step") {
      if (!this.modules[node.id]){
        this.modules[node.id] = {
            'nodes' : [],
            'connections' : [],
            'inputs' : [],
            'outputs' : [],
        };
      }

    }



    if (nodeData) {
      node.setData(nodeData);
    }


    await node.update();

    // console.log(node)

    await this.editor.addNode(node);
    let centerOfScreen = this.area.area.pointer;
    await this.area.nodeViews.get(node.id)?.translate(centerOfScreen.x, centerOfScreen.y);
    await this.area.nodeViews.get(node.id)?.resize(node.width, node.height);

  }

  getAvailableNodes() {
    return this.configService.getAvailableNodes();
  }

  getModuleOptions() {
    let availableNames = [{
      "name" : "None",
      "id" : ""
    }];
    for (let module in this.modules) {
      if (module == "root") continue;
      let nodes = this.modules["root"].nodes;
      for (let node in nodes) {
        let isLinked = nodes[node].data.params["link"];
        if ((isLinked != undefined) && (isLinked.value != "")) continue;
        if (nodes[node].id == module){
          availableNames.push({
            "name" : nodes[node].data.params["Stage name"].value,
            "id" : nodes[node].id
          });
        }
      }
    }


    return availableNames;
  }

  selectNode(nodeId : string) {
    this.nodeSource.next(nodeId);
  }

  getNode(id : string) : Node {
    return this.editor.getNode(id);
  }

  getStageName(id : string){
    for (let module in this.modules["root"].nodes) {
      if (this.modules["root"].nodes[module].id == id) {
        return this.modules["root"].nodes[module].data.params["Stage name"].value
      }
    }
    return "";
  }

  async deleteNode(id: string) {

    const connections = await this.editor.getConnections();
    for (const element of connections) {
      if (element.source == id || element.target == id)
        await this.editor.removeConnection(element.id);
    }
    await this.editor.removeNode(id);
    
    const nodes = await this.editor.getNodes();
    for (const node of nodes){
      if (node instanceof ModuleNode){
        const m_node = node as ModuleNode;
        if (m_node.params.link.value) {
          const value = m_node.params.link.value;
          if (value == id){
            const connections = await this.editor.getConnections();
            for (const element of connections){
              if (element.source == m_node.id || element.target == m_node.id)
                await this.editor.removeConnection(element.id);
            }
            await this.editor.removeNode(m_node.id);
          } 
        }
      }
    }

    this.anyChangeSource.next("Node deleted");
    this.nodeSource.next("");
  }

  unselectNodes() {
    this.selector.unselectAll();
  }
  
  async arrangeNodes() {
    await this.arrange.layout();
  }

  generateJsonOfEditor() {
    // console.log("Generating JSON of editor");
    let nodes = [];
    let connections = [];
    let inputs = [];
    let outputs = [];

    for (let node of this.editor.getNodes()) {
      nodes.push({
        id: node.id,
        data: node.data(),
        name: node.label,
        nodeName: node.getNodeName(),
      });
    }
    for (let c of this.editor.getConnections()) {
      connections.push({
        source: c.source,
        sourceOutput: c.sourceOutput,
        target: c.target,
        targetInput: c.targetInput
      });
    }
    for (let input of this.findInputs()) {
      inputs.push({
        id: input.id,
        data: input.data(),
      });
    }
    for (let output of this.findOutputs()) {
      outputs.push({
        id: output.id,
        data: output.data(),
      });
    }
    
    this.modules[this.currentModule] = {
      nodes: nodes,
      connections: connections,
      inputs: inputs,
      outputs: outputs,
    };


    this.cleanModules();

    var blob = new Blob([JSON.stringify({modules: this.modules}, null, 2)], {type: "text/plain;charset=utf-8"});
    saveAs(blob, "mls_pipeline.json");
    
  }

  cleanModules() {
    let allNodesIds = [];
    for (let module in this.modules) {
      let nodes = this.modules[module].nodes;
      for (let node of nodes) {
        allNodesIds.push(node.id);
      }
    }

    for (let module in this.modules) {
      if (!(allNodesIds.includes(module)) && !(module === 'root')) {
        delete this.modules[module];
      }
    }
    this.anyChangeSource.next("Modules cleaned");
  }

  async updateNode(node: Node) {
    if (node.nodeName === "Input" || "Output") {
      // TODO USING INHERITANCE
    }

    await this.removeDanglingConnections();
    
    await this.area?.update("node", node.id);
    await this.area?.nodeViews.get(node.id)?.resize(node.width, node.height);
    
    const nodes = await this.editor.getNodes();
    for (const linked_node of nodes){
      if (linked_node instanceof ModuleNode){
        let m_node = linked_node as ModuleNode;
        if (m_node.params.link.value) {
          const value = m_node.params.link.value;
          if (value == node.id){
            m_node.color = node.color
            this.updateNode(m_node);
          } 
        }
      }
    }

    this.anyChangeSource.next("Node updated");
  }

  private async removeDanglingConnections() {
    const connections = await this.editor.getConnections();

    for (const connection of connections) {
      const sourceNode = this.editor.getNode(connection.source);
      const targetNode = this.editor.getNode(connection.target);

      const hasSourceOutput = Boolean(sourceNode && connection.sourceOutput in sourceNode.outputs);
      const hasTargetInput = Boolean(targetNode && connection.targetInput in targetNode.inputs);

      if (!hasSourceOutput || !hasTargetInput) {
        await this.editor.removeConnection(connection.id);
      }
    }
  }

  async getNodeModule(nodeId : string) {
    for (const module of Object.keys(this.modules)){
      if (module == "root") continue;
      const nodes_of_module = this.modules[module].nodes;
      for (const node of nodes_of_module){
        if (node.id == nodeId){
          return module;
        }
      }
    }
    return ""
  }

  findInputs() {
    let nodes = this.editor.getNodes();
    let inputNodes = [];
    for (let node of nodes) {
      if (node.getNodeName() === "Input") {
        inputNodes.push(node);
      }
    }
    return inputNodes;
  }

  findOutputs(){
    let nodes = this.editor.getNodes();
    let outputNodes = [];
    for (let node of nodes) {
      if (node.getNodeName() === "Output") {
        outputNodes.push(node);
      }
    }
    return outputNodes;
  }

  async loadEditor(json: any) {
    await this.cleanEditor();
    this.modules = json["modules"];
    await this.changeEditor("root", false);
  }

  async cleanEditor() {
    await this.editor.clear();
    this.modules = {
      "root": {
        "nodes": [],
        "connections": [],
      }
    }
    let node = new ModuleNode();
    node.id = "root";
    await this.changeEditor(node.id, false);
  }

  getModuleTag(moduleId: string) : string {
    for (const nodes of this.modules["root"]["nodes"]){
      if (nodes.id == moduleId) {
          return nodes.data.params["Stage name"].value;
      }
    }
    return "General Editor"
  }

  async linkModule(linked_node: ModuleNode) : Promise<boolean>{

    let origin_id = linked_node.params.link.value;

    const nodes = await this.editor.getNodes();
    for (const node of nodes){
      if (node instanceof ModuleNode){
        const m_node = node as ModuleNode;
        if (m_node.params.link.value && m_node.id == origin_id)
          return false;
      }
    }


    for (let c of this.editor.getConnections()) {
      if (c.source == linked_node.id || c.target == linked_node.id) {
        await this.editor.removeConnection(c.id);
      }
    }


    delete this.modules[linked_node.id];
    for (let node of this.modules['root'].nodes) {
      if (node.id != origin_id) continue;
      linked_node.params['Stage name'].value = node.data.params['Stage name'].value + "*";
      linked_node.params['color'].value = node.data.params['color'].value;
      let real_node = await this.editor.getNode(node.id) as ModuleNode;
      linked_node.color = real_node.color;
      let inputs = this.modules[node.id].inputs;
      let outputs = this.modules[node.id].outputs;
      let inputStrings: [string, string][] = [];
      let outputStrings: [string, string][] = [];
      for (let input of inputs) {
        inputStrings.push([input.data.params.key.value, input.data.params.type.value]);
      }
      for (let output of outputs) {
        outputStrings.push([output.data.params.key.value, output.data.params.type.value]);
      }
      
      linked_node.syncPorts(inputStrings, outputStrings);
      await this.updateNode(linked_node);
    }
    return true;
  }

  async unlinkModule(unlinked_node: ModuleNode) {
    this.modules[unlinked_node.id] = {
      'nodes' : [],
      'connections' : [],
      'inputs' : [],
      'outputs' : [],
    };
      let inputStrings: [string, string][] = [];
      let outputStrings: [string, string][] = [];
      const connections = await this.editor.getConnections();
      
      for (const element of connections){
        if (element.source == unlinked_node.id || element.target == unlinked_node.id)
          await this.editor.removeConnection(element.id);
      }

      unlinked_node.syncPorts(inputStrings, outputStrings);
      await this.updateNode(unlinked_node);
  }

  private async clearEditor(){
      let nodes = [];
      let connections = [];
      let inputs = [];
      let outputs = [];
  
      for (let node of this.editor.getNodes()) {
        nodes.push({
          id: node.id,
          data: node.data(),
          name: node.label,
          nodeName: node.getNodeName(),
        });
      }
      for (let c of this.editor.getConnections()) {
        connections.push({
          source: c.source,
          sourceOutput: c.sourceOutput,
          target: c.target,
          targetInput: c.targetInput
        });
      }
      for (let input of this.findInputs()) {
        inputs.push({
          id: input.id,
          data: input.data(),
        });
      }
      for (let output of this.findOutputs()) {
        outputs.push({
          id: output.id,
          data: output.data(),
        });
      }
  
      this.modules[this.currentModule] = {
        nodes: nodes,
        connections: connections,
        inputs: inputs,
        outputs: outputs,
      };
  
      await this.editor.clear();
      const editor_connections = await this.editor.getConnections();
      for (const element of editor_connections) {
          this.editor.removeConnection(element.id);
      }
  }

  async changeEditor(targetModuleId: string, clear?: boolean) {
    if ((targetModuleId != 'root') && this.currentModule == targetModuleId) return;


    if (clear) await this.clearEditor();

    this.nodeSource.next("");

    this.currentModule = targetModuleId;

    // console.log(this.modules[this.currentModule]);

    for (let node of this.modules[this.currentModule].nodes) {
      await this.addNode(node.nodeName, node.id, node.data);
      if (node.nodeName === "Step") {
        let nodeModule = await this.editor.getNode(node.id) as ModuleNode;
        if (node.data.params.link && node.data.params.link.value != "") {
          continue;
        }
        // console.log(this.modules[node.id]);
        let inputs = this.modules[node.id].inputs;
        let outputs = this.modules[node.id].outputs;
        let inputStrings: [string, string][] = [];
        let outputStrings: [string, string][] = [];
        for (let input of inputs) {
          inputStrings.push([input.data.params.key.value, input.data.params.type.value]);
        }
        for (let output of outputs) {
          outputStrings.push([output.data.params.key.value, output.data.params.type.value]);
        }
        
        nodeModule.syncPorts(inputStrings, outputStrings);
        await this.updateNode(nodeModule);
      }
    }

    // console.log(this.modules[this.currentModule]);

    for (let node of this.modules[this.currentModule].nodes) {
      if (node.nodeName === "Step") {
        if (node.data.params.link && node.data.params.link.value != "") {
          let nodeModule = await this.editor.getNode(node.id) as ModuleNode;
          await this.linkModule(nodeModule);
          await this.updateNode(nodeModule);
          continue;
        }
      }
    }
    for (let connection of this.modules[this.currentModule].connections) {
        try{
        let sourceNode = await this.editor.getNode(connection.source);
        let targetNode = await this.editor.getNode(connection.target);
        if (!sourceNode || !targetNode) continue;
        await this.editor.addConnection(new Connection(sourceNode, connection.sourceOutput as never, targetNode, connection.targetInput as never));
      }
      catch (e) {
        console.log("Error", e);
      }
    }

    await this.arrangeNodes();
    await this.homeZoom();

    this.cleanModules();
    this.anyChangeSource.next("Editor changed");

    this.editorSource.next(this.getModuleTag(targetModuleId))
  }

  async generateAndDownloadCode() {

    // console.log("Generating JSON of editor");
    let nodes = [];
    let connections = [];
    let inputs = [];
    let outputs = [];

    for (let node of this.editor.getNodes()) {
      nodes.push({
        id: node.id,
        data: node.data(),
        name: node.label,
        nodeName: node.getNodeName(),
      });
    }
    for (let c of this.editor.getConnections()) {
      connections.push({
        source: c.source,
        sourceOutput: c.sourceOutput,
        target: c.target,
        targetInput: c.targetInput
      });
    }
    for (let input of this.findInputs()) {
      inputs.push({
        id: input.id,
        data: input.data(),
      });
    }
    for (let output of this.findOutputs()) {
      outputs.push({
        id: output.id,
        data: output.data(),
      });
    }
    
    this.modules[this.currentModule] = {
      nodes: nodes,
      connections: connections,
      inputs: inputs,
      outputs: outputs,
    };

    this.cleanModules();
    const body: string = JSON.stringify(
      {
        code : {modules: this.modules},
        nodes : this.configService.getNodes()
      }
    );
    
    const response = await fetch(getBaseURL('/api/create_app'), { // FIXME: Hardcoded URL
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          // CORS disable
          'Access-Control-Allow-Origin': '*',
        },
        body: body,
    });

    // console.log("Response", response);

    if (!response.ok) {
      throw new Error('Network response was not ok');
    }
    const blob = await response.blob();
    saveAs(blob, "app_pipeline.zip");
  }
  
  async getBaseEditor() {
    const response = await fetch(getBaseURL('/api/get_base_editor'), { // FIXME: Hardcoded URL
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        // CORS disable
        'Access-Control-Allow-Origin': '*',
        },
    });

    if (!response.ok) {
      throw new Error('Network response was not ok');
    }
    const json = await response.json();
    
    // console.log(json);
    
    this.loadEditor(json);
  }

  async loadAvailableTemplates() {
    const response = await fetch(getBaseURL('/api/get_available_editor'), { // FIXME: Hardcoded URL
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        // CORS disable
        'Access-Control-Allow-Origin': '*',
        },
    });

    if (!response.ok) {
      throw new Error('Network response was not ok');
    }
    const json = await response.json();
    this.availableTemplates =  json["editors"];
    
    // console.log(this.availableTemplates);
  }

  getAvailableTemplates(): any {
    return this.availableTemplates;
  }

  async loadTemplate(path : string) {
    const response = await fetch(getBaseURL('/api/get_editor'), { // FIXME: Hardcoded URL
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        // CORS disable
        'Access-Control-Allow-Origin': '*',
        },
        body: path
    });

    if (!response.ok) {
      throw new Error('Network response was not ok');
    }
    this.changeEditor("root", true);

    const json = await response.json();
    
    // console.log(json);
    
    this.loadEditor(json);
  }
}
