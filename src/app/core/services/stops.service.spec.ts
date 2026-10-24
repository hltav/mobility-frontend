import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';
import { environment } from '../../../environments/environment';
import { StopsService } from './stops.service';

describe('Nearest stops API contract', () => {
  let service: StopsService;
  let http: HttpTestingController;
  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [provideHttpClient(), provideHttpClientTesting()],
    });
    service = TestBed.inject(StopsService);
    http = TestBed.inject(HttpTestingController);
  });
  afterEach(() => http.verify());
  it('uses the existing nearest endpoint and preserves SPTrans identifiers without inventing line codes', () => {
    let result: unknown;
    service.nearest({ address: ' Terminal Lapa ' }).subscribe((value) => (result = value));
    const request = http.expectOne((req) => req.url === `${environment.apiUrl}/stops/nearest`);
    expect(request.request.params.get('address')).toBe('Terminal Lapa');
    expect(request.request.params.get('radius_km')).toBe('0.5');
    expect(request.request.params.get('limit')).toBe('5');
    expect(request.request.params.get('mode')).toBe('with_lines');
    request.flush({
      data: {
        point: { lat: -23.55, lng: -46.63 },
        stops: [
          {
            id: 1,
            sptrans_id: 123,
            name: 'Parada',
            lat: -23.551,
            lng: -46.631,
            distance_km: 0.127,
            lines: [33624],
          },
        ],
      },
    });
    expect(result).toMatchObject({
      stops: [{ distance_meters: 127, line_ids: [33624], line_codes: [], arrivals: [] }],
    });
  });
  it('accepts coordinates and an empty stop collection from the processor', () => {
    let result: unknown;
    service.nearest({ lat: -23.55, lng: -46.63 }).subscribe((value) => (result = value));
    const request = http.expectOne((req) => req.url.endsWith('/stops/nearest'));
    expect(request.request.params.get('lat')).toBe('-23.55');
    expect(request.request.params.get('lng')).toBe('-46.63');
    expect(request.request.params.has('address')).toBe(false);
    request.flush({ data: { point: { lat: -23.55, lng: -46.63 }, stops: null } });
    expect(result).toMatchObject({ stops: [] });
  });
});
