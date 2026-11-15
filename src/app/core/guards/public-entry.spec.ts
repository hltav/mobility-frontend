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
  for (const signedIn of [false, true]) {
    it(`não disponibiliza URLs demonstrativas ${signedIn ? 'com' : 'sem'} sessão`, async () => {
      authenticated.set(signedIn);
      const router = TestBed.inject(Router);
      expect(routes.some((route) => route.path?.startsWith('preview'))).toBe(false);
      for (const url of [
        '/preview',
        '/preview/home',
        '/preview/search',
        '/preview/stops',
        '/preview/map',
        '/preview/favorites',
        '/preview/profile',
        '/preview/lines/146',
      ]) {
        await router.navigateByUrl(url);
        expect(router.url).toBe(signedIn ? '/home' : '/');
        expect(authenticated()).toBe(signedIn);
      }
    });
  }
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
