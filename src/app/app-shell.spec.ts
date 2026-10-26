import { Component, signal } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { provideRouter, Router } from '@angular/router';
import { AppComponent } from './app.component';
import { authGuard } from './core/guards/auth.guard';
import { AuthService } from './core/services/auth.service';

@Component({ standalone: true, template: '<p>Página de teste</p>' })
class Page {}

describe('Authenticated mobile shell', () => {
  const auth = { isAuthenticated: signal(true), logout: vi.fn() };
  beforeEach(() => {
    auth.isAuthenticated.set(true);
    TestBed.configureTestingModule({
      imports: [AppComponent],
      providers: [
        { provide: AuthService, useValue: auth },
        provideRouter([
          { path: '', pathMatch: 'full', component: Page },
          { path: 'login', component: Page },
          { path: 'register', component: Page },
          { path: 'home', component: Page, canActivate: [authGuard] },
          { path: 'search', component: Page, canActivate: [authGuard] },
          { path: 'favorites', component: Page, canActivate: [authGuard] },
          { path: 'profile', component: Page, canActivate: [authGuard] },
          { path: 'lines/:id', component: Page, canActivate: [authGuard] },
          { path: 'stops', component: Page, canActivate: [authGuard] },
        ]),
      ],
    });
  });

  it('hides bottom navigation on public pages and displays it in the authenticated area', async () => {
    const fixture = TestBed.createComponent(AppComponent);
    fixture.detectChanges();
    const router = TestBed.inject(Router);
    for (const path of ['/login', '/register']) {
      await router.navigateByUrl(path);
      fixture.detectChanges();
      expect(fixture.nativeElement.querySelector('app-bottom-nav')).toBeNull();
    }
    for (const path of ['/home', '/search', '/favorites']) {
      await router.navigateByUrl(path);
      fixture.detectChanges();
      expect(fixture.nativeElement.querySelector('app-bottom-nav')).not.toBeNull();
      expect(fixture.nativeElement.querySelector('.app-shell--authenticated')).not.toBeNull();
    }
  });

  it('uses the dedicated details toolbar instead of the global navigation', async () => {
    const fixture = TestBed.createComponent(AppComponent);
    fixture.detectChanges();
    await TestBed.inject(Router).navigateByUrl('/lines/146');
    fixture.detectChanges();
    expect(fixture.nativeElement.querySelector('.app-shell--details')).not.toBeNull();
    expect(fixture.nativeElement.querySelector('app-navbar')).toBeNull();
    expect(fixture.nativeElement.querySelector('app-bottom-nav')).toBeNull();
  });

  it('returns the internal content to the top when navigating between pages', async () => {
    const fixture = TestBed.createComponent(AppComponent);
    fixture.detectChanges();
    const router = TestBed.inject(Router);
    await router.navigateByUrl('/home');
    fixture.detectChanges();
    const content = fixture.nativeElement.querySelector('main') as HTMLElement;
    content.scrollTop = 400;

    await router.navigateByUrl('/profile');
    fixture.detectChanges();

    expect(content.scrollTop).toBe(0);
    expect(fixture.nativeElement.querySelector('app-bottom-nav')).not.toBeNull();
  });

  it('limits the landing composition to the public root route', async () => {
    const fixture = TestBed.createComponent(AppComponent);
    fixture.detectChanges();
    const router = TestBed.inject(Router);
    await router.navigateByUrl('/');
    fixture.detectChanges();
    expect(fixture.nativeElement.querySelector('.app-shell--landing')).not.toBeNull();

    for (const path of ['/login', '/register', '/home']) {
      await router.navigateByUrl(path);
      fixture.detectChanges();
      expect(fixture.nativeElement.querySelector('.app-shell--landing')).toBeNull();
    }
  });

  it('uses the screen headers and retains bottom navigation for Favorites and Profile', async () => {
    const fixture = TestBed.createComponent(AppComponent);
    fixture.detectChanges();
    for (const path of ['/favorites', '/profile']) {
      await TestBed.inject(Router).navigateByUrl(path);
      fixture.detectChanges();
      expect(fixture.nativeElement.querySelector('.app-shell--compact')).not.toBeNull();
      expect(fixture.nativeElement.querySelector('app-navbar')).toBeNull();
      expect(fixture.nativeElement.querySelector('app-bottom-nav')).not.toBeNull();
    }
  });

  it('uses a dedicated nearby stops header without global navigation', async () => {
    const fixture = TestBed.createComponent(AppComponent);
    fixture.detectChanges();
    await TestBed.inject(Router).navigateByUrl('/stops');
    fixture.detectChanges();
    expect(fixture.nativeElement.querySelector('.app-shell--stops')).not.toBeNull();
    expect(fixture.nativeElement.querySelector('app-navbar')).toBeNull();
    expect(fixture.nativeElement.querySelector('app-bottom-nav')).toBeNull();
  });

  it('preserves the auth guard and does not expose Home without a session', async () => {
    auth.isAuthenticated.set(false);
    const fixture = TestBed.createComponent(AppComponent);
    fixture.detectChanges();
    const router = TestBed.inject(Router);
    await router.navigateByUrl('/home');
    fixture.detectChanges();
    expect(router.url).toBe('/login');
    expect(fixture.nativeElement.querySelector('app-bottom-nav')).toBeNull();
  });
});
