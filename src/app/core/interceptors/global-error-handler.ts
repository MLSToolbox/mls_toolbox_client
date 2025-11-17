import { ErrorHandler, Injectable, Injector } from '@angular/core';

@Injectable()
export class GlobalErrorHandler implements ErrorHandler {
  constructor(private injector: Injector) {}

  handleError(error: Error | any): void {
    console.group('💥 GLOBAL ERROR HANDLER');
    console.error('Error caught by GlobalErrorHandler:', error);
    
    if (error instanceof Error) {
      console.error('📛 Error Name:', error.name);
      console.error('📝 Error Message:', error.message);
      console.error('📚 Stack Trace:', error.stack);
    } else {
      console.error('⚠️ Unknown Error Type:', typeof error);
      console.error('🔍 Error Details:', error);
    }

    // Log error context
    console.error('🕐 Timestamp:', new Date().toISOString());
    console.error('🌐 User Agent:', navigator.userAgent);
    console.error('📍 Current URL:', window.location.href);

    console.groupEnd();

    // Re-throw the error so Angular can still handle it
    // Comment this out if you want to suppress errors
    // throw error;
  }
}
