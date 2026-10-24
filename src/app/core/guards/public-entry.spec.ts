import { Component, signal } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { provideRouter, Router } from '@angular/router';
import { AuthService } from '../services/auth.service';
import { routes } from '../../app.routes';

@Component({ standalone: true, template: '' })
class Page {}
describe('Public and protected routing', () => {
  const authenticated = signal(false);
  beforeEach(() => {
    authenticated.set(false);
    TestBed.configureTestingModule({
      providers: [
        { provide: AuthService, useValue: { isAuthenticated: authenticated } },
        provideRouter(
          routes.map((route) =>
            route.loadComponent ? { ...route, loadComponent: () => Promise.resolve(Page) } : route,
          ),
        ),
      ],
    });
  });
  it('opens onboarding without a session and preserves login/register URLs', async () => {
    const router = TestBed.inject(Router);
    for (const url of ['/', '/login', '/register']) {
      await router.navigateByUrl(url);
      expect(router.url).toBe(url);
    }
  });
  it('opens Home rather than onboarding or auth screens for an existing session', async () => {
    authenticated.set(true);
    const router = TestBed.inject(Router);
    for (const url of ['/', '/login', '/register']) {
      await router.navigateByUrl(url);
      expect(router.url).toBe('/home');
    }
  });
  it('opens only the isolated preview without a session', async () => {
    const router = TestBed.inject(Router);
    await router.navigateByUrl('/preview/search');
    expect(router.url).toBe('/preview/search');
    await router.navigateByUrl('/preview/stops');
    expect(router.url).toBe('/preview/stops');
    await router.navigateByUrl('/preview/map');
    expect(router.url).toBe('/preview/map');
    await router.navigateByUrl('/preview/favorites');
    expect(router.url).toBe('/preview/favorites');
    await router.navigateByUrl('/preview/profile');
    expect(router.url).toBe('/preview/profile');
    await router.navigateByUrl('/preview/lines/146');
    expect(router.url).toBe('/preview/lines/146');
    expect(authenticated()).toBe(false);
  });
  it('keeps the existing guards on all authenticated routes', async () => {
    const router = TestBed.inject(Router);
    for (const url of [
      '/home',
      '/search',
      '/lines/7',
      '/favorites',
      '/map',
      '/profile',
      '/stops',
    ]) {
      await router.navigateByUrl(url);
      expect(router.url).toBe('/login');
    }
  });
});
