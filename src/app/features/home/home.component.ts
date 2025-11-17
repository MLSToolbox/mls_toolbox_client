import { Component } from "@angular/core";

@Component({
  selector: "app-home",
  templateUrl: "./home.component.html",
})
export class HomeComponent {
  tools = [
    {
      title: "Pipeline Code Generator",
      description:
        "Visual node-based code generator for creating ML pipelines. Build complex workflows with an intuitive drag-and-drop interface.",
      features: [
        "Drag-and-drop node editor",
        "Real-time code generation",
        "Template library for common patterns",
        "Export to production-ready code",
      ],
      routerLink: "/pipeline_generator",
      iconPath:
        "M4 5a1 1 0 011-1h4a1 1 0 011 1v7a1 1 0 01-1 1H5a1 1 0 01-1-1V5zM4 13a1 1 0 011-1h4a1 1 0 011 1v6a1 1 0 01-1 1H5a1 1 0 01-1-1v-6zM14 5a1 1 0 011-1h4a1 1 0 011 1v12a1 1 0 01-1 1h-4a1 1 0 01-1-1V5z",
    },
    {
      title: "Code Assessment",
      description:
        "Automated code quality analysis and metrics. Get instant feedback on code maintainability, complexity, and best practices.",
      features: [
        "Comprehensive code metrics",
        "SOLID principles validation",
        "Complexity analysis",
        "Detailed reports and recommendations",
      ],
      routerLink: "/assess",
      iconPath:
        "M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01",
    },
  ];
}
