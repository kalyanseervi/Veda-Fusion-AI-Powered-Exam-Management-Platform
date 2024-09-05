import { TestBed } from '@angular/core/testing';

import { ExamGenResultService } from './exam-gen-result.service';

describe('ExamGenResultService', () => {
  let service: ExamGenResultService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(ExamGenResultService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
