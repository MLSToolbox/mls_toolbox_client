import { Component, ElementRef, OnInit, ViewChild } from "@angular/core";
import { GraphEditorService } from "@app/core";
import { DynamicDialogRef } from "primeng/dynamicdialog";

type ServingOrigin = "mls" | "external";
type ServingType = "api" | "batch";

interface ManualStep {
  id: string;
  nodeName: string;
  column: string;
  valueToReplace: string;
  replacementValue: string;
}

interface FeatureEngineeringStep {
  id: string;
  nodeName: string;
  params: Record<string, any>;
}

@Component({
  selector: "app-serving-dialog",
  templateUrl: "./serving-dialog.component.html",
  styleUrl: "./serving-dialog.component.css",
})
export class ServingDialogComponent implements OnInit {
  currentStep = 1;
  readonly totalSteps = 3;
  origin: ServingOrigin = "mls";
  servingType: ServingType = "api";
  includePreprocessing = true;
  includeFeatureEngineering = true;
  endpointHost = "";
  endpointPort = 8000;
  outputPath = "serving_results/prediction.json";
  trainingPipelineJson: any | null = null;
  fileError = "";
  trainingFileName = "";
  featureEngineeringFromTraining = false;
  includeFeatureScaler = false;
  featureScalerPath = "";
  includeTruthScaler = false;
  truthScalerPath = "";

  dataCollectionOptions: any[] = [];
  dataCollectionConfig = new Map<string, any>();
  dataCollectionNodeName = "";
  dataCollectionParams: any[] = [];
  dataCollectionValues: Record<string, any> = {};
  optionValues: any = {};

  dataCleaningOptions: any[] = [];
  dataCleaningConfig = new Map<string, any>();
  manualSteps: ManualStep[] = [];

  featureEngineeringOptions: any[] = [];
  featureEngineeringConfig = new Map<string, any>();
  featureEngineeringSteps: FeatureEngineeringStep[] = [];

  @ViewChild("trainingFileInput") trainingFileInput!: ElementRef;

  constructor(
    public editorService: GraphEditorService,
    private ref: DynamicDialogRef
  ) {}

  async ngOnInit(): Promise<void> {
    await this.editorService.waitForFetch();
    const nodes = this.editorService.getNodes() || [];
    this.optionValues = this.editorService.options || {};
    const dataCollection = nodes.filter(
      (node: any) => node.category === "Data Collection"
    );
    const dataCleaning = nodes.filter(
      (node: any) =>
        node.category === "Data Cleaning" &&
        Array.isArray(node.inputs) &&
        node.inputs.length === 1
    );
    const featureEngineering = nodes.filter(
      (node: any) =>
        node.category === "Feature Engineering" &&
        Array.isArray(node.inputs) &&
        node.inputs.length === 1
    );

    this.dataCleaningOptions = dataCleaning.map((node: any) => ({
      label: node.node,
      value: node.node,
    }));

    for (const node of dataCleaning) {
      this.dataCleaningConfig.set(node.node, node);
    }

    this.featureEngineeringOptions = featureEngineering.map((node: any) => ({
      label: node.node,
      value: node.node,
    }));

    for (const node of featureEngineering) {
      this.featureEngineeringConfig.set(node.node, node);
    }

    this.dataCollectionOptions = dataCollection.map((node: any) => ({
      label: node.node,
      value: node.node,
    }));

    for (const node of dataCollection) {
      this.dataCollectionConfig.set(node.node, node);
    }

    if (this.dataCollectionOptions.length > 0) {
      this.setDataCollectionNode(this.dataCollectionOptions[0].value);
    }

    if (this.dataCleaningOptions.length > 0) {
      this.addStep();
    }

    if (this.featureEngineeringOptions.length > 0) {
      this.addFeatureStep();
    }
  }

  setOrigin(origin: ServingOrigin) {
    this.origin = origin;
    this.fileError = "";
  }

  setServingType(type: ServingType) {
    this.servingType = type;
  }

  toggleIncludePreprocessing() {
    if (!this.includePreprocessing) {
      this.trainingPipelineJson = null;
      this.trainingFileName = "";
      this.fileError = "";
      this.featureEngineeringFromTraining = false;
    }
  }

  toggleIncludeFeatureEngineering() {
    if (!this.includeFeatureEngineering) {
      this.featureEngineeringSteps = [];
    } else if (this.featureEngineeringSteps.length === 0) {
      this.addFeatureStep();
    }
  }

  goNext() {
    if (this.currentStep < this.totalSteps && this.canGoNext()) {
      this.currentStep += 1;
    }
  }

  goPrev() {
    if (this.currentStep > 1) {
      this.currentStep -= 1;
    }
  }

  canGoNext(): boolean {
    if (this.currentStep === 1) {
      return Boolean(this.origin);
    }

    if (this.currentStep === 2) {
      if (this.origin === "mls") {
        if (this.includePreprocessing || this.includeFeatureEngineering) {
          return Boolean(this.trainingPipelineJson);
        }
        return true;
      }

      if (this.origin === "external") {
        if (this.includePreprocessing && this.manualSteps.length === 0) {
          return false;
        }
        if (this.includeFeatureEngineering && this.featureEngineeringSteps.length === 0) {
          return false;
        }
      }
    }

    return true;
  }

  chooseTrainingFile() {
    this.trainingFileInput.nativeElement.click();
  }

  onTrainingFileChange(event: Event) {
    this.fileError = "";
    this.trainingPipelineJson = null;
    this.trainingFileName = "";

    const target = event.target as HTMLInputElement;
    if (!target.files || target.files.length === 0) {
      return;
    }

    const file = target.files[0];
    this.trainingFileName = file.name;
    const reader = new FileReader();
    reader.onload = () => {
      try {
        const content = reader.result as string;
        this.trainingPipelineJson = JSON.parse(content);
        this.featureEngineeringFromTraining = this.hasStage(
          this.trainingPipelineJson,
          "feature engineering"
        );
      } catch (error) {
        this.fileError = "Invalid JSON file.";
        this.featureEngineeringFromTraining = false;
      }
    };
    reader.readAsText(file);
    target.value = "";
  }

  setDataCollectionNode(nodeName: string) {
    this.dataCollectionNodeName = nodeName;
    const config = this.dataCollectionConfig.get(nodeName);
    this.dataCollectionParams = config?.params || [];
    this.dataCollectionValues = {};

    for (const param of this.dataCollectionParams) {
      if (param.param_type === "description") continue;
      this.dataCollectionValues[param.param_label] = this.defaultParamValue(
        param
      );
    }
  }

  private defaultParamValue(param: any) {
    if (param.param_type === "string") return "";
    if (param.param_type === "number") return 0;
    if (param.param_type === "boolean") return false;
    if (param.param_type === "list") return [];
    if (param.param_type === "map") return {};
    if (param.param_type === "option") {
      const options = this.optionValues?.[param.optionId] || [];
      return options.length > 0 ? options[0] : "";
    }
    return "";
  }

  private defaultFeatureParamValue(param: any) {
    if (param.param_type === "string") return "";
    if (param.param_type === "number") return 0;
    if (param.param_type === "boolean") return false;
    if (param.param_type === "list") return "";
    if (param.param_type === "map") return "";
    if (param.param_type === "option") {
      const options = this.optionValues?.[param.optionId] || [];
      return options.length > 0 ? options[0] : "";
    }
    return "";
  }

  private hasStage(trainingPipelineJson: any, stageName: string): boolean {
    const nodes = trainingPipelineJson?.modules?.root?.nodes;
    if (!Array.isArray(nodes)) return false;
    return nodes.some((node: any) => {
      const value = node?.data?.params?.["Stage name"]?.value;
      return typeof value === "string" && value.toLowerCase().includes(stageName);
    });
  }


  addStep() {
    if (this.dataCleaningOptions.length === 0) {
      return;
    }
    const defaultNode = this.dataCleaningOptions[0].value;
    this.manualSteps.push({
      id: this.newId(),
      nodeName: defaultNode,
      column: "",
      valueToReplace: "",
      replacementValue: "",
    });
  }

  addFeatureStep() {
    if (this.featureEngineeringOptions.length === 0) {
      return;
    }
    const defaultNode = this.featureEngineeringOptions[0].value;
    const defaultParams = this.buildFeatureParams(defaultNode);
    this.featureEngineeringSteps.push({
      id: this.newId(),
      nodeName: defaultNode,
      params: defaultParams,
    });
  }

  removeStep(id: string) {
    this.manualSteps = this.manualSteps.filter((step) => step.id !== id);
  }

  removeFeatureStep(id: string) {
    this.featureEngineeringSteps = this.featureEngineeringSteps.filter(
      (step) => step.id !== id
    );
  }

  updateStepNodeName(step: ManualStep, nodeName: string) {
    step.nodeName = nodeName;
    step.column = "";
    step.valueToReplace = "";
    step.replacementValue = "";
  }

  updateFeatureStepNodeName(step: FeatureEngineeringStep, nodeName: string) {
    step.nodeName = nodeName;
    step.params = this.buildFeatureParams(nodeName);
  }

  getFeatureEngineeringParams(step: FeatureEngineeringStep) {
    const config = this.featureEngineeringConfig.get(step.nodeName);
    return config?.params || [];
  }

  private buildFeatureParams(nodeName: string): Record<string, any> {
    const config = this.featureEngineeringConfig.get(nodeName);
    const params: Record<string, any> = {};
    for (const param of config?.params || []) {
      if (param.param_type === "description") continue;
      params[param.param_label] = this.defaultFeatureParamValue(param);
    }
    return params;
  }

  needsColumn(nodeName: string): boolean {
    const config = this.dataCleaningConfig.get(nodeName);
    return Boolean(
      config?.params?.some((param: any) => param.param_label === "column")
    );
  }

  needsNewValue(nodeName: string): boolean {
    const config = this.dataCleaningConfig.get(nodeName);
    return Boolean(
      config?.params?.some((param: any) => param.param_label === "new_value")
    );
  }

  needsValueMap(nodeName: string): boolean {
    const config = this.dataCleaningConfig.get(nodeName);
    return Boolean(
      config?.params?.some((param: any) => param.param_label === "value_map")
    );
  }

  canCreate(): boolean {
    if (!this.endpointHost.trim() || !this.endpointPort) return false;
    if (this.servingType === "api" && !this.outputPath.trim()) return false;
    if (!this.dataCollectionNodeName) return false;
    if (this.includePreprocessing) {
      if (this.origin === "mls" && !this.trainingPipelineJson) {
        return false;
      }
      if (this.origin === "external" && this.manualSteps.length === 0) {
        return false;
      }
    }
    if (this.includeFeatureEngineering) {
      if (this.origin === "external" && this.featureEngineeringSteps.length === 0) {
        return false;
      }
    }
    return true;
  }

  async createPipeline() {
    if (!this.canCreate()) {
      return;
    }

    await this.editorService.createServingPipeline({
      origin: this.origin,
      servingType: this.servingType,
      endpointHost: this.endpointHost.trim(),
      endpointPort: this.endpointPort,
      outputPath: this.outputPath.trim(),
      includePreprocessing: this.includePreprocessing,
      includeFeatureEngineering: this.includeFeatureEngineering,
      trainingPipelineJson: this.trainingPipelineJson,
      dataCollectionNodeName: this.dataCollectionNodeName,
      dataCollectionParams: this.dataCollectionValues,
      manualSteps: this.manualSteps.map((step) => ({
        nodeName: step.nodeName,
        column: step.column.trim(),
        valueToReplace: step.valueToReplace.trim(),
        replacementValue: step.replacementValue.trim(),
      })),
      featureEngineeringSteps: this.featureEngineeringSteps.map((step) => ({
        nodeName: step.nodeName,
        params: this.normalizeFeatureEngineeringParams(step),
      })),
      featureScalerPath: this.includeFeatureScaler ? this.featureScalerPath.trim() : null,
      truthScalerPath: this.includeTruthScaler ? this.truthScalerPath.trim() : null,
    });

    this.ref.close();
  }

  cancel() {
    this.ref.close();
  }

  private newId(): string {
    if (typeof crypto !== "undefined" && "randomUUID" in crypto) {
      return crypto.randomUUID().replace(/-/g, "").slice(0, 16);
    }
    return Math.random().toString(16).slice(2, 18);
  }

  private normalizeFeatureEngineeringParams(
    step: FeatureEngineeringStep
  ): Record<string, any> {
    const config = this.featureEngineeringConfig.get(step.nodeName);
    const params: Record<string, any> = {};

    for (const param of config?.params || []) {
      if (param.param_type === "description") continue;
      const rawValue = step.params[param.param_label];
      params[param.param_label] = this.coerceFeatureParamValue(param, rawValue);
    }

    return params;
  }

  private coerceFeatureParamValue(param: any, value: any) {
    if (param.param_type === "list") {
      return this.parseListValue(value);
    }
    if (param.param_type === "map") {
      return this.parseMapValue(value);
    }
    if (param.param_type === "number") {
      return value === "" || value === null || value === undefined
        ? 0
        : Number(value);
    }
    if (param.param_type === "boolean") {
      return Boolean(value);
    }
    return value ?? this.defaultFeatureParamValue(param);
  }

  private parseListValue(value: any): string[] {
    if (Array.isArray(value)) return value;
    if (typeof value !== "string") return value ? [String(value)] : [];
    return value
      .split(",")
      .map((item) => item.trim())
      .filter((item) => item.length > 0);
  }

  private parseMapValue(value: any): Record<string, any> {
    if (value && typeof value === "object" && !Array.isArray(value)) {
      return value;
    }
    if (typeof value !== "string") return {};
    const result: Record<string, any> = {};
    for (const pair of value.split(",")) {
      const [rawKey, rawVal] = pair.split(/[:=]/);
      if (!rawKey) continue;
      const key = rawKey.trim();
      const val = rawVal?.trim();
      if (key.length === 0) continue;
      result[key] = val ?? "";
    }
    return result;
  }
}
