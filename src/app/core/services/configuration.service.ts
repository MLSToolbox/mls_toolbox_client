import { Injectable } from "@angular/core";
import { BehaviorSubject } from "rxjs";
import { environment } from "environment/environment";

@Injectable({
  providedIn: "root",
})
export class ConfigurationService {
  options: any;
  options_of_options: any;
  nodes: any;
  sockets: any;
  semaphor: BehaviorSubject<boolean> = new BehaviorSubject<boolean>(false);

  constructor() {
    this.initClass();
  }

  async initClass() {
    const url = `${environment.apiUrl}`;

    try {
      const response = await fetch(url, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          "Access-Control-Allow-Origin": "*",
        },
        signal: AbortSignal.timeout(environment.apiTimeout),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const json = await response.json();

      this.options = json["options"]["options"];
      this.options_of_options = json["options"]["option_of_options"];
      this.nodes = json["nodes"]["nodes"];
      this.sockets = json["sockets"];

      this.semaphor.next(true);
      this.semaphor.complete();
    } catch (error) {
      console.error("Error loading configuration:", error);
      // TODO: Implement proper error handling
      throw error;
    }
  }

  getNode(key: string) {
    for (let i = 0; i < this.nodes.length; i++) {
      if (this.nodes[i]["node"] == key) return this.nodes[i];
    }
    return {};
  }

  getAvailableNodes() {
    let result: Map<string, string[]> = new Map();
    for (let i = 0; i < this.nodes.length; i++) {
      let node_cat = this.nodes[i].category;
      result.set(node_cat, []);
    }
    for (let i = 0; i < this.nodes.length; i++) {
      let node_cat = this.nodes[i].category;
      result.get(node_cat)?.push(this.nodes[i]["node"]);
    }

    return result;
  }

  getSocket(key: string) {
    if (key in this.sockets) return this.sockets[key];
    return {};
  }

  getNodes() {
    return this.nodes;
  }

  waitForFetch(): Promise<void> {
    if (this.semaphor.getValue() === true) return Promise.resolve();
    return new Promise((resolve) => {
      this.semaphor.subscribe((value) => {
        if (value === true) {
          resolve();
        }
      });
    });
  }
}
