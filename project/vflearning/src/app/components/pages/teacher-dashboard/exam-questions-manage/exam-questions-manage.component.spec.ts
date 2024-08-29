import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ExamQuestionsManageComponent } from './exam-questions-manage.component';

describe('ExamQuestionsManageComponent', () => {
  let component: ExamQuestionsManageComponent;
  let fixture: ComponentFixture<ExamQuestionsManageComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ExamQuestionsManageComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ExamQuestionsManageComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
