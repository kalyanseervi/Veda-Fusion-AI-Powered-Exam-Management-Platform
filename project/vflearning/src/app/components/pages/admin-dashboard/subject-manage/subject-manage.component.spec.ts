import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SubjectManageComponent } from './subject-manage.component';

describe('SubjectManageComponent', () => {
  let component: SubjectManageComponent;
  let fixture: ComponentFixture<SubjectManageComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [SubjectManageComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(SubjectManageComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
