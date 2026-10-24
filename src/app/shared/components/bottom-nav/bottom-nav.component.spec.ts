import { TestBed } from '@angular/core/testing';
import { provideRouter, Router } from '@angular/router';
import { Component } from '@angular/core';
import { routes } from '../../../app.routes';
import { BottomNavComponent } from './bottom-nav.component';

@Component({ template: '', standalone: true })
class EmptyPage {}

describe('BottomNavComponent', () => {
  it('links only to implemented routes and exposes the current page', async () => {
    TestBed.configureTestingModule({
      imports: [BottomNavComponent],
      providers: [
        provideRouter(
          ['home', 'search', 'map', 'favorites', 'profile'].map((path) => ({
            path,
            component: EmptyPage,
          })),
        ),
      ],
    });
    const fixture = TestBed.createComponent(BottomNavComponent);
    fixture.detectChanges();
    await TestBed.inject(Router).navigateByUrl('/home');
    fixture.detectChanges();
    await fixture.whenStable();
    fixture.detectChanges();
    const links = Array.from(fixture.nativeElement.querySelectorAll('a')) as HTMLAnchorElement[];
    expect(links.map((link) => link.getAttribute('href'))).toEqual([
      '/home',
      '/search',
      '/map',
      '/favorites',
      '/profile',
    ]);
    expect(links[0].getAttribute('aria-current')).toBe('page');
    await TestBed.inject(Router).navigateByUrl('/map?line=15');
    fixture.detectChanges();
    await fixture.whenStable();
    fixture.detectChanges();
    expect(links[2].getAttribute('aria-current')).toBe('page');
    fixture.componentRef.setInput('preview', true);
    fixture.detectChanges();
    expect(fixture.nativeElement.querySelector('a[href="/preview/map"]')).not.toBeNull();
    for (const item of fixture.componentInstance.items) {
      expect(routes.some((route) => '/' + route.path === item.path && route.loadComponent)).toBe(
        true,
      );
    }
  });
});
