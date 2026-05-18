import { z } from 'zod';

export const LineVariantSchema = z.object({
  sptrans_id: z.number(),
  circular: z.boolean(),
});

export const BusLineSchema = z.object({
  id: z.number(),
  code: z.string(),
  name: z.string(),
  origin: z.string(),
  destination: z.string(),
  origin_lat: z.number().nullable().optional(),
  origin_lng: z.number().nullable().optional(),
  variants: z.array(LineVariantSchema).nullable().optional(),
  isFavorite: z.boolean().nullable().optional().default(false),
  buses: z.array(z.unknown()).optional().default([]),
});

export type BusLine = z.infer<typeof BusLineSchema>;
