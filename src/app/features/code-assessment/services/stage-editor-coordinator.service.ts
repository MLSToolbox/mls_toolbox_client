import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';

/**
 * Tracks which file's "Select Stages" popup is open within a single
 * Validate Pipeline tree, so opening one always closes any other that
 * was left open. Provided per AssessmentStageValidationComponent
 * instance (not providedIn: 'root'), so it's a fresh, isolated
 * coordinator for each visit to that step rather than app-wide state.
 */
@Injectable()
export class StageEditorCoordinatorService {
  private readonly openPathSubject = new BehaviorSubject<string | null>(null);
  readonly openPath$: Observable<string | null> = this.openPathSubject.asObservable();

  isOpen(path: string): boolean {
    return this.openPathSubject.value === path;
  }

  toggle(path: string): void {
    this.openPathSubject.next(this.openPathSubject.value === path ? null : path);
  }

  closeAll(): void {
    if (this.openPathSubject.value !== null) {
      this.openPathSubject.next(null);
    }
  }
}
