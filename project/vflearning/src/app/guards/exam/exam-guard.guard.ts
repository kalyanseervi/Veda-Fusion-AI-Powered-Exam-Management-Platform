import { Injectable } from '@angular/core';
import { CanActivate, ActivatedRouteSnapshot, RouterStateSnapshot, Router } from '@angular/router';
import { ExamStateService } from '../../services/exam/exam-state.service';


@Injectable({
  providedIn: 'root',
})
export class ExamGuard implements CanActivate {
  constructor(private router: Router, private examStateService: ExamStateService) {}

  canActivate(
    route: ActivatedRouteSnapshot,
    state: RouterStateSnapshot
  ): boolean {
    if (this.examStateService.isInExamPortal) {
      // Prevent navigation if in exam portal
      return false;
    }
    return true; // Allow navigation otherwise
  }
}
