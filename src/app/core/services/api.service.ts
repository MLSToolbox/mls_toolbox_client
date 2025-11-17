import { Injectable } from "@angular/core";
import { HttpClient } from "@angular/common/http";
import { environment } from "@environment/index";
import { Observable } from "rxjs";
import { ApiResponse, UploadZipResponse, AnalyzeResponse } from "../models";

@Injectable({
  providedIn: "root",
})
export class ApiService {
  private baseURL = environment.apiUrl;

  constructor(private http: HttpClient) {}

  /**
   * Upload ZIP file
   * Note: No Content-Type header is set to allow browser to set multipart/form-data with boundary
   */
  uploadZip(file: File): Observable<ApiResponse<UploadZipResponse>> {
    const formData = new FormData();
    formData.append("file", file, file.name);
    
    console.log('🚀 Uploading to:', `${this.baseURL}/upload-zip`);
    console.log('📦 File details:', {
      name: file.name,
      size: file.size,
      type: file.type
    });
    
    return this.http.post<ApiResponse<UploadZipResponse>>(
      `${this.baseURL}/upload-zip`,
      formData
      // No headers - let Angular/browser set Content-Type automatically
    );
  }

  /**
   * Run analysis on uploaded code
   */
  analyze(session_uuid: string, data: any): Observable<ApiResponse<AnalyzeResponse>> {
    console.log('🔬 Running analysis:', `${this.baseURL}/analyze/${session_uuid}`);
    return this.http.post<ApiResponse<AnalyzeResponse>>(
      `${this.baseURL}/analyze/${session_uuid}`,
      data,
      {
        headers: {
          'Content-Type': 'application/json'
        }
      }
    );
  }
}
