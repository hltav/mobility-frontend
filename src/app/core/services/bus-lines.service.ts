import { HttpClient, HttpParams } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { map, Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import { normalizeBusLine } from '../mappers/normalize-bus-line.mapper';
import { BusLine } from '../schemas/bus-line.schema';
import { NearbyResponse, NearbyResponseSchema } from '../schemas/nearby-response.schema';

interface ApiResponse<T> {
  data: T;
}

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

    return this.http.get<ApiResponse<unknown[]>>(this.apiUrl, { params: httpParams }).pipe(
      map((response) => {
        const data = response.data ?? [];
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

  findNearby(address: string, radiusKm = 1.0): Observable<NearbyResponse> {
    const params = new HttpParams().set('address', address).set('radius_km', radiusKm.toString());

    return this.http
      .get<{ data: unknown }>(`${this.apiUrl}/nearby`, { params })
      .pipe(map((response) => NearbyResponseSchema.parse(response.data)));
  }

  reverseGeocode(lat: number, lng: number): Observable<string> {
    const params = new HttpParams().set('lat', lat.toString()).set('lng', lng.toString());

    return this.http
      .get<{ data: { address: string } }>(`${environment.apiUrl}/geocode/reverse`, { params })
      .pipe(map((r) => r.data.address));
  }
}
