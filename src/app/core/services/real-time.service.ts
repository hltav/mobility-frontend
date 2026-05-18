import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { map, Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import { RealTimeBus, RealTimeBusSchema } from '../schemas/real-timeBus.schema';

@Injectable({ providedIn: 'root' })
export class RealtimeService {
  private http = inject(HttpClient);
  private apiUrl = environment.apiUrl;

  getBuses(lineId: number): Observable<RealTimeBus[]> {
    return this.http.get(`${this.apiUrl}/lines/${lineId}/buses`).pipe(
      map((response: any) => {
        const data = response.data || response;
        return Array.isArray(data) ? data.map((bus: any) => RealTimeBusSchema.parse(bus)) : [];
      }),
    );
  }
}
