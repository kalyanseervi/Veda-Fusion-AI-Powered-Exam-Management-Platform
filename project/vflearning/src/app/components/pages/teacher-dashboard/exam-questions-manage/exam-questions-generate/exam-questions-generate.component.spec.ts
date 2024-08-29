import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ExamQuestionsGenerateComponent } from './exam-questions-generate.component';

describe('ExamQuestionsGenerateComponent', () => {
  let component: ExamQuestionsGenerateComponent;
  let fixture: ComponentFixture<ExamQuestionsGenerateComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ExamQuestionsGenerateComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ExamQuestionsGenerateComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
