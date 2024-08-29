import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ExamQuestionsListComponent } from './exam-questions-list.component';

describe('ExamQuestionsListComponent', () => {
  let component: ExamQuestionsListComponent;
  let fixture: ComponentFixture<ExamQuestionsListComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ExamQuestionsListComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ExamQuestionsListComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
