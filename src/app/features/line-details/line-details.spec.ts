import { ComponentFixture, TestBed } from '@angular/core/testing';

import { LineDetailsComponent } from './line-details.component';

describe('LineDetailsComponent', () => {
  let component: LineDetailsComponent;
  let fixture: ComponentFixture<LineDetailsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [LineDetailsComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(LineDetailsComponent);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
