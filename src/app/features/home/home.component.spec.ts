import { TestBed } from '@angular/core/testing';
import { provideRouter, Router } from '@angular/router';
import { of, Subject, throwError } from 'rxjs';
import { AuthService } from '../../core/services/auth.service';
import { BusLinesService } from '../../core/services/bus-lines.service';
import { FavoritesService } from '../../core/services/favorites.service';
import { HomeComponent } from './home.component';

describe('HomeComponent', () => {
  const line = {
    id: 7,
    database_id: 7,
    sptrans_id: 33624,
    code: '8000-10',
    name: 'Linha de teste',
    origin: 'Origem',
    destination: 'Destino',
    buses: [],
    isFavorite: false,
  };
  const busLines = { getAll: vi.fn(), findNearby: vi.fn(), reverseGeocode: vi.fn() };
  const favorites = { getFavorites: vi.fn(), addFavorite: vi.fn() };
  const auth = { getUser: vi.fn(() => ({ name: 'Ana Silva' })) };

  beforeEach(() => {
    vi.clearAllMocks();
    busLines.getAll.mockReturnValue(of([line]));
    favorites.getFavorites.mockReturnValue(of([]));
    favorites.addFavorite.mockReturnValue(of({}));
    TestBed.configureTestingModule({
      imports: [HomeComponent],
      providers: [
        provideRouter([]),
        { provide: AuthService, useValue: auth },
        { provide: BusLinesService, useValue: busLines },
        { provide: FavoritesService, useValue: favorites },
      ],
    });
  });

  function render() {
    const fixture = TestBed.createComponent(HomeComponent);
    fixture.detectChanges();
    return fixture;
  }

  it('uses the authenticated user and renders lines returned by the official service', () => {
    const fixture = render();
    expect(fixture.nativeElement.textContent).toContain('Ana');
    expect(fixture.nativeElement.textContent).toContain('8000-10');
    expect(busLines.getAll).toHaveBeenCalledWith({ per_page: 3 });
    expect(fixture.nativeElement.textContent).not.toMatch(/\d+\s*min\b/);
  });

  it('limits the home preview to three cards and filters the returned lines locally', () => {
    busLines.getAll.mockReturnValue(
      of([
        line,
        { ...line, id: 8, name: 'Terminal Lapa' },
        { ...line, id: 9, name: 'Praça da Sé' },
        { ...line, id: 10, name: 'Vila Mariana' },
      ]),
    );
    const fixture = render();
    expect(fixture.nativeElement.querySelectorAll('app-line-card')).toHaveLength(3);
    fixture.componentInstance.filterTerm.set('mariana');
    fixture.detectChanges();
    expect(fixture.nativeElement.querySelectorAll('app-line-card')).toHaveLength(1);
    expect(fixture.nativeElement.textContent).toContain('Vila Mariana');
    expect(busLines.getAll).toHaveBeenCalledTimes(1);
    fixture.componentInstance.filterTerm.set('inexistente');
    fixture.detectChanges();
    expect(fixture.nativeElement.textContent).toContain('Nenhuma linha corresponde ao filtro');
  });

  it('shows loading, error and retry instead of substituting demo lines', () => {
    const response = new Subject<never>();
    busLines.getAll.mockReturnValue(response);
    const fixture = render();
    expect(fixture.nativeElement.textContent).toContain('Buscando linhas');
    response.error(new Error('offline'));
    fixture.detectChanges();
    expect(fixture.nativeElement.querySelector('[role="alert"]').textContent).toContain(
      'Não foi possível',
    );
    expect(fixture.nativeElement.querySelector('app-line-card')).toBeNull();
    busLines.getAll.mockReturnValue(of([line]));
    fixture.nativeElement.querySelector('[role="alert"] button').click();
    fixture.detectChanges();
    expect(fixture.nativeElement.querySelector('app-line-card')).not.toBeNull();
  });

  it('provides a real empty state', () => {
    busLines.getAll.mockReturnValue(of([]));
    const fixture = render();
    expect(fixture.nativeElement.textContent).toContain('Nenhuma linha disponível');
    expect(fixture.nativeElement.querySelector('a[href="/preview/home"]')?.textContent).toContain(
      'Visualizar com dados de exemplo',
    );
  });

  it('opens nearby stops from the Home action and passes the origin address', () => {
    const fixture = render();
    fixture.componentInstance.fromTerm = '  Terminal Lapa  ';
    const navigate = vi.spyOn(TestBed.inject(Router), 'navigate').mockResolvedValue(true);
    fixture.nativeElement.querySelector('.journey-actions button').click();
    expect(navigate).toHaveBeenCalledWith(['/stops'], {
      queryParams: { address: 'Terminal Lapa' },
    });
  });

  it('passes the journey to the existing search route', () => {
    const fixture = render();
    const navigate = vi.spyOn(TestBed.inject(Router), 'navigate').mockResolvedValue(true);
    fixture.componentInstance.fromTerm = '  Terminal Lapa  ';
    fixture.componentInstance.toTerm = 'Praça da Sé';
    fixture.componentInstance.search();
    expect(navigate).toHaveBeenCalledWith(['/search'], {
      queryParams: { from: 'Terminal Lapa', to: 'Praça da Sé' },
    });
  });

  it('uses the internal ID for details and the official favorite resolver for additions', () => {
    const fixture = render();
    const component = fixture.componentInstance;
    const navigate = vi.spyOn(TestBed.inject(Router), 'navigate').mockResolvedValue(true);
    component.viewDetails(line);
    expect(navigate).toHaveBeenCalledWith(['/lines', 7]);
    component.toggleFavorite(line);
    expect(favorites.addFavorite).toHaveBeenCalledWith(line);
    expect(component.isFavorite(line)).toBe(true);
    component.toggleFavorite(line);
    expect(navigate).toHaveBeenLastCalledWith(['/favorites']);
    expect(favorites.addFavorite).toHaveBeenCalledTimes(1);
  });

  it('does not guess an internal ID for a line known only by SPTrans', () => {
    const fixture = render();
    const navigate = vi.spyOn(TestBed.inject(Router), 'navigate').mockResolvedValue(true);
    fixture.componentInstance.viewDetails({ ...line, database_id: null, id: 33624 });
    expect(navigate).not.toHaveBeenCalled();
  });

  it('disables favorite changes when their state could not be loaded', () => {
    favorites.getFavorites.mockReturnValue(throwError(() => new Error('offline')));
    const fixture = render();
    fixture.componentInstance.toggleFavorite(line);
    expect(favorites.addFavorite).not.toHaveBeenCalled();
    expect(fixture.nativeElement.textContent).toContain('Favoritos indisponíveis');
  });

  it('requires an origin before asking the nearby API', () => {
    const fixture = render();
    fixture.componentInstance.loadNearby();
    expect(busLines.findNearby).not.toHaveBeenCalled();
    expect(fixture.componentInstance.locationMessage()).toContain('endereço');
  });

  it('cancels the previous line request when switching to nearby results', () => {
    const previous = new Subject<never>();
    busLines.getAll.mockReturnValue(previous);
    busLines.findNearby.mockReturnValue(of({ origin: { address: 'Lapa' }, lines: [] }));
    const fixture = render();
    expect(previous.observed).toBe(true);
    fixture.componentInstance.fromTerm = 'Lapa';
    fixture.componentInstance.loadNearby();
    expect(previous.observed).toBe(false);
    expect(fixture.componentInstance.nearby()).toBe(true);
    expect(fixture.componentInstance.loading()).toBe(false);
  });

  it('uses real nearby results without fabricating distances or arrival predictions', () => {
    busLines.findNearby.mockReturnValue(
      of({ origin: { address: 'Lapa', lat: -23.5, lng: -46.7 }, lines: [line] }),
    );
    const fixture = render();
    fixture.componentInstance.fromTerm = 'Lapa';
    fixture.componentInstance.loadNearby();
    fixture.detectChanges();
    expect(busLines.findNearby).toHaveBeenCalledWith('Lapa');
    expect(fixture.componentInstance.nearby()).toBe(true);
    expect(fixture.nativeElement.textContent).toContain('Linhas próximas');
  });

  it('handles denied geolocation with a manual-address alternative', () => {
    const original = Object.getOwnPropertyDescriptor(navigator, 'geolocation');
    Object.defineProperty(navigator, 'geolocation', {
      configurable: true,
      value: {
        getCurrentPosition: (_success: unknown, fail: (error: { code: number }) => void) =>
          fail({ code: 1 }),
      },
    });
    try {
      const fixture = render();
      fixture.componentInstance.useCurrentLocation();
      expect(fixture.componentInstance.locating()).toBe(false);
      expect(fixture.componentInstance.locationMessage()).toContain('não autorizada');
      expect(busLines.reverseGeocode).not.toHaveBeenCalled();
    } finally {
      if (original) Object.defineProperty(navigator, 'geolocation', original);
      else Reflect.deleteProperty(navigator, 'geolocation');
    }
  });
});
