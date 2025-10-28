import { Injectable } from "@angular/core";
import axios, { AxiosInstance, AxiosRequestConfig } from "axios";

import { environment } from "@environment/index";

@Injectable({
  providedIn: "root",
})
export class HttpClientService {
  private axiosInstance: AxiosInstance;

  constructor() {
    this.axiosInstance = axios.create({
      baseURL: environment.apiUrl,
      timeout: environment.apiTimeout,
      headers: {
        "Content-Type": "application/json",
      },
    });

    this.setupInterceptors();
  }

  private setupInterceptors() {
    this.axiosInstance.interceptors.request.use(
      (config) => {
        return config;
      },
      (error) => Promise.reject(error)
    );

    this.axiosInstance.interceptors.response.use(
      (response) => response,
      (error) => {
        console.error("API Error:", error);
        return Promise.reject(error);
      }
    );
  }

  get<T>(url: string, config?: AxiosRequestConfig) {
    return this.axiosInstance.get<T>(url, config);
  }

  post<T>(url: string, data?: any, config?: AxiosRequestConfig) {
    return this.axiosInstance.post<T>(url, data, config);
  }

  put<T>(url: string, data?: any, config?: AxiosRequestConfig) {
    return this.axiosInstance.put<T>(url, data, config);
  }

  delete<T>(url: string, config?: AxiosRequestConfig) {
    return this.axiosInstance.delete<T>(url, config);
  }
}
