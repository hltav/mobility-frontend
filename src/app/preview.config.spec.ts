import { Component } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { provideRouter, Router } from '@angular/router';
import { RouterTestingHarness } from '@angular/router/testing';
import { PREVIEW_ENABLED, PREVIEW_ENTRY_ROUTES } from './preview.config.prod';

@Component({ standalone: true, template: '<p>Entrada pública</p>' })
class PublicEntry {}

describe('Production preview boundary', () => {
  it('does not register or activate any demonstration URL in the production route configuration', async () => {
    TestBed.configureTestingModule({
      providers: [
        provideRouter([
          ...PREVIEW_ENTRY_ROUTES,
          { path: '', component: PublicEntry },
          { path: '**', redirectTo: '' },
        ]),
      ],
    });
    const harness = await RouterTestingHarness.create();
    expect(PREVIEW_ENABLED).toBe(false);
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
      await harness.navigateByUrl(url, PublicEntry);
      expect(TestBed.inject(Router).url).toBe('/');
      expect(harness.routeNativeElement?.textContent).toBe('Entrada pública');
    }
  });
});
