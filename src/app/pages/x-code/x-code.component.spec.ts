import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { XCodeComponent } from './x-code.component';

describe('XCodeComponent', () => {
  let component: XCodeComponent;
  let fixture: ComponentFixture<XCodeComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ XCodeComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(XCodeComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
