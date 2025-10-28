import { Injectable } from "@angular/core";
import { HttpClient, HttpHeaders } from "@angular/common/http";
import { environment } from "@environment/index";
import { Observable } from "rxjs";

@Injectable({
  providedIn: "root",
})
export class HttpClientService {
  private baseURL = environment.apiUrl;

  constructor(private http: HttpClient) {}

  get<T>(url: string): Observable<T> {
    return this.http.get<T>(`${this.baseURL}${url}`);
  }

  post<T>(url: string, data?: any, headers?: HttpHeaders): Observable<T> {
    return this.http.post<T>(`${this.baseURL}${url}`, data, { headers });
  }

  put<T>(url: string, data?: any): Observable<T> {
    return this.http.put<T>(`${this.baseURL}${url}`, data);
  }

  delete<T>(url: string): Observable<T> {
    return this.http.delete<T>(`${this.baseURL}${url}`);
  }
}
