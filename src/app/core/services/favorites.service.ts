import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { map, Observable, switchMap } from 'rxjs';
import { environment } from '../../../environments/environment';
import { normalizeBusLine } from '../mappers/normalize-bus-line.mapper';
import { BusLine, BusLineSchema } from '../schemas/bus-line.schema';

interface Favorite {
  id: number;
  line_id: number;
  line: BusLine;
}

@Injectable({ providedIn: 'root' })
export class FavoritesService {
  private http = inject(HttpClient);
  private apiUrl = `${environment.apiUrl}/favorites`;

  getFavorites(): Observable<BusLine[]> {
    return this.http.get(this.apiUrl).pipe(
      map((response: any) => {
        const favorites = response.data || response;
        return favorites.map((fav: any) => {
          const line = fav.line || fav;
          return BusLineSchema.parse({
            ...line,
            database_id: line.database_id ?? (fav.line ? line.id : undefined),
            favorite_id: fav.line ? fav.id : line.favorite_id,
            isFavorite: true,
          });
        });
      }),
    );
  }

  addFavorite(line: BusLine | number): Observable<any> {
    if (typeof line === 'number') {
      return this.http.post(this.apiUrl, { line_id: line });
    }

    const databaseId = line.database_id ?? this.getDatabaseIdFromLine(line);

    if (databaseId) {
      return this.http.post(this.apiUrl, { line_id: databaseId });
    }

    return this.findDatabaseId(line).pipe(
      switchMap((lineId) => this.http.post(this.apiUrl, { line_id: lineId })),
    );
  }

  removeFavorite(favoriteId: number): Observable<any> {
    return this.http.delete(`${this.apiUrl}/${favoriteId}`);
  }

  private findDatabaseId(line: BusLine): Observable<number> {
    return this.http
      .get<{
        data: unknown[] | { data: unknown[] };
      }>(`${environment.apiUrl}/lines`, { params: { term: line.code, per_page: 100 } })
      .pipe(
        map((response) => {
          const lines = Array.isArray(response.data) ? response.data : response.data.data;
          const match = lines
            .map(normalizeBusLine)
            .find((candidate) => this.sameLine(candidate, line));
          const databaseId = match ? this.getDatabaseIdFromLine(match) : null;

          if (!databaseId) {
            throw new Error('Linha não encontrada no banco local.');
          }

          return databaseId;
        }),
      );
  }

  private sameLine(a: BusLine, b: BusLine) {
    return (
      this.normalize(a.code) === this.normalize(b.code) &&
      this.normalize(a.origin) === this.normalize(b.origin) &&
      this.normalize(a.destination) === this.normalize(b.destination)
    );
  }

  private getDatabaseIdFromLine(line: BusLine) {
    return line.database_id ?? (line.sptrans_id && line.id !== line.sptrans_id ? line.id : null);
  }

  private normalize(value: string) {
    return value.trim().toLowerCase();
  }
}
