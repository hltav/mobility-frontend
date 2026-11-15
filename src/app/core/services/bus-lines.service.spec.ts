import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';
import { environment } from '../../../environments/environment';
import { BusLinesService } from './bus-lines.service';

describe('Linhas e paradas pelo contrato HTTP existente', () => {
  let service: BusLinesService;
  let http: HttpTestingController;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [provideHttpClient(), provideHttpClientTesting()],
    });
    service = TestBed.inject(BusLinesService);
    http = TestBed.inject(HttpTestingController);
  });
  afterEach(() => http.verify());

  it('envia filtro e paginação e preserva IDs internos diferentes dos IDs SPTrans', () => {
    const received = vi.fn();
    service.getAll({ term: 'Linha de teste', per_page: 20 }).subscribe(received);
    const request = http.expectOne((req) => req.url === `${environment.apiUrl}/lines`);
    expect(request.request.method).toBe('GET');
    expect(request.request.params.get('term')).toBe('Linha de teste');
    expect(request.request.params.get('per_page')).toBe('20');
    request.flush({
      data: {
        data: [
          {
            id: 7,
            sptrans_id: 9001,
            code: 'T-1',
            name: 'Linha de teste',
            origin: 'Origem de teste',
            destination: 'Destino de teste',
          },
        ],
      },
    });
    expect(received).toHaveBeenCalledWith([
      expect.objectContaining({ id: 7, database_id: 7, sptrans_id: 9001 }),
    ]);
  });

  it('ordena paradas e descarta itens sem coordenadas ou fora dos limites geográficos', () => {
    const received = vi.fn();
    service.getStops(7, 2).subscribe(received);
    const request = http.expectOne((req) => req.url === `${environment.apiUrl}/lines/7/stops`);
    expect(request.request.params.get('direction')).toBe('2');
    request.flush({
      data: {
        stops: [
          { id: 2, name: 'Segunda', latitude: -23.56, longitude: -46.64, order: 2 },
          { id: 1, name: 'Primeira', lat: -23.55, lng: -46.63, order: 1 },
          { id: 3, name: 'Sem coordenadas' },
          { id: 4, name: 'Latitude inválida', lat: 91, lng: -46.63 },
        ],
      },
    });
    expect(received).toHaveBeenCalledWith([
      expect.objectContaining({ id: 1, lat: -23.55, lng: -46.63 }),
      expect.objectContaining({ id: 2, lat: -23.56, lng: -46.64 }),
    ]);
  });
});
