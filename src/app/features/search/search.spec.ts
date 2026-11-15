import { TestBed } from '@angular/core/testing';
import { ActivatedRoute, convertToParamMap, provideRouter, Router } from '@angular/router';
import { of, Subject, throwError } from 'rxjs';
import { BusLinesService } from '../../core/services/bus-lines.service';
import { FavoritesService } from '../../core/services/favorites.service';
import { BusLine } from '../../core/schemas/bus-line.schema';
import { SearchComponent } from './search.component';
import { ToastService } from '../../shared/services/toast.service';

// Integration boundary introduced by the Home; existing search logic stays in place.
describe('SearchComponent journey entry', () => {
  const busLines = {
    getAll: vi.fn(),
    findNearby: vi.fn(),
    findNearbySafe: vi.fn(),
    findTripLinesSafe: vi.fn(),
    reverseGeocode: vi.fn(),
  };
  const favorites = { getFavorites: vi.fn(), addFavorite: vi.fn() };
  const line: BusLine = {
    id: 100,
    database_id: 7,
    sptrans_id: 100,
    code: '8000-10',
    name: 'Lapa',
    origin: 'Lapa',
    destination: 'Centro',
    buses: [],
    isFavorite: false,
  };
  beforeEach(() => {
    vi.clearAllMocks();
    favorites.getFavorites.mockReturnValue(of([]));
    favorites.addFavorite.mockReturnValue(of({}));
    busLines.getAll.mockReturnValue(of([]));
    busLines.findNearby.mockReturnValue(of({ origin: null, lines: [] }));
    busLines.findNearbySafe.mockReturnValue(of({ origin: null, lines: [] }));
    busLines.findTripLinesSafe.mockReturnValue(of([]));
    busLines.reverseGeocode.mockReturnValue(of('Origem de teste'));
  });
  function render(params: Record<string, string> = {}) {
    TestBed.configureTestingModule({
      imports: [SearchComponent],
      providers: [
        provideRouter([]),
        {
          provide: ActivatedRoute,
          useValue: { snapshot: { queryParamMap: convertToParamMap(params) } },
        },
        { provide: BusLinesService, useValue: busLines },
        { provide: FavoritesService, useValue: favorites },
      ],
    });
    const fixture = TestBed.createComponent(SearchComponent);
    fixture.detectChanges();
    return fixture;
  }
  it('preserves the existing available-lines entry without journey parameters', () => {
    const fixture = render();
    expect(fixture.componentInstance).toBeTruthy();
    expect(fixture.nativeElement.querySelector('a[href="/preview/search"]')).toBeNull();
    expect(busLines.getAll).toHaveBeenCalledWith({ per_page: 50 });
    expect(busLines.findTripLinesSafe).not.toHaveBeenCalled();
  });
  it('renders all results as compact cards and opens details using the database ID', () => {
    busLines.getAll.mockReturnValue(
      of([line, ...[2, 3, 4].map((id) => ({ ...line, id, code: String(id) }))]),
    );
    const fixture = render();
    expect(fixture.nativeElement.querySelectorAll('.compact-line')).toHaveLength(4);
    const navigate = vi.spyOn(TestBed.inject(Router), 'navigate').mockResolvedValue(true);
    fixture.nativeElement.querySelector('.compact-details').click();
    expect(navigate).toHaveBeenCalledWith(['/lines', 7]);
  });
  it('updates the compact favorite state and opens favorites for an already saved line', () => {
    busLines.getAll.mockReturnValue(of([line]));
    const fixture = render();
    const navigate = vi.spyOn(TestBed.inject(Router), 'navigate').mockResolvedValue(true);
    fixture.nativeElement.querySelector('.compact-favorite').click();
    fixture.detectChanges();
    expect(favorites.addFavorite).toHaveBeenCalledWith(expect.objectContaining({ database_id: 7 }));
    expect(
      fixture.nativeElement.querySelector('.compact-favorite').getAttribute('aria-pressed'),
    ).toBe('true');
    fixture.nativeElement.querySelector('.compact-favorite').click();
    expect(navigate).toHaveBeenCalledWith(['/favorites']);
    expect(favorites.addFavorite).toHaveBeenCalledTimes(1);
  });
  it('disables favorite changes while their initial state is loading', () => {
    const pending = new Subject<BusLine[]>();
    favorites.getFavorites.mockReturnValue(pending);
    busLines.getAll.mockReturnValue(of([line]));
    const fixture = render();
    expect(fixture.nativeElement.querySelector('.compact-favorite').disabled).toBe(true);
    pending.next([{ ...line, isFavorite: true }]);
    fixture.detectChanges();
    expect(fixture.nativeElement.querySelector('.compact-favorite').disabled).toBe(false);
    expect(
      fixture.nativeElement.querySelector('.compact-favorite').getAttribute('aria-pressed'),
    ).toBe('true');
  });
  it('does not navigate to details using a SPTrans-only identifier', () => {
    busLines.getAll.mockReturnValue(of([{ ...line, database_id: null }]));
    const fixture = render();
    const navigate = vi.spyOn(TestBed.inject(Router), 'navigate').mockResolvedValue(true);
    fixture.nativeElement.querySelector('.compact-chevron').click();
    expect(navigate).not.toHaveBeenCalled();
  });
  it('filters by code, name, origin and destination without showing unrelated results', () => {
    busLines.getAll.mockReturnValue(
      of([
        line,
        {
          ...line,
          id: 2,
          code: '15',
          name: 'Sé',
          origin: 'Praça da Sé',
          destination: 'Vila Mariana',
        },
      ]),
    );
    const fixture = render();
    for (const term of ['8000', 'lapa', 'centro']) {
      fixture.componentInstance.query.set(term);
      fixture.detectChanges();
      expect(fixture.nativeElement.querySelectorAll('.compact-line')).toHaveLength(1);
      expect(fixture.nativeElement.querySelector('.compact-name').textContent).toContain('Lapa');
    }
    fixture.componentInstance.query.set('inexistente');
    fixture.detectChanges();
    expect(fixture.nativeElement.querySelectorAll('.compact-line')).toHaveLength(0);
    expect(fixture.nativeElement.textContent).toContain('Nenhuma linha encontrada');
  });
  it('requests server results after typing and cancels stale requests', async () => {
    vi.useFakeTimers();
    try {
      const fixture = render();
      const first = new Subject<BusLine[]>();
      const second = new Subject<BusLine[]>();
      busLines.getAll.mockReturnValueOnce(first).mockReturnValueOnce(second);
      fixture.componentInstance.onQueryChange('Lapa');
      await vi.advanceTimersByTimeAsync(250);
      expect(busLines.getAll).toHaveBeenLastCalledWith({ term: 'Lapa', per_page: 50 });
      fixture.componentInstance.onQueryChange('Centro');
      await vi.advanceTimersByTimeAsync(250);
      expect(first.observed).toBe(false);
      second.next([line]);
      second.complete();
      expect(fixture.componentInstance.isLoading()).toBe(false);
      expect(fixture.componentInstance.filteredLines()).toHaveLength(1);
    } finally {
      vi.useRealTimers();
    }
  });
  it('filters by known direction and favorites while leaving unknown directions unclassified', () => {
    busLines.getAll.mockReturnValue(
      of([
        line,
        { ...line, id: 2, database_id: 8, code: '15', direction: 1 },
        { ...line, id: 3, database_id: 9, code: '152', direction: 2 },
      ]),
    );
    favorites.getFavorites.mockReturnValue(of([{ ...line, id: 2, database_id: 8 }]));
    const fixture = render();
    fixture.componentInstance.direction.set(1);
    expect(fixture.componentInstance.filteredLines().map((line) => line.code)).toEqual(['15']);
    fixture.componentInstance.direction.set(2);
    expect(fixture.componentInstance.filteredLines().map((line) => line.code)).toEqual(['152']);
    fixture.componentInstance.direction.set(0);
    fixture.componentInstance.onlyFavorites.set(true);
    expect(fixture.componentInstance.filteredLines().map((line) => line.code)).toEqual(['15']);
  });
  it('opens the additional filters and shows a retry state on loading failure', () => {
    busLines.getAll.mockReturnValue(throwError(() => new Error('offline')));
    const fixture = render();
    fixture.nativeElement.querySelector('.filters-toggle').click();
    fixture.detectChanges();
    expect(fixture.nativeElement.querySelector('#search-origin')).not.toBeNull();
    expect(fixture.nativeElement.querySelector('[role="alert"]').textContent).toContain(
      'Não foi possível carregar',
    );
    busLines.getAll.mockReturnValue(of([line]));
    fixture.nativeElement.querySelector('[role="alert"] button').click();
    fixture.detectChanges();
    expect(fixture.nativeElement.querySelectorAll('.compact-line')).toHaveLength(1);
  });
  it('receives origin and destination from Home and starts the existing route search', () => {
    const fixture = render({ from: 'Terminal Lapa', to: 'Praça da Sé' });
    expect(fixture.componentInstance.fromTerm).toBe('Terminal Lapa');
    expect(fixture.componentInstance.toTerm).toBe('Praça da Sé');
    expect(busLines.findTripLinesSafe).toHaveBeenCalledWith('Terminal Lapa', 'Praça da Sé');
  });
  it('uses the existing nearby flow when only an origin is supplied', () => {
    render({ from: 'Terminal Lapa' });
    expect(busLines.findNearby).toHaveBeenCalledWith('Terminal Lapa');
    expect(busLines.findTripLinesSafe).not.toHaveBeenCalled();
  });

  it('intersecta e deduplica resultados textuais sem incluir linhas só de uma extremidade', () => {
    const unrelated = { ...line, id: 2, database_id: 8, code: '15' };
    busLines.getAll
      .mockReturnValueOnce(of([line, { ...line }, unrelated]))
      .mockReturnValueOnce(of([{ ...line, origin: ' LÁPA ', destination: ' centro ' }]));
    const fixture = render({ from: 'Origem de teste', to: 'Destino de teste' });
    expect(fixture.componentInstance.allLines().map((item) => item.database_id)).toEqual([7]);
    expect(fixture.nativeElement.querySelectorAll('.compact-line')).toHaveLength(1);
    expect(fixture.componentInstance.isLoading()).toBe(false);
  });

  it('usa linhas do trajeto sem duplicatas quando as consultas textuais e próximas estão vazias', () => {
    busLines.findTripLinesSafe.mockReturnValue(of([line, { ...line }]));
    const fixture = render({ from: 'Origem de teste', to: 'Destino de teste' });
    expect(fixture.componentInstance.allLines().map((item) => item.code)).toEqual(['8000-10']);
    expect(fixture.componentInstance.isRouteMode()).toBe(true);
    expect(fixture.componentInstance.isLoading()).toBe(false);
  });

  it('não usa fallback de trajeto quando há resultados textuais sem linha em comum', () => {
    busLines.getAll
      .mockReturnValueOnce(of([line]))
      .mockReturnValueOnce(of([{ ...line, id: 2, code: '15' }]));
    busLines.findTripLinesSafe.mockReturnValue(of([line]));
    const fixture = render({ from: 'Origem de teste', to: 'Destino de teste' });
    expect(fixture.componentInstance.allLines()).toEqual([]);
    expect(fixture.componentInstance.isLoading()).toBe(false);
    expect(fixture.nativeElement.textContent).toContain('Nenhuma linha encontrada');
  });

  for (const [originLength, destinationLength] of [
    [101, 100],
    [100, 200],
    [200, 200],
    [100, 100],
  ]) {
    it(`preserva o trajeto com origem de ${originLength} e destino de ${destinationLength} caracteres`, () => {
      const from = 'O'.repeat(originLength);
      const to = 'D'.repeat(destinationLength);
      const nearbyLine = { ...line, distance_km: 0.5 };
      busLines.findNearbySafe.mockImplementation((address: string) =>
        of({
          origin: { address, lat: -23.55, lng: -46.63 },
          lines: [nearbyLine],
        }),
      );
      busLines.findTripLinesSafe.mockReturnValue(of([line]));
      busLines.getAll.mockReturnValue(of([line]));

      const fixture = render({ from, to });

      expect(busLines.findTripLinesSafe).toHaveBeenCalledWith(from, to);
      expect(busLines.findNearbySafe.mock.calls).toEqual([
        [from, 2],
        [to, 2],
      ]);
      const eligibleTerms = [from, to].filter((term) => term.length <= 100);
      expect(busLines.getAll.mock.calls).toEqual(
        eligibleTerms.map((term) => [{ term, per_page: 100 }]),
      );
      expect(fixture.componentInstance.fromTerm).toBe(from);
      expect(fixture.componentInstance.toTerm).toBe(to);
      expect(fixture.componentInstance.allLines().map((item) => item.database_id)).toEqual([7]);
      expect(fixture.componentInstance.isLoading()).toBe(false);
      expect(fixture.nativeElement.querySelectorAll('.compact-line')).toHaveLength(1);
    });
  }

  describe('GPS e geocodificação controlados pelo teste', () => {
    const getCurrentPosition = vi.fn<Geolocation['getCurrentPosition']>();
    const position: GeolocationPosition = {
      coords: {
        latitude: -23.55,
        longitude: -46.63,
        accuracy: 10,
        altitude: null,
        altitudeAccuracy: null,
        heading: null,
        speed: null,
        toJSON: () => ({}),
      },
      timestamp: 0,
      toJSON: () => ({}),
    };
    let original: PropertyDescriptor | undefined;

    beforeEach(() => {
      original = Object.getOwnPropertyDescriptor(navigator, 'geolocation');
      getCurrentPosition.mockReset();
      busLines.findNearby.mockReturnValue(
        of({
          origin: { address: 'Origem de teste', lat: -23.55, lng: -46.63 },
          lines: [],
        }),
      );
      Object.defineProperty(navigator, 'geolocation', {
        configurable: true,
        value: { getCurrentPosition },
      });
    });
    afterEach(() => {
      if (original) Object.defineProperty(navigator, 'geolocation', original);
      else Reflect.deleteProperty(navigator, 'geolocation');
    });

    it('consulta o endereço do GPS e inicia a busca próxima após a resposta', () => {
      const fixture = render();
      const address = new Subject<string>();
      busLines.reverseGeocode.mockReturnValue(address);
      getCurrentPosition.mockImplementation((success) => success(position));
      fixture.componentInstance.useCurrentLocation();
      expect(busLines.reverseGeocode).toHaveBeenCalledWith(-23.55, -46.63);
      expect(fixture.componentInstance.isLocating()).toBe(true);
      expect(busLines.findNearby).not.toHaveBeenCalled();
      address.next('Origem de teste');
      address.complete();
      expect(fixture.componentInstance.fromTerm).toBe('Origem de teste');
      expect(busLines.findNearby).toHaveBeenCalledWith('Origem de teste');
      expect(fixture.componentInstance.isLocating()).toBe(false);
    });

    it('preserva o fallback atual de coordenadas quando a geocodificação falha', () => {
      const fixture = render();
      busLines.reverseGeocode.mockReturnValue(throwError(() => new Error('offline')));
      getCurrentPosition.mockImplementation((success) => success(position));
      fixture.componentInstance.useCurrentLocation();
      expect(fixture.componentInstance.fromTerm).toBe('-23.55000, -46.63000');
      expect(busLines.findNearby).toHaveBeenCalledWith('-23.55000, -46.63000');
      expect(fixture.componentInstance.isLocating()).toBe(false);
    });

    it('libera o carregamento e informa a recusa de GPS sem chamar a API', () => {
      const fixture = render();
      const toast = vi.spyOn(TestBed.inject(ToastService), 'show').mockImplementation(() => {});
      getCurrentPosition.mockImplementation((_success, failure) => {
        failure?.({
          code: 1,
          message: 'Permissão negada no teste',
          PERMISSION_DENIED: 1,
          POSITION_UNAVAILABLE: 2,
          TIMEOUT: 3,
        });
      });
      fixture.componentInstance.useCurrentLocation();
      expect(fixture.componentInstance.isLocating()).toBe(false);
      expect(busLines.reverseGeocode).not.toHaveBeenCalled();
      expect(busLines.findNearby).not.toHaveBeenCalled();
      expect(toast).toHaveBeenCalledWith('Erro ao obter localização', 'error');
    });
  });
});
