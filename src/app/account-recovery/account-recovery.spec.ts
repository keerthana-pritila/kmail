import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AccountRecovery } from './account-recovery';

describe('AccountRecovery', () => {
  let component: AccountRecovery;
  let fixture: ComponentFixture<AccountRecovery>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AccountRecovery],
    }).compileComponents();

    fixture = TestBed.createComponent(AccountRecovery);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
