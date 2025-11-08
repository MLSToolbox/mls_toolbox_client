import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';
import { AssessmentState, UploadedFile } from '../models/assessment.models';

@Injectable({
  providedIn: 'root'
})
export class CodeAssessmentService {
  private stateSubject = new BehaviorSubject<AssessmentState>({
    currentStep: 1,
    uploadedFile: null,
    isAnalyzing: false,
    error: null
  });

  state$ = this.stateSubject.asObservable();

  uploadFile(file: File): void {
    const uploadedFile: UploadedFile = {
      name: file.name,
      size: file.size,
      type: file.type
    };
    
    this.stateSubject.next({
      ...this.stateSubject.value,
      uploadedFile,
      currentStep: 2
    });
  }

  setStep(step: number): void {
    this.stateSubject.next({
      ...this.stateSubject.value,
      currentStep: step
    });
  }

  resetAssessment(): void {
    this.stateSubject.next({
      currentStep: 1,
      uploadedFile: null,
      isAnalyzing: false,
      error: null
    });
  }
}
