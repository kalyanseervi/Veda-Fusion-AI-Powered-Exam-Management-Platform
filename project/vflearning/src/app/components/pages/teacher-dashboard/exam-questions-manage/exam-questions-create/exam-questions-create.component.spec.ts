import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ExamQuestionsCreateComponent } from './exam-questions-create.component';

describe('ExamQuestionsCreateComponent', () => {
  let component: ExamQuestionsCreateComponent;
  let fixture: ComponentFixture<ExamQuestionsCreateComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ExamQuestionsCreateComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ExamQuestionsCreateComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
