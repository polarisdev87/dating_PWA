import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { AcceptDateComponent } from './accept-date.component';

describe('AcceptDateComponent', () => {
  let component: AcceptDateComponent;
  let fixture: ComponentFixture<AcceptDateComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ AcceptDateComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(AcceptDateComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
