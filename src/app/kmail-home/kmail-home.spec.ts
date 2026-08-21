import { ComponentFixture, TestBed } from '@angular/core/testing';

import { KmailHome } from './kmail-home';

describe('KmailHome', () => {
  let component: KmailHome;
  let fixture: ComponentFixture<KmailHome>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [KmailHome],
    }).compileComponents();

    fixture = TestBed.createComponent(KmailHome);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
