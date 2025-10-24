import { NgModule } from "@angular/core";
import { BrowserModule } from "@angular/platform-browser";
import { BrowserAnimationsModule } from "@angular/platform-browser/animations";
import { provideAnimationsAsync } from "@angular/platform-browser/animations/async";
import { HttpClientModule } from "@angular/common/http";
import { AppRoutingModule } from "./app-routing.module";
import { AppComponent } from "./app.component";
import { SharedModule } from "./shared/shared.module";
import { AccordionModule } from "primeng/accordion";
import { TooltipModule } from "primeng/tooltip";
import { InputTextModule } from "primeng/inputtext";
import { ScrollPanelModule } from "primeng/scrollpanel";
import { SplitButtonModule } from "primeng/splitbutton";
import { TableModule } from "primeng/table";
import { KnobModule } from "primeng/knob";
import { DynamicDialogModule } from "primeng/dynamicdialog";
import { ToastModule } from "primeng/toast";
import { MessageService } from "primeng/api";

@NgModule({
  declarations: [AppComponent],
  imports: [
    BrowserModule,
    HttpClientModule,
    AppRoutingModule,
    BrowserAnimationsModule,
    SharedModule,
    AccordionModule,
    TooltipModule,
    InputTextModule,
    ScrollPanelModule,
    SplitButtonModule,
    TableModule,
    KnobModule,
    DynamicDialogModule,
    ToastModule,
  ],
  providers: [provideAnimationsAsync(), MessageService],
  bootstrap: [AppComponent],
})
export class AppModule {}
