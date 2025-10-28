import { Injectable } from "@angular/core";

import { HttpClientService } from "./http-client.service";

@Injectable({
  providedIn: "root",
})
export class ApiService {
  constructor(private http: HttpClientService) {}

  uploadZip(file: File) {
    const formData = new FormData();
    formData.append("file", file);
    return this.http.post("/upload-zip", formData, {
      headers: { "Content-Type": "multipart/form-data" },
    });
  }

  analyze(session_uuid: string, data: any) {
    return this.http.post(`/analyze/${session_uuid}`, data);
  }
}
