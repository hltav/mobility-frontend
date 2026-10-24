import { Component, input } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { ActivatedRoute, convertToParamMap, provideRouter } from '@angular/router';
import { of, Subject, throwError } from 'rxjs';
import { BusLinesService } from '../../core/services/bus-lines.service';
import { RealtimeService } from '../../core/services/real-time.service';
import { RealTimeBus } from '../../core/schemas/real-timeBus.schema';
import { MapComponent } from '../../shared/components/map/map.component';
import { PREVIEW_LINES, PREVIEW_STOPS } from '../preview/preview-data';
import { MapPageComponent } from './map-page.component';

@Component({ selector: 'app-map', standalone: true, template: '' })
class StubMap {
  height = input<number | string>(400);
  showZoomControls = input(true);
  fitKey = input<unknown>(null);
  buses = input<unknown[]>([]);
  routePoints = input<unknown[]>([]);
  userPoint = input<unknown>(null);
  zoomIn = vi.fn();
  zoomOut = vi.fn();
}

describe('Live map page', () => {
  const lines = { getAll: vi.fn(), getStops: vi.fn(), getRoutePath: vi.fn() };
  const realtime = { getBuses: vi.fn() };
  beforeEach(() => {
    vi.clearAllMocks();
    lines.getAll.mockReturnValue(of(structuredClone(PREVIEW_LINES)));
    lines.getStops.mockReturnValue(of(PREVIEW_STOPS));
    lines.getRoutePath.mockImplementation((points) => of(points));
    realtime.getBuses.mockImplementation((id: number) =>
      of(structuredClone(PREVIEW_LINES.find((line) => line.id === id)?.buses ?? [])),
    );
  });
  function render(params: Record<string, string> = {}, preview = false) {
    TestBed.configureTestingModule({
      imports: [MapPageComponent],
      providers: [
        provideRouter([]),
        {
          provide: ActivatedRoute,
          useValue: { snapshot: { queryParamMap: convertToParamMap(params), data: { preview } } },
        },
        { provide: BusLinesService, useValue: lines },
        { provide: RealtimeService, useValue: realtime },
      ],
    });
    TestBed.overrideComponent(MapPageComponent, {
      remove: { imports: [MapComponent] },
      add: { imports: [StubMap] },
    });
    const fixture = TestBed.createComponent(MapPageComponent);
    fixture.detectChanges();
    return fixture;
  }
  it('loads available lines and honors a selected line in the URL', () => {
    const fixture = render({ line: '15' });
    expect(lines.getAll).toHaveBeenCalledWith({ per_page: 6 });
    expect(fixture.componentInstance.selectedLine()?.code).toBe('15');
    expect(fixture.componentInstance.visibleBuses()).toHaveLength(7);
    expect(fixture.nativeElement.querySelectorAll('.map-line-chip')).toHaveLength(3);
    expect(fixture.nativeElement.querySelector('.map-live-label').textContent).toContain(
      'Linha 15',
    );
    expect(lines.getStops).not.toHaveBeenCalled();
  });
  it('cancels a previous positions request when selecting a different line', () => {
    const previous = new Subject<RealTimeBus[]>();
    realtime.getBuses.mockReturnValueOnce(previous);
    const fixture = render();
    expect(previous.observed).toBe(true);
    fixture.nativeElement.querySelectorAll('.map-line-chip')[1].click();
    fixture.detectChanges();
    expect(previous.observed).toBe(false);
    expect(fixture.componentInstance.selectedLine()?.code).toBe('15');
    expect(fixture.componentInstance.visibleBuses()).toHaveLength(7);
  });
  it('filters directions, line text and moving vehicles without stale selections', () => {
    const fixture = render();
    const component = fixture.componentInstance;
    component.onlyMoving.set(true);
    expect(component.visibleBuses()).toHaveLength(2);
    component.setDirection(2);
    expect(component.visibleLines().map((line) => line.code)).toEqual(['152']);
    expect(component.selectedLine()?.code).toBe('152');
    component.setDirection(0);
    component.setLineFilter('CANT');
    expect(component.visibleLines()).toHaveLength(1);
    expect(component.selectedLine()?.code).toBe('15');
    component.setLineFilter('inexistente');
    expect(component.selectedLine()).toBeNull();
    expect(component.visibleBuses()).toHaveLength(0);
    component.setLineFilter('');
    expect(component.selectedLine()?.code).toBe('146');
  });
  it('requests the selected route only when its filter is enabled and clears it on disable', () => {
    const fixture = render({ line: '15' });
    fixture.componentInstance.setShowRoute(true);
    expect(lines.getStops).toHaveBeenCalledWith(15, 1);
    expect(fixture.componentInstance.routePoints()).toHaveLength(6);
    fixture.componentInstance.setShowRoute(false);
    expect(fixture.componentInstance.routePoints()).toHaveLength(0);
  });
  it('offers a visible mock entry when available lines cannot be loaded', () => {
    lines.getAll.mockReturnValue(throwError(() => new Error('offline')));
    const fixture = render();
    expect(fixture.nativeElement.querySelector('.map-empty').textContent).toContain(
      'Não foi possível carregar',
    );
    expect(fixture.nativeElement.querySelector('a[href="/preview/map"]')).not.toBeNull();
    lines.getAll.mockReturnValue(of(PREVIEW_LINES));
    fixture.nativeElement.querySelector('.map-empty button').click();
    fixture.detectChanges();
    expect(fixture.nativeElement.querySelectorAll('.map-line-chip')).toHaveLength(3);
  });
  it('continues polling after an error and cancels polling when destroyed', () => {
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
      expect(fixture.componentInstance.visibleBuses()).toHaveLength(4);
      fixture.destroy();
      const requests = realtime.getBuses.mock.calls.length;
      vi.advanceTimersByTime(20000);
      expect(realtime.getBuses).toHaveBeenCalledTimes(requests);
    } finally {
      vi.useRealTimers();
    }
  });
  it('uses a simulated location in preview without requesting location permission', () => {
    const fixture = render({}, true);
    fixture.componentInstance.useCurrentLocation();
    expect(fixture.componentInstance.userPoint()).toEqual({ lat: -23.5505, lng: -46.6333 });
    expect(fixture.componentInstance.liveLabel()).toContain('DEMO');
  });
  it('does not use a SPTrans-only identifier for the internal positions endpoint', () => {
    lines.getAll.mockReturnValue(of([{ ...PREVIEW_LINES[0], database_id: null }]));
    const fixture = render();
    expect(realtime.getBuses).not.toHaveBeenCalled();
    expect(fixture.componentInstance.selectedLine()).toBeNull();
    expect(fixture.nativeElement.querySelector('.map-line-chip').disabled).toBe(true);
    expect(fixture.nativeElement.querySelector('.map-message').textContent).toContain(
      'Posições indisponíveis',
    );
  });
});
