import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ExamManageComponent } from './exam-manage.component';

describe('ExamManageComponent', () => {
  let component: ExamManageComponent;
  let fixture: ComponentFixture<ExamManageComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ExamManageComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ExamManageComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
