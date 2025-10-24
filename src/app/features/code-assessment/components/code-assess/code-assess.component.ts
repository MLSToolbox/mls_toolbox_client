import { Component } from "@angular/core";
import { MessageService } from "primeng/api";

@Component({
  selector: "app-code-assess",
  templateUrl: "./code-assess.component.html",
  styleUrl: "./code-assess.component.css",
})
export class CodeAssessComponent {
  // Sidebar state
  sidebarOpen = false;

  constructor(private messageService: MessageService) {}

  // Toggle sidebar (para móviles)
  toggleSidebar() {
    this.sidebarOpen = !this.sidebarOpen;
  }
}
