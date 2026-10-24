import { HttpClient, HttpParams } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { catchError, forkJoin, map, Observable, of } from 'rxjs';
import { z } from 'zod';
import { environment } from '../../../environments/environment';
import { normalizeBusLine } from '../mappers/normalize-bus-line.mapper';
import { ApiResponse } from '../schemas/api-response.schema';
import {
  LineStop,
  LineStopSchema,
  LineStopsResponseSchema,
  NearbyResponseDtoSchema,
  PaginatedResponse,
  TripNearestResponseSchema,
} from '../schemas/bus-line-service.schema';
import { BusLine, BusLineSchema } from '../schemas/bus-line.schema';
import {
  NearbyLine,
  NearbyResponse,
  NearbyResponseSchema,
} from '../schemas/nearby-response.schema';

@Injectable({ providedIn: 'root' })
export class BusLinesService {
  private http = inject(HttpClient);
  private apiUrl = `${environment.apiUrl}/lines`;

  search(term: string): Observable<BusLine[]> {
    const params = new HttpParams().set('term', term);

    return this.http.get<ApiResponse<unknown[]>>(`${this.apiUrl}/search`, { params }).pipe(
      map((response) => {
        const data = response.data ?? [];
        return data.map(normalizeBusLine);
      }),
    );
  }

  getAll(params?: { term?: string; per_page?: number }): Observable<BusLine[]> {
    let httpParams = new HttpParams();

    if (params?.term) httpParams = httpParams.set('term', params.term);
    if (params?.per_page) {
      httpParams = httpParams.set('per_page', params.per_page.toString());
    }

    return this.http
      .get<ApiResponse<unknown[] | PaginatedResponse<unknown>>>(this.apiUrl, { params: httpParams })
      .pipe(
        map((response) => {
          const data = Array.isArray(response.data) ? response.data : (response.data?.data ?? []);
          return data.map(normalizeBusLine);
        }),
      );
  }

  getById(id: number): Observable<BusLine> {
    return this.http
      .get<ApiResponse<{ line: unknown; buses: unknown[] }>>(`${this.apiUrl}/${id}`)
      .pipe(
        map((response) => {
          const { line, buses } = response.data as { line: unknown; buses: unknown[] };
          const normalizedLine = normalizeBusLine(line);
          return {
            ...normalizedLine,
            buses: buses ?? [],
          };
        }),
      );
  }

  getStops(id: number, direction?: 1 | 2): Observable<LineStop[]> {
    let params = new HttpParams();

    if (direction) {
      params = params.set('direction', direction.toString());
    }

    return this.http.get<ApiResponse<unknown>>(`${this.apiUrl}/${id}/stops`, { params }).pipe(
      map((response) => {
        const data = response.data;
        const stops = this.extractStopsPayload(data);

        return stops
          .map((stop, index) => this.normalizeLineStop(stop, index))
          .filter((stop): stop is LineStop => !!stop)
          .filter((stop) => this.hasValidPoint(stop))
          .sort((a, b) => a.order - b.order);
      }),
    );
  }

  findNearby(address: string, radiusKm = 1.0): Observable<NearbyResponse> {
    const params = new HttpParams().set('address', address).set('radius_km', radiusKm.toString());

    return this.http
      .get<{ data: unknown }>(`${this.apiUrl}/nearby`, { params })
      .pipe(map((response) => this.normalizeNearbyResponse(response.data)));
  }

  findNearbySafe(address: string, radiusKm = 1.0): Observable<NearbyResponse> {
    return this.findNearby(address, radiusKm).pipe(
      catchError(() =>
        of({
          origin: null,
          lines: [],
        }),
      ),
    );
  }

  reverseGeocode(lat: number, lng: number): Observable<string> {
    const params = new HttpParams().set('lat', lat.toString()).set('lng', lng.toString());

    return this.http
      .get<{ data: { address: string } }>(`${environment.apiUrl}/geocode/reverse`, { params })
      .pipe(map((r) => r.data.address));
  }

  findTripLines(originAddress: string, destinationAddress: string): Observable<BusLine[]> {
    const params = new HttpParams()
      .set('origin_address', originAddress)
      .set('destination_address', destinationAddress)
      .set('radius_km', '2')
      .set('limit', '20')
      .set('mode', 'with_lines');

    return this.http
      .get<{ data: unknown }>(`${environment.apiUrl}/stops/trip-nearest`, { params })
      .pipe(map((response) => this.normalizeTripLines(response.data)));
  }

  findTripLinesSafe(originAddress: string, destinationAddress: string): Observable<BusLine[]> {
    return this.findTripLines(originAddress, destinationAddress).pipe(catchError(() => of([])));
  }

  getRoutePath(points: { lat: number; lng: number }[]): Observable<{ lat: number; lng: number }[]> {
    if (points.length < 2) return of(points);

    // Divide em chunks de 10 pontos com overlap de 1
    const CHUNK_SIZE = 10;
    const chunks: { lat: number; lng: number }[][] = [];

    for (let i = 0; i < points.length - 1; i += CHUNK_SIZE - 1) {
      chunks.push(points.slice(i, i + CHUNK_SIZE));
    }

    const requests = chunks.map((chunk) => {
      const coordinates = chunk.map((p) => `${p.lng},${p.lat}`).join(';');
      const url = `https://router.project-osrm.org/route/v1/driving/${coordinates}?overview=full&geometries=geojson`;

      return this.http.get<any>(url).pipe(
        map((response) => {
          if (response.code === 'Ok' && response.routes?.[0]?.geometry?.coordinates) {
            return response.routes[0].geometry.coordinates.map((coord: [number, number]) => ({
              lat: coord[1],
              lng: coord[0],
            }));
          }
          return chunk;
        }),
        catchError(() => of(chunk)),
      );
    });

    return forkJoin(requests).pipe(map((results) => results.flat()));
  }

  private normalizeNearbyResponse(data: unknown): NearbyResponse {
    const dto = NearbyResponseDtoSchema.parse(data);

    return NearbyResponseSchema.parse({
      origin: dto.origin,
      lines: dto.lines.map((line) => this.normalizeNearbyLine(line)),
    });
  }

  private normalizeNearbyLine(
    line: z.infer<typeof NearbyResponseDtoSchema>['lines'][number],
  ): NearbyLine {
    const normalizedLine =
      'sptrans_id' in line ? normalizeBusLine(line) : BusLineSchema.parse(line);

    return {
      ...normalizedLine,
      distance_km: line.distance_km,
    };
  }

  private normalizeTripLines(data: unknown): BusLine[] {
    const trip = TripNearestResponseSchema.parse(data);
    const originLines = this.extractStopLines(trip.origin.stops);
    const destinationLineIds = new Set(
      this.extractStopLines(trip.destination.stops).map((line) => line.id),
    );

    return this.uniqueLines(originLines.filter((line) => destinationLineIds.has(line.id)));
  }

  private extractStopLines(
    stops: z.infer<typeof TripNearestResponseSchema>['origin']['stops'],
  ): BusLine[] {
    const linesById = new Map<number, BusLine>();

    for (const stop of stops) {
      for (const line of stop.lines) {
        const normalizedLine = BusLineSchema.parse({
          id: line.id ?? line.sptrans_id,
          database_id: line.id ?? null,
          sptrans_id: line.sptrans_id ?? null,
          code: line.code,
          name: line.name,
          origin: line.origin,
          destination: line.destination,
          origin_lat: line.origin_lat,
          origin_lng: line.origin_lng,
          variants: [],
          isFavorite: false,
        });

        linesById.set(normalizedLine.id, normalizedLine);
      }
    }

    return this.uniqueLines([...linesById.values()]);
  }

  private uniqueLines(lines: BusLine[]): BusLine[] {
    const linesBySignature = new Map<string, BusLine>();

    for (const line of lines) {
      linesBySignature.set(this.lineSignature(line), line);
    }

    return [...linesBySignature.values()];
  }

  private lineSignature(line: BusLine): string {
    return [line.code, line.origin, line.destination]
      .map((value) => value.trim().toLowerCase())
      .join('|');
  }

  private extractStopsPayload(data: unknown): unknown[] {
    if (Array.isArray(data)) return data;

    if (data && typeof data === 'object') {
      const payload = data as { stops?: unknown; data?: unknown };

      if (Array.isArray(payload.stops)) return payload.stops;
      if (Array.isArray(payload.data)) return payload.data;
    }

    return LineStopsResponseSchema.parse(data).stops;
  }

  private normalizeLineStop(stop: unknown, index: number): LineStop | null {
    const parsed = LineStopSchema.safeParse(stop);

    if (!parsed.success) return null;

    return {
      ...parsed.data,
      order: parsed.data.order || index + 1,
    };
  }

  private hasValidPoint(point: { lat: number; lng: number }) {
    return (
      Number.isFinite(point.lat) &&
      Number.isFinite(point.lng) &&
      point.lat >= -90 &&
      point.lat <= 90 &&
      point.lng >= -180 &&
      point.lng <= 180 &&
      point.lat !== 0 &&
      point.lng !== 0
    );
  }
}
