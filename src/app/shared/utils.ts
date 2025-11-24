import { isDevMode } from "@angular/core";
import {
  Node,
  ModuleNode,
  CustomNode,
  InputNode,
  OutputNode,
  CustomSocket,
} from "@features/graph-editor";

export function getNewNode(nodeName: string, config?: any): Node | undefined {
  let node: Node;
  if (nodeName === "Step") node = new ModuleNode();
  else if (nodeName === "Input") node = new InputNode();
  else if (nodeName === "Output") node = new OutputNode();
  else {
    if (!config["category"]) return;
    node = new CustomNode(nodeName, config);
  }
  return node;
}

export function getSocket(socketName: string): CustomSocket {
  return new CustomSocket(socketName);
}

export function getColorFromCategory(category: string): string {
  const saturation = 0.3;
  const value = 0.7;
  // create random number using the category as seed
  let seed = 0;
  for (let i = 0; i < category.length; i++) {
    seed += category.charCodeAt(i);
    seed *= category.charCodeAt(i);
    seed ^= category.charCodeAt(i);
    seed %= 10000;
  }
  let random = (seed % 100) / 100;
  return `hsl(${random * 360}, ${saturation * 100}%, ${value * 100}%)`;
}

export function getBaseURL(suffix = ""): string {
  if (isDevMode()) {
    return "http://localhost:5000" + suffix;
  }

  return "https://gessi.cs.upc.edu:1446" + suffix;
}
