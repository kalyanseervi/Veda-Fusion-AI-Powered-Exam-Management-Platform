import { TestBed } from '@angular/core/testing';

import { ExamStateService } from './exam-state.service';

describe('ExamStateService', () => {
  let service: ExamStateService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(ExamStateService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
