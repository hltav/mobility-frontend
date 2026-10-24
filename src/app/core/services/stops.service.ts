import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { map } from 'rxjs';
import { environment } from '../../../environments/environment';
import { NearbyStopsRequest, NearbyStopsResponseSchema } from '../schemas/nearby-stop.schema';

@Injectable({ providedIn: 'root' })
export class StopsService {
  private readonly http = inject(HttpClient);
  nearest(origin: NearbyStopsRequest, radiusKm = 0.5, limit = 5) {
    let params = new HttpParams()
      .set('radius_km', radiusKm)
      .set('limit', limit)
      .set('mode', 'with_lines');
    params =
      'address' in origin
        ? params.set('address', origin.address.trim())
        : params.set('lat', origin.lat).set('lng', origin.lng);
    return this.http
      .get<{ data: unknown }>(`${environment.apiUrl}/stops/nearest`, { params })
      .pipe(map((response) => NearbyStopsResponseSchema.parse(response.data)));
  }
}
