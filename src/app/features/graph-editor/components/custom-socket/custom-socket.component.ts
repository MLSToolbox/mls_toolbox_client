import {
  Component,
  Input,
  HostBinding,
  ChangeDetectorRef,
  OnChanges,
} from "@angular/core";
import { GraphEditorService } from "@app/core";

@Component({
  selector: "app-custom-socket",
  templateUrl: "./custom-socket.component.html",
  styleUrls: ["./custom-socket.component.css"],
})
export class CustomSocketComponent implements OnChanges {
  @Input() data!: any;
  @Input() rendered!: any;

  custom_background = "red";
  custom_border = "red";

  @HostBinding("title") get title() {
    return this.data.name;
  }

  constructor(
    private cdr: ChangeDetectorRef,
    private editorService: GraphEditorService
  ) {
    this.cdr.detach();
  }

  ngOnChanges(): void {
    let config = this.editorService.getSocket(this.data.name);
    this.custom_background = config["background-color"];
    this.custom_border = config["border-color"];
    this.cdr.detectChanges();
    requestAnimationFrame(() => this.rendered());
  }
}
