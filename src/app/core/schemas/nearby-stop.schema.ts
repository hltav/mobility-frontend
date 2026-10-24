import * as z from 'zod';

const PointSchema = z.object({
  lat: z.coerce.number().min(-90).max(90),
  lng: z.coerce.number().min(-180).max(180),
});
const StopDtoSchema = PointSchema.extend({
  id: z.coerce.number().int(),
  sptrans_id: z.coerce.number().int().optional(),
  name: z.string(),
  address: z.string().optional().default(''),
  distance_km: z.coerce.number().nonnegative(),
  lines: z.array(z.coerce.number().int()).optional().default([]),
  line_codes: z.array(z.string()).optional().default([]),
  arrivals: z
    .array(z.object({ code: z.string(), minutes: z.number().nonnegative() }))
    .optional()
    .default([]),
}).transform((stop) => ({
  id: stop.id,
  sptrans_id: stop.sptrans_id,
  name: stop.name || 'Parada sem nome',
  address: stop.address,
  lat: stop.lat,
  lng: stop.lng,
  distance_meters: Math.round(stop.distance_km * 1000),
  line_ids: stop.lines,
  line_codes: stop.line_codes,
  arrivals: stop.arrivals,
}));
export const NearbyStopsResponseSchema = z.object({
  point: PointSchema.nullable(),
  stops: z
    .array(StopDtoSchema)
    .nullable()
    .transform((stops) => stops ?? []),
});
export type NearbyStop = z.infer<typeof StopDtoSchema>;
export type NearbyStopsResponse = z.infer<typeof NearbyStopsResponseSchema>;
export type NearbyStopsRequest = { address: string } | { lat: number; lng: number };
