import { Component, signal } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { provideRouter, Router } from '@angular/router';
import { RouterTestingHarness } from '@angular/router/testing';
import { routes } from './app.routes';
import { AuthService } from './core/services/auth.service';

@Component({ standalone: true, template: '<p>Rota oficial</p>' })
class OfficialPage {}

for (const signedIn of [false, true]) {
  it(`não ativa URLs demonstrativas ${signedIn ? 'com' : 'sem'} sessão nas rotas do aplicativo`, async () => {
    TestBed.configureTestingModule({
      providers: [
        { provide: AuthService, useValue: { isAuthenticated: signal(signedIn) } },
        provideRouter(
          routes.map((route) =>
            route.loadComponent
              ? { ...route, loadComponent: () => Promise.resolve(OfficialPage) }
              : route,
          ),
        ),
      ],
    });
    const harness = await RouterTestingHarness.create();
    for (const url of [
      '/preview',
      '/preview/home',
      '/preview/profile',
      '/preview/search',
      '/preview/map',
      '/preview/stops',
      '/preview/favorites',
      '/preview/lines/146',
    ]) {
      await harness.navigateByUrl(url, OfficialPage);
      expect(TestBed.inject(Router).url).toBe(signedIn ? '/home' : '/');
      expect(harness.routeNativeElement?.textContent).toBe('Rota oficial');
    }
  });
}
