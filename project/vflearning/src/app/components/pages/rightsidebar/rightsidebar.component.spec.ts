import { ComponentFixture, TestBed } from '@angular/core/testing';

import { RightsidebarComponent } from './rightsidebar.component';

describe('RightsidebarComponent', () => {
  let component: RightsidebarComponent;
  let fixture: ComponentFixture<RightsidebarComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [RightsidebarComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(RightsidebarComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
