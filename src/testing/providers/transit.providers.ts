// Providers sintéticos exclusivos de testes; não importar no runtime.
import { Injectable, Provider, signal } from '@angular/core';
import { of, throwError } from 'rxjs';
import { BusLine } from '../../app/core/schemas/bus-line.schema';
import { RealTimeBusSchema } from '../../app/core/schemas/real-timeBus.schema';
import { BusLinesService } from '../../app/core/services/bus-lines.service';
import { FavoritesService } from '../../app/core/services/favorites.service';
import { RealtimeService } from '../../app/core/services/real-time.service';
import { StopsService } from '../../app/core/services/stops.service';
import { NearbyStopsRequest } from '../../app/core/schemas/nearby-stop.schema';
import { TEST_NEARBY_STOPS, TEST_LINES, TEST_STOPS } from '../fixtures/transit.fixture';
import { AuthService } from '../../app/core/services/auth.service';

@Injectable()
export class TestAuthService {
  readonly isAuthenticated = signal(false).asReadonly();

  getUser() {
    return { id: 0, name: 'Pessoa de teste', email: 'test@example.invalid' };
  }

  getToken(): null {
    return null;
  }

  logout() {
    // Provider de teste: não lê nem modifica a sessão do navegador.
  }
}

const normalize = (value: string) =>
  value
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .trim();
const cloneLines = () => structuredClone(TEST_LINES);

@Injectable()
export class TestBusLinesService {
  getAll(params?: { term?: string; per_page?: number }) {
    const term = normalize(params?.term ?? '');
    return of(
      cloneLines()
        .filter((line) =>
          normalize(`${line.code} ${line.name} ${line.origin} ${line.destination}`).includes(term),
        )
        .slice(0, params?.per_page ?? TEST_LINES.length),
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
    if (!direction) return of([]); // Sem sentido informado, não há paradas no cenário de teste.
    const stops = structuredClone(TEST_STOPS);
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
export class TestFavoritesService {
  private readonly favorites = new Map<number, BusLine>();
  getFavorites() {
    return of(structuredClone([...this.favorites.values()]));
  }
  addFavorite(value: BusLine | number) {
    const line = typeof value === 'number' ? TEST_LINES.find((line) => line.id === value) : value;
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
export class TestRealtimeService {
  getBuses(id: number) {
    return of(
      structuredClone(TEST_LINES.find((line) => line.id === id)?.buses ?? []).map((bus) =>
        RealTimeBusSchema.parse(bus),
      ),
    );
  }
}

@Injectable()
export class TestStopsService {
  nearest(_origin: NearbyStopsRequest, radiusKm = 0.5, limit = 5) {
    return of({
      point: { lat: -23.5505, lng: -46.6333 },
      stops: structuredClone(TEST_NEARBY_STOPS)
        .filter((stop) => stop.distance_meters <= radiusKm * 1000)
        .slice(0, limit),
    });
  }
}

export const TEST_PROVIDERS: Provider[] = [
  { provide: AuthService, useClass: TestAuthService },
  { provide: StopsService, useClass: TestStopsService },
  { provide: BusLinesService, useClass: TestBusLinesService },
  { provide: FavoritesService, useClass: TestFavoritesService },
  { provide: RealtimeService, useClass: TestRealtimeService },
];
