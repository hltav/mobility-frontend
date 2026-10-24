import { TestBed } from '@angular/core/testing';
import { provideHttpClient, withInterceptors, HttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { provideRouter, Router } from '@angular/router';
import { AuthService } from './auth.service';
import { authInterceptor } from '../interceptors/auth.interceptor';
import { environment } from '../../../environments/environment';

const response = {
  message: 'Sucesso',
  data: {
    token: 'test-token',
    user: {
      id: 7,
      name: 'Ana Silva',
      email: 'ana@example.com',
      avatar: null,
      google_id: null,
      email_verified_at: null,
      created_at: '2026-01-01',
      updated_at: '2026-01-01',
    },
  },
};
describe('Official Laravel authentication', () => {
  let service: AuthService;
  let http: HttpTestingController;
  let navigate: ReturnType<typeof vi.spyOn>;
  beforeEach(() => {
    localStorage.clear();
    TestBed.configureTestingModule({
      providers: [
        provideRouter([]),
        provideHttpClient(withInterceptors([authInterceptor])),
        provideHttpClientTesting(),
      ],
    });
    navigate = vi.spyOn(TestBed.inject(Router), 'navigate').mockResolvedValue(true);
    service = TestBed.inject(AuthService);
    http = TestBed.inject(HttpTestingController);
  });
  afterEach(() => {
    http.verify();
    localStorage.clear();
  });
  it('normalizes login and persists the existing token/user keys', () => {
    service.login({ email: 'ana@example.com', password: 'abcdef' }).subscribe();
    http.expectOne(environment.apiUrl + '/auth/login').flush(response);
    expect(localStorage.getItem('auth_token')).toBe('test-token');
    expect(service.getUser()?.name).toBe('Ana Silva');
    expect(service.isAuthenticated()).toBe(true);
  });
  it('normalizes the registration envelope exactly once', () => {
    service
      .register({
        name: 'Ana Silva',
        email: 'ana@example.com',
        password: 'abcdef',
        password_confirmation: 'abcdef',
      })
      .subscribe((result) => expect(result.token).toBe('test-token'));
    const request = http.expectOne(environment.apiUrl + '/auth/register');
    expect(request.request.body.password_confirmation).toBe('abcdef');
    request.flush(response, { status: 201, statusText: 'Created' });
    expect(service.isAuthenticated()).toBe(true);
    expect(service.getUser()?.id).toBe(7);
  });
  it('clears session immediately on logout, retains its captured bearer, and does not loop on 401', () => {
    service.saveAuthData(response.data);
    service.logout();
    expect(localStorage.getItem('auth_token')).toBeNull();
    expect(service.isAuthenticated()).toBe(false);
    const request = http.expectOne(environment.apiUrl + '/auth/logout');
    expect(request.request.headers.get('Authorization')).toBe('Bearer test-token');
    request.flush({}, { status: 401, statusText: 'Unauthorized' });
    http.expectNone(environment.apiUrl + '/auth/logout');
    expect(navigate).toHaveBeenCalledWith(['/login']);
  });
  it('invalidates an expired session without calling the remote logout endpoint', () => {
    service.saveAuthData(response.data);
    TestBed.inject(HttpClient)
      .get(environment.apiUrl + '/favorites')
      .subscribe({ error: () => {} });
    const request = http.expectOne(environment.apiUrl + '/favorites');
    expect(request.request.headers.get('Authorization')).toBe('Bearer test-token');
    request.flush({}, { status: 401, statusText: 'Unauthorized' });
    expect(service.isAuthenticated()).toBe(false);
    http.expectNone(environment.apiUrl + '/auth/logout');
  });
  it('does not send a bearer to external or lookalike API URLs', () => {
    service.saveAuthData(response.data);
    const client = TestBed.inject(HttpClient);
    for (const url of [
      'https://router.project-osrm.org/route/v1/driving/test',
      environment.apiUrl + '-other',
    ]) {
      client.get(url).subscribe();
      const request = http.expectOne(url);
      expect(request.request.headers.has('Authorization')).toBe(false);
      request.flush({});
    }
  });
  it('treats incorrect login credentials as a form error without remote logout', () => {
    localStorage.setItem('auth_token', 'old-token');
    service.login({ email: 'ana@example.com', password: 'abcdef' }).subscribe({ error: () => {} });
    const request = http.expectOne(environment.apiUrl + '/auth/login');
    expect(request.request.headers.has('Authorization')).toBe(false);
    request.flush({}, { status: 401, statusText: 'Unauthorized' });
    expect(navigate).not.toHaveBeenCalled();
    http.expectNone(environment.apiUrl + '/auth/logout');
  });
  it('never creates a session from a malformed successful response', () => {
    let failed = false;
    service
      .login({ email: 'ana@example.com', password: 'abcdef' })
      .subscribe({ error: () => (failed = true) });
    http.expectOne(environment.apiUrl + '/auth/login').flush({ message: 'ok', data: {} });
    expect(failed).toBe(true);
    expect(localStorage.getItem('auth_token')).toBeNull();
  });
});
