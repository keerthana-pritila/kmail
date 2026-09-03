import { ComponentFixture, TestBed } from '@angular/core/testing';

import { QuickTips } from './quick-tips';

describe('QuickTips', () => {
  let component: QuickTips;
  let fixture: ComponentFixture<QuickTips>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [QuickTips],
    }).compileComponents();

    fixture = TestBed.createComponent(QuickTips);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
