import { ComponentFixture, TestBed } from '@angular/core/testing';

import { KmailSidebar } from './kmail-sidebar';

describe('KmailSidebar', () => {
  let component: KmailSidebar;
  let fixture: ComponentFixture<KmailSidebar>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [KmailSidebar],
    }).compileComponents();

    fixture = TestBed.createComponent(KmailSidebar);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
