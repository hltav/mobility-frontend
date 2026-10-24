import { TestBed } from '@angular/core/testing';
import { provideRouter, Router } from '@angular/router';
import { HttpErrorResponse } from '@angular/common/http';
import { Subject, of, throwError } from 'rxjs';
import { AuthService } from '../../../core/services/auth.service';
import { LoginComponent } from './login.component';

describe('Login UI', () => {
  const auth = { login: vi.fn() };
  beforeEach(() => {
    vi.clearAllMocks();
    auth.login.mockReturnValue(of({}));
    TestBed.configureTestingModule({
      imports: [LoginComponent],
      providers: [provideRouter([]), { provide: AuthService, useValue: auth }],
    });
  });
  function render() {
    const f = TestBed.createComponent(LoginComponent);
    f.detectChanges();
    return f;
  }
  it('opens the login form directly without onboarding content', () => {
    const f = render();
    expect(f.nativeElement.querySelector('.entry-map')).toBeNull();
    expect(f.nativeElement.querySelector('#login-email')).not.toBeNull();
    expect(f.nativeElement.querySelector('.auth-return').getAttribute('href')).toBe('/');
    expect(auth.login).not.toHaveBeenCalled();
  });
  it('validates locally and associates accessible labels with fields', () => {
    const f = render();
    f.componentInstance.onSubmit();
    f.detectChanges();
    expect(auth.login).not.toHaveBeenCalled();
    expect(f.nativeElement.querySelector('label[for="login-email"]')).not.toBeNull();
    expect(f.nativeElement.querySelector('[role="alert"]')).not.toBeNull();
  });
  it('prevents duplicate submissions and redirects successful login to home', () => {
    const pending = new Subject<unknown>();
    auth.login.mockReturnValue(pending);
    const f = render();
    const c = f.componentInstance;
    const nav = vi.spyOn(TestBed.inject(Router), 'navigate').mockResolvedValue(true);
    c.email = 'ana@example.com';
    c.password = 'abcdef';
    c.onSubmit();
    c.onSubmit();
    expect(auth.login).toHaveBeenCalledTimes(1);
    pending.next({});
    pending.complete();
    expect(c.isLoading()).toBe(false);
    expect(nav).toHaveBeenCalledWith(['/home']);
  });
  it('renders incorrect-credentials feedback and releases the loading state', () => {
    auth.login.mockReturnValue(throwError(() => new HttpErrorResponse({ status: 401 })));
    const f = render();
    const c = f.componentInstance;
    c.email = 'ana@example.com';
    c.password = 'abcdef';
    c.onSubmit();
    f.detectChanges();
    expect(f.nativeElement.textContent).toContain('E-mail ou senha incorretos');
    expect(c.isLoading()).toBe(false);
  });
  it('explains network unavailability without substituting a demo session', () => {
    auth.login.mockReturnValue(throwError(() => new HttpErrorResponse({ status: 0 })));
    const f = render();
    const c = f.componentInstance;
    c.email = 'ana@example.com';
    c.password = 'abcdef';
    c.onSubmit();
    expect(c.errorMessage()).toContain('conexão');
  });
});
