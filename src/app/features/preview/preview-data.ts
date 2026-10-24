import { NearbyStop } from '../../core/schemas/nearby-stop.schema';
import { BusLine } from '../../core/schemas/bus-line.schema';
import { RealTimeBus } from '../../core/schemas/real-timeBus.schema';
import { LineStop } from '../../core/schemas/bus-line-service.schema';

// Fixed visual fixtures. These are not official routes, positions or predictions.
const vehicles = (code: string, count: number): RealTimeBus[] =>
  Array.from({ length: count }, (_, index) => ({
    prefix: `DEMO-${code}-${String(index + 1).padStart(2, '0')}`,
    lat: -23.5505 + index * 0.0008,
    lng: -46.6333 + index * 0.0005,
    accessible: index % 2 === 0,
    plate: ['ABC1D23', 'XYZ9E87', 'QWE4R56', 'RTY2G34'][index % 4],
    speed_kmh: [24, 18, 31, 22][index % 4],
    observed_at: new Date(Date.now() - [10, 22, 5, 16][index % 4] * 1000).toISOString(),
    status: index % 3 === 0 ? 'stopped' : 'moving',
  }));

export const PREVIEW_LINES: BusLine[] = [
  {
    id: 146,
    database_id: 146,
    code: '146',
    name: 'CALLAO',
    direction: 1,
    origin: 'LAPA',
    destination: 'CALLAO',
    origin_lat: -23.5505,
    origin_lng: -46.6333,
    isFavorite: false,
    buses: vehicles('146', 4),
  },
  {
    id: 15,
    database_id: 15,
    code: '15',
    name: 'CANT',
    direction: 1,
    origin: 'VILA GUSTAVO',
    destination: 'CANT. DO PARANAPANEMA',
    origin_lat: -23.5505,
    origin_lng: -46.6333,
    isFavorite: false,
    buses: vehicles('15', 7),
  },
  {
    id: 152,
    database_id: 152,
    code: '152',
    name: 'LAPA',
    direction: 2,
    origin: 'JD. ALVORADA',
    destination: 'LAPA',
    origin_lat: -23.5505,
    origin_lng: -46.6333,
    isFavorite: false,
    buses: vehicles('152', 3),
  },
];

export const PREVIEW_STOPS: LineStop[] = [
  { name: 'Terminal Lapa', code: 'TPL-01', scheduled_time: '05:40', line_codes: ['146', '8000'] },
  { name: 'Av. Ermano Marchetti', code: 'P-112', scheduled_time: '05:44', line_codes: ['146'] },
  { name: 'Rua Catão, 832', code: 'P-114', scheduled_time: '05:47', line_codes: ['146', '152'] },
  {
    name: 'Av. Pacaembu, 1200',
    code: 'P-123',
    scheduled_time: '05:51',
    line_codes: ['146', '152', '8000'],
  },
  {
    name: 'Av. Dr. Arnaldo x R. Cardeal',
    code: 'P-130',
    scheduled_time: '05:55',
    line_codes: ['146'],
  },
  { name: 'Terminal Callao', code: 'TPL-02', scheduled_time: '06:10', line_codes: ['146'] },
].map((stop, index) => ({
  ...stop,
  id: index + 1,
  lat: -23.5505 + index * 0.0016,
  lng: -46.6333 + index * 0.001,
  order: index + 1,
}));

export const PREVIEW_NEARBY_STOPS: NearbyStop[] = [
  { name: 'Av. Pacaembu, 1200', distance_meters: 127, line_codes: ['146', '152', '8000'] },
  { name: 'R. Cardoso de Almeida, 500', distance_meters: 240, line_codes: ['15', '175T'] },
  { name: 'Pça. Marrey Jr. - Estádio', distance_meters: 410, line_codes: ['N802', '146'] },
  { name: 'Av. Dr. Arnaldo, 2082', distance_meters: 450, line_codes: ['146', '8000'] },
  { name: 'R. Alagoas x Av. Pacaembu', distance_meters: 480, line_codes: ['15', '152'] },
].map((stop, index) => ({
  ...stop,
  id: index + 1,
  sptrans_id: 10000 + index,
  address: stop.name + ' — São Paulo (exemplo)',
  lat: -23.5505 + stop.distance_meters / 111320,
  lng: -46.6333,
  line_ids: [],
  arrivals: stop.line_codes.map((code) => ({ code, minutes: 3 })),
}));
