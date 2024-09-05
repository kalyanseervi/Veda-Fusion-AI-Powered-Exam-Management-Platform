import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ExamGenerateResultComponent } from './exam-generate-result.component';

describe('ExamGenerateResultComponent', () => {
  let component: ExamGenerateResultComponent;
  let fixture: ComponentFixture<ExamGenerateResultComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ExamGenerateResultComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ExamGenerateResultComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
