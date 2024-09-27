import { TestBed } from '@angular/core/testing';
import { CanActivateFn } from '@angular/router';

import { examGuardGuard } from './exam-guard.guard';

describe('examGuardGuard', () => {
  const executeGuard: CanActivateFn = (...guardParameters) => 
      TestBed.runInInjectionContext(() => examGuardGuard(...guardParameters));

  beforeEach(() => {
    TestBed.configureTestingModule({});
  });

  it('should be created', () => {
    expect(executeGuard).toBeTruthy();
  });
});
