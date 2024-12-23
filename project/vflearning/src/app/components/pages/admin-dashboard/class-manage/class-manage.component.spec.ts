import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ClassManageComponent } from './class-manage.component';

describe('ClassManageComponent', () => {
  let component: ClassManageComponent;
  let fixture: ComponentFixture<ClassManageComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ClassManageComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ClassManageComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
