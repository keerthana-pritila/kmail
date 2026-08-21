import { ComponentFixture, TestBed } from '@angular/core/testing';

import { EmailDetails } from './email-details';

describe('EmailDetails', () => {
  let component: EmailDetails;
  let fixture: ComponentFixture<EmailDetails>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [EmailDetails],
    }).compileComponents();

    fixture = TestBed.createComponent(EmailDetails);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
