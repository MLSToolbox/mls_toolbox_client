import {
  Component,
  EventEmitter,
  Input,
  OnChanges,
  OnInit,
  AfterViewInit,
  OnDestroy,
  Output,
  SimpleChanges,
  ChangeDetectorRef,
  ElementRef,
  NgZone
} from "@angular/core";
import { HttpClient } from "@angular/common/http";
import { GraphEditorService } from "../../services/graph-editor.service"; // ruta RELATIVA correcta
import { MessageService } from 'primeng/api';

@Component({
  selector: "app-service-assignment-dashboard",
  templateUrl: "./service-assignment-dashboard.component.html",
  styleUrls: ["./service-assignment-dashboard.component.css"],
})
export class ServiceAssignmentDashboardComponent implements OnInit, OnChanges, AfterViewInit, OnDestroy {
  @Input() stages: any;
  @Output() close = new EventEmitter<void>();
  @Output() assignmentsChange = new EventEmitter<Record<string, string | null>>();

  private windowMousedownListener: (e: MouseEvent) => void;

  stageArray: Array<{
    id: string;
    label: string;
    color?: string;
    depth?: number | null;
    row?: number;
    x?: number;
    y?: number;
  }> = [];

  depthColumns: Array<{
    depth: number;
    nodes: Array<{
      id: string;
      label: string;
      color?: string;
      depth?: number;
      row?: number;
      x?: number;
      y?: number;
    }>;
  }> = [];

  unassignedStageArray: Array<{ id: string; label: string; color?: string }> = [];

  services: Array<{ id: string; color: string }> = [
    { id: "sv1", color: "#e6194b" },
    { id: "sv2", color: "#3cb44b" },
    { id: "sv3", color: "#ffe119" },
    { id: "sv4", color: "#4363d8" },
    { id: "sv5", color: "#f58231" },
    { id: "sv6", color: "#911eb4" },
    { id: "sv7", color: "#42d4f4" },
    { id: "sv8", color: "#f032e6" },
    { id: "sv9", color: "#bfef45" },
    { id: "sv10", color: "#469990" },
  ];

  stageAssignment: Map<string, string | null> = new Map();
  private predecessorMap: Map<string, string[]> = new Map();
  private successorMap: Map<string, string[]> = new Map();
  public editingStageId: string | null = null;
  public editingValue: string = "";
  private stageColorOverride: Map<string, string | undefined> = new Map();

  constructor(
    private cdr: ChangeDetectorRef,
    private elRef: ElementRef,
    private ngZone: NgZone,
    private http: HttpClient,
    private editorService: GraphEditorService,
    private messageService: MessageService
  ) {
    this.windowMousedownListener = (ev: MouseEvent) => {
      const target = ev.target as HTMLElement | null;
      if (!target) return;

      if (
        !this.elRef.nativeElement.contains(target) &&
        !document.querySelector(".service-assignment-dialog")?.contains(target)
      )
        return;

      const editBtn = target.closest(".service-edit-btn") as HTMLElement | null;
      if (editBtn) {
        ev.stopPropagation();
        let stageId = editBtn.getAttribute("data-stage") ?? undefined;

        if (!stageId) {
          const wrapper = editBtn.closest(".stage-wrapper");
          if (wrapper) {
            const stageEl = wrapper.querySelector('[data-stage]');
            if (stageEl) stageId = (stageEl as HTMLElement).getAttribute("data-stage") ?? undefined;
          }
        }

        if (!stageId) {
          const nearby = editBtn.closest(".assign-actions") as HTMLElement | null;
          if (nearby) {
            const anyStage = nearby.querySelector('[data-stage]');
            if (anyStage) stageId = (anyStage as HTMLElement).getAttribute("data-stage") ?? undefined;
          }
        }

        if (!stageId) return;
        this.ngZone.run(() => this.startEdit(stageId));
        return;
      }

      const confirmBtn = target.closest(".confirm-btn") as HTMLElement | null;
      if (confirmBtn) {
        ev.stopPropagation();
        this.ngZone.run(() => {
          // si confirmAndGenerate es async, no hace falta await aquí
          try {
            (this as any).confirmAndGenerate?.();
          } catch (e) {
            // silent fallback
          }
        });
        return;
      }

      const cancelBtn = target.closest(".service-cancel-btn") as HTMLElement | null;
      if (cancelBtn) {
        ev.stopPropagation();
        this.ngZone.run(() => this.cancelEdit());
        return;
      }

      const plus = target.closest(".plus-btn") as HTMLElement | null;
      if (plus) {
        ev.stopPropagation();
        const stageId = plus.getAttribute("data-stage");
        const optId = plus.getAttribute("data-opt-id");
        const optNew = plus.getAttribute("data-opt-new") === "1";
        if (!stageId || !optId) return;
        this.ngZone.run(() => {
          let toAssign = optId;
          if (optNew) {
            const free = this.getFirstFreeServiceId();
            toAssign = free ?? optId;
          }
          this.assignService(stageId, toAssign);
        });
        return;
      }

      const minus = target.closest(".minus-btn") as HTMLElement | null;
      if (minus) {
        ev.stopPropagation();
        const stageId = minus.getAttribute("data-stage");
        if (!stageId) return;
        this.ngZone.run(() => {
          if (this.canShowMinus(stageId)) this.assignService(stageId, null);
        });
        return;
      }
    };
  }

  ngOnInit(): void {
    this.stages = this.stages ?? {};
    this.updateStageArray();
    this.initAssignments();
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes["stages"]) {
      this.stages = changes["stages"].currentValue ?? {};
      this.updateStageArray();
      for (const s of this.stageArray) {
        if (!this.stageAssignment.has(s.id)) this.stageAssignment.set(s.id, null);
      }
    }
  }

  ngAfterViewInit(): void {
    window.addEventListener("mousedown", this.windowMousedownListener, true);
  }

  ngOnDestroy(): void {
    window.removeEventListener("mousedown", this.windowMousedownListener, true);
  }

  private initAssignments(): void {
    this.stageAssignment.clear();
    for (const s of this.stageArray) this.stageAssignment.set(s.id, null);
    this.buildGraphMaps();
    this.emitAssignments();
  }

  private updateStageArray(): void {
    const flat = this.toStageArray(this.stages);
    this.stageArray = flat.map((n) => ({
      id: n.id,
      label: n.label,
      color: n.color,
      depth: n.depth ?? null,
      row: n.row,
      x: n.x,
      y: n.y,
    }));

    const assigned = flat.filter((n) => typeof n.depth === "number");
    const unassigned = flat.filter((n) => n.depth === undefined || n.depth === null);

    const buckets: Map<number, typeof assigned> = new Map();
    for (const node of assigned) {
      const d = node.depth!;
      if (!buckets.has(d)) buckets.set(d, []);
      buckets.get(d)!.push(node);
    }

    const depthsSorted = Array.from(buckets.keys()).sort((a, b) => a - b);
    this.depthColumns = depthsSorted.map((d) => ({
      depth: d,
      nodes: (buckets.get(d) ?? []).sort((a, b) => (a.row ?? 0) - (b.row ?? 0)),
    }));

    this.unassignedStageArray = unassigned.map((n) => ({ id: n.id, label: n.label, color: n.color }));
    this.buildGraphMaps();
  }

  private buildGraphMaps(): void {
    this.predecessorMap.clear();
    this.successorMap.clear();

    let rawConnections: any[] = [];
    try {
      if (this.stages["root"]) {
        rawConnections = Array.isArray(this.stages["root"].connections) ? this.stages["root"].connections : [];
      }
    } catch {
      rawConnections = [];
    }

    for (const s of this.stageArray) {
      this.predecessorMap.set(s.id, []);
      this.successorMap.set(s.id, []);
    }
    for (const c of rawConnections) {
      const src = c?.source ?? c?.from ?? c?.src;
      const dst = c?.target ?? c?.to ?? c?.dst;
      if (!src || !dst) continue;
      if (!this.successorMap.has(src)) this.successorMap.set(src, []);
      if (!this.predecessorMap.has(dst)) this.predecessorMap.set(dst, []);
      this.successorMap.get(src)!.push(dst);
      this.predecessorMap.get(dst)!.push(src);
      if (!this.predecessorMap.has(src)) this.predecessorMap.set(src, []);
      if (!this.successorMap.has(dst)) this.successorMap.set(dst, []);
    }
  }

  private getPredecessorIds(stageId: string): string[] {
    return this.predecessorMap.get(stageId) ?? [];
  }

  private getSuccessorIds(stageId: string): string[] {
    return this.successorMap.get(stageId) ?? [];
  }

  private neighborServiceSet(stageId: string, side: "left" | "right"): Set<string | null> {
    const ids = side === "left" ? this.getPredecessorIds(stageId) : this.getSuccessorIds(stageId);
    const s = new Set<string | null>();
    for (const id of ids) s.add(this.stageAssignment.get(id) ?? null);
    return s;
  }

  getPlusOptions(stageId: string): Array<{ id: string; color: string; isNew?: boolean }> {
    const leftSet = this.neighborServiceSet(stageId, "left");
    const rightSet = this.neighborServiceSet(stageId, "right");

    const onlyLeftSingle = leftSet.size === 1 && !leftSet.has(undefined) && !leftSet.has(null);
    const onlyRightSingle = rightSet.size === 1 && !rightSet.has(undefined) && !rightSet.has(null);
    if (onlyLeftSingle && onlyRightSingle) {
      const leftVal = Array.from(leftSet)[0];
      const rightVal = Array.from(rightSet)[0];
      if (leftVal === rightVal && leftVal !== null) return [];
    }

    const servicesSet = new Set<string>();
    for (const id of this.getPredecessorIds(stageId).concat(this.getSuccessorIds(stageId))) {
      const srv = this.stageAssignment.get(id) ?? null;
      if (srv) servicesSet.add(srv);
    }

    const current = this.getAssignedService(stageId);
    if (current) servicesSet.delete(current);

    const options: Array<{ id: string, color: string, isNew?: boolean }> = [];
    for (const sId of Array.from(servicesSet)) {
      const s = this.services.find((x) => x.id === sId);
      if (s) options.push({ id: s.id, color: s.color });
    }

    const free = this.getFirstFreeServiceId();
    if (free) {
      const s = this.services.find((x) => x.id === free)!;
      options.push({ id: s.id, color: s.color, isNew: true });
    }

    return options;
  }

  canShowPlus(stageId: string): boolean {
    return this.getPlusOptions(stageId).length > 0;
  }

  canShowMinus(stageId: string): boolean {
    const cur = this.getAssignedService(stageId);
    if (!cur) return false;
    const leftServices = this.neighborServiceSet(stageId, "left");
    const rightServices = this.neighborServiceSet(stageId, "right");
    const leftHasSame = Array.from(leftServices).some((s) => s === cur);
    const rightHasSame = Array.from(rightServices).some((s) => s === cur);
    if (leftHasSame && rightHasSame) return false;
    return true;
  }

  assignService(stageId: string, serviceId: string | null): void {
    this.stageAssignment.set(stageId, serviceId);
    this.stageAssignment = new Map(this.stageAssignment);
    this.buildGraphMaps();
    this.cdr.detectChanges();
    this.emitAssignments();
  }

  getAssignedService(stageId: string): string | null {
    return this.stageAssignment.get(stageId) ?? null;
  }

  getPillColor(stageId: string, serviceId: string | null | undefined): string | undefined {
    if (!serviceId) return undefined;
    const s = this.services.find((x) => x.id === serviceId);
    if (s) return s.color;
    return this.stageColorOverride.get(stageId);
  }

  getServiceColor(serviceId: string | null | undefined): string | undefined {
    if (!serviceId) return undefined;
    const s = this.services.find((x) => x.id === serviceId);
    return s ? s.color : undefined;
  }

  private getFirstFreeServiceId(): string | null {
    const used = new Set(Array.from(this.stageAssignment.values()).filter((v): v is string => !!v));
    const free = this.services.find((s) => !used.has(s.id));
    return free ? free.id : null;
  }

  startEdit(stageId: string): void {
    const cur = this.getAssignedService(stageId) ?? "";
    this.editingStageId = stageId;
    this.editingValue = String(cur).slice(0, 10);
    this.stageColorOverride.set(stageId, this.getServiceColor(cur) ?? undefined);

    setTimeout(() => {
      try {
        const selector = `.service-edit-input[data-stage="${stageId}"]`;
        const el = this.elRef.nativeElement.querySelector(selector) as HTMLElement | null;
        if (el && typeof el.focus === "function") el.focus();
      } catch (e) {
        // silent
      }
    }, 0);
  }

  cancelEdit(): void {
    this.editingStageId = null;
    this.editingValue = "";
  }

  confirmEdit(stageId: string): void {
    const raw = String(this.editingValue ?? "").trim().slice(0, 10);
    const newId = raw.length > 0 ? raw : null;

    const prevId = this.getAssignedService(stageId);

    if (prevId === newId) {
      this.editingStageId = null;
      this.editingValue = "";
      return;
    }

    if (!newId) {
      this.assignService(stageId, null);
      this.editingStageId = null;
      this.editingValue = "";
      return;
    }

    const collision = this.services.find((s) => s.id === newId);
    if (collision && collision.id !== prevId) {
      alert(`Service id "${newId}" already exists. Choose a different id.`);
      return;
    }

    const svc = this.services.find((s) => s.id === prevId);
    if (svc) {
      svc.id = newId;
    } else {
      const color = this.stageColorOverride.get(stageId) ?? "#777777";
      this.services.push({ id: newId, color });
    }

    for (const [k, v] of Array.from(this.stageAssignment.entries())) {
      if (v === prevId) {
        this.stageAssignment.set(k, newId);
      }
    }

    this.stageAssignment = new Map(this.stageAssignment);
    this.buildGraphMaps();

    setTimeout(() => this.cdr.detectChanges(), 0);

    this.emitAssignments();

    this.editingStageId = null;
    this.editingValue = "";
  }

  onServiceLabelBlur(stageId: string, ev: Event): void {
    const el = ev.target as HTMLElement;
    const raw = el.innerText?.trim() ?? "";
    if (/^sv\d+$/.test(raw)) {
      const exists = this.services.some((x) => x.id === raw);
      if (exists) this.assignService(stageId, raw);
      else el.innerText = this.getAssignedService(stageId) ?? "";
    } else {
      const prev = this.getAssignedService(stageId) ?? "";
      el.innerText = prev;
    }
  }

  private emitAssignments(): void {
    const obj: Record<string, string | null> = {};
    for (const [k, v] of this.stageAssignment.entries()) obj[k] = v ?? null;
    this.assignmentsChange.emit(obj);
  }

  private toStageArray(stages: any): Array<any> {
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
      } else if (typeof stages === "object") {
        rawNodes = Object.values(stages);
      }
    } catch {
      // ignore
    }

    const nodesById: Map<string, any> = new Map();
    for (const n of rawNodes) nodesById.set(n?.id ?? n?.key ?? String(Math.random()), n);

    const adjacency: Map<string, string[]> = new Map();
    const originalIncoming: Map<string, number> = new Map();
    const outDegree: Map<string, number> = new Map();

    for (const id of nodesById.keys()) {
      adjacency.set(id, []);
      originalIncoming.set(id, 0);
      outDegree.set(id, 0);
    }

    for (const c of rawConnections) {
      const src = c?.source ?? c?.from ?? c?.src;
      const dst = c?.target ?? c?.to ?? c?.dst;
      if (!src || !dst) continue;
      if (!adjacency.has(src)) adjacency.set(src, []);
      adjacency.get(src)!.push(dst);
      originalIncoming.set(dst, (originalIncoming.get(dst) ?? 0) + 1);
      outDegree.set(src, (outDegree.get(src) ?? 0) + 1);
      if (!nodesById.has(src)) {
        nodesById.set(src, { id: src, name: src });
        originalIncoming.set(src, 0);
        outDegree.set(src, 1);
      }
      if (!nodesById.has(dst)) {
        nodesById.set(dst, { id: dst, name: dst });
        originalIncoming.set(dst, 1);
        outDegree.set(dst, 0);
      }
      if (!adjacency.has(dst)) adjacency.set(dst, []);
    }

    const workingIncoming: Map<string, number> = new Map();
    for (const [k, v] of originalIncoming.entries()) workingIncoming.set(k, v);

    const queue: string[] = [];
    for (const [id, cnt] of workingIncoming.entries()) if (cnt === 0) queue.push(id);

    const processed: string[] = [];
    while (queue.length > 0) {
      const nodeId = queue.shift()!;
      processed.push(nodeId);
      for (const childId of adjacency.get(nodeId) ?? []) {
        workingIncoming.set(childId, (workingIncoming.get(childId) ?? 0) - 1);
        if (workingIncoming.get(childId) === 0) queue.push(childId);
      }
    }

    if (processed.length < nodesById.size) {
      for (const id of nodesById.keys()) if (!processed.includes(id)) processed.push(id);
    }

    const longest: Map<string, number> = new Map();
    for (const id of nodesById.keys()) longest.set(id, 0);

    for (const id of processed) {
      const curLen = longest.get(id) ?? 0;
      for (const nb of adjacency.get(id) ?? []) {
        if ((longest.get(nb) ?? 0) < curLen + 1) longest.set(nb, curLen + 1);
      }
    }

    const depthMap: Map<string, number> = new Map();
    for (const [id, len] of longest.entries()) depthMap.set(id, len);

    const depthBuckets: Map<number, string[]> = new Map();
    const isolatedIds: string[] = [];
    for (const id of nodesById.keys()) {
      if ((outDegree.get(id) ?? 0) === 0 && (originalIncoming.get(id) ?? 0) === 0) {
        isolatedIds.push(id);
        continue;
      }
      const d = depthMap.get(id) ?? 0;
      if (!depthBuckets.has(d)) depthBuckets.set(d, []);
      depthBuckets.get(d)!.push(id);
    }

    const depthsSorted = Array.from(depthBuckets.keys()).sort((a, b) => a - b);
    const result: any[] = [];
    for (const d of depthsSorted) {
      const bucket = depthBuckets.get(d) ?? [];
      bucket.sort((a, b) => ((originalIncoming.get(b) ?? 0) - (originalIncoming.get(a) ?? 0)) || a.localeCompare(b));
      for (let idx = 0; idx < bucket.length; idx++) {
        const id = bucket[idx];
        const entry = nodesById.get(id) ?? {};
        const stageName = entry?.data?.params?.["Stage name"]?.value ?? entry?.name ?? id;
        const color = entry?.data?.params?.color?.value ?? undefined;
        result.push({ id, label: String(stageName), color, depth: d, row: idx });
      }
    }

    for (const id of isolatedIds) {
      const entry = nodesById.get(id) ?? {};
      const stageName = entry?.data?.params?.["Stage name"]?.value ?? entry?.name ?? id;
      result.push({ id, label: String(stageName), color: entry?.data?.params?.color?.value, depth: null, row: 0 });
    }
    return result;
  }

  trackByStage(_: number, item: { id: string }) {
    return item.id;
  }

  closeDialog(): void {
    this.close.emit();
  }

  public hackClickPlus(event: any, stageId: string, optId: string, isNew: boolean): void {
      event.preventDefault();
      event.stopPropagation();
      
      console.warn("HACK CLICK FUNCIONA! Stage:", stageId, "Servei:", optId);

      let toAssign = optId;
      if (isNew) {
        const free = this.getFirstFreeServiceId();
        toAssign = free ? free : (optId ?? this.services[0].id);
      } else if (!toAssign) {
        toAssign = this.services[0].id;
      }
      this.assignService(stageId, toAssign);
  }

  public hackClickMinus(event: any, stageId: string): void {
      event.preventDefault();
      event.stopPropagation();
      
      console.warn("HACK MINUS FUNCIONA! Stage:", stageId);
      if (!this.canShowMinus(stageId)) return;
      this.assignService(stageId, null);
  }

  getPlusTooltip(opt: { id?: string; color?: string; isNew?: boolean } | any): string {
    const id = opt?.id ?? this.getFirstFreeServiceId();
    return id ? `Assign ${id}` : 'Assign service';
  }

  async confirmAndGenerate(): Promise<void> {
    await this.editorService.saveCurrentModuleSnapshotToModules();

    const assignmentsObj: Record<string, string> = Object.fromEntries(
      Array.from(this.stageAssignment.entries())
        .filter(([k, v]) => k !== "root" && v != null)
    ) as Record<string, string>;

    const modules = this.editorService.modules ?? {};
    const root = modules?.root ?? {};
    const rootConnections: Array<any> = root.connections ?? [];
    const rootNodeIds = new Set((root.nodes ?? []).map((n: any) => n.id));

    const connectedStageIds = new Set<string>();
    for (const c of rootConnections) {
      if (c.source && rootNodeIds.has(c.source)) connectedStageIds.add(c.source);
      if (c.target && rootNodeIds.has(c.target)) connectedStageIds.add(c.target);
    }

    const missingIds: string[] = [];
    for (const id of connectedStageIds) {
      const assigned = this.stageAssignment.get(id);
      if (!assigned) missingIds.push(id);
    }

    if (missingIds.length > 0) {
      const names = missingIds.map((id) => this.editorService.getStageName(id) || id);
      const preview = names.slice(0, 3).join(', ') + (names.length > 3 ? '...' : '');
      this.messageService.add({
        severity: 'warn',
        summary: 'Assign services',
        detail: `Assign a service to all connected stages first: ${preview}`,
        life: 5000
      });
      return;
    }

    try {
      await this.editorService.generateAndDownloadCode(assignmentsObj);
      this.close.emit();
    } catch (err) {
      console.error('Generation failed via editorService:', err);
      this.messageService.add({
        severity: 'error',
        summary: 'Generation failed',
        detail: 'An error occurred while generating the services. Check console for details.',
        life: 6000
      });
    }
  }
}
