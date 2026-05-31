import { NgModule, ErrorHandler } from "@angular/core";
import { BrowserModule } from "@angular/platform-browser";
import { BrowserAnimationsModule } from "@angular/platform-browser/animations";
import { provideAnimationsAsync } from "@angular/platform-browser/animations/async";
import { HttpClientModule, HTTP_INTERCEPTORS } from "@angular/common/http";
import { provideHttpClient } from "@angular/common/http";
import { TooltipModule } from "primeng/tooltip";
import { AccordionModule } from "primeng/accordion";
import { InputTextModule } from "primeng/inputtext";
import { ScrollPanelModule } from "primeng/scrollpanel";
import { SplitButtonModule } from "primeng/splitbutton";
import { TableModule } from "primeng/table";
import { KnobModule } from "primeng/knob";
import { DynamicDialogModule, DialogService } from "primeng/dynamicdialog";
import { ToastModule } from "primeng/toast";
import { MessageService } from "primeng/api";

import { AppRoutingModule } from "./app-routing.module";
import { AppComponent } from "./app.component";
import { SharedModule } from "./shared/shared.module";
import { LoggingInterceptor } from "./core/interceptors/logging.interceptor";
import { GlobalErrorHandler } from "./core/interceptors/global-error-handler";

@NgModule({
  declarations: [
    AppComponent,
  ],
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
  providers: [
    provideAnimationsAsync(), 
    provideHttpClient(), 
    MessageService,
    DialogService,
    // HTTP Interceptor for logging all requests/responses
    {
      provide: HTTP_INTERCEPTORS,
      useClass: LoggingInterceptor,
      multi: true
    },
    // Global Error Handler
    {
      provide: ErrorHandler,
      useClass: GlobalErrorHandler
    }
  ],
  bootstrap: [AppComponent],
})
export class AppModule {}
