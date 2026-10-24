import { TestBed } from '@angular/core/testing';
import { provideRouter, Router } from '@angular/router';
import { HttpErrorResponse } from '@angular/common/http';
import { of, throwError } from 'rxjs';
import { AuthService } from '../../../core/services/auth.service';
import { RegisterComponent } from './register.component';

describe('Registration UI', () => {
  const auth = { register: vi.fn() };
  beforeEach(() => {
    vi.clearAllMocks();
    auth.register.mockReturnValue(of({}));
    TestBed.configureTestingModule({
      imports: [RegisterComponent],
      providers: [provideRouter([]), { provide: AuthService, useValue: auth }],
    });
  });
  function render() {
    const f = TestBed.createComponent(RegisterComponent);
    f.detectChanges();
    return f;
  }
  function fill(c: RegisterComponent) {
    c.name = 'Ana Silva';
    c.email = 'ana@example.com';
    c.password = 'abcdef';
    c.passwordConfirmation = 'abcdef';
  }
  it('rejects invalid fields and mismatched confirmation before HTTP', () => {
    const f = render();
    const c = f.componentInstance;
    fill(c);
    c.passwordConfirmation = 'different';
    c.onSubmit();
    expect(auth.register).not.toHaveBeenCalled();
    expect(c.errors()['password_confirmation']).toBe('As senhas não coincidem.');
  });
  it('sends the Laravel request and redirects the authenticated user to home', () => {
    const f = render();
    const c = f.componentInstance;
    fill(c);
    const nav = vi.spyOn(TestBed.inject(Router), 'navigate').mockResolvedValue(true);
    c.onSubmit();
    expect(auth.register).toHaveBeenCalledWith({
      name: 'Ana Silva',
      email: 'ana@example.com',
      password: 'abcdef',
      password_confirmation: 'abcdef',
    });
    expect(nav).toHaveBeenCalledWith(['/home']);
    expect(c.isLoading()).toBe(false);
  });
  it('renders Laravel 422 field errors and allows another attempt', () => {
    auth.register.mockReturnValue(
      throwError(
        () =>
          new HttpErrorResponse({
            status: 422,
            error: { errors: { email: ['Este e-mail já está em uso.'] } },
          }),
      ),
    );
    const f = render();
    const c = f.componentInstance;
    fill(c);
    c.onSubmit();
    f.detectChanges();
    expect(f.nativeElement.querySelector('#register-email-error').textContent).toContain(
      'já está em uso',
    );
    expect(c.isLoading()).toBe(false);
  });
});
