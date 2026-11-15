import { TestBed } from '@angular/core/testing';
import { ActivatedRoute, convertToParamMap, provideRouter, Router } from '@angular/router';
import { TEST_PROVIDERS } from '../../../testing/providers/transit.providers';
import { TEST_LINES } from '../../../testing/fixtures/transit.fixture';
import { SearchComponent } from '../search/search.component';
import { HomeComponent } from '../home/home.component';
import { LineDetailsComponent } from '../line-details/line-details.component';

function configureRoute(id = '146') {
  TestBed.configureTestingModule({
    providers: [
      provideRouter([]),
      ...TEST_PROVIDERS,
      {
        provide: ActivatedRoute,
        useValue: {
          snapshot: {
            queryParamMap: convertToParamMap({}),
            paramMap: convertToParamMap({ id }),
          },
        },
      },
    ],
  });
}

describe('Fluxos oficiais com providers exclusivos de teste', () => {
  it('renderiza fixtures sem HTTP e abre a gestão oficial de favoritos após salvar', () => {
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
    expect(fixture.nativeElement.querySelector('.preview-notice')).toBeNull();
    const navigate = vi.spyOn(TestBed.inject(Router), 'navigate').mockResolvedValue(true);
    const heart = fixture.nativeElement.querySelector('.compact-favorite');
    heart.click();
    fixture.detectChanges();
    expect(heart.getAttribute('aria-pressed')).toBe('true');
    heart.click();
    fixture.detectChanges();
    expect(heart.getAttribute('aria-pressed')).toBe('true');
    expect(navigate).toHaveBeenCalledWith(['/favorites']);
    expect(TEST_LINES.every((line) => !line.isFavorite)).toBe(true);
    fixture.nativeElement.querySelector('.compact-details').click();
    expect(navigate).toHaveBeenCalledWith(['/lines', 146]);
  });

  it('renderiza fixtures isoladas na Home com navegação para as rotas oficiais', () => {
    configureRoute();
    const fixture = TestBed.createComponent(HomeComponent);
    fixture.detectChanges();
    expect(fixture.nativeElement.textContent).toContain('Pessoa');
    expect(fixture.nativeElement.querySelector('a.home-avatar').getAttribute('href')).toBe(
      '/profile',
    );
    expect(fixture.nativeElement.querySelector('a.shortcut[href="/favorites"]')).not.toBeNull();
    expect(fixture.nativeElement.querySelectorAll('.compact-line')).toHaveLength(3);
    expect(fixture.nativeElement.querySelector('.home-footer a').getAttribute('href')).toBe(
      '/search',
    );
    const navigate = vi.spyOn(TestBed.inject(Router), 'navigate').mockResolvedValue(true);
    fixture.componentInstance.search();
    expect(navigate).toHaveBeenCalledWith(['/search'], {
      queryParams: { from: null, to: null },
    });
    fixture.componentInstance.findStops();
    expect(navigate).toHaveBeenCalledWith(['/stops'], { queryParams: { address: null } });
    fixture.componentInstance.viewDetails(fixture.componentInstance.lines()[0]);
    expect(navigate).toHaveBeenCalledWith(['/lines', 146]);
  });

  it('renderiza detalhes com providers de teste e retorna à busca oficial', () => {
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
    const navigate = vi.spyOn(TestBed.inject(Router), 'navigate').mockResolvedValue(true);
    component.toggleFavorite();
    expect(component.line()?.isFavorite).toBe(true);
    expect(navigate).toHaveBeenCalledWith(['/favorites']);
    component.goBack();
    expect(navigate).toHaveBeenCalledWith(['/search']);
    fixture.destroy();
  });
});
