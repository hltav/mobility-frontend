import { Component, input } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { ActivatedRoute, convertToParamMap, provideRouter } from '@angular/router';
import { of, Subject, throwError } from 'rxjs';
import { NearbyStopsResponse } from '../../core/schemas/nearby-stop.schema';
import { StopsService } from '../../core/services/stops.service';
import { MapComponent } from '../../shared/components/map/map.component';
import { PREVIEW_NEARBY_STOPS } from '../preview/preview-data';
import { NearbyStopsComponent } from './nearby-stops.component';

@Component({ selector: 'app-map', standalone: true, template: '' })
class StubMap {
  height = input<unknown>();
  focusedPoint = input<unknown>();
  centerLat = input(0);
  centerLng = input(0);
}

describe('Nearby stops screen', () => {
  const service = { nearest: vi.fn() };
  const result = () => ({
    point: { lat: -23.5505, lng: -46.6333 },
    stops: structuredClone(PREVIEW_NEARBY_STOPS),
  });
  beforeEach(() => {
    vi.clearAllMocks();
    service.nearest.mockReturnValue(of(result()));
  });
  function render(params: Record<string, string> = {}, preview = false) {
    TestBed.configureTestingModule({
      imports: [NearbyStopsComponent],
      providers: [
        provideRouter([]),
        {
          provide: ActivatedRoute,
          useValue: { snapshot: { queryParamMap: convertToParamMap(params), data: { preview } } },
        },
        { provide: StopsService, useValue: service },
      ],
    });
    TestBed.overrideComponent(NearbyStopsComponent, {
      remove: { imports: [MapComponent] },
      add: { imports: [StubMap] },
    });
    const fixture = TestBed.createComponent(NearbyStopsComponent);
    fixture.detectChanges();
    return fixture;
  }
  it('uses the origin supplied by Home and shows five stops ordered by distance', () => {
    const response = result();
    response.stops.reverse();
    response.stops.push({ ...response.stops[0], id: 99, distance_meters: 800 });
    service.nearest.mockReturnValue(of(response));
    const fixture = render({ address: 'Terminal Lapa' });
    expect(service.nearest).toHaveBeenCalledWith({ address: 'Terminal Lapa' }, 0.5, 5);
    expect(fixture.nativeElement.querySelectorAll('.nearby-list li')).toHaveLength(5);
    expect(fixture.componentInstance.stops()[0].distance_meters).toBe(127);
    expect(fixture.componentInstance.stops().at(-1)?.distance_meters).toBe(480);
    expect(
      fixture.nativeElement
        .querySelector('a[aria-label="Voltar para a Home"]')
        .getAttribute('href'),
    ).toBe('/home');
  });
  it('requests location explicitly instead of silently using a made-up origin', () => {
    const fixture = render();
    expect(service.nearest).not.toHaveBeenCalled();
    expect(fixture.nativeElement.textContent).toContain('Use sua localização');
    expect(fixture.nativeElement.querySelector('a[href="/preview/stops"]')).not.toBeNull();
  });
  it('updates selection and opens the corresponding map and information dialogs', () => {
    const fixture = render({}, true);
    const dialogs = fixture.nativeElement.querySelectorAll(
      'dialog',
    ) as NodeListOf<HTMLDialogElement>;
    dialogs[0].showModal = vi.fn();
    dialogs[1].showModal = vi.fn();
    const row = fixture.nativeElement.querySelectorAll('.nearby-list li')[1];
    row.querySelector('.nearby-stop-main').click();
    fixture.detectChanges();
    expect(fixture.componentInstance.selectedStop()?.id).toBe(2);
    expect(fixture.nativeElement.querySelector('.nearby-line-chips').textContent).toContain('175T');
    row.querySelectorAll('button.nearby-stop-action')[0].click();
    fixture.detectChanges();
    expect(dialogs[0].showModal).toHaveBeenCalled();
    expect(fixture.componentInstance.mapOpen()).toBe(true);
    row.querySelectorAll('button.nearby-stop-action')[1].click();
    fixture.detectChanges();
    expect(dialogs[1].showModal).toHaveBeenCalled();
    expect(fixture.componentInstance.infoOpen()).toBe(true);
    expect(row.querySelector('a').getAttribute('href')).toContain('travelmode=walking');
    expect(row.querySelector('a').getAttribute('rel')).toBe('noopener noreferrer');
  });
  it('shows failures and supports a real retry without substituting sample data', () => {
    service.nearest.mockReturnValueOnce(throwError(() => new Error('offline')));
    const fixture = render({ address: 'Lapa' });
    expect(fixture.nativeElement.querySelector('[role="alert"]').textContent).toContain(
      'Não foi possível carregar',
    );
    fixture.nativeElement.querySelector('[role="alert"] button').click();
    fixture.detectChanges();
    expect(service.nearest).toHaveBeenCalledTimes(2);
    expect(fixture.nativeElement.querySelectorAll('.nearby-list li')).toHaveLength(5);
  });
  it('cancels the previous stop request when the origin changes', () => {
    const pending = new Subject<NearbyStopsResponse>();
    service.nearest.mockReturnValueOnce(pending);
    const fixture = render({ address: 'Lapa' });
    expect(pending.observed).toBe(true);
    fixture.componentInstance.load({ lat: -23.55, lng: -46.63 });
    expect(pending.observed).toBe(false);
    expect(fixture.componentInstance.loading()).toBe(false);
  });
  it('handles denied location and retries with coordinates after permission is granted', () => {
    const original = Object.getOwnPropertyDescriptor(navigator, 'geolocation');
    const getCurrentPosition = vi.fn((_success: PositionCallback, fail: PositionErrorCallback) =>
      fail({ code: 1 } as GeolocationPositionError),
    );
    Object.defineProperty(navigator, 'geolocation', {
      configurable: true,
      value: { getCurrentPosition },
    });
    try {
      const fixture = render();
      fixture.componentInstance.useCurrentLocation();
      expect(fixture.componentInstance.error()).toContain('Localização não autorizada');
      expect(service.nearest).not.toHaveBeenCalled();
      getCurrentPosition.mockImplementationOnce((success) =>
        success({ coords: { latitude: -23.55, longitude: -46.63 } } as GeolocationPosition),
      );
      fixture.componentInstance.retry();
      expect(service.nearest).toHaveBeenCalledWith({ lat: -23.55, lng: -46.63 }, 0.5, 5);
      expect(fixture.componentInstance.error()).toBe('');
      expect(fixture.componentInstance.locating()).toBe(false);
    } finally {
      if (original) Object.defineProperty(navigator, 'geolocation', original);
      else Reflect.deleteProperty(navigator, 'geolocation');
    }
  });

  it('keeps preview navigation and labels simulated arrival times', () => {
    const fixture = render({}, true);
    expect(
      fixture.nativeElement
        .querySelector('a[aria-label="Voltar para a Home"]')
        .getAttribute('href'),
    ).toBe('/preview/home');
    expect(fixture.nativeElement.querySelector('.nearby-footnote').textContent).toContain(
      'simulados',
    );
    expect(fixture.nativeElement.querySelector('.nearby-line-chips').textContent).toContain(
      '3 min',
    );
  });
});
