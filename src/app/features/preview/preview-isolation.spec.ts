import { TestBed } from '@angular/core/testing';
import { provideHttpClient, withInterceptors } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { provideRouter } from '@angular/router';
import { RouterTestingHarness } from '@angular/router/testing';
import { routes } from '../../app.routes';
import { AuthService } from '../../core/services/auth.service';
import { FavoritesService } from '../../core/services/favorites.service';
import { authInterceptor } from '../../core/interceptors/auth.interceptor';
import { environment } from '../../../environments/environment';
import { HomeComponent } from '../home/home.component';
import { ProfileComponent } from '../profile/profile.component';
import { PreviewAuthService } from './preview-services';

describe('Development demo and real session separation', () => {
  const sessionUser = {
    id: 7,
    name: 'Pessoa da sessão de teste',
    email: 'session@example.invalid',
  };
  let originalToken: string | null;
  let originalUser: string | null;
  let http: HttpTestingController;

  beforeEach(() => {
    originalToken = localStorage.getItem('auth_token');
    originalUser = localStorage.getItem('user');
    localStorage.setItem('auth_token', 'test-session');
    localStorage.setItem('user', JSON.stringify(sessionUser));
    TestBed.configureTestingModule({
      providers: [
        provideRouter(routes),
        provideHttpClient(withInterceptors([authInterceptor])),
        provideHttpClientTesting(),
      ],
    });
    http = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    http.verify();
    for (const [key, value] of Object.entries({ auth_token: originalToken, user: originalUser })) {
      if (value === null) localStorage.removeItem(key);
      else localStorage.setItem(key, value);
    }
  });

  it('uses only a synthetic identity and temporary favorites in real lazy demo routes, preserving the stored session', async () => {
    const realAuth = TestBed.inject(AuthService);
    const realFavorites = TestBed.inject(FavoritesService);
    const harness = await RouterTestingHarness.create();
    const home = await harness.navigateByUrl('/preview/home', HomeComponent);
    const demoAuth = harness.routeDebugElement!.injector.get(AuthService);
    expect(demoAuth).toBeInstanceOf(PreviewAuthService);
    expect(demoAuth).not.toBe(realAuth);
    expect(demoAuth.getToken()).toBeNull();
    expect(demoAuth.isAuthenticated()).toBe(false);
    expect(home.firstName).toBe('Pessoa');
    expect(harness.routeNativeElement?.textContent).not.toContain(sessionUser.name);
    expect(harness.routeDebugElement!.injector.get(FavoritesService)).not.toBe(realFavorites);
    home.toggleFavorite(home.lines()[0]);
    const profile = await harness.navigateByUrl('/preview/profile', ProfileComponent);
    expect(profile.user).toEqual({
      id: 0,
      name: 'Pessoa de demonstração',
      email: 'demo@example.invalid',
    });
    expect(profile.favoritesCount()).toBe(1);
    expect(harness.routeNativeElement?.textContent).not.toContain(sessionUser.email);
    demoAuth.logout();
    expect(realAuth.isAuthenticated()).toBe(true);
    expect(localStorage.getItem('auth_token')).toBe('test-session');
    expect(JSON.parse(localStorage.getItem('user')!)).toEqual(sessionUser);
    http.expectNone(() => true);

    const realHome = await harness.navigateByUrl('/home', HomeComponent);
    expect(harness.routeDebugElement!.injector.get(AuthService)).toBe(realAuth);
    expect(realHome.firstName).toBe('Pessoa');
    const lines = http.expectOne((request) => request.url === `${environment.apiUrl}/lines`);
    expect(lines.request.headers.get('Authorization')).toBe('Bearer test-session');
    lines.flush({
      data: [
        {
          id: 8,
          sptrans_id: 9001,
          code: 'REAL',
          name: 'Linha da API de teste',
          origin: 'Origem',
          destination: 'Destino',
        },
      ],
    });
    http.expectOne(`${environment.apiUrl}/favorites`).flush({ data: [] });
    harness.detectChanges();
    expect(realHome.lines().map((line) => line.code)).toEqual(['REAL']);
    expect(realHome.isPreview).toBe(false);
    expect(realAuth.getUser()).toEqual(sessionUser);
  });

  it('opens the demo without a token and never creates a real session', async () => {
    localStorage.removeItem('auth_token');
    localStorage.removeItem('user');
    const realAuth = TestBed.inject(AuthService);
    const harness = await RouterTestingHarness.create();
    const profile = await harness.navigateByUrl('/preview/profile', ProfileComponent);
    expect(profile.user?.email).toBe('demo@example.invalid');
    expect(realAuth.isAuthenticated()).toBe(false);
    expect(localStorage.getItem('auth_token')).toBeNull();
    expect(localStorage.getItem('user')).toBeNull();
    http.expectNone(() => true);
  });

  it('keeps real API failure visible instead of substituting demonstration lines', async () => {
    const harness = await RouterTestingHarness.create();
    await harness.navigateByUrl('/preview/home', HomeComponent);
    const home = await harness.navigateByUrl('/home', HomeComponent);
    http
      .expectOne((request) => request.url === `${environment.apiUrl}/lines`)
      .flush({ message: 'Indisponível' }, { status: 503, statusText: 'Service Unavailable' });
    http.expectOne(`${environment.apiUrl}/favorites`).flush({ data: [] });
    harness.detectChanges();
    expect(home.isPreview).toBe(false);
    expect(home.lines()).toEqual([]);
    expect(home.error()).toContain('Não foi possível carregar');
    expect(harness.routeNativeElement?.querySelectorAll('.compact-line')).toHaveLength(0);
  });
});
