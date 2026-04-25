import { ClassicPreset as Classic } from "rete";
import { CustomSocket } from "../sockets";
import { getSocket } from "../utils";
import { getColorFromCategory } from "../utils";
export class CustomNode
    extends Classic.Node<
    Record<string, CustomSocket>,
    Record<string, CustomSocket>
  > implements Classic.Node{
    width = 180;
    height = 200;
    color : string = "rgba(130, 99, 132, 0.75)";
    nodeName: string;
    info : any = {};
    params : any = {};
    private availableInputs: Array<{ port_label: string; port_type: string }> = [];
    constructor(nodeName: string, config: any) {
        super(nodeName);
        
        this.nodeName = nodeName;
        this.info = config.info;
        this.availableInputs = config.inputs || [];
        this.color = getColorFromCategory(config.category!);
        if (config.color!) this.color = config.color;
        
        let show_count = 0;
        for (let i = 0; i < config.params.length; i++) {
            let param = config.params[i];
            this.params[param.param_label] = {
                type : param.param_type,
                show : param.show,
                value : undefined,
                optionId : param.optionId!,
                isParam: "custom",
                param_label: "",
            }

            if (param.param_type == "string") {
                this.params[param.param_label].value = "";
            }
            else if (param.param_type == "number") {
                this.params[param.param_label].value = 0;
            }
            else if (param.param_type == "boolean") {
                this.params[param.param_label].value = false;
            }
            else if (param.param_type == "map") {
                this.params[param.param_label].value = [];
            }
            else if (param.param_type == "list") {
                this.params[param.param_label].value = [];
            }
            else if (param.param_type == "cleaning_map") {
                this.params[param.param_label].value = [];
            }

            if (param.show) show_count++;
        }

        for ( let i = 0; i < config.inputs.length; i++) {
            let input = config.inputs[i];
            this.addInput(input.port_label, new Classic.Input(getSocket(input.port_type), input.port_label));
        }

        for ( let i = 0; i < config.outputs.length; i++) {
            let output = config.outputs[i];
            this.addOutput(output.port_label, new Classic.Output(getSocket(output.port_type), output.port_label));
        }

        this.syncDeployWithDockerConfiguration();
        this.height = 45 + 27.5 * (Object.keys(this.inputs).length + Object.keys(this.outputs).length) + 25 * show_count;
    }

    data() {
        return {
            info: this.info,
            params: this.params
        };
    }

	setData(data: any) {
        this.info = data.info;
		for (let key in this.params) {
			if (key in data.params) {
				if (data.params[key].value !== undefined)       this.params[key].value       = data.params[key].value;
                if (data.params[key].show !== undefined)        this.params[key].show        = data.params[key].show;
                if (data.params[key].isParam !== undefined)     this.params[key].isParam     = data.params[key].isParam;
                if (data.params[key].param_label !== undefined) this.params[key].param_label = data.params[key].param_label;
                if (data.params[key].optionId !== undefined)    this.params[key].optionId    = data.params[key].optionId;
                if (data.params[key].type !== undefined)        this.params[key].type        = data.params[key].type;
			}
		}

		this.syncDeployWithDockerConfiguration();
	}

    async update() {
        this.syncDeployWithDockerConfiguration();
    }

    getNodeName() {
        return this.nodeName;
    }

    private syncDeployWithDockerConfiguration() {
        if (this.nodeName !== "Deploy with Docker") return;

        // Keeps Deploy with Docker sockets and visible params aligned with model_source.
        this.syncDeployWithDockerInputs();

        const source = this.params["model_source"]?.value || "pipeline";
        if (this.params["preprocessing_steps"]) {
            this.params["preprocessing_steps"].show = source === "external";
            if (source !== "external") {
                this.params["preprocessing_steps"].value = [];
            }
        }

        this.updateNodeHeight();
    }

    private syncDeployWithDockerInputs() {
        if (this.nodeName !== "Deploy with Docker") return;

        // Pipeline mode expects model_path; external mode expects model.
        const source = this.params["model_source"]?.value || "pipeline";
        const targetInputLabel = source === "external" ? "model" : "model_path";
        const targetInput = this.availableInputs.find((input) => input.port_label === targetInputLabel);

        if (!targetInput) return;

        const currentInputKeys = Object.keys(this.inputs);
        if (currentInputKeys.length === 1 && currentInputKeys[0] === targetInput.port_label) {
            return;
        }

        currentInputKeys.forEach((key) => this.removeInput(key as never));
        this.addInput(
            targetInput.port_label,
            new Classic.Input(getSocket(targetInput.port_type), targetInput.port_label)
        );
    }

    private updateNodeHeight() {
        const visibleParams = Object.keys(this.params).filter((key) => this.params[key].show !== false).length;
        this.height = 45 + 27.5 * (Object.keys(this.inputs).length + Object.keys(this.outputs).length) + 25 * visibleParams;
    }
}