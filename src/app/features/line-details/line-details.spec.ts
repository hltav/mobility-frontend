import { Component, input } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { ActivatedRoute, convertToParamMap, provideRouter, Router } from '@angular/router';
import { of, Subject, throwError } from 'rxjs';
import { BusLinesService } from '../../core/services/bus-lines.service';
import { FavoritesService } from '../../core/services/favorites.service';
import { RealtimeService } from '../../core/services/real-time.service';
import { MapComponent } from '../../shared/components/map/map.component';
import { PREVIEW_LINES, PREVIEW_STOPS } from '../preview/preview-data';
import { RealTimeBusSchema } from '../../core/schemas/real-timeBus.schema';
import { LineDetailsComponent } from './line-details.component';

@Component({ selector: 'app-map', standalone: true, template: '' })
class StubMap {
  height = input<number | string>(400);
  buses = input<unknown[]>([]);
  routePoints = input<unknown[]>([]);
  userPoint = input<unknown>(null);
  focusedPoint = input<unknown>(null);
  centerLat = input(0);
  centerLng = input(0);
}

describe('Line details', () => {
  const lines = { getById: vi.fn(), getStops: vi.fn(), getRoutePath: vi.fn() };
  const favorites = { getFavorites: vi.fn(), addFavorite: vi.fn(), removeFavorite: vi.fn() };
  const realtime = { getBuses: vi.fn() };
  beforeEach(() => {
    vi.clearAllMocks();
    lines.getById.mockReturnValue(of(structuredClone(PREVIEW_LINES[0])));
    lines.getStops.mockImplementation((_id: number, direction: number) =>
      of(direction === 2 ? [...PREVIEW_STOPS].reverse() : PREVIEW_STOPS),
    );
    lines.getRoutePath.mockImplementation((points) => of(points));
    favorites.getFavorites.mockReturnValue(of([]));
    favorites.addFavorite.mockReturnValue(of({}));
    favorites.removeFavorite.mockReturnValue(of({}));
    realtime.getBuses.mockReturnValue(of(PREVIEW_LINES[0].buses));
  });
  function render(preview = false) {
    TestBed.configureTestingModule({
      imports: [LineDetailsComponent],
      providers: [
        provideRouter([]),
        {
          provide: ActivatedRoute,
          useValue: { snapshot: { paramMap: convertToParamMap({ id: '146' }), data: { preview } } },
        },
        { provide: BusLinesService, useValue: lines },
        { provide: FavoritesService, useValue: favorites },
        { provide: RealtimeService, useValue: realtime },
      ],
    });
    TestBed.overrideComponent(LineDetailsComponent, {
      remove: { imports: [MapComponent] },
      add: { imports: [StubMap] },
    });
    const fixture = TestBed.createComponent(LineDetailsComponent);
    fixture.detectChanges();
    return fixture;
  }
  it('renders summary, compact map, vehicles and stops, and changes the route direction', () => {
    const fixture = render();
    expect(fixture.nativeElement.querySelector('h1').textContent).toContain('CALLAO');
    expect(fixture.nativeElement.querySelectorAll('.vehicle-card')).toHaveLength(4);
    expect(fixture.nativeElement.querySelectorAll('.stops-timeline li')).toHaveLength(6);
    fixture.nativeElement.querySelectorAll('.direction-selector button')[1].click();
    fixture.detectChanges();
    expect(fixture.componentInstance.currentDirection()).toBe(2);
    expect(fixture.componentInstance.routePoints()[0]).toEqual({
      lat: PREVIEW_STOPS.at(-1)!.lat,
      lng: PREVIEW_STOPS.at(-1)!.lng,
    });
    expect(fixture.nativeElement.querySelector('.stops-timeline h3').textContent).toContain(
      'Terminal Callao',
    );
  });
  it('selects a stop and exposes it to the map without using the user location', () => {
    const fixture = render();
    const scroll = vi.fn();
    fixture.nativeElement.querySelector('.line-map-card').scrollIntoView = scroll;
    fixture.nativeElement.querySelector('.stop-action').click();
    fixture.detectChanges();
    expect(fixture.componentInstance.selectedStop()).toEqual(PREVIEW_STOPS[0]);
    expect(fixture.componentInstance.userLocation()).toBeNull();
    expect(scroll).toHaveBeenCalled();
    fixture.componentInstance.switchDirection(2);
    expect(fixture.componentInstance.selectedStop()).toBeNull();
  });
  it('keeps preview favorites local and returns to the sample search', () => {
    const fixture = render(true);
    const navigate = vi.spyOn(TestBed.inject(Router), 'navigate').mockResolvedValue(true);
    fixture.componentInstance.toggleFavorite();
    expect(favorites.addFavorite).toHaveBeenCalledWith(expect.objectContaining({ id: 146 }));
    fixture.componentInstance.toggleFavorite();
    expect(favorites.removeFavorite).toHaveBeenCalledWith(146);
    fixture.componentInstance.goBack();
    expect(navigate).toHaveBeenCalledWith(['/preview/search']);
    expect(fixture.nativeElement.textContent).toContain('DEMO');
  });
  it('shows a failed positions query and recovers on retry', () => {
    realtime.getBuses.mockReturnValueOnce(throwError(() => new Error('offline')));
    const fixture = render();
    expect(fixture.componentInstance.busesError()).toBe(true);
    fixture.componentInstance.loadBuses(146);
    expect(fixture.componentInstance.busesError()).toBe(false);
    expect(fixture.componentInstance.buses()).toHaveLength(4);
  });
  it('shows errors when line details cannot be loaded', () => {
    lines.getById.mockReturnValue(throwError(() => new Error('offline')));
    const fixture = render();
    expect(fixture.nativeElement.querySelector('[role="alert"]').textContent).toContain(
      'Não foi possível carregar',
    );
  });
  it('cancels an outdated route geometry request when switching direction', () => {
    const previous = new Subject<{ lat: number; lng: number }[]>();
    lines.getRoutePath.mockReturnValueOnce(previous);
    const fixture = render();
    expect(previous.observed).toBe(true);
    fixture.componentInstance.switchDirection(2);
    expect(previous.observed).toBe(false);
  });
  it('continues polling after a failed refresh and recovers the vehicle list', () => {
    vi.useFakeTimers();
    try {
      realtime.getBuses
        .mockReturnValueOnce(of([]))
        .mockReturnValueOnce(throwError(() => new Error('offline')))
        .mockReturnValue(of(PREVIEW_LINES[0].buses));
      const fixture = render();
      vi.advanceTimersByTime(10000);
      expect(fixture.componentInstance.busesError()).toBe(true);
      vi.advanceTimersByTime(10000);
      expect(fixture.componentInstance.busesError()).toBe(false);
      expect(fixture.componentInstance.buses()).toHaveLength(4);
      fixture.destroy();
    } finally {
      vi.useRealTimers();
    }
  });

  it('keeps valid vehicle coordinates when optional telemetry is incomplete', () => {
    const bus = RealTimeBusSchema.parse({
      prefix: '12345',
      lat: -23.55,
      lng: -46.63,
      speed_kmh: '24',
      observed_at: 'not-a-date',
      plate: null,
    });
    expect(bus.speed_kmh).toBe(24);
    expect(bus.lat).toBe(-23.55);
    expect(bus.observed_at).toBeUndefined();
  });

  it('releases polling when the page is destroyed', () => {
    vi.useFakeTimers();
    try {
      const fixture = render();
      fixture.destroy();
      const requests = realtime.getBuses.mock.calls.length;
      vi.advanceTimersByTime(20000);
      expect(realtime.getBuses).toHaveBeenCalledTimes(requests);
    } finally {
      vi.useRealTimers();
    }
  });
});
