import { TestBed } from '@angular/core/testing';
import { ActivatedRoute, convertToParamMap, provideRouter, Router } from '@angular/router';
import { PREVIEW_PROVIDERS } from './preview-services';
import { PREVIEW_LINES } from './preview-data';
import { SearchComponent } from '../search/search.component';
import { HomeComponent } from '../home/home.component';
import { LineDetailsComponent } from '../line-details/line-details.component';

function configureRoute(id = '146') {
  TestBed.configureTestingModule({
    providers: [
      provideRouter([]),
      ...PREVIEW_PROVIDERS,
      {
        provide: ActivatedRoute,
        useValue: {
          snapshot: {
            data: { preview: true },
            queryParamMap: convertToParamMap({}),
            paramMap: convertToParamMap({ id }),
          },
        },
      },
    ],
  });
}

describe('Isolated visual preview', () => {
  it('renders the reference fixtures without HTTP services and keeps favorites temporary', () => {
    configureRoute();
    const fixture = TestBed.createComponent(SearchComponent);
    fixture.detectChanges();
    expect(fixture.componentInstance.allLines().map((line) => line.code)).toEqual([
      '146',
      '15',
      '152',
    ]);
    expect(fixture.componentInstance.allLines().map((line) => line.buses.length)).toEqual([
      4, 7, 3,
    ]);
    expect(fixture.nativeElement.querySelector('.preview-notice').textContent).toContain(
      'Dados de exemplo',
    );
    const heart = fixture.nativeElement.querySelector('.compact-favorite');
    heart.click();
    fixture.detectChanges();
    expect(heart.getAttribute('aria-pressed')).toBe('true');
    heart.click();
    fixture.detectChanges();
    expect(heart.getAttribute('aria-pressed')).toBe('false');
    expect(PREVIEW_LINES.every((line) => !line.isFavorite)).toBe(true);
    const navigate = vi.spyOn(TestBed.inject(Router), 'navigate').mockResolvedValue(true);
    fixture.nativeElement.querySelector('.compact-details').click();
    expect(navigate).toHaveBeenCalledWith(['/preview/lines', 146]);
  });

  it('renders the same fixtures on home and keeps navigation inside the preview', () => {
    configureRoute();
    const fixture = TestBed.createComponent(HomeComponent);
    fixture.detectChanges();
    expect(fixture.nativeElement.textContent).toContain('Pessoa');
    expect(fixture.nativeElement.querySelector('a.home-avatar').getAttribute('href')).toBe(
      '/preview/profile',
    );
    expect(
      fixture.nativeElement.querySelector('a.shortcut[href="/preview/favorites"]'),
    ).not.toBeNull();
    expect(fixture.nativeElement.querySelectorAll('.compact-line')).toHaveLength(3);
    expect(fixture.nativeElement.querySelector('.home-footer a').getAttribute('href')).toBe(
      '/preview/search',
    );
    const navigate = vi.spyOn(TestBed.inject(Router), 'navigate').mockResolvedValue(true);
    fixture.componentInstance.search();
    expect(navigate).toHaveBeenCalledWith(['/preview/search'], {
      queryParams: { from: null, to: null },
    });
    fixture.componentInstance.findStops();
    expect(navigate).toHaveBeenCalledWith(['/preview/stops'], { queryParams: { address: null } });
    fixture.componentInstance.viewDetails(fixture.componentInstance.lines()[0]);
    expect(navigate).toHaveBeenCalledWith(['/preview/lines', 146]);
  });

  it('opens sample details with buses and both directions, then returns to the preview', () => {
    configureRoute('15');
    TestBed.overrideComponent(LineDetailsComponent, { set: { template: '', imports: [] } });
    const fixture = TestBed.createComponent(LineDetailsComponent);
    fixture.detectChanges();
    const component = fixture.componentInstance;
    expect(component.line()?.name).toBe('CANT');
    expect(component.buses()).toHaveLength(7);
    expect(component.stopsOutbound()).toHaveLength(6);
    expect(component.stopsInbound()).toHaveLength(6);
    component.switchDirection(2);
    expect(component.routePoints()[0]).toEqual({
      lat: component.stopsInbound()[0].lat,
      lng: component.stopsInbound()[0].lng,
    });
    component.toggleFavorite();
    expect(component.line()?.isFavorite).toBe(true);
    component.toggleFavorite();
    expect(component.line()?.isFavorite).toBe(false);
    const navigate = vi.spyOn(TestBed.inject(Router), 'navigate').mockResolvedValue(true);
    component.goBack();
    expect(navigate).toHaveBeenCalledWith(['/preview/search']);
    fixture.destroy();
  });
});
