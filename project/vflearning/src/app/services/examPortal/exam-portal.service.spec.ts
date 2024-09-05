import { TestBed } from '@angular/core/testing';

import { ExamPortalService } from './exam-portal.service';

describe('ExamPortalService', () => {
  let service: ExamPortalService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(ExamPortalService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
