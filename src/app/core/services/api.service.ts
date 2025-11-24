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

  constructor(private http: HttpClient) { }

  /**
   * Upload code source (ZIP file or Git repository)
   * 
   * @param source - File object for ZIP or string URL for Git repository
   * @returns Observable with upload response
   */
  upload(source: File | string): Observable<ApiResponse<UploadZipResponse>> {
    const formData = new FormData();

    if (source instanceof File) {
      // ZIP file upload
      formData.append("file", source, source.name);

      console.log('🚀 Uploading ZIP to:', `${this.baseURL}/upload`);
      console.log('📦 File details:', {
        name: source.name,
        size: source.size,
        type: source.type
      });
    } else {
      // Git repository URL
      formData.append("git_url", source);

      console.log('🚀 Uploading Git repository to:', `${this.baseURL}/upload`);
      console.log('🔗 Git URL:', source);
    }

    return this.http.post<ApiResponse<UploadZipResponse>>(
      `${this.baseURL}/upload`,
      formData
      // No headers - let Angular/browser set Content-Type automatically
    );
  }

  /**
   * @deprecated Use upload() instead
   * Upload ZIP file
   */
  uploadZip(file: File): Observable<ApiResponse<UploadZipResponse>> {
    return this.upload(file);
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

