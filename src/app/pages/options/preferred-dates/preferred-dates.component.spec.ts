import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { PreferredDatesComponent } from './preferred-dates.component';

describe('PreferredDatesComponent', () => {
  let component: PreferredDatesComponent;
  let fixture: ComponentFixture<PreferredDatesComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ PreferredDatesComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(PreferredDatesComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
