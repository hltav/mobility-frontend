import * as z from 'zod';

export const LineVariantSchema = z.object({
  sptrans_id: z.number(),
  circular: z.boolean(),
});

export const BusLineSchema = z.object({
  id: z.number(),
  database_id: z.number().nullable().optional(),
  favorite_id: z.number().optional(),
  sptrans_id: z.number().nullable().optional(),
  code: z.string(),
  name: z.string(),
  direction: z
    .union([z.literal(1), z.literal(2)])
    .nullable()
    .optional(),
  origin: z.string(),
  destination: z.string(),
  origin_lat: z.number().nullable().optional(),
  origin_lng: z.number().nullable().optional(),
  variants: z.array(LineVariantSchema).nullable().optional(),
  isFavorite: z.boolean().nullable().optional().default(false),
  buses: z.array(z.unknown()).optional().default([]),
});

export type BusLine = z.infer<typeof BusLineSchema>;
