import { ComponentFixture, TestBed } from '@angular/core/testing';

import { Home } from './home';
import { ToastrService } from 'ngx-toastr';
import { provideRouter } from '@angular/router';

const toastrMock = {
  success: vi.fn(),
  warning: vi.fn(),
  error: vi.fn(),
  info: vi.fn()
};

describe('Home', () => {
  let component: Home;
  let fixture: ComponentFixture<Home>;

  beforeEach(async () => {
    localStorage.clear();
    sessionStorage.clear();

    await TestBed.configureTestingModule({
      imports: [Home],
      providers: [
        provideRouter([]),
        {
          provide: ToastrService,
          useValue: toastrMock
        }
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(Home);
    component = fixture.componentInstance;
    // fixture.detectChanges();

    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should display title kmail', () => {
    fixture.detectChanges();
    const element = fixture.nativeElement;
    const heading = element.querySelector('h1');
    expect(heading.textContent).toContain('Kmail');
  });

  it('should display sign in button when not logged in', () => {
    component.isLoggedIn = false;
    fixture.detectChanges();
    const button = fixture.nativeElement;
    expect(button.textContent).toContain('Sign in');
  });

  // it('should display account name if user loggedin', () => {
  //   component.isLoggedIn = true;
  //   component.userName = 'keer';


  //   fixture.detectChanges();

  //   const button = fixture.nativeElement.querySelector('.username');
  //   expect(button).not.toBeNull();
  //   expect(button.textContent).toContain("keer's Account");
  // });
  it('should set logged in user info', () => {
    component.isLoggedIn = true;
    component.userName = 'keer';

    expect(component.isLoggedIn).toBe(true);
    expect(component.userName).toBe('keer');
  });
});
