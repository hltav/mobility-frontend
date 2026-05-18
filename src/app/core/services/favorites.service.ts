import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { map, Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
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
            isFavorite: true,
          });
        });
      }),
    );
  }

  addFavorite(lineId: number): Observable<any> {
    return this.http.post(this.apiUrl, { line_id: lineId });
  }

  removeFavorite(favoriteId: number): Observable<any> {
    return this.http.delete(`${this.apiUrl}/${favoriteId}`);
  }
}
