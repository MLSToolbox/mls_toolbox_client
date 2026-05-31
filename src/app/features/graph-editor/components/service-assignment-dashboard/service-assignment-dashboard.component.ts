import { Component, EventEmitter, Input, OnChanges, OnInit, Output, SimpleChanges } from "@angular/core";

@Component({
  selector: "app-service-assignment-dashboard",
  templateUrl: "./service-assignment-dashboard.component.html",
  styleUrls: ["./service-assignment-dashboard.component.css"],
})
export class ServiceAssignmentDashboardComponent implements OnInit, OnChanges {
  @Input() stages: any;
  @Output() close = new EventEmitter<void>();

  stageArray: Array<{
    id: string;
    label: string;
    color?: string;
    depth?: number;
    row?: number;
    x?: number;
    y?: number;
  }> = [];

  ngOnInit(): void {
    this.stages = this.stages ?? {};
    this.updateStageArray();
    console.log("ServiceAssignmentDashboard - ngOnInit stages received:", this.stages);
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes["stages"]) {
      this.stages = changes["stages"].currentValue ?? {};
      this.updateStageArray();
      console.log("ServiceAssignmentDashboard - ngOnChanges stages:", this.stages);
    }
  }

  private updateStageArray(): void {
    this.stageArray = this.toStageArray(this.stages);
  }

  /** Checklist del que he implementat fins ara
   * Converteix l'entrada a un array enriquit amb depth i row.
   * Implementa un Kahn layering (BFS per nivells) robust:
   * - tolera nodes en array o object
   * - construeix adjacency i incoming counts a partir de connections
   * - assigna depth (nivell X) mitjançant Kahn
   * - agrupa per depth i assigna row (index en profunditat)
   * - calcula x/y simples (si s'utilitzen directament en la vista)
   * - detecta cicles i aplica heuristic safe fallback
   */
  private toStageArray(stages: any): Array<{
    id: string;
    label: string;
    color?: string;
    depth?: number;
    row?: number;
    x?: number;
    y?: number;
  }> {
    if (!stages) return [];

    let rawNodes: any[] = [];
    let rawConnections: any[] = [];

    try {
      if (stages["root"]) {
        const root = stages["root"];
        if (Array.isArray(root.nodes)) rawNodes = root.nodes;
        else if (typeof root.nodes === "object" && root.nodes !== null)
          rawNodes = Array.isArray(Object.values(root.nodes)) ? Object.values(root.nodes) : [];
        rawConnections = Array.isArray(root.connections) ? root.connections : [];
      } else if (Array.isArray(stages)) {
        rawNodes = stages;
        rawConnections = [];
      } else if (typeof stages === "object") {
        rawNodes = Object.values(stages);
        rawConnections = [];
      }
    } catch (e) {
      rawNodes = [];
      rawConnections = [];
    }

    const nodesById: Map<string, any> = new Map();
    for (const n of rawNodes) {
      const id = n?.id ?? n?.key ?? String(Math.random());
      nodesById.set(id, n);
    }

    const adjacency: Map<string, string[]> = new Map();
    const incoming: Map<string, number> = new Map();

    for (const id of nodesById.keys()) {
      adjacency.set(id, []);
      incoming.set(id, 0);
    }

    for (const c of rawConnections) {
      const src = c?.source ?? c?.from ?? c?.src;
      const dst = c?.target ?? c?.to ?? c?.dst;
      if (!src || !dst) continue;
      if (!adjacency.has(src)) adjacency.set(src, []);
      adjacency.get(src)!.push(dst);
      incoming.set(dst, (incoming.get(dst) ?? 0) + 1);
      if (!nodesById.has(src)) nodesById.set(src, { id: src, name: src });
      if (!nodesById.has(dst)) nodesById.set(dst, { id: dst, name: dst });
      if (!incoming.has(src)) incoming.set(src, incoming.get(src) ?? 0);
      if (!adjacency.has(dst)) adjacency.set(dst, adjacency.get(dst) ?? []);
    }

    const queue: string[] = [];
    const depthMap: Map<string, number> = new Map();
    for (const [id, cnt] of incoming.entries()) {
      if (cnt === 0) {
        queue.push(id);
        depthMap.set(id, 0);
      }
    }

    const processed: string[] = [];
    while (queue.length > 0) {
      const nodeId = queue.shift()!;
      processed.push(nodeId);
      const nodeDepth = depthMap.get(nodeId) ?? 0;
      const neigh = adjacency.get(nodeId) ?? [];
      for (const childId of neigh) {
        const prev = incoming.get(childId) ?? 0;
        incoming.set(childId, prev - 1);
        const candidateDepth = nodeDepth + 1;
        if (!depthMap.has(childId)) depthMap.set(childId, candidateDepth);
        else depthMap.set(childId, Math.min(depthMap.get(childId)!, candidateDepth));
        if ((incoming.get(childId) ?? 0) === 0) {
          queue.push(childId);
        }
      }
    }

    if (processed.length < nodesById.size) {
      const unprocessed: string[] = [];
      for (const id of nodesById.keys()) {
        if (!processed.includes(id)) unprocessed.push(id);
      }
      let maxDepth = 0;
      for (const d of depthMap.values()) if (d > maxDepth) maxDepth = d;
      for (let i = 0; i < unprocessed.length; i++) {
        depthMap.set(unprocessed[i], maxDepth + 1 + i);
      }
    }

    const depthBuckets: Map<number, string[]> = new Map();
    for (const id of nodesById.keys()) {
      const d = depthMap.get(id) ?? 0;
      if (!depthBuckets.has(d)) depthBuckets.set(d, []);
      depthBuckets.get(d)!.push(id);
    }

    const depthsSorted = Array.from(depthBuckets.keys()).sort((a, b) => a - b);

    const nodeWidth = 160;
    const nodeHeight = 48;
    const gapX = 48;
    const gapY = 12;
    const marginLeft = 12;
    const marginTop = 12;

    const result: Array<{
      id: string;
      label: string;
      color?: string;
      depth?: number;
      row?: number;
      x?: number;
      y?: number;
    }> = [];

    for (const d of depthsSorted) {
      const bucket = depthBuckets.get(d) ?? [];
      for (let idx = 0; idx < bucket.length; idx++) {
        const id = bucket[idx];
        const entry = nodesById.get(id) ?? {};
        const stageName =
          entry?.data?.params?.["Stage name"]?.value ??
          entry?.data?.params?.stageName?.value ??
          entry?.name ??
          entry?.label ??
          id;
        const color =
          entry?.data?.params?.color?.value ??
          entry?.params?.color?.value ??
          entry?.color ??
          entry?.data?.color ??
          undefined;

        const x = marginLeft + d * (nodeWidth + gapX);
        const y = marginTop + idx * (nodeHeight + gapY);

        result.push({
          id,
          label: String(stageName),
          color: color ?? undefined,
          depth: d,
          row: idx,
          x,
          y,
        });
      }
    }

    return result;
  }

  trackByStage(_: number, item: { id: string }) {
    return item.id;
  }

  closeDialog(): void {
    this.close.emit();
  }
}
