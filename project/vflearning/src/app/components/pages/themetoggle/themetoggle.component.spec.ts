import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ThemetoggleComponent } from './themetoggle.component';

describe('ThemetoggleComponent', () => {
  let component: ThemetoggleComponent;
  let fixture: ComponentFixture<ThemetoggleComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ThemetoggleComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ThemetoggleComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
