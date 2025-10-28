import { Injectable } from "@angular/core";

import { HttpClientService } from "./http-client.service";
import { ApiResponse, UploadZipResponse, AnalyzeResponse } from "../models";

@Injectable({
  providedIn: "root",
})
export class ApiService {
  constructor(private http: HttpClientService) {}

  uploadZip(file: File) {
    const formData = new FormData();
    formData.append("file", file);
    return this.http.post<ApiResponse<UploadZipResponse>>(
      "/upload-zip",
      formData,
      {
        headers: { "Content-Type": "multipart/form-data" },
      }
    );
  }

  analyze(session_uuid: string, data: any) {
    return this.http.post<ApiResponse<AnalyzeResponse>>(
      `/analyze/${session_uuid}`,
      data
    );
  }
}
