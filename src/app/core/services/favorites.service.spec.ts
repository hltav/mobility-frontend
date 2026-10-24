import { TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { FavoritesService } from './favorites.service';
import { environment } from '../../../environments/environment';

describe('Favorites API identity', () => {
  it('preserves the separate favorite and internal line IDs from the API', () => {
    TestBed.configureTestingModule({
      providers: [provideHttpClient(), provideHttpClientTesting()],
    });
    const service = TestBed.inject(FavoritesService);
    const http = TestBed.inject(HttpTestingController);
    service.getFavorites().subscribe((lines) => {
      expect(lines[0].favorite_id).toBe(91);
      expect(lines[0].database_id).toBe(7);
      expect(lines[0].id).toBe(7);
      expect(lines[0].sptrans_id).toBe(9000);
      service.removeFavorite(lines[0].favorite_id!).subscribe();
    });
    http
      .expectOne(`${environment.apiUrl}/favorites`)
      .flush({
        data: [
          {
            id: 91,
            line_id: 7,
            line: {
              id: 7,
              sptrans_id: 9000,
              code: '146',
              name: 'CALLAO',
              origin: 'LAPA',
              destination: 'CALLAO',
            },
          },
        ],
      });
    const deletion = http.expectOne(`${environment.apiUrl}/favorites/91`);
    expect(deletion.request.method).toBe('DELETE');
    deletion.flush({});
    http.verify();
  });
});
