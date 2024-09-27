import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root',
})
export class ExamStateService {
  private _isInExamPortal = false;

  set isInExamPortal(value: boolean) {
    this._isInExamPortal = value;
  }

  get isInExamPortal(): boolean {
    return this._isInExamPortal;
  }
}
