import { ComponentFixture, TestBed } from '@angular/core/testing';

import { VflearningComponent } from './vflearning.component';

describe('VflearningComponent', () => {
  let component: VflearningComponent;
  let fixture: ComponentFixture<VflearningComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [VflearningComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(VflearningComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
