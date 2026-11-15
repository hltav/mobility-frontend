import { TestBed } from '@angular/core/testing';
import { provideHttpClient, withInterceptors } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { provideRouter, Router } from '@angular/router';
import { RouterTestingHarness } from '@angular/router/testing';
import { routes } from '../../app.routes';
import { AuthService } from '../../core/services/auth.service';
import { FavoritesService } from '../../core/services/favorites.service';
import { authInterceptor } from '../../core/interceptors/auth.interceptor';
import { environment } from '../../../environments/environment';
import { HomeComponent } from '../home/home.component';
import { OnboardingComponent } from '../onboarding/onboarding.component';

describe('Remoção das entradas demonstrativas e preservação da sessão', () => {
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

  it('redireciona a entrada demonstrativa para a Home com serviços reais e preserva a sessão', async () => {
    const realAuth = TestBed.inject(AuthService);
    const realFavorites = TestBed.inject(FavoritesService);
    const harness = await RouterTestingHarness.create();
    const realHome = await harness.navigateByUrl('/preview/home', HomeComponent);
    expect(TestBed.inject(Router).url).toBe('/home');
    expect(harness.routeDebugElement?.injector.get(FavoritesService)).toBe(realFavorites);
    expect(realAuth.isAuthenticated()).toBe(true);
    expect(localStorage.getItem('auth_token')).toBe('test-session');
    expect(localStorage.getItem('user')).toBe(JSON.stringify(sessionUser));
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
    expect(harness.routeNativeElement?.querySelector('.home-preview-notice')).toBeNull();
    expect(realAuth.getUser()).toEqual(sessionUser);
  });

  it('redireciona a URL demonstrativa para a entrada pública sem criar sessão', async () => {
    localStorage.removeItem('auth_token');
    localStorage.removeItem('user');
    const realAuth = TestBed.inject(AuthService);
    const harness = await RouterTestingHarness.create();
    await harness.navigateByUrl('/preview/profile', OnboardingComponent);
    expect(TestBed.inject(Router).url).toBe('/');
    expect(realAuth.isAuthenticated()).toBe(false);
    expect(localStorage.getItem('auth_token')).toBeNull();
    expect(localStorage.getItem('user')).toBeNull();
    http.expectNone(() => true);
  });

  it('keeps real API failure visible instead of substituting demonstration lines', async () => {
    const harness = await RouterTestingHarness.create();
    const home = await harness.navigateByUrl('/preview/home', HomeComponent);
    expect(TestBed.inject(Router).url).toBe('/home');
    http
      .expectOne((request) => request.url === `${environment.apiUrl}/lines`)
      .flush({ message: 'Indisponível' }, { status: 503, statusText: 'Service Unavailable' });
    http.expectOne(`${environment.apiUrl}/favorites`).flush({ data: [] });
    harness.detectChanges();
    expect(harness.routeNativeElement?.querySelector('.home-preview-notice')).toBeNull();
    expect(home.lines()).toEqual([]);
    expect(home.error()).toContain('Não foi possível carregar');
    expect(harness.routeNativeElement?.querySelectorAll('.compact-line')).toHaveLength(0);
  });
});
