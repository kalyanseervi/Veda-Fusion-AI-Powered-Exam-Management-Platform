import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ExamCreateComponent } from './exam-create.component';

describe('ExamCreateComponent', () => {
  let component: ExamCreateComponent;
  let fixture: ComponentFixture<ExamCreateComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ExamCreateComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ExamCreateComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
