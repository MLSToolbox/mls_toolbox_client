import { Injectable } from "@angular/core";
import { HttpClient, HttpHeaders } from "@angular/common/http";
import { Observable } from "rxjs";

export interface PrimeNGTreeNode {
  label?: string;
  data?: any;
  icon?: string;
  expandedIcon?: string;
  collapsedIcon?: string;
  children?: PrimeNGTreeNode[];
  leaf?: boolean;
  expanded?: boolean;
  type?: string;
  styleClass?: string;
  selectable?: boolean;
}

@Injectable({
  providedIn: "root",
})
export class CodeAnalysisService {
  private readonly API_URL = "/api";

  constructor(private http: HttpClient) {}

  uploadProjectZip(file: File): Observable<any> {
    const formData = new FormData();
    formData.append("file", file);

    const endpoint = `${this.API_URL}/upload-zip`;

    return this.http.post<any>(endpoint, formData);
  }

  analyzeProject(sessionId: string, analyzers: any[]): Observable<any> {
    const endpoint = `${this.API_URL}/analyze/${sessionId}`;

    const requestBody: any = {
      analyzers,
    };

    return this.http.post<any>(endpoint, requestBody, {
      headers: new HttpHeaders({
        "Content-Type": "application/json",
      }),
    });
  }

  formatFileSize(bytes: number): string {
    if (bytes === 0) return "0 Bytes";

    const k = 1024;
    const sizes = ["Bytes", "KB", "MB", "GB"];
    const i = Math.floor(Math.log(bytes) / Math.log(k));

    return Math.round((bytes / Math.pow(k, i)) * 100) / 100 + " " + sizes[i];
  }

  convertToPrimeNGTree(node: any): PrimeNGTreeNode {
    const isDirectory = node.type === "directory";

    return {
      label: node.name,
      data: {
        path: node.path,
        size: node.size,
        validSyntax: node.valid_syntax,
        type: node.type,
      },
      icon: isDirectory ? "pi pi-folder" : this.getFileIcon(node.name),
      expandedIcon: "pi pi-folder-open",
      collapsedIcon: "pi pi-folder",
      leaf: !isDirectory,
      expanded: false,
      type: node.type,
      styleClass: isDirectory ? "tree-folder" : "tree-file",
      children:
        node.children?.map((child: any) => this.convertToPrimeNGTree(child)) ||
        [],
    };
  }

  private getFileIcon(filename: string): string {
    const ext = filename.split(".").pop()?.toLowerCase();

    const iconMap: { [key: string]: string } = {
      py: "pi pi-file",
      js: "pi pi-file",
      ts: "pi pi-file",
      json: "pi pi-file",
      md: "pi pi-file",
      txt: "pi pi-file",
      yml: "pi pi-file",
      yaml: "pi pi-file",
      xml: "pi pi-file",
      html: "pi pi-file",
      css: "pi pi-file",
      scss: "pi pi-file",
    };

    return iconMap[ext || ""] || "pi pi-file";
  }
}
