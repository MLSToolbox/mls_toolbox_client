import { Component, Input, OnInit } from '@angular/core';
import saveAs from 'file-saver';
import { getBaseURL } from '../utils';
import { KeyValue } from '@angular/common';

@Component({
  selector: 'app-code-assess-response',
  templateUrl: './code-assess-response.component.html',
  styleUrl: './code-assess-response.component.css'
})
export class CodeAssessResponseComponent implements OnInit{
  @Input() response!: any[];
  @Input() testId!: string | unknown;
  @Input() uploadedFile!: File | undefined;
  fetching: boolean = false;

  headers!: any[];

  ngOnInit(): void {
    this.headers = Object.keys(this.response[0].message_count);

    // console.log(this.headers);
  }


  getFullReport() {
    this.fetching = true;
    let formData = new FormData();
    formData.append("app", this.uploadedFile!);
    const target_url = "/api/get_report?test_id=" + this.testId;
    fetch(getBaseURL(target_url), {method: "POST", body: formData}).then(( response ) => {
      this.fetching = false;
      response.blob().then((data) => {
        // console.log(data);
        window.saveAs(data, 'report.txt');
      })
    }).catch((error) => {
      this.fetching = false;
    })
    
  }

  originalOrder = (a: KeyValue<any,any>, b: KeyValue<any,any>): number => {
    return 0;
  }
}
