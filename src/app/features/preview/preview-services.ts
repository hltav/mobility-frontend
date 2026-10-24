import { Injectable, Provider, signal } from '@angular/core';
import { of, throwError } from 'rxjs';
import { BusLine } from '../../core/schemas/bus-line.schema';
import { RealTimeBus } from '../../core/schemas/real-timeBus.schema';
import { BusLinesService } from '../../core/services/bus-lines.service';
import { FavoritesService } from '../../core/services/favorites.service';
import { RealtimeService } from '../../core/services/real-time.service';
import { StopsService } from '../../core/services/stops.service';
import { NearbyStopsRequest } from '../../core/schemas/nearby-stop.schema';
import { PREVIEW_NEARBY_STOPS, PREVIEW_LINES, PREVIEW_STOPS } from './preview-data';
import { AuthService } from '../../core/services/auth.service';

@Injectable()
export class PreviewAuthService {
  readonly isAuthenticated = signal(false).asReadonly();

  getUser() {
    return { id: 0, name: 'Pessoa de demonstração', email: 'demo@example.invalid' };
  }

  getToken(): null {
    return null;
  }

  logout() {
    // Exiting the demo is navigation only; never clear or revoke the real session.
  }
}

const normalize = (value: string) =>
  value
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .trim();
const cloneLines = () => structuredClone(PREVIEW_LINES);

@Injectable()
export class PreviewBusLinesService {
  getAll(params?: { term?: string; per_page?: number }) {
    const term = normalize(params?.term ?? '');
    return of(
      cloneLines()
        .filter((line) =>
          normalize(`${line.code} ${line.name} ${line.origin} ${line.destination}`).includes(term),
        )
        .slice(0, params?.per_page ?? PREVIEW_LINES.length),
    );
  }
  getById(id: number) {
    const line = cloneLines().find((line) => line.id === id);
    return line ? of(line) : throwError(() => new Error('Linha de exemplo não encontrada.'));
  }
  findNearby(_address: string, _radiusKm?: number) {
    return of({
      origin: { address: 'Origem simulada — São Paulo', lat: -23.5505, lng: -46.6333 },
      lines: cloneLines().map((line) => ({ ...line, distance_km: 0.5 })),
    });
  }
  findNearbySafe(address: string, radiusKm?: number) {
    return this.findNearby(address, radiusKm);
  }
  findTripLinesSafe(_from: string, _to: string) {
    return of(cloneLines());
  }
  reverseGeocode(_lat: number, _lng: number) {
    return of('Origem simulada — São Paulo');
  }
  getStops(_id: number, direction?: 1 | 2) {
    if (!direction) return of([]); // Exercise the existing direction selector in details.
    const stops = structuredClone(PREVIEW_STOPS);
    return of(
      (direction === 2 ? stops.reverse() : stops).map((stop, index) => ({
        ...stop,
        ...(direction === 2
          ? { scheduled_time: `06:${String(20 + index * 4).padStart(2, '0')}` }
          : {}),
        order: index + 1,
      })),
    );
  }
  getRoutePath(points: { lat: number; lng: number }[]) {
    return of(points);
  }
}

@Injectable()
export class PreviewFavoritesService {
  private readonly favorites = new Map<number, BusLine>();
  getFavorites() {
    return of(structuredClone([...this.favorites.values()]));
  }
  addFavorite(value: BusLine | number) {
    const line =
      typeof value === 'number' ? PREVIEW_LINES.find((line) => line.id === value) : value;
    if (!line) return throwError(() => new Error('Linha de exemplo não encontrada.'));
    this.favorites.set(line.id, {
      ...structuredClone(line),
      favorite_id: line.id,
      isFavorite: true,
    });
    return of({});
  }
  removeFavorite(id: number) {
    this.favorites.delete(id);
    return of({});
  }
}

@Injectable()
export class PreviewRealtimeService {
  getBuses(id: number) {
    return of(
      structuredClone(PREVIEW_LINES.find((line) => line.id === id)?.buses ?? []) as RealTimeBus[],
    );
  }
}

@Injectable()
export class PreviewStopsService {
  nearest(_origin: NearbyStopsRequest, radiusKm = 0.5, limit = 5) {
    return of({
      point: { lat: -23.5505, lng: -46.6333 },
      stops: structuredClone(PREVIEW_NEARBY_STOPS)
        .filter((stop) => stop.distance_meters <= radiusKm * 1000)
        .slice(0, limit),
    });
  }
}

export const PREVIEW_PROVIDERS: Provider[] = [
  { provide: AuthService, useClass: PreviewAuthService },
  { provide: StopsService, useClass: PreviewStopsService },
  { provide: BusLinesService, useClass: PreviewBusLinesService },
  { provide: FavoritesService, useClass: PreviewFavoritesService },
  { provide: RealtimeService, useClass: PreviewRealtimeService },
];
