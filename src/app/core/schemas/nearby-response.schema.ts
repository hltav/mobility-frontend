import * as z from 'zod';
import { BusLineSchema } from './bus-line.schema';

export const NearbyOriginSchema = z.object({
  address: z.string(),
  lat: z.number(),
  lng: z.number(),
});

export const NearbyLineSchema = BusLineSchema.extend({
  distance_km: z.number(),
});

export const NearbyResponseSchema = z.object({
  origin: NearbyOriginSchema.nullable(),
  lines: z.array(NearbyLineSchema),
});

export type NearbyOrigin = z.infer<typeof NearbyOriginSchema>;
export type NearbyLine = z.infer<typeof NearbyLineSchema>;
export type NearbyResponse = z.infer<typeof NearbyResponseSchema>;
