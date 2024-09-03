import { TestBed } from '@angular/core/testing';

import { AssignExamService } from './assign-exam.service';

describe('AssignExamService', () => {
  let service: AssignExamService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(AssignExamService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
