import { Component, HostListener } from "@angular/core";
import { GraphEditorService } from "@app/core";

@Component({
  selector: "app-focus-handler",
  templateUrl: "./focus-handler.component.html",
  styleUrl: "./focus-handler.component.css",
})
export class FocusHandlerComponent {
  constructor(private editorService: GraphEditorService) {}

  @HostListener("document:keyup", ["$event"])
  keyEvent(event: KeyboardEvent) {
    this.editorService.keyUp(event);
  }
}
