import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ExamAssignComponent } from './exam-assign.component';

describe('ExamAssignComponent', () => {
  let component: ExamAssignComponent;
  let fixture: ComponentFixture<ExamAssignComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ExamAssignComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ExamAssignComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
