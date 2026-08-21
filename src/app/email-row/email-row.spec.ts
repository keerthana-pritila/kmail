import { ComponentFixture, TestBed } from '@angular/core/testing';

import { EmailRow } from './email-row';

describe('EmailRow', () => {
  let component: EmailRow;
  let fixture: ComponentFixture<EmailRow>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [EmailRow],
    }).compileComponents();

    fixture = TestBed.createComponent(EmailRow);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
