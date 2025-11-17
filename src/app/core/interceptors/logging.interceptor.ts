import { Injectable } from '@angular/core';
import {
  HttpRequest,
  HttpHandler,
  HttpEvent,
  HttpInterceptor,
  HttpResponse,
  HttpErrorResponse
} from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { tap, catchError } from 'rxjs/operators';

@Injectable()
export class LoggingInterceptor implements HttpInterceptor {
  intercept(request: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {
    const started = Date.now();
    const requestId = this.generateRequestId();

    // Log request details
    console.group(`🌐 HTTP Request [${requestId}]`);
    console.log('📤 Method:', request.method);
    console.log('🔗 URL:', request.url);
    console.log('📋 Headers:', this.formatHeaders(request.headers));
    
    if (request.body) {
      if (request.body instanceof FormData) {
        console.log('📦 Body: FormData');
        this.logFormData(request.body);
      } else {
        console.log('📦 Body:', request.body);
      }
    }
    console.groupEnd();

    return next.handle(request).pipe(
      tap(event => {
        if (event instanceof HttpResponse) {
          const elapsed = Date.now() - started;
          console.group(`✅ HTTP Response [${requestId}] - ${elapsed}ms`);
          console.log('📥 Status:', event.status, event.statusText);
          console.log('🔗 URL:', request.url);
          console.log('📋 Headers:', this.formatHeaders(event.headers));
          console.log('📦 Body:', event.body);
          console.groupEnd();
        }
      }),
      catchError((error: HttpErrorResponse) => {
        const elapsed = Date.now() - started;
        console.group(`❌ HTTP Error [${requestId}] - ${elapsed}ms`);
        console.error('🔗 URL:', request.url);
        console.error('⚠️ Status:', error.status, error.statusText);
        console.error('📋 Error Headers:', this.formatHeaders(error.headers));
        console.error('❗ Error Details:', {
          message: error.message,
          error: error.error,
          status: error.status,
          statusText: error.statusText,
          url: error.url,
          ok: error.ok,
          name: error.name,
          type: error.type
        });
        
        // Log specific error scenarios
        if (error.status === 0) {
          console.error('🚫 NETWORK ERROR: Cannot reach server');
          console.error('   Possible causes:');
          console.error('   - Backend server is not running');
          console.error('   - CORS configuration issues');
          console.error('   - Wrong URL/port');
          console.error('   - Network connectivity issues');
          console.error('   Expected URL:', request.url);
        } else if (error.status === 404) {
          console.error('🔍 NOT FOUND: Endpoint does not exist');
        } else if (error.status === 500) {
          console.error('💥 SERVER ERROR: Backend crashed');
        } else if (error.status === 413) {
          console.error('📦 PAYLOAD TOO LARGE: File size exceeds server limit');
        }
        
        console.groupEnd();
        return throwError(() => error);
      })
    );
  }

  private generateRequestId(): string {
    return Math.random().toString(36).substring(2, 9);
  }

  private formatHeaders(headers: any): { [key: string]: string } {
    const headersObj: { [key: string]: string } = {};
    if (headers && headers.keys) {
      headers.keys().forEach((key: string) => {
        headersObj[key] = headers.get(key);
      });
    }
    return headersObj;
  }

  private logFormData(formData: FormData): void {
    console.log('📋 FormData entries:');
    formData.forEach((value, key) => {
      if (value instanceof File) {
        console.log(`  ${key}:`, {
          name: value.name,
          size: value.size,
          type: value.type,
          lastModified: new Date(value.lastModified)
        });
      } else {
        console.log(`  ${key}:`, value);
      }
    });
  }
}
