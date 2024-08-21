import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SubjectCreateComponent } from './subject-create.component';

describe('SubjectCreateComponent', () => {
  let component: SubjectCreateComponent;
  let fixture: ComponentFixture<SubjectCreateComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [SubjectCreateComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(SubjectCreateComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
