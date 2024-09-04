import { TestBed } from '@angular/core/testing';

import { ExamportalService } from './examportal.service';

describe('ExamportalService', () => {
  let service: ExamportalService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(ExamportalService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
