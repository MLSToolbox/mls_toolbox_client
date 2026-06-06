import { NgModule } from "@angular/core";
import { CommonModule } from "@angular/common";
import { ScrollPanelModule } from "primeng/scrollpanel";
import { GraphEditorRoutingModule } from "./graph-editor-routing.module";
import { GraphComponent } from "./components/graph/graph.component";
import { GraphMenuComponent } from "./components/graph-menu/graph-menu.component";
import { GraphPropertiesComponent } from "./components/graph-properties/graph-properties.component";
import { GraphLayersComponent } from "./components/graph-layers/graph-layers.component";
import { TemplateDialogComponent } from "./components/graph-file/template-dialog/template-dialog.component";
import { ServingDialogComponent } from "./components/graph-file/serving-dialog/serving-dialog.component";
import { GraphFileComponent } from "./components/graph-file/graph-file.component";
import { CustomNodeComponent } from "./components/custom-node/custom-node.component";
import { ModelNodeComponent } from "./components/custom-node/model-node.component";
import { CustomSocketComponent } from "./components/custom-socket";
import { CustomConnectionComponent } from "./components/custom-connection/custom-connection.component";
import { FocusHandlerComponent } from "./components/focus-handler/focus-handler.component";
import { GraphEditorComponent } from "./components/graph-editor/graph-editor.component";
import { DialogModule } from "primeng/dialog";
import { AccordionModule } from "primeng/accordion";
import { TooltipModule } from "primeng/tooltip";
import { FloatLabelModule } from "primeng/floatlabel";
import { ButtonModule } from "primeng/button";
import { DropdownModule } from "primeng/dropdown";
import { SelectButtonModule } from "primeng/selectbutton";
import { InputNumberModule } from "primeng/inputnumber";
import { ReteModule } from "rete-angular-plugin/17";
import { FormsModule } from "@angular/forms";
import {SplitButtonModule} from 'primeng/splitbutton';
import { SharedModule } from "@shared/shared.module";
@NgModule({
  declarations: [
    GraphComponent,
    GraphEditorComponent,
    GraphMenuComponent,      
    GraphLayersComponent,     
    GraphPropertiesComponent, 
    GraphFileComponent,       
    TemplateDialogComponent,  
    ServingDialogComponent,
    CustomNodeComponent,      
    ModelNodeComponent,       
    CustomSocketComponent,    
    CustomConnectionComponent, 
    FocusHandlerComponent, 
],
  imports: [
    CommonModule,
    DialogModule,
    SharedModule,
    ScrollPanelModule,
    AccordionModule,
    TooltipModule,
    FloatLabelModule,
    ButtonModule,
    DropdownModule,
    SelectButtonModule,
    InputNumberModule,
    ReteModule,
    FormsModule,
    SplitButtonModule,
    GraphEditorRoutingModule
    ],
})
export class GraphEditorModule {}
